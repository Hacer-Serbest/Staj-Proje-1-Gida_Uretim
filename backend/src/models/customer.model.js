const { query } = require('../config/db');

const create = async ({ name, contactName, email, phone, address, taxNumber }) => {
  const { rows } = await query(
    `INSERT INTO customers (name, contact_name, email, phone, address, tax_number)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [name, contactName || null, email || null, phone || null, address || null, taxNumber || null]
  );
  return rows[0];
};

const findById = async (id) => {
  const { rows } = await query('SELECT * FROM customers WHERE id = $1', [id]);
  return rows[0] || null;
};

const list = async ({ isActive, search } = {}) => {
  const conditions = [];
  const params = [];

  if (isActive !== undefined) {
    params.push(isActive);
    conditions.push(`is_active = $${params.length}`);
  }
  if (search) {
    params.push(`%${search}%`);
    conditions.push(`name ILIKE $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const { rows } = await query(`SELECT * FROM customers ${where} ORDER BY name ASC`, params);
  return rows;
};

const update = async (id, fields) => {
  const allowed = ['name', 'contact_name', 'email', 'phone', 'address', 'tax_number', 'is_active'];
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
    `UPDATE customers SET ${setClauses.join(', ')} WHERE id = $${params.length} RETURNING *`,
    params
  );
  return rows[0] || null;
};

module.exports = { create, findById, list, update };
