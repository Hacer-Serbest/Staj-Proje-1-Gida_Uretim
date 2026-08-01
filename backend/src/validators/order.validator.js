const { z } = require('zod');

const orderItemSchema = z.object({
  productId: z.string().uuid('Geçersiz ürün kimliği.'),
  quantity: z.coerce.number().positive('Miktar sıfırdan büyük olmalı.'),
  unitPrice: z.coerce.number().min(0).optional(),
});

const createOrderSchema = z.object({
  customerId: z.string().uuid('Geçersiz müşteri kimliği.'),
  deliveryDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Tarih YYYY-MM-DD formatında olmalı.')
    .optional(),
  notes: z.string().trim().max(1000).optional(),
  items: z
    .array(orderItemSchema)
    .min(1, 'En az bir ürün eklenmeli.')
    .superRefine((items, ctx) => {
      const seen = new Set();
      for (const item of items) {
        if (seen.has(item.productId)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Aynı ürün siparişte birden fazla kez geçemez.',
          });
          break;
        }
        seen.add(item.productId);
      }
    }),
});

const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'in_production', 'ready', 'delivered', 'cancelled']),
});

const listOrdersQuerySchema = z.object({
  status: z.enum(['pending', 'confirmed', 'in_production', 'ready', 'delivered', 'cancelled']).optional(),
  customerId: z.string().uuid().optional(),
});

module.exports = { createOrderSchema, updateOrderStatusSchema, listOrdersQuerySchema };
