-- Hammadde stok hareketleri: her giriş/çıkış kalıcı bir kayıt olarak tutulur.
-- materials.current_stock bu hareketlerin özetidir ve servis katmanında hareketle birlikte güncellenir.
CREATE TABLE IF NOT EXISTS inventory_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID NOT NULL REFERENCES materials (id) ON DELETE RESTRICT,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('in', 'out')),
  quantity NUMERIC(14, 3) NOT NULL CHECK (quantity > 0),
  reason TEXT NOT NULL CHECK (
    reason IN ('purchase', 'production_consumption', 'production_return', 'adjustment', 'initial', 'waste')
  ),
  reference_type TEXT,
  reference_id UUID,
  notes TEXT,
  created_by UUID REFERENCES users (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_inventory_movements_material_id ON inventory_movements (material_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_reference ON inventory_movements (reference_type, reference_id);
