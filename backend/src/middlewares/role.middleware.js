const ApiError = require('../utils/ApiError');

/**
 * authenticate middleware'inden SONRA kullanılmalıdır.
 * @param {...string} allowedRoles
 */
const authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(401, 'Kimlik doğrulaması gerekli.'));
  }

  if (!allowedRoles.includes(req.user.role)) {
    return next(new ApiError(403, 'Bu işlem için yetkiniz yok.'));
  }

  next();
};

module.exports = authorize;
