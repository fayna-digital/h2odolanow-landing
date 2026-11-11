// Panel zgłoszeń H2O!dolanów — waniliowy JS, bez zależności.
// Zasada: żadnych innerHTML na danych z bazy (dane osobowe → tylko textContent).

const $ = (id) => document.getElementById(id);

const state = {
  filters: { q: '', type: '', status: '', from: '', to: '' },
  items: []
};

async function api(path, { method = 'GET', body } = {}) {
  const headers = {};
  if (method !== 'GET') {
    headers['content-type'] = 'application/json';
    headers['x-requested-with'] = 'h2-admin';
  }
  const response = await fetch(path, {
    method,
    headers,
    credentials: 'same-origin',
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  let payload = {};
  try {
    payload = await response.json();
  } catch {
    payload = {};
  }
  return { status: response.status, ok: response.ok && payload.ok !== false, payload };
}

function setStatus(element, message, state_) {
  element.textContent = message || '';
  if (state_) element.dataset.state = state_;
  else delete element.dataset.state;
}

function showLogin(message) {
  $('login-view').hidden = false;
  $('panel-view').hidden = true;
  $('logout').hidden = true;
  $('whoami').textContent = '';
  if (message) setStatus($('login-status'), message, 'error');
}

async function showPanel() {
  $('login-view').hidden = true;
  $('panel-view').hidden = false;
  $('logout').hidden = false;
  $('whoami').textContent = 'zalogowano';
  await Promise.all([loadStats(), loadSettings(), loadList(), loadTemplates()]);
}

async function loadStats() {
  const { ok, payload } = await api('/admin/api/stats');
  if (!ok) return;
  const labels = {
    uczestnik: 'uczestnicy',
    prelegent: 'prelegenci',
    partner: 'partnerzy',
    media: 'media'
  };
  const list = $('stats');
  list.textContent = '';
  const entries = [['razem', payload.stats.total]];
  for (const [key, value] of Object.entries(payload.stats.byType || {})) {
    entries.push([labels[key] || key, value]);
  }
  for (const [label, value] of entries) {
    const item = document.createElement('li');
    const strong = document.createElement('strong');
    strong.textContent = value;
    const span = document.createElement('span');
    span.textContent = label;
    item.append(strong, span);
    list.append(item);
  }
}

async function loadSettings() {
  const { ok, payload } = await api('/admin/api/settings');
  if (!ok) return;
  $('open-toggle').checked = Boolean(payload.settings.registration_open);
  $('open-status').textContent = payload.settings.registration_open
    ? 'Formularz przyjmuje zgłoszenia.'
    : 'Formularz jest zamknięty — zgłoszenia nie są przyjmowane.';
}

async function loadTemplates() {
  const { ok, payload } = await api('/admin/api/settings');
  if (!ok) return;
  const s = payload.settings;
  $('t-confirm-subject').value = s.email_confirm_subject || '';
  $('t-confirm-body').value = s.email_confirm_body || '';
  $('t-admin-subject').value = s.email_admin_subject || '';
  $('t-admin-body').value = s.email_admin_body || '';
}

function currentQuery() {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(state.filters)) {
    if (value) params.set(key, value);
  }
  return params;
}

async function loadList() {
  const params = currentQuery();
  params.set('limit', '100');
  const { ok, payload } = await api(`/admin/api/registrations?${params.toString()}`);
  const status = $('list-status');
  if (!ok) {
    setStatus(status, payload.message || 'Nie udało się pobrać listy.', 'error');
    return;
  }
  state.items = payload.items;
  renderRows(payload.items);
  $('total').textContent = `${payload.total} ${payload.total === 1 ? 'zgłoszenie' : 'zgłoszeń'}`;
  // Komunikaty o udanej operacji zostają widoczne; czyścimy tylko błędy pobierania.
  if (status.dataset.state === 'error') setStatus(status, '');
}

function renderRows(items) {
  const tbody = $('rows');
  tbody.textContent = '';

  if (!items.length) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 8;
    td.className = 'empty';
    td.textContent = 'Brak zgłoszeń dla wybranych kryteriów.';
    tr.append(td);
    tbody.append(tr);
    return;
  }

  for (const item of items) {
    const tr = document.createElement('tr');

    const idCell = document.createElement('td');
    idCell.className = 'num';
    idCell.textContent = item.id;
    tr.append(idCell);

    const dateCell = document.createElement('td');
    dateCell.className = 'mono';
    dateCell.textContent = String(item.created_at).slice(0, 16).replace('T', ' ');
    tr.append(dateCell);

    const nameCell = document.createElement('td');
    nameCell.textContent = item.name;
    if (item.position) {
      const small = document.createElement('div');
      small.className = 'hint';
      small.textContent = item.position;
      nameCell.append(small);
    }
    tr.append(nameCell);

    const orgCell = document.createElement('td');
    orgCell.textContent = item.organization;
    if (item.city) {
      const small = document.createElement('div');
      small.className = 'hint';
      small.textContent = item.city;
      orgCell.append(small);
    }
    tr.append(orgCell);

    const contactCell = document.createElement('td');
    const mail = document.createElement('div');
    mail.className = 'mono';
    mail.textContent = item.email;
    const phone = document.createElement('div');
    phone.className = 'mono';
    phone.textContent = item.phone;
    contactCell.append(mail, phone);
    tr.append(contactCell);

    const typeCell = document.createElement('td');
    typeCell.textContent = item.type;
    tr.append(typeCell);

    const statusCell = document.createElement('td');
    const pill = document.createElement('span');
    pill.className = 'pill';
    pill.dataset.status = item.status;
    pill.textContent = item.status;
    statusCell.append(pill);
    tr.append(statusCell);

    const actionsCell = document.createElement('td');
    const actions = document.createElement('div');
    actions.className = 'actions';

    const edit = document.createElement('button');
    edit.type = 'button';
    edit.className = 'btn btn--ghost btn--small';
    edit.textContent = 'Edytuj';
    edit.addEventListener('click', () => openEdit(item));

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'btn btn--danger';
    remove.textContent = 'Usuń';
    remove.addEventListener('click', () => removeItem(item));

    actions.append(edit, remove);
    actionsCell.append(actions);
    tr.append(actionsCell);

    tbody.append(tr);
  }
}

async function removeItem(item) {
  const confirmed = window.confirm(
    `Usunąć zgłoszenie ${item.name} (${item.email})? Tej operacji nie można cofnąć — dane zostaną trwale usunięte z bazy.`
  );
  if (!confirmed) return;

  const { ok, payload } = await api(`/admin/api/registrations/${item.id}`, { method: 'DELETE' });
  if (!ok) {
    setStatus($('list-status'), payload.message || 'Nie udało się usunąć zgłoszenia.', 'error');
    return;
  }
  setStatus($('list-status'), `Zgłoszenie ${item.id} zostało usunięte.`, 'success');
  await Promise.all([loadStats(), loadList()]);
}

function openEdit(item) {
  $('e-id').value = item.id;
  $('e-name').value = item.name;
  $('e-organization').value = item.organization;
  $('e-position').value = item.position || '';
  $('e-email').value = item.email;
  $('e-phone').value = item.phone;
  $('e-city').value = item.city || '';
  $('e-type').value = item.type;
  $('e-status').value = item.status;
  $('e-notes').value = item.notes || '';
  $('e-consent-contact').checked = Boolean(item.consent_contact);
  setStatus($('edit-status'), '');
  $('edit-dialog').showModal();
}

async function saveEdit(event) {
  event.preventDefault();
  const id = $('e-id').value;
  const body = {
    name: $('e-name').value,
    organization: $('e-organization').value,
    position: $('e-position').value,
    email: $('e-email').value,
    phone: $('e-phone').value,
    city: $('e-city').value,
    type: $('e-type').value,
    status: $('e-status').value,
    notes: $('e-notes').value,
    consent_contact: $('e-consent-contact').checked
  };

  const { ok, payload } = await api(`/admin/api/registrations/${id}`, { method: 'PATCH', body });
  if (!ok) {
    const details = payload.errors ? Object.values(payload.errors).join(' ') : payload.message;
    setStatus($('edit-status'), details || 'Nie udało się zapisać zmian.', 'error');
    return;
  }
  $('edit-dialog').close();
  setStatus($('list-status'), `Zgłoszenie ${id} zaktualizowane.`, 'success');
  await Promise.all([loadStats(), loadList()]);
}

async function saveTemplates(event) {
  event.preventDefault();
  const { ok, payload } = await api('/admin/api/settings', {
    method: 'PATCH',
    body: {
      email_confirm_subject: $('t-confirm-subject').value,
      email_confirm_body: $('t-confirm-body').value,
      email_admin_subject: $('t-admin-subject').value,
      email_admin_body: $('t-admin-body').value
    }
  });
  setStatus(
    $('template-status'),
    ok ? 'Treści zapisane.' : payload.message || 'Nie udało się zapisać treści.',
    ok ? 'success' : 'error'
  );
}

function exportCsv() {
  const params = currentQuery();
  window.location.href = `/admin/api/registrations.csv?${params.toString()}`;
}

function bind() {
  $('login-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const { ok, payload } = await api('/admin/api/login', {
      method: 'POST',
      body: { password: $('password').value }
    });
    if (!ok) {
      setStatus($('login-status'), payload.message || 'Logowanie nie powiodło się.', 'error');
      return;
    }
    $('password').value = '';
    setStatus($('login-status'), '');
    await showPanel();
  });

  $('logout').addEventListener('click', async () => {
    await api('/admin/api/logout', { method: 'POST', body: {} });
    showLogin('Wylogowano.');
  });

  $('filters').addEventListener('submit', (event) => {
    event.preventDefault();
    state.filters = {
      q: $('f-q').value.trim(),
      type: $('f-type').value,
      status: $('f-status').value,
      from: $('f-from').value,
      to: $('f-to').value
    };
    setStatus($('list-status'), '');
    loadList();
  });

  $('filters').addEventListener('reset', () => {
    state.filters = { q: '', type: '', status: '', from: '', to: '' };
    setStatus($('list-status'), '');
    window.setTimeout(loadList, 0);
  });

  $('export').addEventListener('click', exportCsv);

  $('open-toggle').addEventListener('change', async (event) => {
    const { ok, payload } = await api('/admin/api/settings', {
      method: 'PATCH',
      body: { registration_open: event.target.checked }
    });
    if (!ok) {
      event.target.checked = !event.target.checked;
      setStatus($('open-status'), payload.message || 'Nie udało się zmienić stanu rejestracji.', 'error');
      return;
    }
    setStatus(
      $('open-status'),
      event.target.checked
        ? 'Rejestracja otwarta — formularz przyjmuje zgłoszenia.'
        : 'Rejestracja zamknięta — nowe zgłoszenia są odrzucane.',
      'success'
    );
  });

  $('edit-form').addEventListener('submit', saveEdit);
  $('edit-cancel').addEventListener('click', () => $('edit-dialog').close());
  $('templates').addEventListener('submit', saveTemplates);
}

async function boot() {
  bind();
  const { ok, payload } = await api('/admin/api/session');
  if (ok && payload.authenticated) {
    if (payload.passwordIsDefault) {
      setStatus(
        $('list-status'),
        'Uwaga: panel działa na domyślnym haśle. Ustaw H2_ADMIN_PASSWORD przed wdrożeniem.',
        'error'
      );
    }
    await showPanel();
    return;
  }
  showLogin('');
}

document.addEventListener('DOMContentLoaded', boot);
