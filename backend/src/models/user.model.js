const { query } = require('../config/db');

const PUBLIC_COLUMNS = 'id, full_name, email, phone, employee_id, role, is_active, created_at, updated_at';

const findByEmail = async (email) => {
  const { rows } = await query('SELECT * FROM users WHERE email = $1', [email]);
  return rows[0] || null;
};

const findById = async (id) => {
  const { rows } = await query(`SELECT ${PUBLIC_COLUMNS} FROM users WHERE id = $1`, [id]);
  return rows[0] || null;
};

// password_hash dahil tüm sütunları döner; yalnızca auth.service içinde kullanılmalıdır.
const findByIdWithPassword = async (id) => {
  const { rows } = await query('SELECT * FROM users WHERE id = $1', [id]);
  return rows[0] || null;
};

const findByEmployeeId = async (employeeId) => {
  const { rows } = await query('SELECT id FROM users WHERE employee_id = $1', [employeeId]);
  return rows[0] || null;
};

const create = async ({ fullName, email, passwordHash, role, phone, employeeId }) => {
  const { rows } = await query(
    `INSERT INTO users (full_name, email, password_hash, role, phone, employee_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING ${PUBLIC_COLUMNS}`,
    [fullName, email, passwordHash, role, phone || null, employeeId || null]
  );
  return rows[0];
};

const list = async ({ role, isActive } = {}) => {
  const conditions = [];
  const params = [];

  if (role) {
    params.push(role);
    conditions.push(`role = $${params.length}`);
  }
  if (isActive !== undefined) {
    params.push(isActive);
    conditions.push(`is_active = $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const { rows } = await query(
    `SELECT ${PUBLIC_COLUMNS} FROM users ${where} ORDER BY created_at DESC`,
    params
  );
  return rows;
};

const update = async (id, fields) => {
  const allowed = ['full_name', 'role', 'is_active', 'phone', 'employee_id'];
  const setClauses = [];
  const params = [];

  for (const key of allowed) {
    if (fields[key] !== undefined) {
      params.push(fields[key]);
      setClauses.push(`${key} = $${params.length}`);
    }
  }

  if (setClauses.length === 0) {
    return findById(id);
  }

  params.push(id);
  const { rows } = await query(
    `UPDATE users SET ${setClauses.join(', ')} WHERE id = $${params.length} RETURNING ${PUBLIC_COLUMNS}`,
    params
  );
  return rows[0] || null;
};

const updatePassword = async (id, passwordHash) => {
  await query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, id]);
};

module.exports = {
  findByEmail,
  findById,
  findByIdWithPassword,
  findByEmployeeId,
  create,
  list,
  update,
  updatePassword,
};
