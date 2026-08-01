const { z } = require('zod');

const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Tarih YYYY-MM-DD formatında olmalı.')
  .optional();

const createProductionOrderSchema = z.object({
  productId: z.string().uuid('Geçersiz ürün kimliği.'),
  plannedQuantity: z.coerce.number().positive('Planlanan miktar sıfırdan büyük olmalı.'),
  plannedStartDate: dateStringSchema,
  plannedEndDate: dateStringSchema,
  notes: z.string().trim().max(1000).optional(),
  orderId: z.string().uuid('Geçersiz sipariş kimliği.').optional(),
});

const completeProductionSchema = z.object({
  producedQuantity: z.coerce.number().positive('Üretilen miktar sıfırdan büyük olmalı.'),
});

const listProductionOrdersQuerySchema = z.object({
  status: z.enum(['planned', 'in_progress', 'completed', 'cancelled']).optional(),
  productId: z.string().uuid().optional(),
});

module.exports = { createProductionOrderSchema, completeProductionSchema, listProductionOrdersQuerySchema };
