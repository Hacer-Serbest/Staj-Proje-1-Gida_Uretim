const { query } = require('../config/db');

const create = async ({ name, sku, unit, salePrice, description }) => {
  const { rows } = await query(
    `INSERT INTO products (name, sku, unit, sale_price, description)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [name, sku, unit, salePrice ?? 0, description || null]
  );
  return rows[0];
};

const findById = async (id) => {
  const { rows } = await query('SELECT * FROM products WHERE id = $1', [id]);
  return rows[0] || null;
};

const findBySku = async (sku) => {
  const { rows } = await query('SELECT * FROM products WHERE sku = $1', [sku]);
  return rows[0] || null;
};

const list = async ({ isActive } = {}) => {
  const conditions = [];
  const params = [];

  if (isActive !== undefined) {
    params.push(isActive);
    conditions.push(`is_active = $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const { rows } = await query(`SELECT * FROM products ${where} ORDER BY name ASC`, params);
  return rows;
};

const update = async (id, fields) => {
  const allowed = ['name', 'sku', 'unit', 'sale_price', 'description', 'is_active'];
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
    `UPDATE products SET ${setClauses.join(', ')} WHERE id = $${params.length} RETURNING *`,
    params
  );
  return rows[0] || null;
};

module.exports = { create, findById, findBySku, list, update };
