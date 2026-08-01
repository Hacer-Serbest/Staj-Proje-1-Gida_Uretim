const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const userModel = require('../models/user.model');

const list = asyncHandler(async (req, res) => {
  const { role, isActive } = req.query;
  const users = await userModel.list({ role, isActive });
  res.status(200).json({ success: true, data: { users } });
});

const getById = asyncHandler(async (req, res) => {
  const user = await userModel.findById(req.params.id);
  if (!user) {
    throw new ApiError(404, 'Kullanıcı bulunamadı.');
  }
  res.status(200).json({ success: true, data: { user } });
});

const update = asyncHandler(async (req, res) => {
  const existing = await userModel.findById(req.params.id);
  if (!existing) {
    throw new ApiError(404, 'Kullanıcı bulunamadı.');
  }

  const fields = {};
  if (req.body.fullName !== undefined) fields.full_name = req.body.fullName;
  if (req.body.role !== undefined) fields.role = req.body.role;
  if (req.body.isActive !== undefined) fields.is_active = req.body.isActive;

  const user = await userModel.update(req.params.id, fields);
  res.status(200).json({ success: true, data: { user } });
});

module.exports = { list, getById, update };
