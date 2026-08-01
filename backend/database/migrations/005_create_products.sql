CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sku TEXT NOT NULL UNIQUE,
  unit TEXT NOT NULL CHECK (unit IN ('kg', 'g', 'lt', 'ml', 'adet', 'paket')),
  sale_price NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (sale_price >= 0),
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_is_active ON products (is_active);

CREATE TRIGGER trg_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
