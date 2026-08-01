const { Router } = require('express');
const inventoryController = require('../controllers/inventory.controller');
const authenticate = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
const { createMovementSchema, listMovementsQuerySchema } = require('../validators/inventory.validator');

const router = Router();

router.use(authenticate);

router.get('/', validate(listMovementsQuerySchema, 'query'), inventoryController.listMovements);
router.post('/', authorize('admin', 'depo'), validate(createMovementSchema), inventoryController.createMovement);

module.exports = router;
