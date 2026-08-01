const { z } = require('zod');

const idParamSchema = z.object({
  id: z.string().uuid('Geçersiz kimlik formatı.'),
});

const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

module.exports = { idParamSchema, paginationQuerySchema };
