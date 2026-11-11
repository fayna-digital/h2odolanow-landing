import { REGISTRATION_TYPES, REGISTRATION_STATUSES } from './db.mjs';

export const TYPE_LABELS = {
  uczestnik: 'Uczestnik',
  prelegent: 'Prelegent / moderator',
  partner: 'Partner / wystawca',
  media: 'Przedstawiciel mediów'
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

function text(value, max) {
  if (value === undefined || value === null) return '';
  return String(value)
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

export function toBool(value) {
  if (value === true) return true;
  if (value === false || value === undefined || value === null || value === '') return false;
  const normalized = String(value).trim().toLowerCase();
  return ['1', 'true', 'on', 'yes', 'tak'].includes(normalized);
}

/**
 * Walidacja zgłoszenia. Te same reguły działają na froncie i na serwerze —
 * tutaj są te obowiązujące, bo frontend można obejść.
 */
export function validateRegistration(input = {}, options = {}) {
  const minFillMs = Number(options.minFillMs ?? 0);
  const errors = {};

  const values = {
    name: text(input.name, 120),
    organization: text(input.organization, 160),
    position: text(input.position, 120),
    email: text(input.email, 160).toLowerCase(),
    phone: text(input.phone, 32),
    city: text(input.city, 80),
    type: text(input.type, 32) || 'uczestnik',
    notes: typeof input.notes === 'string' ? input.notes.trim().slice(0, 2000) : '',
    consent_rodo: toBool(input.consent_rodo),
    consent_contact: toBool(input.consent_contact)
  };

  const digits = values.phone.replace(/\D/g, '');

  if (values.name.length < 3) {
    errors.name = 'Podaj imię i nazwisko.';
  } else if (!/\p{L}/u.test(values.name)) {
    errors.name = 'Imię i nazwisko musi zawierać litery.';
  }

  if (values.organization.length < 2) {
    errors.organization = 'Podaj nazwę instytucji lub firmy.';
  }

  if (!EMAIL_RE.test(values.email)) {
    errors.email = 'Podaj poprawny adres e-mail.';
  }

  if (digits.length < 9 || digits.length > 15) {
    errors.phone = 'Podaj numer telefonu (min. 9 cyfr).';
  }

  if (!REGISTRATION_TYPES.includes(values.type)) {
    errors.type = 'Wybierz rodzaj zgłoszenia z listy.';
    values.type = 'uczestnik';
  }

  if (!values.consent_rodo) {
    errors.consent_rodo = 'Zgoda na przetwarzanie danych jest wymagana.';
  }

  const honeypot = text(input.website, 200) !== '';

  let tooFast = false;
  if (input.form_loaded_at && minFillMs > 0) {
    const loaded = Date.parse(input.form_loaded_at);
    if (Number.isFinite(loaded) && Date.now() - loaded < minFillMs) tooFast = true;
  }

  return { values, errors, honeypot, tooFast };
}

/** Walidacja pól edytowanych w panelu administracyjnym. */
export function validateAdminPatch(input = {}) {
  const errors = {};
  const patch = {};

  if (input.name !== undefined) {
    patch.name = text(input.name, 120);
    if (patch.name.length < 3) errors.name = 'Imię i nazwisko jest za krótkie.';
  }
  if (input.organization !== undefined) {
    patch.organization = text(input.organization, 160);
    if (patch.organization.length < 2) errors.organization = 'Nazwa instytucji jest za krótka.';
  }
  if (input.position !== undefined) patch.position = text(input.position, 120);
  if (input.email !== undefined) {
    patch.email = text(input.email, 160).toLowerCase();
    if (!EMAIL_RE.test(patch.email)) errors.email = 'Niepoprawny adres e-mail.';
  }
  if (input.phone !== undefined) {
    patch.phone = text(input.phone, 32);
    const digits = patch.phone.replace(/\D/g, '');
    if (digits.length < 9 || digits.length > 15) errors.phone = 'Niepoprawny numer telefonu.';
  }
  if (input.city !== undefined) patch.city = text(input.city, 80);
  if (input.type !== undefined) {
    if (!REGISTRATION_TYPES.includes(input.type)) errors.type = 'Nieznany rodzaj zgłoszenia.';
    else patch.type = input.type;
  }
  if (input.status !== undefined) {
    if (!REGISTRATION_STATUSES.includes(input.status)) errors.status = 'Nieznany status.';
    else patch.status = input.status;
  }
  if (input.notes !== undefined) {
    patch.notes = typeof input.notes === 'string' ? input.notes.slice(0, 2000) : '';
  }
  if (input.consent_contact !== undefined) patch.consent_contact = toBool(input.consent_contact);

  return { patch, errors };
}
