const { pool } = require('../config/db');
const ApiError = require('../utils/ApiError');
const productModel = require('../models/product.model');
const productionOrderModel = require('../models/productionOrder.model');
const productRecipeModel = require('../models/productRecipe.model');
const inventoryService = require('./inventory.service');

const createProductionOrder = async ({ productId, plannedQuantity, plannedStartDate, plannedEndDate, notes, orderId, createdBy }) => {
  const product = await productModel.findById(productId);
  if (!product) {
    throw new ApiError(404, 'Ürün bulunamadı.');
  }

  const recipe = await productRecipeModel.getByProduct(productId);
  if (recipe.length === 0) {
    throw new ApiError(400, 'Bu ürün için tanımlı bir reçete (hammadde listesi) yok. Önce reçete tanımlayın.');
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const orderNumber = await productionOrderModel.generateOrderNumber(client);
    const productionOrder = await productionOrderModel.create(client, {
      orderNumber,
      productId,
      plannedQuantity,
      plannedStartDate,
      plannedEndDate,
      notes,
      orderId,
      createdBy,
    });
    await client.query('COMMIT');
    return productionOrder;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const startProduction = async (id) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const productionOrder = await productionOrderModel.findByIdForUpdate(client, id);
    if (!productionOrder) {
      throw new ApiError(404, 'Üretim emri bulunamadı.');
    }
    if (productionOrder.status !== 'planned') {
      throw new ApiError(400, `Sadece "planned" durumundaki üretim emirleri başlatılabilir. Mevcut durum: ${productionOrder.status}`);
    }

    const updated = await productionOrderModel.updateStatus(client, id, {
      status: 'in_progress',
      actual_start_date: new Date(),
    });
    await client.query('COMMIT');
    return updated;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Üretimi tamamlar: üretilen miktara göre reçetedeki hammaddeleri stoktan düşer.
 * Yetersiz stok varsa tüm işlem geri alınır (atomik).
 */
const completeProduction = async (id, { producedQuantity }, userId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const productionOrder = await productionOrderModel.findByIdForUpdate(client, id);
    if (!productionOrder) {
      throw new ApiError(404, 'Üretim emri bulunamadı.');
    }
    if (productionOrder.status !== 'in_progress') {
      throw new ApiError(400, `Sadece "in_progress" durumundaki üretim emirleri tamamlanabilir. Mevcut durum: ${productionOrder.status}`);
    }

    const recipe = await productRecipeModel.getByProduct(productionOrder.product_id);

    for (const item of recipe) {
      const requiredQuantity = Number(item.quantity_required) * Number(producedQuantity);
      await inventoryService.recordMovementWithClient(client, {
        materialId: item.material_id,
        movementType: 'out',
        quantity: requiredQuantity,
        reason: 'production_consumption',
        referenceType: 'production_order',
        referenceId: id,
        notes: `${productionOrder.order_number} üretim emri tüketimi`,
        createdBy: userId,
      });
    }

    const updated = await productionOrderModel.updateStatus(client, id, {
      status: 'completed',
      produced_quantity: producedQuantity,
      actual_end_date: new Date(),
    });

    await client.query('COMMIT');
    return updated;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const cancelProduction = async (id) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const productionOrder = await productionOrderModel.findByIdForUpdate(client, id);
    if (!productionOrder) {
      throw new ApiError(404, 'Üretim emri bulunamadı.');
    }
    if (productionOrder.status === 'completed' || productionOrder.status === 'cancelled') {
      throw new ApiError(400, `"${productionOrder.status}" durumundaki bir üretim emri iptal edilemez.`);
    }

    const updated = await productionOrderModel.updateStatus(client, id, { status: 'cancelled' });
    await client.query('COMMIT');
    return updated;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

module.exports = { createProductionOrder, startProduction, completeProduction, cancelProduction };
