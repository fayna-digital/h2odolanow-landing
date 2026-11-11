import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

export function renderTemplate(template, data) {
  return String(template).replace(/\{\{\s*([a-z0-9_]+)\s*\}\}/gi, (match, key) => {
    const value = data[key.toLowerCase()];
    return value === undefined || value === null ? '' : String(value);
  });
}

function eml({ from, to, subject, body, date = new Date() }) {
  const boundary = `h2-${randomUUID()}`;
  const encoded = Buffer.from(body, 'utf8').toString('base64').replace(/(.{76})/g, '$1\r\n');

  return [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: =?UTF-8?B?${Buffer.from(subject, 'utf8').toString('base64')}?=`,
    `Date: ${date.toUTCString()}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset="utf-8"',
    'Content-Transfer-Encoding: base64',
    '',
    encoded,
    '',
    `--${boundary}--`,
    ''
  ].join('\r\n');
}

/**
 * Prototypowe wysyłanie poczty.
 *
 * transport = "file"  → wiadomości lądują w var/outbox jako pliki .eml
 *                       (testy i praca bez serwera SMTP),
 * transport = "smtp"  → realna wysyłka, jeśli w projekcie jest nodemailer
 *                       (npm install nodemailer) i ustawione H2_SMTP_URL.
 */
export function createMailer(config) {
  const sent = [];

  async function sendViaFile({ to, subject, body }) {
    await fsp.mkdir(config.outboxDir, { recursive: true });
    const safe = to.replace(/[^a-z0-9@._-]/gi, '_').slice(0, 60);
    const file = path.join(config.outboxDir, `${Date.now()}-${safe}.eml`);
    await fsp.writeFile(file, eml({ from: config.mail.from, to, subject, body }), 'utf8');
    return file;
  }

  async function sendViaSmtp({ to, subject, body }) {
    let nodemailer;
    try {
      nodemailer = await import('nodemailer');
    } catch {
      throw new Error(
        'Transport SMTP wymaga pakietu nodemailer (npm install nodemailer) albo ustaw H2_MAIL_TRANSPORT=file.'
      );
    }
    if (!config.mail.smtpUrl) {
      throw new Error('Brak H2_SMTP_URL dla transportu SMTP.');
    }
    const transport = nodemailer.createTransport(config.mail.smtpUrl);
    return transport.sendMail({ from: config.mail.from, to, subject, text: body });
  }

  return {
    transport: config.mail.transport,

    async send({ to, subject, body }) {
      const payload = { to, subject, body };
      let result;
      if (config.mail.transport === 'smtp') result = await sendViaSmtp(payload);
      else result = await sendViaFile(payload);
      sent.push({ to, subject, at: new Date().toISOString(), result });
      return result;
    },

    sent
  };
}

export function outboxFiles(dir) {
  try {
    return fs
      .readdirSync(dir)
      .filter((name) => name.endsWith('.eml'))
      .map((name) => path.join(dir, name));
  } catch {
    return [];
  }
}
