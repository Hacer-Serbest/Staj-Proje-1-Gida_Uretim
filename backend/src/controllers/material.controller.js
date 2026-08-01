const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const materialModel = require('../models/material.model');
const inventoryMovementModel = require('../models/inventoryMovement.model');
const inventoryService = require('../services/inventory.service');

const list = asyncHandler(async (req, res) => {
  const { isActive, criticalOnly } = req.query;
  const materials = await materialModel.list({ isActive, criticalOnly });
  res.status(200).json({ success: true, data: { materials } });
});

const getById = asyncHandler(async (req, res) => {
  const material = await materialModel.findById(req.params.id);
  if (!material) {
    throw new ApiError(404, 'Hammadde bulunamadı.');
  }
  res.status(200).json({ success: true, data: { material } });
});

const create = asyncHandler(async (req, res) => {
  const { name, unit, currentStock, criticalStockLevel, unitPrice } = req.body;

  const existing = await materialModel.findByName(name);
  if (existing) {
    throw new ApiError(409, 'Bu isimde bir hammadde zaten kayıtlı.');
  }

  const material = await materialModel.create({ name, unit, currentStock, criticalStockLevel, unitPrice });

  if (currentStock > 0) {
    await inventoryService.recordMovement({
      materialId: material.id,
      movementType: 'in',
      quantity: currentStock,
      reason: 'initial',
      notes: 'Hammadde kaydı ile birlikte açılış stoğu.',
      createdBy: req.user.id,
    });
  }

  res.status(201).json({ success: true, data: { material } });
});

const update = asyncHandler(async (req, res) => {
  const existing = await materialModel.findById(req.params.id);
  if (!existing) {
    throw new ApiError(404, 'Hammadde bulunamadı.');
  }

  const fields = {};
  if (req.body.name !== undefined) fields.name = req.body.name;
  if (req.body.unit !== undefined) fields.unit = req.body.unit;
  if (req.body.criticalStockLevel !== undefined) fields.critical_stock_level = req.body.criticalStockLevel;
  if (req.body.unitPrice !== undefined) fields.unit_price = req.body.unitPrice;
  if (req.body.isActive !== undefined) fields.is_active = req.body.isActive;

  const material = await materialModel.update(req.params.id, fields);
  res.status(200).json({ success: true, data: { material } });
});

const listMovements = asyncHandler(async (req, res) => {
  const material = await materialModel.findById(req.params.id);
  if (!material) {
    throw new ApiError(404, 'Hammadde bulunamadı.');
  }

  const movements = await inventoryMovementModel.listByMaterial(req.params.id, req.query);
  res.status(200).json({ success: true, data: { movements } });
});

module.exports = { list, getById, create, update, listMovements };
