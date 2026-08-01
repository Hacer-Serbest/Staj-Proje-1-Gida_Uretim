CREATE TABLE IF NOT EXISTS materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  unit TEXT NOT NULL CHECK (unit IN ('kg', 'g', 'lt', 'ml', 'adet', 'paket')),
  current_stock NUMERIC(14, 3) NOT NULL DEFAULT 0 CHECK (current_stock >= 0),
  critical_stock_level NUMERIC(14, 3) NOT NULL DEFAULT 0 CHECK (critical_stock_level >= 0),
  unit_price NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (unit_price >= 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_materials_is_active ON materials (is_active);

CREATE TRIGGER trg_materials_updated_at
BEFORE UPDATE ON materials
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
