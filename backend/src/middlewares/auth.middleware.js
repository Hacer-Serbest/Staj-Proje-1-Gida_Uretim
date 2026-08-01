const jwt = require('jsonwebtoken');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');

const authenticate = (req, res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(new ApiError(401, 'Yetkilendirme başlığı eksik veya hatalı.'));
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    req.user = { id: payload.id, role: payload.role };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Oturum süresi dolmuş, lütfen tekrar giriş yapın.'));
    }
    return next(new ApiError(401, 'Geçersiz veya bozuk token.'));
  }
};

module.exports = authenticate;
