const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const SEEDS_DIR = path.join(__dirname, 'seeds');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false,
});

const run = async () => {
  const files = fs
    .readdirSync(SEEDS_DIR)
    .filter((file) => file.endsWith('.js'))
    .sort();

  const client = await pool.connect();

  try {
    for (const file of files) {
      const seedFn = require(path.join(SEEDS_DIR, file));
      console.log(`Seed çalıştırılıyor: ${file}`);
      await client.query('BEGIN');
      try {
        await seedFn(client);
        await client.query('COMMIT');
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`Seed başarısız: ${file}`);
        throw err;
      }
    }
  } finally {
    client.release();
    await pool.end();
  }
};

run().catch((err) => {
  console.error('Seed işlemi hata ile sonlandı:', err.message);
  process.exit(1);
});
