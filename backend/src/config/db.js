const { Pool } = require('pg');
const env = require('./env');

const pool = new Pool({
  connectionString: env.databaseUrl,
  ssl: env.pgSsl ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  console.error('Beklenmeyen veritabanı havuzu hatası:', err);
  process.exit(1);
});

const query = (text, params) => pool.query(text, params);

module.exports = { pool, query };
