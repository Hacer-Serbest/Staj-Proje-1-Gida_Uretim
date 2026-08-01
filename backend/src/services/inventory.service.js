const { pool } = require('../config/db');
const ApiError = require('../utils/ApiError');
const materialModel = require('../models/material.model');
const inventoryMovementModel = require('../models/inventoryMovement.model');

/**
 * Var olan bir transaction client'ı içinde stok hareketi işler.
 * Materyal satırını kilitler, yeni stok negatif olamaz, hareketi kaydeder.
 * Bu fonksiyon kendi başına BEGIN/COMMIT yapmaz — çağıran taraf transaction yönetir.
 */
const recordMovementWithClient = async (
  client,
  { materialId, movementType, quantity, reason, referenceType, referenceId, notes, createdBy }
) => {
  if (quantity <= 0) {
    throw new ApiError(400, 'Miktar sıfırdan büyük olmalı.');
  }

  const locked = await materialModel.lockForUpdate(client, materialId);
  if (!locked) {
    throw new ApiError(404, 'Hammadde bulunamadı.');
  }

  const delta = movementType === 'in' ? quantity : -quantity;
  const newStock = Number(locked.current_stock) + delta;

  if (newStock < 0) {
    throw new ApiError(
      400,
      `Yetersiz stok: "${locked.name}" için mevcut stok (${locked.current_stock} ${locked.unit}) bu işlemi karşılamıyor.`
    );
  }

  const material = await materialModel.setStock(client, materialId, newStock);

  const movement = await inventoryMovementModel.create(client, {
    materialId,
    movementType,
    quantity,
    reason,
    referenceType,
    referenceId,
    notes,
    createdBy,
  });

  return { material, movement };
};

/**
 * Tek başına bir stok hareketi kaydeder (kendi transaction'ını yönetir).
 */
const recordMovement = async (params) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await recordMovementWithClient(client, params);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

module.exports = { recordMovement, recordMovementWithClient };
