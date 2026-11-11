import { test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { loadConfig } from '../server/src/config.mjs';
import { createApp } from '../server/src/app.mjs';

/**
 * Testy prototypu modułu rejestracji. Każdy zestaw dostaje własną bazę
 * w katalogu tymczasowym, więc testy nie zależą od siebie ani od var/.
 */
async function startApp(env = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'h2-test-'));
  const config = loadConfig({ H2_VAR_DIR: dir, ...env });
  const app = createApp(config);
  const server = http.createServer(app.handler);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;

  return {
    base,
    dir,
    config,
    app,
    async close() {
      await new Promise((resolve) => server.close(resolve));
      app.close();
      fs.rmSync(dir, { recursive: true, force: true });
    }
  };
}

const VALID = {
  name: 'Anna Kowalska',
  organization: 'Urząd Gminy i Miasta Odolanów',
  position: 'Referent',
  email: 'anna.kowalska@example.org',
  phone: '600 100 200',
  city: 'Odolanów',
  type: 'uczestnik',
  notes: 'Proszę o miejsce przy oknie.',
  consent_rodo: true,
  consent_contact: true
};

function submit(base, body, init = {}) {
  return fetch(`${base}/api/registrations`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(init.headers || {}) },
    body: JSON.stringify(body)
  });
}

function outbox(dir) {
  const folder = path.join(dir, 'outbox');
  try {
    return fs.readdirSync(folder).filter((name) => name.endsWith('.eml'));
  } catch {
    return [];
  }
}

async function adminLogin(base, password) {
  const response = await fetch(`${base}/admin/api/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ password })
  });
  const cookie = (response.headers.getSetCookie?.() || [])
    .map((value) => value.split(';')[0])
    .join('; ');
  return { response, cookie };
}

test('API publiczne: health, status i przyjęcie zgłoszenia', async (t) => {
  const app = await startApp();
  t.after(() => app.close());

  const health = await fetch(`${app.base}/api/health`);
  assert.equal(health.status, 200);
  const healthBody = await health.json();
  assert.equal(healthBody.ok, true);
  assert.equal(healthBody.mail, 'file');

  const status = await fetch(`${app.base}/api/registration-status`);
  const statusBody = await status.json();
  assert.equal(statusBody.open, true);
  assert.equal(statusBody.event.name, 'H2O!dolanów');

  const created = await submit(app.base, VALID);
  assert.equal(created.status, 201);
  const createdBody = await created.json();
  assert.equal(createdBody.ok, true);
  assert.equal(typeof createdBody.id, 'number');
  assert.equal(app.app.store.getRegistration(createdBody.id).email, VALID.email);

  // Dwa e-maile: potwierdzenie dla uczestnika i powiadomienie organizatora.
  const files = outbox(app.dir);
  assert.equal(files.length, 2);
  const participant = files.find((name) => name.includes('anna.kowalska'));
  assert.ok(participant, 'brak pliku .eml dla uczestnika');
  const raw = fs.readFileSync(path.join(app.dir, 'outbox', participant), 'utf8');
  assert.match(raw, /To: anna\.kowalska@example\.org/);
  assert.match(raw, /Subject: =\?UTF-8\?B\?/);
  assert.match(raw, /Content-Type: text\/plain/);
});

test('API publiczne: duplikat, walidacja, honeypot i anty-bot', async (t) => {
  const app = await startApp();
  t.after(() => app.close());

  assert.equal((await submit(app.base, VALID)).status, 201);

  const duplicate = await submit(app.base, VALID);
  assert.equal(duplicate.status, 409);
  assert.equal((await duplicate.json()).error, 'duplicate');

  const invalid = await submit(app.base, {
    name: 'A',
    organization: '',
    email: 'zly-adres@',
    phone: '12',
    type: 'nieznany',
    consent_rodo: false
  });
  assert.equal(invalid.status, 400);
  const invalidBody = await invalid.json();
  assert.equal(invalidBody.error, 'validation');
  for (const field of ['name', 'organization', 'email', 'phone', 'consent_rodo']) {
    assert.ok(invalidBody.errors[field], `brak błędu dla pola ${field}`);
  }

  const honeypot = await submit(app.base, {
    ...VALID,
    email: 'bot@example.org',
    website: 'http://spam.example'
  });
  assert.equal(honeypot.status, 202);
  assert.equal((await honeypot.json()).ok, true);
  assert.equal(app.app.store.findByEmail('bot@example.org'), null);

  const tooFast = await submit(app.base, {
    ...VALID,
    email: 'szybki@example.org',
    form_loaded_at: new Date().toISOString()
  });
  assert.equal(tooFast.status, 400);
  assert.equal((await tooFast.json()).error, 'too_fast');
});

test('API publiczne: limit zgłoszeń z jednego adresu IP', async (t) => {
  const app = await startApp();
  t.after(() => app.close());

  const results = [];
  for (let index = 0; index < 5; index += 1) {
    const response = await submit(app.base, { ...VALID, email: `osoba${index}@example.org` });
    results.push(response.status);
  }
  assert.deepEqual(results, [201, 201, 201, 201, 201]);

  const blocked = await submit(app.base, { ...VALID, email: 'szosta@example.org' });
  assert.equal(blocked.status, 429);
  assert.equal((await blocked.json()).error, 'rate_limited');
});

test('Panel: logowanie, lista, edycja, CSV i zamykanie rejestracji', async (t) => {
  const app = await startApp({ H2_ADMIN_PASSWORD: 'testowe-haslo' });
  t.after(() => app.close());

  const anonymous = await fetch(`${app.base}/admin/api/stats`);
  assert.equal(anonymous.status, 401);

  const bad = await adminLogin(app.base, 'zle-haslo');
  assert.equal(bad.response.status, 401);

  const { response, cookie } = await adminLogin(app.base, 'testowe-haslo');
  assert.equal(response.status, 200);
  assert.match(cookie, /^h2_admin=/);

  // Formularz wysłany jako application/x-www-form-urlencoded też jest przyjmowany.
  const form = new URLSearchParams({
    name: 'Piotr Nowak',
    organization: 'Gmina Przygodzice',
    email: 'piotr.nowak@example.org',
    phone: '600100300',
    type: 'prelegent',
    consent_rodo: 'on'
  });
  const formSubmit = await fetch(`${app.base}/api/registrations`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: form
  });
  assert.equal(formSubmit.status, 201);
  const { id } = await formSubmit.json();

  const auth = { cookie, 'x-requested-with': 'h2-admin', 'content-type': 'application/json' };

  const session = await fetch(`${app.base}/admin/api/session`, { headers: { cookie } });
  assert.equal((await session.json()).authenticated, true);

  const stats = await (await fetch(`${app.base}/admin/api/stats`, { headers: { cookie } })).json();
  assert.equal(stats.stats.total, 1);
  assert.equal(stats.stats.byType.prelegent, 1);
  assert.equal(stats.open, true);

  const list = await (
    await fetch(`${app.base}/admin/api/registrations?q=piotr`, { headers: { cookie } })
  ).json();
  assert.equal(list.total, 1);
  assert.equal(list.items[0].id, id);

  // Zmiana bez nagłówka X-Requested-With jest blokowana.
  const csrf = await fetch(`${app.base}/admin/api/registrations/${id}`, {
    method: 'PATCH',
    headers: { cookie, 'content-type': 'application/json' },
    body: JSON.stringify({ status: 'potwierdzone' })
  });
  assert.equal(csrf.status, 403);

  const patched = await fetch(`${app.base}/admin/api/registrations/${id}`, {
    method: 'PATCH',
    headers: auth,
    body: JSON.stringify({ status: 'potwierdzone', city: 'Przygodzice' })
  });
  assert.equal(patched.status, 200);
  assert.equal((await patched.json()).registration.status, 'potwierdzone');

  const csv = await fetch(`${app.base}/admin/api/registrations.csv`, { headers: { cookie } });
  assert.equal(csv.status, 200);
  assert.match(csv.headers.get('content-type'), /text\/csv/);
  assert.match(csv.headers.get('content-disposition'), /zgloszenia-h2odolanow-/);
  // response.text() usuwa BOM, więc sprawdzamy bajty — Excel potrzebuje go w pliku.
  const csvBytes = Buffer.from(await csv.arrayBuffer());
  assert.deepEqual([...csvBytes.subarray(0, 3)], [0xef, 0xbb, 0xbf], 'CSV powinien zaczynać się od BOM');
  const csvText = csvBytes.toString('utf8');
  assert.match(csvText, /"Imię i nazwisko";"Instytucja \/ firma"/);
  assert.match(csvText, /"Piotr Nowak"/);

  const closed = await fetch(`${app.base}/admin/api/settings`, {
    method: 'PATCH',
    headers: auth,
    body: JSON.stringify({ registration_open: false })
  });
  assert.equal(closed.status, 200);
  assert.equal((await closed.json()).settings.registration_open, false);

  const rejected = await submit(app.base, { ...VALID, email: 'po-zamknieciu@example.org' });
  assert.equal(rejected.status, 503);
  assert.equal((await rejected.json()).error, 'registration_closed');

  const removed = await fetch(`${app.base}/admin/api/registrations/${id}`, {
    method: 'DELETE',
    headers: auth
  });
  assert.equal(removed.status, 200);
  assert.equal(app.app.store.getRegistration(id), null);

  const logout = await fetch(`${app.base}/admin/api/logout`, {
    method: 'POST',
    headers: auth,
    body: '{}'
  });
  assert.equal(logout.status, 200);
  const after = await fetch(`${app.base}/admin/api/session`, { headers: { cookie } });
  assert.equal((await after.json()).authenticated, false);
});

test('Statyka: podstrona, panel, zasoby i ochrona przed traversalem', async (t) => {
  const app = await startApp();
  t.after(() => app.close());

  const landing = await fetch(`${app.base}/`);
  assert.equal(landing.status, 200);
  assert.match(landing.headers.get('content-type'), /text\/html/);
  assert.match(await landing.text(), /H<sub>2<\/sub>O<span class="bang">!<\/span>dolanów/);

  for (const file of ['/h2odolanow_style.css', '/h2odolanow_script.js', '/assets/logo-odolanow.png']) {
    const response = await fetch(`${app.base}${file}`);
    assert.equal(response.status, 200, `nie działa ${file}`);
  }

  const admin = await fetch(`${app.base}/admin`);
  assert.equal(admin.status, 200);
  assert.match(admin.headers.get('content-security-policy'), /frame-ancestors 'none'/);
  assert.equal(admin.headers.get('x-frame-options'), 'DENY');

  const panelJs = await fetch(`${app.base}/admin/app.js`);
  assert.equal(panelJs.status, 200);
  assert.match(panelJs.headers.get('content-type'), /javascript/);

  const head = await fetch(`${app.base}/`, { method: 'HEAD' });
  assert.equal(head.status, 200);
  assert.ok(Number(head.headers.get('content-length')) > 1000);
  assert.equal(await head.text(), '');

  const traversal = await fetch(`${app.base}/admin/%2e%2e%2f%2e%2e%2fsrc%2fapp.mjs`);
  assert.equal(traversal.status, 404);
  assert.doesNotMatch(await traversal.text(), /createApp/);

  const traversalAssets = await fetch(`${app.base}/assets/%2e%2e%2fsrc%2fapp.mjs`);
  assert.equal(traversalAssets.status, 404);

  const missingApi = await fetch(`${app.base}/api/nie-ma`);
  assert.equal(missingApi.status, 404);
  assert.equal((await missingApi.json()).error, 'not_found');

  const wrongMethod = await fetch(`${app.base}/api/registrations`, { method: 'PUT' });
  assert.equal(wrongMethod.status, 405);
});
