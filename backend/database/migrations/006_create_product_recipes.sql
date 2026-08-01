-- Ürün reçetesi (BOM - Bill of Materials): 1 birim ürün için gereken hammadde miktarları
CREATE TABLE IF NOT EXISTS product_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products (id) ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES materials (id) ON DELETE RESTRICT,
  quantity_required NUMERIC(14, 4) NOT NULL CHECK (quantity_required > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (product_id, material_id)
);

CREATE INDEX IF NOT EXISTS idx_product_recipes_product_id ON product_recipes (product_id);
CREATE INDEX IF NOT EXISTS idx_product_recipes_material_id ON product_recipes (material_id);

CREATE TRIGGER trg_product_recipes_updated_at
BEFORE UPDATE ON product_recipes
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
