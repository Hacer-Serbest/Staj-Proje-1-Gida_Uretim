const { z } = require('zod');

const UNITS = ['kg', 'g', 'lt', 'ml', 'adet', 'paket'];

const createMaterialSchema = z.object({
  name: z.string().trim().min(2, 'Hammadde adı en az 2 karakter olmalı.').max(150),
  unit: z.enum(UNITS),
  currentStock: z.coerce.number().min(0).default(0),
  criticalStockLevel: z.coerce.number().min(0).default(0),
  unitPrice: z.coerce.number().min(0).default(0),
});

const updateMaterialSchema = z
  .object({
    name: z.string().trim().min(2).max(150).optional(),
    unit: z.enum(UNITS).optional(),
    criticalStockLevel: z.coerce.number().min(0).optional(),
    unitPrice: z.coerce.number().min(0).optional(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Güncellenecek en az bir alan gönderilmeli.',
  });

const listMaterialsQuerySchema = z.object({
  isActive: z
    .enum(['true', 'false'])
    .optional()
    .transform((val) => (val === undefined ? undefined : val === 'true')),
  criticalOnly: z
    .enum(['true', 'false'])
    .optional()
    .transform((val) => val === 'true'),
});

module.exports = { UNITS, createMaterialSchema, updateMaterialSchema, listMaterialsQuerySchema };
