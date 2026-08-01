const { z } = require('zod');

const UNITS = ['kg', 'g', 'lt', 'ml', 'adet', 'paket'];

const createProductSchema = z.object({
  name: z.string().trim().min(2, 'Ürün adı en az 2 karakter olmalı.').max(150),
  sku: z.string().trim().min(2, 'SKU en az 2 karakter olmalı.').max(50).toUpperCase(),
  unit: z.enum(UNITS),
  salePrice: z.coerce.number().min(0).default(0),
  description: z.string().trim().max(1000).optional(),
});

const updateProductSchema = z
  .object({
    name: z.string().trim().min(2).max(150).optional(),
    sku: z.string().trim().min(2).max(50).toUpperCase().optional(),
    unit: z.enum(UNITS).optional(),
    salePrice: z.coerce.number().min(0).optional(),
    description: z.string().trim().max(1000).optional(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Güncellenecek en az bir alan gönderilmeli.',
  });

const listProductsQuerySchema = z.object({
  isActive: z
    .enum(['true', 'false'])
    .optional()
    .transform((val) => (val === undefined ? undefined : val === 'true')),
});

const recipeItemSchema = z.object({
  materialId: z.string().uuid('Geçersiz hammadde kimliği.'),
  quantityRequired: z.coerce.number().positive('Miktar sıfırdan büyük olmalı.'),
});

const setRecipeSchema = z.object({
  items: z
    .array(recipeItemSchema)
    .min(1, 'En az bir hammadde eklenmeli.')
    .superRefine((items, ctx) => {
      const seen = new Set();
      for (const item of items) {
        if (seen.has(item.materialId)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Aynı hammadde reçetede birden fazla kez geçemez.',
          });
          break;
        }
        seen.add(item.materialId);
      }
    }),
});

module.exports = { UNITS, createProductSchema, updateProductSchema, listProductsQuerySchema, setRecipeSchema };
