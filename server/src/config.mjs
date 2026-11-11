import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));

export const paths = {
  server: path.resolve(here, '..'),
  repo: path.resolve(here, '..', '..'),
  public: path.resolve(here, '..', 'public'),
  var: path.resolve(here, '..', 'var'),
};

/**
 * Konfiguracja prototypu. Wszystko, co zależy od środowiska, idzie przez zmienne
 * środowiskowe, żeby ten sam kod działał lokalnie i na serwerze urzędu.
 */
export function loadConfig(env = process.env) {
  const varDir = env.H2_VAR_DIR ? path.resolve(env.H2_VAR_DIR) : paths.var;

  return {
    varDir,
    dbFile: env.H2_DB_FILE ? path.resolve(env.H2_DB_FILE) : path.join(varDir, 'registrations.sqlite'),
    outboxDir: path.join(varDir, 'outbox'),
    landingRoot: paths.repo,
    publicDir: paths.public,

    host: env.HOST || '127.0.0.1',
    port: Number(env.PORT || 8787),

    adminPassword: env.H2_ADMIN_PASSWORD || 'demo-admin',
    adminPasswordIsDefault: !env.H2_ADMIN_PASSWORD,
    sessionTtlMs: Number(env.H2_SESSION_TTL_MS || 8 * 60 * 60 * 1000),

    // Limit zgłoszeń z jednego adresu IP.
    submitLimit: { windowMs: 10 * 60 * 1000, max: 5 },
    // Limit prób logowania do panelu.
    loginLimit: { windowMs: 15 * 60 * 1000, max: 10 },
    // Minimalny czas wypełniania formularza (anty-bot).
    minFillMs: Number(env.H2_MIN_FILL_MS || 2000),
    // Sól do hashowania IP — nie zapisujemy adresów wprost.
    ipSalt: env.H2_IP_SALT || 'h2odolanow-proto',

    mail: {
      transport: env.H2_MAIL_TRANSPORT || 'file', // file | smtp
      from: env.H2_MAIL_FROM || 'H2O!dolanów <no-reply@odolanow.pl>',
      organizer: (env.H2_ORGANIZER_EMAIL || 'sekretariat@odolanow.pl')
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean),
      smtpUrl: env.H2_SMTP_URL || ''
    },

    event: {
      name: 'H2O!dolanów',
      dateLabel: '27–28 kwietnia 2027',
      place: 'Klaster Energii Odolanów–Przygodzice–Sulmierzyce',
      contactEmail: 'sekretariat@odolanow.pl',
      contactPhone: '62 733 15 81'
    }
  };
}
