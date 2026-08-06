const { z } = require('zod');

const ROLES = ['admin', 'uretim', 'depo', 'satis'];

const registerSchema = z.object({
  fullName: z.string().trim().min(2, 'Ad soyad en az 2 karakter olmalı.').max(120),
  email: z.string().trim().email('Geçerli bir e-posta adresi girin.').toLowerCase(),
  password: z.string().min(8, 'Şifre en az 8 karakter olmalı.').max(72),
  role: z.enum(ROLES).default('satis'),
  phone: z.string().trim().max(30).optional(),
  employeeId: z.string().trim().max(30).optional(),
});

const loginSchema = z.object({
  email: z.string().trim().email('Geçerli bir e-posta adresi girin.').toLowerCase(),
  password: z.string().min(1, 'Şifre gerekli.'),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Mevcut şifre gerekli.'),
  newPassword: z.string().min(8, 'Yeni şifre en az 8 karakter olmalı.').max(72),
});

module.exports = { ROLES, registerSchema, loginSchema, changePasswordSchema };
