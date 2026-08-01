const { Router } = require('express');
const authController = require('../controllers/auth.controller');
const authenticate = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
const { registerSchema, loginSchema, changePasswordSchema } = require('../validators/auth.validator');

const router = Router();

router.post('/login', validate(loginSchema), authController.login);

// Yeni kullanıcı hesabı sadece admin tarafından oluşturulur (serbest kayıt yok).
router.post('/register', authenticate, authorize('admin'), validate(registerSchema), authController.register);

router.get('/me', authenticate, authController.me);
router.patch('/me/password', authenticate, validate(changePasswordSchema), authController.changePassword);

module.exports = router;
