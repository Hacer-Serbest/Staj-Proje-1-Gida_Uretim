const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const customerModel = require('../models/customer.model');

const list = asyncHandler(async (req, res) => {
  const customers = await customerModel.list(req.query);
  res.status(200).json({ success: true, data: { customers } });
});

const getById = asyncHandler(async (req, res) => {
  const customer = await customerModel.findById(req.params.id);
  if (!customer) {
    throw new ApiError(404, 'Müşteri bulunamadı.');
  }
  res.status(200).json({ success: true, data: { customer } });
});

const create = asyncHandler(async (req, res) => {
  const customer = await customerModel.create(req.body);
  res.status(201).json({ success: true, data: { customer } });
});

const update = asyncHandler(async (req, res) => {
  const existing = await customerModel.findById(req.params.id);
  if (!existing) {
    throw new ApiError(404, 'Müşteri bulunamadı.');
  }

  const fields = {};
  if (req.body.name !== undefined) fields.name = req.body.name;
  if (req.body.contactName !== undefined) fields.contact_name = req.body.contactName;
  if (req.body.email !== undefined) fields.email = req.body.email;
  if (req.body.phone !== undefined) fields.phone = req.body.phone;
  if (req.body.address !== undefined) fields.address = req.body.address;
  if (req.body.taxNumber !== undefined) fields.tax_number = req.body.taxNumber;
  if (req.body.isActive !== undefined) fields.is_active = req.body.isActive;

  const customer = await customerModel.update(req.params.id, fields);
  res.status(200).json({ success: true, data: { customer } });
});

module.exports = { list, getById, create, update };
