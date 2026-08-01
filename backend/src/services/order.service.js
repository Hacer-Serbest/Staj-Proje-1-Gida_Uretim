const { pool } = require('../config/db');
const ApiError = require('../utils/ApiError');
const customerModel = require('../models/customer.model');
const productModel = require('../models/product.model');
const orderModel = require('../models/order.model');
const orderItemModel = require('../models/orderItem.model');

const ALLOWED_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['in_production', 'cancelled'],
  in_production: ['ready', 'cancelled'],
  ready: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};

const createOrder = async ({ customerId, deliveryDate, notes, items, createdBy }) => {
  const customer = await customerModel.findById(customerId);
  if (!customer || !customer.is_active) {
    throw new ApiError(400, 'Geçersiz veya pasif müşteri.');
  }

  const resolvedItems = [];
  for (const item of items) {
    const product = await productModel.findById(item.productId);
    if (!product || !product.is_active) {
      throw new ApiError(400, `Geçersiz veya pasif ürün: ${item.productId}`);
    }
    resolvedItems.push({
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice !== undefined ? item.unitPrice : Number(product.sale_price),
    });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const orderNumber = await orderModel.generateOrderNumber(client);
    const order = await orderModel.create(client, { orderNumber, customerId, deliveryDate, notes, createdBy });
    const orderItems = await orderItemModel.bulkInsert(client, order.id, resolvedItems);
    await client.query('COMMIT');
    return { ...order, items: orderItems };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const updateOrderStatus = async (id, newStatus) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const order = await orderModel.findByIdForUpdate(client, id);
    if (!order) {
      throw new ApiError(404, 'Sipariş bulunamadı.');
    }

    const allowedNext = ALLOWED_TRANSITIONS[order.status] || [];
    if (!allowedNext.includes(newStatus)) {
      throw new ApiError(
        400,
        `"${order.status}" durumundan "${newStatus}" durumuna geçilemez. İzin verilen geçişler: ${allowedNext.join(', ') || 'yok'}.`
      );
    }

    const updated = await orderModel.updateStatus(client, id, newStatus);
    await client.query('COMMIT');
    return updated;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

module.exports = { createOrder, updateOrderStatus, ALLOWED_TRANSITIONS };
