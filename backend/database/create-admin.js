const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();

/**
 * Production'da ilk admin kullanıcıyı oluşturmak için kullanılır.
 * database/seeds/001_demo_data.js DEMO amaçlıdır ve herkesçe bilinen bir şifre
 * (Admin123!) içerir — production'da ASLA çalıştırılmamalıdır. Bunun yerine:
 *
 *   ADMIN_EMAIL=... ADMIN_PASSWORD=... ADMIN_NAME="..." [ADMIN_PHONE=...] [ADMIN_EMPLOYEE_ID=...] npm run create-admin
 *
 * İdempotenttir: e-posta zaten kayıtlıysa hiçbir şey yapmaz.
 */

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false,
});

const run = async () => {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const fullName = process.env.ADMIN_NAME || 'Sistem Yöneticisi';
  const phone = process.env.ADMIN_PHONE || null;
  const employeeId = process.env.ADMIN_EMPLOYEE_ID || null;

  if (!email || !password) {
    console.error('ADMIN_EMAIL ve ADMIN_PASSWORD ortam değişkenleri zorunludur.');
    console.error('Örnek: ADMIN_EMAIL=admin@firma.com ADMIN_PASSWORD=GucluBirSifre123! npm run create-admin');
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('ADMIN_PASSWORD en az 8 karakter olmalı.');
    process.exit(1);
  }

  const client = await pool.connect();
  try {
    const { rows } = await client.query('SELECT id FROM users WHERE email = $1', [email]);
    if (rows.length > 0) {
      console.log(`Bu e-posta zaten kayıtlı, herhangi bir değişiklik yapılmadı: ${email}`);
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await client.query(
      `INSERT INTO users (full_name, email, password_hash, role, phone, employee_id)
       VALUES ($1, $2, $3, 'admin', $4, $5)`,
      [fullName, email, passwordHash, phone, employeeId]
    );
    console.log(`Admin kullanıcı oluşturuldu: ${email}`);
  } finally {
    client.release();
    await pool.end();
  }
};

run().catch((err) => {
  console.error('Admin oluşturma işlemi başarısız:', err.message);
  process.exit(1);
});
