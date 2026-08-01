CREATE SEQUENCE IF NOT EXISTS production_order_number_seq START 1;

CREATE TABLE IF NOT EXISTS production_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  product_id UUID NOT NULL REFERENCES products (id) ON DELETE RESTRICT,
  planned_quantity NUMERIC(14, 3) NOT NULL CHECK (planned_quantity > 0),
  produced_quantity NUMERIC(14, 3) NOT NULL DEFAULT 0 CHECK (produced_quantity >= 0),
  status TEXT NOT NULL DEFAULT 'planned' CHECK (
    status IN ('planned', 'in_progress', 'completed', 'cancelled')
  ),
  planned_start_date DATE,
  planned_end_date DATE,
  actual_start_date TIMESTAMPTZ,
  actual_end_date TIMESTAMPTZ,
  notes TEXT,
  created_by UUID REFERENCES users (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_production_orders_status ON production_orders (status);
CREATE INDEX IF NOT EXISTS idx_production_orders_product_id ON production_orders (product_id);

CREATE TRIGGER trg_production_orders_updated_at
BEFORE UPDATE ON production_orders
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
