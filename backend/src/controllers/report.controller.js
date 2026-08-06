const asyncHandler = require('../utils/asyncHandler');
const reportModel = require('../models/report.model');

const toDateOnly = (date) => date.toISOString().slice(0, 10);

// Sorguda from/to verilmezse son 30 günü varsayılan alır.
const resolveRange = (query) => {
  const to = query.to || toDateOnly(new Date());
  const from = query.from || toDateOnly(new Date(Date.now() - 29 * 24 * 60 * 60 * 1000));
  return { from, to };
};

const production = asyncHandler(async (req, res) => {
  const { from, to } = resolveRange(req.query);
  const summary = await reportModel.getProductionSummary(from, to);
  res.status(200).json({ success: true, data: { from, to, ...summary } });
});

const inventory = asyncHandler(async (req, res) => {
  const { from, to } = resolveRange(req.query);
  const summary = await reportModel.getInventorySummary(from, to);
  res.status(200).json({ success: true, data: { from, to, ...summary } });
});

const sales = asyncHandler(async (req, res) => {
  const { from, to } = resolveRange(req.query);
  const summary = await reportModel.getSalesSummary(from, to);
  res.status(200).json({ success: true, data: { from, to, ...summary } });
});

module.exports = { production, inventory, sales };
