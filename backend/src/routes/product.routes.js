const { Router } = require('express');
const productController = require('../controllers/product.controller');
const authenticate = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
const { idParamSchema } = require('../validators/common.validator');
const {
  createProductSchema,
  updateProductSchema,
  listProductsQuerySchema,
  setRecipeSchema,
} = require('../validators/product.validator');

const router = Router();

router.use(authenticate);

router.get('/', validate(listProductsQuerySchema, 'query'), productController.list);
router.get('/:id', validate(idParamSchema, 'params'), productController.getById);
router.get('/:id/recipe', validate(idParamSchema, 'params'), productController.getRecipe);

router.post('/', authorize('admin', 'uretim'), validate(createProductSchema), productController.create);
router.patch(
  '/:id',
  authorize('admin', 'uretim'),
  validate(idParamSchema, 'params'),
  validate(updateProductSchema),
  productController.update
);
router.put(
  '/:id/recipe',
  authorize('admin', 'uretim'),
  validate(idParamSchema, 'params'),
  validate(setRecipeSchema),
  productController.setRecipe
);

module.exports = router;
