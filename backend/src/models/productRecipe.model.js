const { query } = require('../config/db');

const getByProduct = async (productId) => {
  const { rows } = await query(
    `SELECT pr.id, pr.product_id, pr.material_id, pr.quantity_required,
            m.name AS material_name, m.unit AS material_unit, m.current_stock AS material_current_stock
     FROM product_recipes pr
     JOIN materials m ON m.id = pr.material_id
     WHERE pr.product_id = $1
     ORDER BY m.name ASC`,
    [productId]
  );
  return rows;
};

const deleteByProduct = async (client, productId) => {
  await client.query('DELETE FROM product_recipes WHERE product_id = $1', [productId]);
};

const bulkInsert = async (client, productId, items) => {
  for (const item of items) {
    await client.query(
      `INSERT INTO product_recipes (product_id, material_id, quantity_required)
       VALUES ($1, $2, $3)`,
      [productId, item.materialId, item.quantityRequired]
    );
  }
};

module.exports = { getByProduct, deleteByProduct, bulkInsert };
