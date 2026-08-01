const { z } = require('zod');

const createCustomerSchema = z.object({
  name: z.string().trim().min(2, 'Müşteri adı en az 2 karakter olmalı.').max(150),
  contactName: z.string().trim().max(150).optional(),
  email: z.string().trim().email('Geçerli bir e-posta adresi girin.').optional(),
  phone: z.string().trim().max(30).optional(),
  address: z.string().trim().max(500).optional(),
  taxNumber: z.string().trim().max(50).optional(),
});

const updateCustomerSchema = z
  .object({
    name: z.string().trim().min(2).max(150).optional(),
    contactName: z.string().trim().max(150).optional(),
    email: z.string().trim().email('Geçerli bir e-posta adresi girin.').optional(),
    phone: z.string().trim().max(30).optional(),
    address: z.string().trim().max(500).optional(),
    taxNumber: z.string().trim().max(50).optional(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Güncellenecek en az bir alan gönderilmeli.',
  });

const listCustomersQuerySchema = z.object({
  isActive: z
    .enum(['true', 'false'])
    .optional()
    .transform((val) => (val === undefined ? undefined : val === 'true')),
  search: z.string().trim().max(150).optional(),
});

module.exports = { createCustomerSchema, updateCustomerSchema, listCustomersQuerySchema };
