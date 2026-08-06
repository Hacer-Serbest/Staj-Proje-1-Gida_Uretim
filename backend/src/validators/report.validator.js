const { z } = require('zod');

const DATE_SHAPE = /^\d{4}-\d{2}-\d{2}$/;

// Regex sadece şekli doğrular (13. ay, 99. gün gibi geçersiz tarihleri de eşleştirir).
// Takvimsel olarak da geçerli olduğunu ayrıca kontrol ediyoruz — aksi halde
// PostgreSQL'e geçersiz bir tarih gidip 500 hatasına yol açar.
const isValidCalendarDate = (value) => {
  if (!DATE_SHAPE.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
};

const dateString = z.string().refine(isValidCalendarDate, 'Geçerli bir tarih olmalı (YYYY-MM-DD).');

const dateRangeQuerySchema = z
  .object({
    from: dateString.optional(),
    to: dateString.optional(),
  })
  .refine((data) => !data.from || !data.to || data.from <= data.to, {
    message: '"from" tarihi "to" tarihinden sonra olamaz.',
  });

module.exports = { dateRangeQuerySchema };
