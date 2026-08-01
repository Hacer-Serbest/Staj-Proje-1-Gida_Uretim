const { z } = require('zod');

const createMovementSchema = z.object({
  materialId: z.string().uuid('Geçersiz hammadde kimliği.'),
  movementType: z.enum(['in', 'out']),
  quantity: z.coerce.number().positive('Miktar sıfırdan büyük olmalı.'),
  reason: z.enum(['purchase', 'adjustment', 'initial', 'waste']),
  notes: z.string().trim().max(500).optional(),
});

const listMovementsQuerySchema = z.object({
  reason: z.enum(['purchase', 'production_consumption', 'production_return', 'adjustment', 'initial', 'waste']).optional(),
  movementType: z.enum(['in', 'out']).optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

module.exports = { createMovementSchema, listMovementsQuerySchema };
