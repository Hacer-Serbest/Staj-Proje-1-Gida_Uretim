const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const productModel = require('../models/product.model');
const productRecipeModel = require('../models/productRecipe.model');
const productService = require('../services/product.service');

const list = asyncHandler(async (req, res) => {
  const products = await productModel.list(req.query);
  res.status(200).json({ success: true, data: { products } });
});

const getById = asyncHandler(async (req, res) => {
  const product = await productModel.findById(req.params.id);
  if (!product) {
    throw new ApiError(404, 'Ürün bulunamadı.');
  }
  res.status(200).json({ success: true, data: { product } });
});

const create = asyncHandler(async (req, res) => {
  const { name, sku, unit, salePrice, description } = req.body;

  const existing = await productModel.findBySku(sku);
  if (existing) {
    throw new ApiError(409, 'Bu SKU zaten kullanımda.');
  }

  const product = await productModel.create({ name, sku, unit, salePrice, description });
  res.status(201).json({ success: true, data: { product } });
});

const update = asyncHandler(async (req, res) => {
  const existing = await productModel.findById(req.params.id);
  if (!existing) {
    throw new ApiError(404, 'Ürün bulunamadı.');
  }

  if (req.body.sku && req.body.sku !== existing.sku) {
    const skuOwner = await productModel.findBySku(req.body.sku);
    if (skuOwner) {
      throw new ApiError(409, 'Bu SKU zaten kullanımda.');
    }
  }

  const fields = {};
  if (req.body.name !== undefined) fields.name = req.body.name;
  if (req.body.sku !== undefined) fields.sku = req.body.sku;
  if (req.body.unit !== undefined) fields.unit = req.body.unit;
  if (req.body.salePrice !== undefined) fields.sale_price = req.body.salePrice;
  if (req.body.description !== undefined) fields.description = req.body.description;
  if (req.body.isActive !== undefined) fields.is_active = req.body.isActive;

  const product = await productModel.update(req.params.id, fields);
  res.status(200).json({ success: true, data: { product } });
});

const getRecipe = asyncHandler(async (req, res) => {
  const product = await productModel.findById(req.params.id);
  if (!product) {
    throw new ApiError(404, 'Ürün bulunamadı.');
  }

  const recipe = await productRecipeModel.getByProduct(req.params.id);
  res.status(200).json({ success: true, data: { recipe } });
});

const setRecipe = asyncHandler(async (req, res) => {
  const recipe = await productService.setRecipe(req.params.id, req.body.items);
  res.status(200).json({ success: true, data: { recipe } });
});

module.exports = { list, getById, create, update, getRecipe, setRecipe };
