import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

export const REGISTRATION_TYPES = ['uczestnik', 'prelegent', 'partner', 'media'];
export const REGISTRATION_STATUSES = ['nowe', 'potwierdzone', 'anulowane'];

export const DEFAULT_SETTINGS = {
  registration_open: '1',
  email_confirm_subject: 'Potwierdzenie zgłoszenia – H2O!dolanów, 27–28 kwietnia 2027',
  email_confirm_body: [
    'Dzień dobry {{name}},',
    '',
    'dziękujemy za zgłoszenie udziału w konferencji H2O!dolanów.',
    '',
    'Termin: {{date}}',
    'Miejsce: {{place}}',
    'Rodzaj zgłoszenia: {{type_label}}',
    '',
    'Zgłoszenie zostało przyjęte i zapisane. Przed wydarzeniem otrzymają Państwo',
    'informacje organizacyjne, w tym szczegóły dojazdu i parkingu.',
    '',
    'Jeśli zgłoszenie nie było wysłane przez Państwa, prosimy o kontakt:',
    '{{contact_email}}, tel. {{contact_phone}}.',
    '',
    'Do zobaczenia w Odolanowie.',
    'Organizatorzy H2O!dolanów'
  ].join('\n'),
  email_admin_subject: 'Nowe zgłoszenie – H2O!dolanów',
  email_admin_body: [
    'Nowe zgłoszenie rejestracyjne (ID {{id}}).',
    '',
    'Imię i nazwisko: {{name}}',
    'Instytucja / firma: {{organization}}',
    'Stanowisko: {{position}}',
    'E-mail: {{email}}',
    'Telefon: {{phone}}',
    'Miejscowość: {{city}}',
    'Rodzaj zgłoszenia: {{type_label}}',
    'Dodatkowe informacje: {{notes}}',
    '',
    'Zgoda RODO: {{consent_rodo}}',
    'Zgoda na kontakt informacyjny: {{consent_contact}}',
    '',
    'Data przyjęcia: {{created_at}}',
    '',
    'Zgłoszenie jest widoczne w panelu administracyjnym.'
  ].join('\n')
};

const SCHEMA = `
CREATE TABLE IF NOT EXISTS registrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL,
  name TEXT NOT NULL,
  organization TEXT NOT NULL,
  position TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  consent_rodo INTEGER NOT NULL,
  consent_contact INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'nowe',
  ip_hash TEXT,
  user_agent TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS registrations_email_unique
  ON registrations (lower(email));

CREATE INDEX IF NOT EXISTS registrations_created_at
  ON registrations (created_at);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL,
  action TEXT NOT NULL,
  detail TEXT,
  ip_hash TEXT
);
`;

export function openDatabase(file) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec(SCHEMA);

  const insertSetting = db.prepare(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO NOTHING'
  );
  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) insertSetting.run(key, value);

  return db;
}

export function createStore(db) {
  const getSettingStmt = db.prepare('SELECT value FROM settings WHERE key = ?');
  const setSettingStmt = db.prepare(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
  );
  const allSettingsStmt = db.prepare('SELECT key, value FROM settings ORDER BY key');

  const insertStmt = db.prepare(`
    INSERT INTO registrations
      (created_at, name, organization, position, email, phone, city, type, notes,
       consent_rodo, consent_contact, status, ip_hash, user_agent)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const byEmailStmt = db.prepare('SELECT * FROM registrations WHERE lower(email) = lower(?)');
  const byIdStmt = db.prepare('SELECT * FROM registrations WHERE id = ?');
  const deleteStmt = db.prepare('DELETE FROM registrations WHERE id = ?');
  const countStmt = db.prepare('SELECT COUNT(*) AS total FROM registrations');
  const typeCountStmt = db.prepare(
    'SELECT type, COUNT(*) AS total FROM registrations GROUP BY type ORDER BY type'
  );
  const auditStmt = db.prepare(
    'INSERT INTO audit_log (created_at, action, detail, ip_hash) VALUES (?, ?, ?, ?)'
  );

  const EDITABLE = [
    'name',
    'organization',
    'position',
    'email',
    'phone',
    'city',
    'type',
    'notes',
    'status',
    'consent_contact'
  ];

  return {
    db,

    getSetting(key) {
      const row = getSettingStmt.get(key);
      return row ? row.value : null;
    },

    setSetting(key, value) {
      setSettingStmt.run(key, String(value));
    },

    allSettings() {
      const out = {};
      for (const row of allSettingsStmt.all()) out[row.key] = row.value;
      return out;
    },

    insertRegistration(record) {
      const result = insertStmt.run(
        record.created_at,
        record.name,
        record.organization,
        record.position ?? '',
        record.email,
        record.phone,
        record.city ?? '',
        record.type,
        record.notes ?? '',
        record.consent_rodo ? 1 : 0,
        record.consent_contact ? 1 : 0,
        record.status ?? 'nowe',
        record.ip_hash ?? null,
        record.user_agent ?? null
      );
      return Number(result.lastInsertRowid);
    },

    findByEmail(email) {
      return byEmailStmt.get(email) ?? null;
    },

    getRegistration(id) {
      return byIdStmt.get(id) ?? null;
    },

    listRegistrations(filters = {}) {
      const where = [];
      const params = [];

      if (filters.q) {
        const like = `%${filters.q}%`;
        where.push(`(name LIKE ? OR organization LIKE ? OR email LIKE ? OR phone LIKE ? OR city LIKE ?)`);
        params.push(like, like, like, like, like);
      }
      if (filters.type && REGISTRATION_TYPES.includes(filters.type)) {
        where.push('type = ?');
        params.push(filters.type);
      }
      if (filters.status && REGISTRATION_STATUSES.includes(filters.status)) {
        where.push('status = ?');
        params.push(filters.status);
      }
      if (filters.from) {
        where.push('created_at >= ?');
        params.push(`${filters.from}T00:00:00.000Z`);
      }
      if (filters.to) {
        where.push('created_at <= ?');
        params.push(`${filters.to}T23:59:59.999Z`);
      }

      const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
      const limit = Math.min(Math.max(Number(filters.limit) || 50, 1), 500);
      const offset = Math.max(Number(filters.offset) || 0, 0);

      const items = db
        .prepare(
          `SELECT * FROM registrations ${whereSql}
           ORDER BY datetime(created_at) DESC, id DESC
           LIMIT ? OFFSET ?`
        )
        .all(...params, limit, offset);

      const totalRow = db
        .prepare(`SELECT COUNT(*) AS total FROM registrations ${whereSql}`)
        .get(...params);

      return { items, total: Number(totalRow?.total ?? 0), limit, offset };
    },

    listAllForExport(filters = {}) {
      const { items } = this.listRegistrations({ ...filters, limit: 500, offset: 0 });
      if (items.length < 500) return items;

      const all = [];
      let offset = 0;
      for (;;) {
        const { items: page } = this.listRegistrations({ ...filters, limit: 500, offset });
        all.push(...page);
        if (page.length < 500) break;
        offset += 500;
      }
      return all;
    },

    updateRegistration(id, patch) {
      const sets = [];
      const params = [];
      for (const field of EDITABLE) {
        if (patch[field] === undefined) continue;
        sets.push(`${field} = ?`);
        params.push(field === 'consent_contact' ? (patch[field] ? 1 : 0) : patch[field]);
      }
      if (!sets.length) return this.getRegistration(id);
      db.prepare(`UPDATE registrations SET ${sets.join(', ')} WHERE id = ?`).run(...params, id);
      return this.getRegistration(id);
    },

    deleteRegistration(id) {
      const result = deleteStmt.run(id);
      return result.changes > 0;
    },

    stats() {
      const total = Number(countStmt.get()?.total ?? 0);
      const byType = {};
      for (const type of REGISTRATION_TYPES) byType[type] = 0;
      for (const row of typeCountStmt.all()) byType[row.type] = Number(row.total);
      return { total, byType };
    },

    audit(action, detail, ipHash) {
      auditStmt.run(new Date().toISOString(), action, detail ?? null, ipHash ?? null);
    }
  };
}
