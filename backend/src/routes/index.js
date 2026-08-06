const { Router } = require('express');

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const materialRoutes = require('./material.routes');
const inventoryRoutes = require('./inventory.routes');
const productRoutes = require('./product.routes');
const productionRoutes = require('./production.routes');
const customerRoutes = require('./customer.routes');
const orderRoutes = require('./order.routes');
const reportRoutes = require('./report.routes');

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/materials', materialRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/products', productRoutes);
router.use('/production-orders', productionRoutes);
router.use('/customers', customerRoutes);
router.use('/orders', orderRoutes);
router.use('/reports', reportRoutes);

module.exports = router;
