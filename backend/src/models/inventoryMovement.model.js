const { query } = require('../config/db');

const create = async (
  client,
  { materialId, movementType, quantity, reason, referenceType, referenceId, notes, createdBy }
) => {
  const { rows } = await client.query(
    `INSERT INTO inventory_movements
       (material_id, movement_type, quantity, reason, reference_type, reference_id, notes, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [materialId, movementType, quantity, reason, referenceType || null, referenceId || null, notes || null, createdBy]
  );
  return rows[0];
};

const listByMaterial = async (materialId, { limit = 50, offset = 0 } = {}) => {
  const { rows } = await query(
    `SELECT im.*, u.full_name AS created_by_name
     FROM inventory_movements im
     LEFT JOIN users u ON u.id = im.created_by
     WHERE im.material_id = $1
     ORDER BY im.created_at DESC
     LIMIT $2 OFFSET $3`,
    [materialId, limit, offset]
  );
  return rows;
};

const listAll = async ({ reason, movementType, limit = 50, offset = 0 } = {}) => {
  const conditions = [];
  const params = [];

  if (reason) {
    params.push(reason);
    conditions.push(`im.reason = $${params.length}`);
  }
  if (movementType) {
    params.push(movementType);
    conditions.push(`im.movement_type = $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  params.push(limit, offset);

  const { rows } = await query(
    `SELECT im.*, m.name AS material_name, u.full_name AS created_by_name
     FROM inventory_movements im
     JOIN materials m ON m.id = im.material_id
     LEFT JOIN users u ON u.id = im.created_by
     ${where}
     ORDER BY im.created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );
  return rows;
};

module.exports = { create, listByMaterial, listAll };
