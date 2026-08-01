const { pool } = require('../config/db');
const ApiError = require('../utils/ApiError');
const productModel = require('../models/product.model');
const materialModel = require('../models/material.model');
const productRecipeModel = require('../models/productRecipe.model');

const setRecipe = async (productId, items) => {
  const product = await productModel.findById(productId);
  if (!product) {
    throw new ApiError(404, 'Ürün bulunamadı.');
  }

  for (const item of items) {
    const material = await materialModel.findById(item.materialId);
    if (!material) {
      throw new ApiError(400, `Geçersiz hammadde kimliği: ${item.materialId}`);
    }
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await productRecipeModel.deleteByProduct(client, productId);
    if (items.length > 0) {
      await productRecipeModel.bulkInsert(client, productId, items);
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  return productRecipeModel.getByProduct(productId);
};

module.exports = { setRecipe };
