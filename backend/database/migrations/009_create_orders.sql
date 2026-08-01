CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  customer_id UUID NOT NULL REFERENCES customers (id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'confirmed', 'in_production', 'ready', 'delivered', 'cancelled')
  ),
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  delivery_date DATE,
  notes TEXT,
  created_by UUID REFERENCES users (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders (customer_id);

CREATE TRIGGER trg_orders_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- B2B siparişi karşılamak için oluşturulan üretim emirlerini siparişle ilişkilendirir (opsiyonel).
ALTER TABLE production_orders
  ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES orders (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_production_orders_order_id ON production_orders (order_id);
