-- pgcrypto: gen_random_uuid() için gerekli
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Tüm tablolarda ortak kullanılacak updated_at otomatik güncelleme fonksiyonu
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
