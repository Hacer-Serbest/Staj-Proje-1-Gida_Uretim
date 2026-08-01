const asyncHandler = require('../utils/asyncHandler');
const inventoryService = require('../services/inventory.service');
const inventoryMovementModel = require('../models/inventoryMovement.model');

const createMovement = asyncHandler(async (req, res) => {
  const { materialId, movementType, quantity, reason, notes } = req.body;

  const { material, movement } = await inventoryService.recordMovement({
    materialId,
    movementType,
    quantity,
    reason,
    notes,
    createdBy: req.user.id,
  });

  res.status(201).json({ success: true, data: { material, movement } });
});

const listMovements = asyncHandler(async (req, res) => {
  const movements = await inventoryMovementModel.listAll(req.query);
  res.status(200).json({ success: true, data: { movements } });
});

module.exports = { createMovement, listMovements };
