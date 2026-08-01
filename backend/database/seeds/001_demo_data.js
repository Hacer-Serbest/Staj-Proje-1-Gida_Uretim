const bcrypt = require('bcryptjs');

/**
 * Demo verisi ekler. Tüm insert'ler ON CONFLICT DO NOTHING kullanır,
 * bu yüzden birden fazla kez çalıştırmak güvenlidir.
 */
const seed = async (client) => {
  const adminPasswordHash = await bcrypt.hash('Admin123!', 10);

  const { rows: userRows } = await client.query(
    `INSERT INTO users (full_name, email, password_hash, role)
     VALUES ($1, $2, $3, 'admin')
     ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
     RETURNING id`,
    ['Sistem Yöneticisi', 'admin@example.com', adminPasswordHash]
  );
  const adminId = userRows[0].id;

  const materials = [
    { name: 'Buğday Unu', unit: 'kg', current_stock: 500, critical_stock_level: 100, unit_price: 12.5 },
    { name: 'Şeker', unit: 'kg', current_stock: 300, critical_stock_level: 50, unit_price: 22.0 },
    { name: 'Ayçiçek Yağı', unit: 'lt', current_stock: 200, critical_stock_level: 40, unit_price: 45.0 },
    { name: 'Tuz', unit: 'kg', current_stock: 100, critical_stock_level: 20, unit_price: 8.0 },
    { name: 'Maya', unit: 'kg', current_stock: 25, critical_stock_level: 5, unit_price: 90.0 },
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

  const products = [
    { name: 'Ekmek (500g)', sku: 'PRD-EKMEK-500', unit: 'adet', sale_price: 15.0, description: 'Standart somun ekmek' },
    { name: 'Kraker Paketi', sku: 'PRD-KRAKER-200', unit: 'paket', sale_price: 28.0, description: '200g kraker paketi' },
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
  ];

  for (const recipe of recipes) {
    await client.query(
      `INSERT INTO product_recipes (product_id, material_id, quantity_required)
       VALUES ($1, $2, $3)
       ON CONFLICT (product_id, material_id) DO UPDATE SET quantity_required = EXCLUDED.quantity_required`,
      [productIds[recipe.product], materialIds[recipe.material], recipe.quantity_required]
    );
  }

  // customers tablosunda doğal bir unique alan olmadığından ON CONFLICT yerine
  // önce mevcut kaydı kontrol ediyoruz (yoksa seed her çalıştığında çoğaltır).
  const { rows: existingCustomerRows } = await client.query(
    'SELECT id FROM customers WHERE name = $1',
    ['Anadolu Market Zinciri']
  );

  const customerIsNew = existingCustomerRows.length === 0;
  let customerId = existingCustomerRows[0]?.id;

  if (customerIsNew) {
    const { rows: customerRows } = await client.query(
      `INSERT INTO customers (name, contact_name, email, phone, address, tax_number)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      ['Anadolu Market Zinciri', 'Mehmet Yılmaz', 'siparis@anadolumarket.example', '0212 555 00 00', 'İstanbul', '1234567890']
    );
    customerId = customerRows[0].id;

    const { rows: orderNumberRows } = await client.query("SELECT nextval('order_number_seq') AS n");
    const orderNumber = `SIP-${new Date().getFullYear()}-${String(orderNumberRows[0].n).padStart(6, '0')}`;

    const { rows: orderRows } = await client.query(
      `INSERT INTO orders (order_number, customer_id, status, delivery_date, created_by)
       VALUES ($1, $2, 'pending', CURRENT_DATE + INTERVAL '7 days', $3)
       RETURNING id`,
      [orderNumber, customerId, adminId]
    );
    const orderId = orderRows[0].id;

    await client.query(
      `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT DO NOTHING`,
      [orderId, productIds['Ekmek (500g)'], 200, products[0].sale_price]
    );
  }

  console.log('Demo verisi başarıyla eklendi (admin@example.com / Admin123!).');
};

module.exports = seed;
