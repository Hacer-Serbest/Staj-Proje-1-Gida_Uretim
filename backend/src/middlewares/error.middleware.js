const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');
const env = require('../config/env');

const notFoundHandler = (req, res, next) => {
  next(new ApiError(404, `Kaynak bulunamadı: ${req.method} ${req.originalUrl}`));
};

const errorHandler = (err, req, res, next) => {
  const statusCode = err instanceof ApiError ? err.statusCode : 500;
  const message = statusCode === 500 && env.nodeEnv === 'production'
    ? 'Sunucu hatası oluştu.'
    : err.message || 'Sunucu hatası oluştu.';

  if (statusCode >= 500) {
    logger.error(err.stack || err.message);
  }

  res.status(statusCode).json({
    success: false,
    message,
    details: err instanceof ApiError ? err.details : undefined,
  });
};

module.exports = { notFoundHandler, errorHandler };
