const { query } = require('../config/db');

// current_stock her zaman 0 ile başlar; açılış stoğu varsa çağıran taraf (material.controller)
// bunu inventory_movements üzerinden ('initial' hareketiyle) uygular. Stok miktarının TEK
// kaynağı hareketler olmalı — burada da set edilirse çift sayım olur.
const create = async ({ name, unit, criticalStockLevel, unitPrice }) => {
  const { rows } = await query(
    `INSERT INTO materials (name, unit, critical_stock_level, unit_price)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [name, unit, criticalStockLevel ?? 0, unitPrice ?? 0]
  );
  return rows[0];
};

const findById = async (id) => {
  const { rows } = await query('SELECT * FROM materials WHERE id = $1', [id]);
  return rows[0] || null;
};

const findByName = async (name) => {
  const { rows } = await query('SELECT * FROM materials WHERE name = $1', [name]);
  return rows[0] || null;
};

const list = async ({ isActive, criticalOnly } = {}) => {
  const conditions = [];
  const params = [];

  if (isActive !== undefined) {
    params.push(isActive);
    conditions.push(`is_active = $${params.length}`);
  }
  if (criticalOnly) {
    conditions.push('current_stock <= critical_stock_level');
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const { rows } = await query(`SELECT * FROM materials ${where} ORDER BY name ASC`, params);
  return rows;
};

const update = async (id, fields) => {
  const allowed = ['name', 'unit', 'critical_stock_level', 'unit_price', 'is_active'];
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
    `UPDATE materials SET ${setClauses.join(', ')} WHERE id = $${params.length} RETURNING *`,
    params
  );
  return rows[0] || null;
};

// Transaction içinde satırı kilitler; inventory.service yeterlilik kontrolünü
// UPDATE'ten ÖNCE yapabilsin diye ham satırı döner (DB CHECK constraint'ine
// güvenmek yerine temiz bir ApiError(400) üretebilmek için).
const lockForUpdate = async (client, id) => {
  const { rows } = await client.query('SELECT * FROM materials WHERE id = $1 FOR UPDATE', [id]);
  return rows[0] || null;
};

const setStock = async (client, id, newStock) => {
  const { rows } = await client.query(
    'UPDATE materials SET current_stock = $1 WHERE id = $2 RETURNING *',
    [newStock, id]
  );
  return rows[0];
};

module.exports = { create, findById, findByName, list, update, lockForUpdate, setStock };
