const app = require('./app');
const env = require('./config/env');
const { pool } = require('./config/db');
const logger = require('./utils/logger');

let server;

const start = async () => {
  try {
    await pool.query('SELECT 1');
    logger.info('Veritabanı bağlantısı başarılı.');
  } catch (err) {
    logger.error('Veritabanına bağlanılamadı:', err.message);
    process.exit(1);
  }

  server = app.listen(env.port, () => {
    logger.info(`Sunucu ${env.port} portunda, "${env.nodeEnv}" modunda çalışıyor.`);
  });
};

const shutdown = async (signal) => {
  logger.info(`${signal} alındı, sunucu kapatılıyor...`);
  if (server) {
    server.close(() => logger.info('HTTP sunucusu kapatıldı.'));
  }
  await pool.end();
  process.exit(0);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (reason) => {
  logger.error('Yakalanmamış Promise reddi:', reason);
});

start();
