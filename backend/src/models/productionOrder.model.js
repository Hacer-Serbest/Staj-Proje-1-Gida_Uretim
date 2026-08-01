const { query } = require('../config/db');

const generateOrderNumber = async (client) => {
  const { rows } = await client.query("SELECT nextval('production_order_number_seq') AS n");
  const year = new Date().getFullYear();
  return `URT-${year}-${String(rows[0].n).padStart(6, '0')}`;
};

const create = async (
  client,
  { orderNumber, productId, plannedQuantity, plannedStartDate, plannedEndDate, notes, orderId, createdBy }
) => {
  const { rows } = await client.query(
    `INSERT INTO production_orders
       (order_number, product_id, planned_quantity, planned_start_date, planned_end_date, notes, order_id, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [orderNumber, productId, plannedQuantity, plannedStartDate || null, plannedEndDate || null, notes || null, orderId || null, createdBy]
  );
  return rows[0];
};

const findById = async (id) => {
  const { rows } = await query(
    `SELECT po.*, p.name AS product_name, p.unit AS product_unit
     FROM production_orders po
     JOIN products p ON p.id = po.product_id
     WHERE po.id = $1`,
    [id]
  );
  return rows[0] || null;
};

const findByIdForUpdate = async (client, id) => {
  const { rows } = await client.query('SELECT * FROM production_orders WHERE id = $1 FOR UPDATE', [id]);
  return rows[0] || null;
};

const list = async ({ status, productId } = {}) => {
  const conditions = [];
  const params = [];

  if (status) {
    params.push(status);
    conditions.push(`po.status = $${params.length}`);
  }
  if (productId) {
    params.push(productId);
    conditions.push(`po.product_id = $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const { rows } = await query(
    `SELECT po.*, p.name AS product_name, p.unit AS product_unit
     FROM production_orders po
     JOIN products p ON p.id = po.product_id
     ${where}
     ORDER BY po.created_at DESC`,
    params
  );
  return rows;
};

const updateStatus = async (client, id, fields) => {
  const allowed = [
    'status',
    'produced_quantity',
    'actual_start_date',
    'actual_end_date',
    'planned_start_date',
    'planned_end_date',
    'notes',
  ];
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
  const { rows } = await client.query(
    `UPDATE production_orders SET ${setClauses.join(', ')} WHERE id = $${params.length} RETURNING *`,
    params
  );
  return rows[0] || null;
};

module.exports = { generateOrderNumber, create, findById, findByIdForUpdate, list, updateStatus };
