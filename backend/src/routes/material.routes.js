const { Router } = require('express');
const materialController = require('../controllers/material.controller');
const authenticate = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
const { idParamSchema } = require('../validators/common.validator');
const {
  createMaterialSchema,
  updateMaterialSchema,
  listMaterialsQuerySchema,
} = require('../validators/material.validator');
const { listMovementsQuerySchema } = require('../validators/inventory.validator');

const router = Router();

router.use(authenticate);

router.get('/', validate(listMaterialsQuerySchema, 'query'), materialController.list);
router.get('/:id', validate(idParamSchema, 'params'), materialController.getById);
router.get(
  '/:id/movements',
  validate(idParamSchema, 'params'),
  validate(listMovementsQuerySchema, 'query'),
  materialController.listMovements
);

router.post('/', authorize('admin', 'depo'), validate(createMaterialSchema), materialController.create);
router.patch(
  '/:id',
  authorize('admin', 'depo'),
  validate(idParamSchema, 'params'),
  validate(updateMaterialSchema),
  materialController.update
);

module.exports = router;
