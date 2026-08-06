const { Router } = require('express');
const reportController = require('../controllers/report.controller');
const authenticate = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { dateRangeQuerySchema } = require('../validators/report.validator');

const router = Router();

router.use(authenticate);

router.get('/production', validate(dateRangeQuerySchema, 'query'), reportController.production);
router.get('/inventory', validate(dateRangeQuerySchema, 'query'), reportController.inventory);
router.get('/sales', validate(dateRangeQuerySchema, 'query'), reportController.sales);

module.exports = router;
