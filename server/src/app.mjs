import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { openDatabase, createStore } from './db.mjs';
import { validateRegistration, validateAdminPatch, TYPE_LABELS, toBool } from './validate.mjs';
import { createMailer, renderTemplate } from './mail.mjs';

const MAX_BODY = 64 * 1024;
const COOKIE = 'h2_admin';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8'
};

const ASSET_RE = /^\/assets\/[A-Za-z0-9._-]+\.(jpg|jpeg|png|svg|webp|ico|pdf|woff2)$/;
const LANDING_FILES = new Set([
  '/h2odolanow_landing.html',
  '/h2odolanow_style.css',
  '/h2odolanow_script.js'
]);

function json(res, status, payload, headers = {}) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    ...headers
  });
  res.end(body);
}

function text(res, status, body, type = 'text/plain; charset=utf-8') {
  res.writeHead(status, { 'content-type': type, 'cache-control': 'no-store' });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY) {
        reject(Object.assign(new Error('Payload too large'), { status: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      const type = String(req.headers['content-type'] || '');
      if (!raw) return resolve({});
      if (type.includes('application/json')) {
        try {
          const parsed = JSON.parse(raw);
          return resolve(parsed && typeof parsed === 'object' ? parsed : {});
        } catch {
          return reject(Object.assign(new Error('Niepoprawny JSON'), { status: 400 }));
        }
      }
      if (type.includes('application/x-www-form-urlencoded')) {
        return resolve(Object.fromEntries(new URLSearchParams(raw)));
      }
      return resolve({});
    });
    req.on('error', reject);
  });
}

function parseCookies(req) {
  const out = {};
  for (const part of String(req.headers.cookie || '').split(';')) {
    const index = part.indexOf('=');
    if (index < 0) continue;
    out[part.slice(0, index).trim()] = decodeURIComponent(part.slice(index + 1).trim());
  }
  return out;
}

function rate(map, key, rule) {
  const now = Date.now();
  const recent = (map.get(key) || []).filter((time) => now - time < rule.windowMs);
  if (recent.length >= rule.max) {
    map.set(key, recent);
    return false;
  }
  recent.push(now);
  map.set(key, recent);

  if (map.size > 5000) {
    for (const [entry, times] of map) {
      if (!times.length || now - times[times.length - 1] > rule.windowMs) map.delete(entry);
    }
  }
  return true;
}

function csvCell(value) {
  const clean = value === null || value === undefined ? '' : String(value);
  return `"${clean.replace(/"/g, '""')}"`;
}

const CSV_COLUMNS = [
  ['ID', (row) => row.id],
  ['Data zgłoszenia', (row) => row.created_at],
  ['Imię i nazwisko', (row) => row.name],
  ['Instytucja / firma', (row) => row.organization],
  ['Stanowisko', (row) => row.position],
  ['E-mail', (row) => row.email],
  ['Telefon', (row) => row.phone],
  ['Miejscowość', (row) => row.city],
  ['Rodzaj zgłoszenia', (row) => TYPE_LABELS[row.type] || row.type],
  ['Status', (row) => row.status],
  ['Zgoda RODO', (row) => (row.consent_rodo ? 'tak' : 'nie')],
  ['Zgoda na kontakt', (row) => (row.consent_contact ? 'tak' : 'nie')],
  ['Dodatkowe informacje', (row) => row.notes]
];

function toCsv(rows) {
  const header = CSV_COLUMNS.map(([label]) => csvCell(label)).join(';');
  const body = rows.map((row) => CSV_COLUMNS.map(([, pick]) => csvCell(pick(row))).join(';'));
  return `\uFEFF${[header, ...body].join('\r\n')}\r\n`;
}

export function createApp(config) {
  const db = openDatabase(config.dbFile);
  const store = createStore(db);
  const mailer = createMailer(config);

  const sessions = new Map();
  const submitHits = new Map();
  const loginHits = new Map();

  const ipSalt = config.ipSalt;

  function ipHash(req) {
    const ip = req.socket.remoteAddress || 'unknown';
    return crypto.createHash('sha256').update(`${ipSalt}:${ip}`).digest('hex').slice(0, 16);
  }

  function currentSession(req) {
    const token = parseCookies(req)[COOKIE];
    if (!token) return null;
    const session = sessions.get(token);
    if (!session) return null;
    if (session.expires < Date.now()) {
      sessions.delete(token);
      return null;
    }
    return { token, ...session };
  }

  function requireAdmin(req, res) {
    const session = currentSession(req);
    if (!session) {
      json(res, 401, { ok: false, error: 'unauthorized', message: 'Zaloguj się ponownie.' });
      return null;
    }
    if (req.method !== 'GET' && req.headers['x-requested-with'] !== 'h2-admin') {
      json(res, 403, { ok: false, error: 'csrf', message: 'Brak nagłówka X-Requested-With.' });
      return null;
    }
    return session;
  }

  function registrationOpen() {
    return store.getSetting('registration_open') === '1';
  }

  function mailData(record) {
    return {
      ...config.event,
      id: record.id,
      name: record.name,
      organization: record.organization,
      position: record.position || '—',
      email: record.email,
      phone: record.phone,
      city: record.city || '—',
      type: record.type,
      type_label: TYPE_LABELS[record.type] || record.type,
      notes: record.notes || '—',
      consent_rodo: record.consent_rodo ? 'tak' : 'nie',
      consent_contact: record.consent_contact ? 'tak' : 'nie',
      created_at: record.created_at,
      contact_email: config.event.contactEmail,
      contact_phone: config.event.contactPhone
    };
  }

  async function sendRegistrationMails(record) {
    const data = mailData(record);
    const results = { participant: null, organizer: null };

    try {
      await mailer.send({
        to: record.email,
        subject: renderTemplate(store.getSetting('email_confirm_subject'), data),
        body: renderTemplate(store.getSetting('email_confirm_body'), data)
      });
      results.participant = 'sent';
    } catch (error) {
      results.participant = `error: ${error.message}`;
    }

    const recipients = config.mail.organizer.join(', ');
    if (recipients) {
      try {
        await mailer.send({
          to: recipients,
          subject: renderTemplate(store.getSetting('email_admin_subject'), data),
          body: renderTemplate(store.getSetting('email_admin_body'), data)
        });
        results.organizer = 'sent';
      } catch (error) {
        results.organizer = `error: ${error.message}`;
      }
    }

    return results;
  }

  async function handleSubmit(req, res) {
    const ip = ipHash(req);

    if (!rate(submitHits, ip, config.submitLimit)) {
      return json(res, 429, {
        ok: false,
        error: 'rate_limited',
        message: 'Zbyt wiele zgłoszeń z tego adresu. Spróbuj ponownie za kilka minut.'
      });
    }

    if (!registrationOpen()) {
      return json(res, 503, {
        ok: false,
        error: 'registration_closed',
        message: 'Rejestracja jest chwilowo zamknięta. Informacje: sekretariat@odolanow.pl.'
      });
    }

    const body = await readBody(req);
    const { values, errors, honeypot, tooFast } = validateRegistration(body, {
      minFillMs: config.minFillMs
    });

    // Pole-pułapka: bot dostaje sukces, ale nic nie zapisujemy.
    if (honeypot) {
      store.audit('spam_honeypot', 'odrzucone bez zapisu', ip);
      return json(res, 202, { ok: true, message: 'Zgłoszenie przyjęte.' });
    }

    if (tooFast) {
      return json(res, 400, {
        ok: false,
        error: 'too_fast',
        message: 'Formularz został wypełniony zbyt szybko. Spróbuj ponownie.'
      });
    }

    if (Object.keys(errors).length) {
      return json(res, 400, {
        ok: false,
        error: 'validation',
        message: 'Proszę poprawić zaznaczone pola formularza.',
        errors
      });
    }

    const existing = store.findByEmail(values.email);
    if (existing) {
      return json(res, 409, {
        ok: false,
        error: 'duplicate',
        message: 'Ten adres e-mail jest już zapisany na konferencję.'
      });
    }

    const record = {
      ...values,
      created_at: new Date().toISOString(),
      status: 'nowe',
      ip_hash: ip,
      user_agent: String(req.headers['user-agent'] || '').slice(0, 300)
    };

    let id;
    try {
      id = store.insertRegistration(record);
    } catch (error) {
      if (/unique/i.test(error.message)) {
        return json(res, 409, {
          ok: false,
          error: 'duplicate',
          message: 'Ten adres e-mail jest już zapisany na konferencję.'
        });
      }
      throw error;
    }

    const saved = store.getRegistration(id);
    const mail = await sendRegistrationMails(saved);
    store.audit('registration_created', `id=${id}`, ip);

    return json(res, 201, {
      ok: true,
      id,
      message: 'Dziękujemy. Zgłoszenie zostało zapisane, potwierdzenie wysłaliśmy na podany adres e-mail.',
      mail
    });
  }

  async function handleAdminApi(req, res, url, pathname) {
    const route = pathname.slice('/admin/api'.length);

    if (route === '/login' && req.method === 'POST') {
      const ip = ipHash(req);
      if (!rate(loginHits, ip, config.loginLimit)) {
        return json(res, 429, { ok: false, error: 'rate_limited', message: 'Zbyt wiele prób logowania.' });
      }
      const body = await readBody(req);
      const given = crypto.createHash('sha256').update(String(body.password || '')).digest();
      const expected = crypto.createHash('sha256').update(config.adminPassword).digest();
      if (!crypto.timingSafeEqual(given, expected)) {
        store.audit('admin_login_failed', null, ip);
        return json(res, 401, { ok: false, error: 'bad_password', message: 'Nieprawidłowe hasło.' });
      }

      const token = crypto.randomBytes(32).toString('hex');
      sessions.set(token, { expires: Date.now() + config.sessionTtlMs });
      store.audit('admin_login', null, ip);

      const secure = String(req.headers['x-forwarded-proto'] || '').includes('https');
      return json(res, 200, { ok: true }, {
        'set-cookie': `${COOKIE}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${Math.floor(
          config.sessionTtlMs / 1000
        )}${secure ? '; Secure' : ''}`
      });
    }

    if (route === '/logout' && req.method === 'POST') {
      const token = parseCookies(req)[COOKIE];
      if (token) sessions.delete(token);
      return json(res, 200, { ok: true }, {
        'set-cookie': `${COOKIE}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0`
      });
    }

    if (route === '/session' && req.method === 'GET') {
      const session = currentSession(req);
      return json(res, 200, {
        ok: true,
        authenticated: Boolean(session),
        passwordIsDefault: config.adminPasswordIsDefault
      });
    }

    const session = requireAdmin(req, res);
    if (!session) return;

    if (route === '/stats' && req.method === 'GET') {
      return json(res, 200, { ok: true, stats: store.stats(), open: registrationOpen() });
    }

    if (route === '/registrations' && req.method === 'GET') {
      const filters = {
        q: (url.searchParams.get('q') || '').trim().slice(0, 80),
        type: url.searchParams.get('type') || '',
        status: url.searchParams.get('status') || '',
        from: url.searchParams.get('from') || '',
        to: url.searchParams.get('to') || '',
        limit: url.searchParams.get('limit') || 50,
        offset: url.searchParams.get('offset') || 0
      };
      const result = store.listRegistrations(filters);
      return json(res, 200, { ok: true, ...result });
    }

    if (route === '/registrations.csv' && req.method === 'GET') {
      const rows = store.listAllForExport({
        q: (url.searchParams.get('q') || '').trim(),
        type: url.searchParams.get('type') || '',
        status: url.searchParams.get('status') || '',
        from: url.searchParams.get('from') || '',
        to: url.searchParams.get('to') || ''
      });
      const stamp = new Date().toISOString().slice(0, 10);
      res.writeHead(200, {
        'content-type': 'text/csv; charset=utf-8',
        'content-disposition': `attachment; filename="zgloszenia-h2odolanow-${stamp}.csv"`,
        'cache-control': 'no-store'
      });
      res.end(toCsv(rows));
      store.audit('export_csv', `rows=${rows.length}`, ipHash(req));
      return;
    }

    const idMatch = route.match(/^\/registrations\/(\d+)$/);
    if (idMatch) {
      const id = Number(idMatch[1]);
      const existing = store.getRegistration(id);
      if (!existing) return json(res, 404, { ok: false, error: 'not_found' });

      if (req.method === 'PATCH') {
        const body = await readBody(req);
        const { patch, errors } = validateAdminPatch(body);
        if (Object.keys(errors).length) {
          return json(res, 400, { ok: false, error: 'validation', errors });
        }
        if (patch.email && patch.email !== existing.email) {
          const clash = store.findByEmail(patch.email);
          if (clash && clash.id !== id) {
            return json(res, 409, { ok: false, error: 'duplicate', message: 'Ten e-mail należy do innego zgłoszenia.' });
          }
        }
        try {
          const updated = store.updateRegistration(id, patch);
          store.audit('registration_updated', `id=${id}`, ipHash(req));
          return json(res, 200, { ok: true, registration: updated });
        } catch (error) {
          if (/unique/i.test(error.message)) {
            return json(res, 409, { ok: false, error: 'duplicate' });
          }
          throw error;
        }
      }

      if (req.method === 'DELETE') {
        store.deleteRegistration(id);
        store.audit('registration_deleted', `id=${id}`, ipHash(req));
        return json(res, 200, { ok: true });
      }
    }

    if (route === '/settings' && req.method === 'GET') {
      return json(res, 200, {
        ok: true,
        settings: {
          ...store.allSettings(),
          registration_open: registrationOpen()
        }
      });
    }

    if (route === '/settings' && req.method === 'PATCH') {
      const body = await readBody(req);
      if (body.registration_open !== undefined) {
        store.setSetting('registration_open', toBool(body.registration_open) ? '1' : '0');
      }
      for (const key of ['email_confirm_subject', 'email_confirm_body', 'email_admin_subject', 'email_admin_body']) {
        if (typeof body[key] === 'string') store.setSetting(key, body[key].slice(0, 20000));
      }
      store.audit('settings_updated', null, ipHash(req));
      return json(res, 200, {
        ok: true,
        settings: { ...store.allSettings(), registration_open: registrationOpen() }
      });
    }

    return json(res, 404, { ok: false, error: 'not_found' });
  }

  function serveFile(res, filePath, cache, { head = false, headers = {} } = {}) {
    let stat;
    try {
      stat = fs.statSync(filePath);
      if (!stat.isFile()) throw new Error('not a file');
    } catch {
      return false;
    }
    const type = MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
    res.writeHead(200, {
      'content-type': type,
      'content-length': stat.size,
      'cache-control': cache,
      'last-modified': stat.mtime.toUTCString(),
      ...headers
    });
    if (head) {
      res.end();
    } else {
      fs.createReadStream(filePath).pipe(res);
    }
    return true;
  }

  function serveAdminAsset(res, pathname, head) {
    const name = pathname === '/admin' || pathname === '/admin/' ? 'index.html' : pathname.replace('/admin/', '');
    if (!/^[A-Za-z0-9._-]+$/.test(name)) return false;
    const adminDir = path.join(config.publicDir, 'admin');
    const file = path.join(adminDir, name);
    if (!path.resolve(file).startsWith(path.resolve(adminDir))) return false;

    return serveFile(res, file, 'no-store', {
      head,
      headers: {
        'x-frame-options': 'DENY',
        'content-security-policy':
          "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; frame-ancestors 'none'; base-uri 'none'"
      }
    });
  }

  function serveLanding(res, pathname, head = false) {
    const root = config.landingRoot;
    let file = null;

    if (pathname === '/' || pathname === '/index.html') {
      file = path.join(root, 'h2odolanow_landing.html');
    } else if (LANDING_FILES.has(pathname)) {
      file = path.join(root, pathname.replace(/^\//, ''));
    } else if (ASSET_RE.test(pathname)) {
      file = path.join(root, pathname.replace(/^\//, ''));
    } else if (pathname === '/favicon.ico') {
      file = path.join(root, 'assets', 'logo-odolanow.png');
    }

    if (!file) return false;
    if (!path.resolve(file).startsWith(path.resolve(root))) return false;

    const ext = path.extname(file).toLowerCase();
    const cache = ext === '.html' ? 'no-cache' : 'public, max-age=604800';
    return serveFile(res, file, cache, { head });
  }

  async function handle(req, res) {
    res.setHeader('x-content-type-options', 'nosniff');
    res.setHeader('referrer-policy', 'strict-origin-when-cross-origin');

    let pathname;
    try {
      pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    } catch {
      return text(res, 400, 'Niepoprawny adres.');
    }

    if (pathname === '/api/health' && req.method === 'GET') {
      return json(res, 200, {
        ok: true,
        service: 'h2odolanow-registration',
        version: '0.1.0',
        mail: mailer.transport
      });
    }

    if (pathname === '/api/registration-status' && req.method === 'GET') {
      return json(res, 200, {
        ok: true,
        open: registrationOpen(),
        event: config.event
      });
    }

    if (pathname === '/api/registrations' && req.method === 'POST') {
      return handleSubmit(req, res);
    }

    if (pathname.startsWith('/admin/api/')) {
      return handleAdminApi(req, res, new URL(req.url, 'http://localhost'), pathname);
    }

    if (req.method === 'GET' || req.method === 'HEAD') {
      const head = req.method === 'HEAD';
      if (pathname === '/admin' || pathname === '/admin/' || pathname.startsWith('/admin/')) {
        if (serveAdminAsset(res, pathname, head)) return;
      }
      if (serveLanding(res, pathname, head)) return;
      if (pathname.startsWith('/api/')) return json(res, 404, { ok: false, error: 'not_found' });
      return text(res, 404, 'Nie znaleziono strony.', 'text/plain; charset=utf-8');
    }

    return json(res, 405, { ok: false, error: 'method_not_allowed' });
  }

  return {
    handler: (req, res) => {
      handle(req, res).catch((error) => {
        const status = error.status || 500;
        if (status >= 500) console.error('[h2]', error);
        if (!res.headersSent) {
          json(res, status, {
            ok: false,
            error: status === 500 ? 'server_error' : 'bad_request',
            message: status === 500 ? 'Błąd serwera. Spróbuj ponownie.' : error.message
          });
        } else {
          res.end();
        }
      });
    },
    store,
    mailer,
    close: () => db.close()
  };
}
