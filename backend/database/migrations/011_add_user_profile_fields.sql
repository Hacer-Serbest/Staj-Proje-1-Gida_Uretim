-- Profil sayfasında gösterilen iletişim bilgisi ve çalışan kimlik numarası.
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS employee_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_employee_id
  ON users (employee_id)
  WHERE employee_id IS NOT NULL;
