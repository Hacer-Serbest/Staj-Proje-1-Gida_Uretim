const { Router } = require('express');
const customerController = require('../controllers/customer.controller');
const authenticate = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
const { idParamSchema } = require('../validators/common.validator');
const {
  createCustomerSchema,
  updateCustomerSchema,
  listCustomersQuerySchema,
} = require('../validators/customer.validator');

const router = Router();

router.use(authenticate);

router.get('/', validate(listCustomersQuerySchema, 'query'), customerController.list);
router.get('/:id', validate(idParamSchema, 'params'), customerController.getById);

router.post('/', authorize('admin', 'satis'), validate(createCustomerSchema), customerController.create);
router.patch(
  '/:id',
  authorize('admin', 'satis'),
  validate(idParamSchema, 'params'),
  validate(updateCustomerSchema),
  customerController.update
);

module.exports = router;
