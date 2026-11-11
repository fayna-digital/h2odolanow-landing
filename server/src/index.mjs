import http from 'node:http';
import { loadConfig } from './config.mjs';
import { createApp } from './app.mjs';

const config = loadConfig();
const app = createApp(config);
const server = http.createServer(app.handler);

server.listen(config.port, config.host, () => {
  const base = `http://${config.host}:${config.port}`;
  console.log('H2O!dolanów — moduł rejestracji (prototyp)');
  console.log(`  podstrona: ${base}/`);
  console.log(`  panel:     ${base}/admin`);
  console.log(`  baza:      ${config.dbFile}`);
  console.log(
    `  poczta:    transport=${config.mail.transport}` +
      (config.mail.transport === 'file' ? ` → ${config.outboxDir}` : ` → ${config.mail.smtpUrl}`)
  );
  if (config.adminPasswordIsDefault) {
    console.warn('  UWAGA: domyślne hasło panelu (demo-admin). Ustaw H2_ADMIN_PASSWORD przed wdrożeniem.');
  }
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    console.log('\nZamykam serwer…');
    server.close(() => {
      app.close();
      process.exit(0);
    });
  });
}
