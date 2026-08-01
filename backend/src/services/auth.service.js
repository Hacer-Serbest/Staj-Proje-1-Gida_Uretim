const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');
const userModel = require('../models/user.model');

const SALT_ROUNDS = 10;

const generateToken = (user) =>
  jwt.sign({ id: user.id, role: user.role }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });

const register = async ({ fullName, email, password, role }) => {
  const existing = await userModel.findByEmail(email);
  if (existing) {
    throw new ApiError(409, 'Bu e-posta adresi zaten kayıtlı.');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await userModel.create({ fullName, email, passwordHash, role });

  return { user, token: generateToken(user) };
};

const login = async ({ email, password }) => {
  const user = await userModel.findByEmail(email);
  if (!user) {
    throw new ApiError(401, 'E-posta veya şifre hatalı.');
  }

  if (!user.is_active) {
    throw new ApiError(403, 'Hesabınız pasif durumda. Yöneticinizle iletişime geçin.');
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw new ApiError(401, 'E-posta veya şifre hatalı.');
  }

  const { password_hash, ...safeUser } = user;
  return { user: safeUser, token: generateToken(user) };
};

const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await userModel.findByIdWithPassword(userId);
  if (!user) {
    throw new ApiError(404, 'Kullanıcı bulunamadı.');
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
  if (!isMatch) {
    throw new ApiError(401, 'Mevcut şifre hatalı.');
  }

  const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await userModel.updatePassword(userId, newHash);
};

module.exports = { register, login, changePassword, generateToken };
