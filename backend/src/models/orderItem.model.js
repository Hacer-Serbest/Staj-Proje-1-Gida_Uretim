const { query } = require('../config/db');

const bulkInsert = async (client, orderId, items) => {
  const inserted = [];
  for (const item of items) {
    const { rows } = await client.query(
      `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [orderId, item.productId, item.quantity, item.unitPrice]
    );
    inserted.push(rows[0]);
  }
  return inserted;
};

const getByOrder = async (orderId) => {
  const { rows } = await query(
    `SELECT oi.*, p.name AS product_name, p.unit AS product_unit
     FROM order_items oi
     JOIN products p ON p.id = oi.product_id
     WHERE oi.order_id = $1
     ORDER BY p.name ASC`,
    [orderId]
  );
  return rows;
};

module.exports = { bulkInsert, getByOrder };
