const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const orderModel = require('../models/order.model');
const orderItemModel = require('../models/orderItem.model');
const orderService = require('../services/order.service');

const list = asyncHandler(async (req, res) => {
  const orders = await orderModel.list(req.query);
  res.status(200).json({ success: true, data: { orders } });
});

const getById = asyncHandler(async (req, res) => {
  const order = await orderModel.findById(req.params.id);
  if (!order) {
    throw new ApiError(404, 'Sipariş bulunamadı.');
  }

  const items = await orderItemModel.getByOrder(req.params.id);
  res.status(200).json({ success: true, data: { order: { ...order, items } } });
});

const create = asyncHandler(async (req, res) => {
  const order = await orderService.createOrder({ ...req.body, createdBy: req.user.id });
  res.status(201).json({ success: true, data: { order } });
});

const updateStatus = asyncHandler(async (req, res) => {
  const order = await orderService.updateOrderStatus(req.params.id, req.body.status);
  res.status(200).json({ success: true, data: { order } });
});

module.exports = { list, getById, create, updateStatus };
