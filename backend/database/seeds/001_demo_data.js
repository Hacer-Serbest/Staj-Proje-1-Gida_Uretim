const bcrypt = require('bcryptjs');

/**
 * Demo verisi ekler. Tüm insert'ler ON CONFLICT DO NOTHING / idempotent kontrol
 * kullanır, bu yüzden birden fazla kez çalıştırmak güvenlidir.
 */
const seed = async (client) => {
  // Benzersiz bir metin sütununa (order_number gibi) göre var olan kaydı bulur,
  // yoksa insertSql'i çalıştırıp id'sini döner.
  const upsertGetId = async (selectSql, selectParams, insertSql, insertParams) => {
    const { rows: existing } = await client.query(selectSql, selectParams);
    if (existing.length > 0) return existing[0].id;
    const { rows: inserted } = await client.query(insertSql, insertParams);
    return inserted[0].id;
  };

  const adminPasswordHash = await bcrypt.hash('Admin123!', 10);

  const { rows: userRows } = await client.query(
    `INSERT INTO users (full_name, email, password_hash, role, phone, employee_id)
     VALUES ($1, $2, $3, 'admin', $4, $5)
     ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
     RETURNING id`,
    ['Sistem Yöneticisi', 'admin@example.com', adminPasswordHash, '0532 000 00 01', 'EMP-0001']
  );
  const adminId = userRows[0].id;

  // ---- Hammaddeler (3 tanesi kasıtlı olarak kritik seviyede/altında) ----
  const materials = [
    { name: 'Buğday Unu', unit: 'kg', current_stock: 420, critical_stock_level: 100, unit_price: 12.5 },
    { name: 'Şeker', unit: 'kg', current_stock: 300, critical_stock_level: 50, unit_price: 22.0 },
    { name: 'Ayçiçek Yağı', unit: 'lt', current_stock: 35, critical_stock_level: 40, unit_price: 45.0 }, // kritik
    { name: 'Tuz', unit: 'kg', current_stock: 100, critical_stock_level: 20, unit_price: 8.0 },
    { name: 'Maya', unit: 'kg', current_stock: 3.5, critical_stock_level: 5, unit_price: 90.0 }, // kritik
    { name: 'Süt Tozu', unit: 'kg', current_stock: 80, critical_stock_level: 15, unit_price: 55.0 },
    { name: 'Kabartma Tozu', unit: 'kg', current_stock: 4, critical_stock_level: 8, unit_price: 35.0 }, // kritik
    { name: 'Tarçın', unit: 'kg', current_stock: 12, critical_stock_level: 3, unit_price: 120.0 },
  ];

  const materialIds = {};
  for (const material of materials) {
    const { rows } = await client.query(
      `INSERT INTO materials (name, unit, current_stock, critical_stock_level, unit_price)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      [material.name, material.unit, material.current_stock, material.critical_stock_level, material.unit_price]
    );
    materialIds[material.name] = rows[0].id;
  }

  // Pasif hammadde örneği (Hammadde & Stok sayfasındaki "pasif" filtresini test edebilmek için).
  await client.query(
    `INSERT INTO materials (name, unit, current_stock, critical_stock_level, unit_price, is_active)
     VALUES ($1, $2, $3, $4, $5, false)
     ON CONFLICT (name) DO UPDATE SET is_active = false`,
    ['Palm Yağı (Kullanım Dışı)', 'lt', 0, 0, 38.0]
  );

  // ---- Ürünler ----
  const products = [
    { name: 'Ekmek (500g)', sku: 'PRD-EKMEK-500', unit: 'adet', sale_price: 15.0, description: 'Standart somun ekmek' },
    { name: 'Kraker Paketi', sku: 'PRD-KRAKER-200', unit: 'paket', sale_price: 28.0, description: '200g kraker paketi' },
    { name: 'Tam Buğday Ekmeği', sku: 'PRD-EKMEK-TB400', unit: 'adet', sale_price: 18.5, description: '400g tam buğday ekmeği' },
    { name: 'Kurabiye Paketi', sku: 'PRD-KURABIYE-250', unit: 'paket', sale_price: 32.0, description: '250g tarçınlı kurabiye paketi' },
  ];

  const productIds = {};
  for (const product of products) {
    const { rows } = await client.query(
      `INSERT INTO products (name, sku, unit, sale_price, description)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (sku) DO UPDATE SET sku = EXCLUDED.sku
       RETURNING id`,
      [product.name, product.sku, product.unit, product.sale_price, product.description]
    );
    productIds[product.name] = rows[0].id;
  }

  const recipes = [
    { product: 'Ekmek (500g)', material: 'Buğday Unu', quantity_required: 0.35 },
    { product: 'Ekmek (500g)', material: 'Maya', quantity_required: 0.01 },
    { product: 'Ekmek (500g)', material: 'Tuz', quantity_required: 0.008 },
    { product: 'Kraker Paketi', material: 'Buğday Unu', quantity_required: 0.15 },
    { product: 'Kraker Paketi', material: 'Ayçiçek Yağı', quantity_required: 0.05 },
    { product: 'Kraker Paketi', material: 'Tuz', quantity_required: 0.005 },
    { product: 'Tam Buğday Ekmeği', material: 'Buğday Unu', quantity_required: 0.3 },
    { product: 'Tam Buğday Ekmeği', material: 'Maya', quantity_required: 0.012 },
    { product: 'Tam Buğday Ekmeği', material: 'Tuz', quantity_required: 0.007 },
    { product: 'Tam Buğday Ekmeği', material: 'Süt Tozu', quantity_required: 0.02 },
    { product: 'Kurabiye Paketi', material: 'Buğday Unu', quantity_required: 0.12 },
    { product: 'Kurabiye Paketi', material: 'Şeker', quantity_required: 0.08 },
    { product: 'Kurabiye Paketi', material: 'Ayçiçek Yağı', quantity_required: 0.03 },
    { product: 'Kurabiye Paketi', material: 'Kabartma Tozu', quantity_required: 0.005 },
    { product: 'Kurabiye Paketi', material: 'Tarçın', quantity_required: 0.002 },
  ];

  for (const recipe of recipes) {
    await client.query(
      `INSERT INTO product_recipes (product_id, material_id, quantity_required)
       VALUES ($1, $2, $3)
       ON CONFLICT (product_id, material_id) DO UPDATE SET quantity_required = EXCLUDED.quantity_required`,
      [productIds[recipe.product], materialIds[recipe.material], recipe.quantity_required]
    );
  }

  // ---- Müşteriler (customers'ta doğal bir unique alan olmadığından isme göre kontrol ediyoruz) ----
  const customerNames = [
    { name: 'Anadolu Market Zinciri', contact_name: 'Mehmet Yılmaz', email: 'siparis@anadolumarket.example', phone: '0212 555 00 00', address: 'İstanbul', tax_number: '1234567890' },
    { name: 'Marmara Toptan Gıda', contact_name: 'Elif Demir', email: 'siparis@marmaratoptan.example', phone: '0224 444 11 22', address: 'Bursa', tax_number: '2233445566' },
    { name: 'Ege Fırın Zinciri', contact_name: 'Cem Arslan', email: 'siparis@egefirin.example', phone: '0232 333 22 11', address: 'İzmir', tax_number: '9988776655' },
  ];

  const customerIds = {};
  for (const customer of customerNames) {
    const customerId = await upsertGetId(
      'SELECT id FROM customers WHERE name = $1',
      [customer.name],
      `INSERT INTO customers (name, contact_name, email, phone, address, tax_number)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [customer.name, customer.contact_name, customer.email, customer.phone, customer.address, customer.tax_number]
    );
    customerIds[customer.name] = customerId;
  }

  // ---- Üretim emirleri (aktif üretim vurgusuyla — 3 tanesi in_progress) ----
  const productionOrders = [
    { orderNumber: 'URT-DEMO-001', product: 'Ekmek (500g)', planned: 150, status: 'in_progress', startedHoursAgo: 22 },
    { orderNumber: 'URT-DEMO-002', product: 'Tam Buğday Ekmeği', planned: 80, status: 'in_progress', startedHoursAgo: 4 },
    { orderNumber: 'URT-DEMO-003', product: 'Kraker Paketi', planned: 60, status: 'in_progress', startedHoursAgo: 2 },
    { orderNumber: 'URT-DEMO-004', product: 'Kurabiye Paketi', planned: 40, status: 'planned' },
    { orderNumber: 'URT-DEMO-005', product: 'Ekmek (500g)', planned: 100, produced: 100, status: 'completed', endedDaysAgo: 2 },
    { orderNumber: 'URT-DEMO-006', product: 'Kraker Paketi', planned: 50, produced: 48, status: 'completed', endedDaysAgo: 1 },
    { orderNumber: 'URT-DEMO-007', product: 'Tam Buğday Ekmeği', planned: 30, status: 'cancelled' },
  ];

  const hoursAgo = (h) => new Date(Date.now() - h * 60 * 60 * 1000);
  const daysAgo = (d) => new Date(Date.now() - d * 24 * 60 * 60 * 1000);

  for (const po of productionOrders) {
    const actualStartDate =
      po.startedHoursAgo !== undefined
        ? hoursAgo(po.startedHoursAgo)
        : po.endedDaysAgo !== undefined
          ? daysAgo(po.endedDaysAgo + 0.25) // tamamlananlar için makul bir başlangıç anı
          : null;
    const actualEndDate = po.endedDaysAgo !== undefined ? daysAgo(po.endedDaysAgo) : null;

    await upsertGetId(
      'SELECT id FROM production_orders WHERE order_number = $1',
      [po.orderNumber],
      `INSERT INTO production_orders
         (order_number, product_id, planned_quantity, produced_quantity, status, actual_start_date, actual_end_date, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [po.orderNumber, productIds[po.product], po.planned, po.produced || 0, po.status, actualStartDate, actualEndDate, adminId]
    );
  }

  // ---- B2B siparişler (SIP-DEMO-* ile 6 durumun tamamı temsil edilir) ----
  const demoOrders = [
    {
      orderNumber: 'SIP-DEMO-001',
      customer: 'Marmara Toptan Gıda',
      status: 'confirmed',
      items: [{ product: 'Ekmek (500g)', quantity: 300, unitPrice: 15.0 }],
    },
    {
      orderNumber: 'SIP-DEMO-002',
      customer: 'Ege Fırın Zinciri',
      status: 'in_production',
      items: [
        { product: 'Tam Buğday Ekmeği', quantity: 150, unitPrice: 18.5 },
        { product: 'Kurabiye Paketi', quantity: 80, unitPrice: 32.0 },
      ],
    },
    {
      orderNumber: 'SIP-DEMO-003',
      customer: 'Anadolu Market Zinciri',
      status: 'ready',
      items: [{ product: 'Kraker Paketi', quantity: 120, unitPrice: 28.0 }],
    },
    {
      orderNumber: 'SIP-DEMO-004',
      customer: 'Marmara Toptan Gıda',
      status: 'delivered',
      items: [{ product: 'Ekmek (500g)', quantity: 500, unitPrice: 15.0 }],
    },
    {
      orderNumber: 'SIP-DEMO-005',
      customer: 'Ege Fırın Zinciri',
      status: 'cancelled',
      items: [{ product: 'Kurabiye Paketi', quantity: 40, unitPrice: 32.0 }],
    },
    {
      orderNumber: 'SIP-DEMO-006',
      customer: 'Anadolu Market Zinciri',
      status: 'pending',
      items: [{ product: 'Ekmek (500g)', quantity: 200, unitPrice: 15.0 }],
    },
  ];

  for (const order of demoOrders) {
    const orderId = await upsertGetId(
      'SELECT id FROM orders WHERE order_number = $1',
      [order.orderNumber],
      `INSERT INTO orders (order_number, customer_id, status, delivery_date, created_by)
       VALUES ($1, $2, $3, CURRENT_DATE + INTERVAL '5 days', $4)
       RETURNING id`,
      [order.orderNumber, customerIds[order.customer], order.status, adminId]
    );

    for (const item of order.items) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT DO NOTHING`,
        [orderId, productIds[item.product], item.quantity, item.unitPrice]
      );
    }
  }

  console.log('Demo verisi başarıyla eklendi (admin@example.com / Admin123!).');
};

module.exports = seed;
