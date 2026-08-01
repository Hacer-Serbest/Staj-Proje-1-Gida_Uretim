const { query } = require('../config/db');

const generateOrderNumber = async (client) => {
  const { rows } = await client.query("SELECT nextval('order_number_seq') AS n");
  const year = new Date().getFullYear();
  return `SIP-${year}-${String(rows[0].n).padStart(6, '0')}`;
};

const create = async (client, { orderNumber, customerId, deliveryDate, notes, createdBy }) => {
  const { rows } = await client.query(
    `INSERT INTO orders (order_number, customer_id, delivery_date, notes, created_by)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [orderNumber, customerId, deliveryDate || null, notes || null, createdBy]
  );
  return rows[0];
};

const findById = async (id) => {
  const { rows } = await query(
    `SELECT o.*, c.name AS customer_name, c.contact_name AS customer_contact_name
     FROM orders o
     JOIN customers c ON c.id = o.customer_id
     WHERE o.id = $1`,
    [id]
  );
  return rows[0] || null;
};

const findByIdForUpdate = async (client, id) => {
  const { rows } = await client.query('SELECT * FROM orders WHERE id = $1 FOR UPDATE', [id]);
  return rows[0] || null;
};

const list = async ({ status, customerId } = {}) => {
  const conditions = [];
  const params = [];

  if (status) {
    params.push(status);
    conditions.push(`o.status = $${params.length}`);
  }
  if (customerId) {
    params.push(customerId);
    conditions.push(`o.customer_id = $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const { rows } = await query(
    `SELECT o.*, c.name AS customer_name
     FROM orders o
     JOIN customers c ON c.id = o.customer_id
     ${where}
     ORDER BY o.created_at DESC`,
    params
  );
  return rows;
};

const updateStatus = async (client, id, status) => {
  const { rows } = await client.query(
    'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
    [status, id]
  );
  return rows[0] || null;
};

module.exports = { generateOrderNumber, create, findById, findByIdForUpdate, list, updateStatus };
