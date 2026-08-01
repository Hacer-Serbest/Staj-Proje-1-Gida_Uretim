const { Router } = require('express');
const orderController = require('../controllers/order.controller');
const authenticate = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
const { idParamSchema } = require('../validators/common.validator');
const {
  createOrderSchema,
  updateOrderStatusSchema,
  listOrdersQuerySchema,
} = require('../validators/order.validator');

const router = Router();

router.use(authenticate);

router.get('/', validate(listOrdersQuerySchema, 'query'), orderController.list);
router.get('/:id', validate(idParamSchema, 'params'), orderController.getById);

router.post('/', authorize('admin', 'satis'), validate(createOrderSchema), orderController.create);
router.patch(
  '/:id/status',
  authorize('admin', 'satis', 'uretim'),
  validate(idParamSchema, 'params'),
  validate(updateOrderStatusSchema),
  orderController.updateStatus
);

module.exports = router;
