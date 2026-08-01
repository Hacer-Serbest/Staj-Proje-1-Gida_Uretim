const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const productionOrderModel = require('../models/productionOrder.model');
const productionService = require('../services/production.service');

const list = asyncHandler(async (req, res) => {
  const productionOrders = await productionOrderModel.list(req.query);
  res.status(200).json({ success: true, data: { productionOrders } });
});

const getById = asyncHandler(async (req, res) => {
  const productionOrder = await productionOrderModel.findById(req.params.id);
  if (!productionOrder) {
    throw new ApiError(404, 'Üretim emri bulunamadı.');
  }
  res.status(200).json({ success: true, data: { productionOrder } });
});

const create = asyncHandler(async (req, res) => {
  const productionOrder = await productionService.createProductionOrder({
    ...req.body,
    createdBy: req.user.id,
  });
  res.status(201).json({ success: true, data: { productionOrder } });
});

const start = asyncHandler(async (req, res) => {
  const productionOrder = await productionService.startProduction(req.params.id);
  res.status(200).json({ success: true, data: { productionOrder } });
});

const complete = asyncHandler(async (req, res) => {
  const productionOrder = await productionService.completeProduction(req.params.id, req.body, req.user.id);
  res.status(200).json({ success: true, data: { productionOrder } });
});

const cancel = asyncHandler(async (req, res) => {
  const productionOrder = await productionService.cancelProduction(req.params.id);
  res.status(200).json({ success: true, data: { productionOrder } });
});

module.exports = { list, getById, create, start, complete, cancel };
