const asyncHandler = require('../utils/asyncHandler');
const authService = require('../services/auth.service');
const userModel = require('../models/user.model');

const register = asyncHandler(async (req, res) => {
  const { user, token } = await authService.register(req.body);
  res.status(201).json({ success: true, data: { user, token } });
});

const login = asyncHandler(async (req, res) => {
  const { user, token } = await authService.login(req.body);
  res.status(200).json({ success: true, data: { user, token } });
});

const me = asyncHandler(async (req, res) => {
  const user = await userModel.findById(req.user.id);
  res.status(200).json({ success: true, data: { user } });
});

const changePassword = asyncHandler(async (req, res) => {
  await authService.changePassword(req.user.id, req.body.currentPassword, req.body.newPassword);
  res.status(200).json({ success: true, message: 'Şifre başarıyla güncellendi.' });
});

module.exports = { register, login, me, changePassword };
