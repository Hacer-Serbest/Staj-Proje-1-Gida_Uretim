const ApiError = require('../utils/ApiError');

/**
 * zod şeması ile req.body/query/params doğrular.
 * @param {import('zod').ZodSchema} schema
 * @param {'body' | 'query' | 'params'} source
 */
const validate = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source]);

  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    return next(new ApiError(400, 'Geçersiz istek verisi.', details));
  }

  req[source] = result.data;
  next();
};

module.exports = validate;
