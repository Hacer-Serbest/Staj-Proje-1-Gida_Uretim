const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false,
});

const ensureMigrationsTable = async (client) => {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      filename TEXT NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
};

const getAppliedMigrations = async (client) => {
  const { rows } = await client.query('SELECT filename FROM schema_migrations ORDER BY id');
  return new Set(rows.map((row) => row.filename));
};

const run = async () => {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    console.error(`Migration klasörü bulunamadı: ${MIGRATIONS_DIR}`);
    process.exit(1);
  }

  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  const client = await pool.connect();

  try {
    await ensureMigrationsTable(client);
    const applied = await getAppliedMigrations(client);

    const pending = files.filter((file) => !applied.has(file));

    if (pending.length === 0) {
      console.log('Uygulanacak yeni migration yok. Veritabanı güncel.');
      return;
    }

    for (const file of pending) {
      const filePath = path.join(MIGRATIONS_DIR, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      console.log(`Uygulanıyor: ${file}`);
      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file]);
        await client.query('COMMIT');
        console.log(`Tamamlandı: ${file}`);
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`Migration başarısız: ${file}`);
        throw err;
      }
    }

    console.log(`${pending.length} migration başarıyla uygulandı.`);
  } finally {
    client.release();
    await pool.end();
  }
};

run().catch((err) => {
  console.error('Migration işlemi hata ile sonlandı:', err.message);
  process.exit(1);
});
