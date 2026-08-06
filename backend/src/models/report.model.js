const { query } = require('../config/db');

/**
 * Tamamlanan üretim emirlerinin, verilen tarih aralığında ürün bazında özeti.
 * Tarih filtresi actual_end_date üzerinden uygulanır (üretimin fiilen bittiği an).
 */
const getProductionSummary = async (from, to) => {
  const { rows: byProduct } = await query(
    `SELECT p.id AS product_id, p.name AS product_name, p.unit,
            COUNT(po.id)::int AS order_count,
            COALESCE(SUM(po.produced_quantity), 0) AS total_produced
     FROM production_orders po
     JOIN products p ON p.id = po.product_id
     WHERE po.status = 'completed'
       AND po.actual_end_date::date BETWEEN $1 AND $2
     GROUP BY p.id, p.name, p.unit
     ORDER BY total_produced DESC`,
    [from, to]
  );

  const totals = byProduct.reduce(
    (acc, row) => ({
      orderCount: acc.orderCount + row.order_count,
      totalProduced: acc.totalProduced + Number(row.total_produced),
    }),
    { orderCount: 0, totalProduced: 0 }
  );

  return { totals, byProduct };
};

/**
 * Verilen tarih aralığındaki stok hareketlerinin hammadde bazında giriş/çıkış özeti.
 */
const getInventorySummary = async (from, to) => {
  const { rows: byMaterial } = await query(
    `SELECT m.id AS material_id, m.name AS material_name, m.unit,
            COALESCE(SUM(CASE WHEN im.movement_type = 'in' THEN im.quantity ELSE 0 END), 0) AS total_in,
            COALESCE(SUM(CASE WHEN im.movement_type = 'out' THEN im.quantity ELSE 0 END), 0) AS total_out,
            COUNT(im.id)::int AS movement_count
     FROM inventory_movements im
     JOIN materials m ON m.id = im.material_id
     WHERE im.created_at::date BETWEEN $1 AND $2
     GROUP BY m.id, m.name, m.unit
     ORDER BY total_out DESC`,
    [from, to]
  );

  const totals = byMaterial.reduce(
    (acc, row) => ({
      totalIn: acc.totalIn + Number(row.total_in),
      totalOut: acc.totalOut + Number(row.total_out),
      movementCount: acc.movementCount + row.movement_count,
    }),
    { totalIn: 0, totalOut: 0, movementCount: 0 }
  );

  return { totals, byMaterial };
};

/**
 * Verilen tarih aralığında (iptal edilmemiş) siparişlerin ürün ve müşteri bazında ciro özeti.
 */
const getSalesSummary = async (from, to) => {
  const { rows: byProduct } = await query(
    `SELECT p.id AS product_id, p.name AS product_name, p.unit,
            COALESCE(SUM(oi.quantity), 0) AS total_quantity,
            COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS total_revenue
     FROM order_items oi
     JOIN orders o ON o.id = oi.order_id
     JOIN products p ON p.id = oi.product_id
     WHERE o.status != 'cancelled'
       AND o.order_date BETWEEN $1 AND $2
     GROUP BY p.id, p.name, p.unit
     ORDER BY total_revenue DESC`,
    [from, to]
  );

  const { rows: byCustomer } = await query(
    `SELECT c.id AS customer_id, c.name AS customer_name,
            COUNT(DISTINCT o.id)::int AS order_count,
            COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS total_revenue
     FROM orders o
     JOIN customers c ON c.id = o.customer_id
     JOIN order_items oi ON oi.order_id = o.id
     WHERE o.status != 'cancelled'
       AND o.order_date BETWEEN $1 AND $2
     GROUP BY c.id, c.name
     ORDER BY total_revenue DESC`,
    [from, to]
  );

  const { rows: orderCountRows } = await query(
    `SELECT COUNT(DISTINCT o.id)::int AS order_count
     FROM orders o
     WHERE o.status != 'cancelled'
       AND o.order_date BETWEEN $1 AND $2`,
    [from, to]
  );

  const totals = byProduct.reduce(
    (acc, row) => ({
      totalQuantity: acc.totalQuantity + Number(row.total_quantity),
      totalRevenue: acc.totalRevenue + Number(row.total_revenue),
    }),
    { totalQuantity: 0, totalRevenue: 0 }
  );
  totals.orderCount = orderCountRows[0].order_count;

  return { totals, byProduct, byCustomer };
};

module.exports = { getProductionSummary, getInventorySummary, getSalesSummary };
