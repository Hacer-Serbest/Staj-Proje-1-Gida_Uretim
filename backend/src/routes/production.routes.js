const { Router } = require('express');
const productionController = require('../controllers/production.controller');
const authenticate = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
const { idParamSchema } = require('../validators/common.validator');
const {
  createProductionOrderSchema,
  completeProductionSchema,
  listProductionOrdersQuerySchema,
} = require('../validators/production.validator');

const router = Router();

router.use(authenticate);

router.get('/', validate(listProductionOrdersQuerySchema, 'query'), productionController.list);
router.get('/:id', validate(idParamSchema, 'params'), productionController.getById);

router.post(
  '/',
  authorize('admin', 'uretim'),
  validate(createProductionOrderSchema),
  productionController.create
);
router.post(
  '/:id/start',
  authorize('admin', 'uretim'),
  validate(idParamSchema, 'params'),
  productionController.start
);
router.post(
  '/:id/complete',
  authorize('admin', 'uretim'),
  validate(idParamSchema, 'params'),
  validate(completeProductionSchema),
  productionController.complete
);
router.post(
  '/:id/cancel',
  authorize('admin', 'uretim'),
  validate(idParamSchema, 'params'),
  productionController.cancel
);

module.exports = router;
