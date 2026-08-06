const { z } = require('zod');
const { ROLES } = require('./auth.validator');

const listUsersQuerySchema = z.object({
  role: z.enum(ROLES).optional(),
  isActive: z
    .enum(['true', 'false'])
    .optional()
    .transform((val) => (val === undefined ? undefined : val === 'true')),
});

const updateUserSchema = z
  .object({
    fullName: z.string().trim().min(2).max(120).optional(),
    role: z.enum(ROLES).optional(),
    isActive: z.boolean().optional(),
    phone: z.string().trim().max(30).optional(),
    employeeId: z.string().trim().max(30).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Güncellenecek en az bir alan gönderilmeli.',
  });

module.exports = { listUsersQuerySchema, updateUserSchema };
