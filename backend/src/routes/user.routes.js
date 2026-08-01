const { Router } = require('express');
const userController = require('../controllers/user.controller');
const authenticate = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
const { idParamSchema } = require('../validators/common.validator');
const { listUsersQuerySchema, updateUserSchema } = require('../validators/user.validator');

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/', validate(listUsersQuerySchema, 'query'), userController.list);
router.get('/:id', validate(idParamSchema, 'params'), userController.getById);
router.patch(
  '/:id',
  validate(idParamSchema, 'params'),
  validate(updateUserSchema, 'body'),
  userController.update
);

module.exports = router;
