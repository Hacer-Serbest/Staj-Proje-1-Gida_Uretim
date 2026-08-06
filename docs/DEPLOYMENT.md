# Deployment Rehberi

Backend → **Render**, Frontend → **Vercel**, Veritabanı → **Render Managed PostgreSQL**.

## 1. Ön Koşul

- Proje GitHub'a push edilmiş olmalı (`main` branch).
- Render ve Vercel hesapları (ikisi de GitHub ile giriş yapılabilir).

## 2. Backend + Veritabanı (Render)

1. [render.com/dashboard](https://dashboard.render.com) → **New** → **Blueprint**.
2. GitHub reponuzu seçin. Render, repo kökündeki `render.yaml` dosyasını otomatik bulur ve şunları oluşturur:
   - `gida-uretim-kontrol-backend` adında bir Web Service (Node.js, `backend/` dizininden)
   - `gida-uretim-kontrol-db` adında yönetilen bir PostgreSQL veritabanı
3. **Apply** deyin. Render otomatik olarak:
   - `DATABASE_URL`'i veritabanından web servisine bağlar
   - `JWT_SECRET`'ı güvenli rastgele bir değerle üretir
   - Her deploy öncesi `npm run migrate` çalıştırır (`preDeployCommand`)
4. İlk deploy bitince servis URL'inizi not edin (örn. `https://gida-uretim-kontrol-backend.onrender.com`).
5. `GET https://<backend-url>/api/health` adresinin `{"success":true,...}` döndürdüğünü doğrulayın.

**`FRONTEND_ORIGIN` bu adımda henüz ayarlanamaz** — çünkü Vercel URL'i henüz yok. Adım 4'e kadar bekleyin.

## 3. Frontend (Vercel)

1. [vercel.com/new](https://vercel.com/new) → GitHub reponuzu import edin.
2. **Root Directory** alanını `frontend` olarak ayarlayın (proje bir monorepo, Vercel'in hangi klasörü build edeceğini bilmesi gerekir). Vercel, `frontend/vercel.json`'ı otomatik kullanır.
3. **Environment Variables** bölümüne ekleyin:
   - `VITE_API_BASE_URL` = `https://<render-backend-url>/api` (Adım 2.4'teki URL + `/api`)
4. **Deploy**'a tıklayın. Bitince Vercel URL'inizi not edin (örn. `https://gida-uretim-kontrol.vercel.app`).

## 4. CORS'u Bağlama

1. Render dashboard → `gida-uretim-kontrol-backend` → **Environment**.
2. `FRONTEND_ORIGIN` değişkenini Vercel URL'inizle güncelleyin (örn. `https://gida-uretim-kontrol.vercel.app`, sonunda `/` **olmadan**).
3. Kaydedince Render servisi otomatik yeniden başlar.

## 5. İlk Admin Kullanıcısını Oluşturma

`database/seeds/001_demo_data.js` **sadece geliştirme/demo** içindir ve herkesçe bilinen bir şifre (`Admin123!`) içerir — **production'da asla `npm run seed` çalıştırmayın.**

Bunun yerine Render dashboard → backend servisi → **Shell** sekmesini açıp:

```bash
ADMIN_EMAIL=siz@firmaniz.com ADMIN_PASSWORD=GucluBirSifre123! ADMIN_NAME="Adınız Soyadınız" \
  ADMIN_PHONE="0532 000 00 00" ADMIN_EMPLOYEE_ID="EMP-0001" npm run create-admin
```

Bu komut idempotenttir — aynı e-posta ile tekrar çalıştırılırsa hiçbir şey değiştirmez.

## 6. Canlıya Alma Kontrol Listesi

- [ ] Backend `/api/health` 200 dönüyor
- [ ] `JWT_SECRET` Render tarafından otomatik üretildi (dev secret'ı **değil**)
- [ ] `PGSSL=true` ve `DATABASE_URL` Render Postgres'e bağlı
- [ ] `FRONTEND_ORIGIN` gerçek Vercel domain'iyle güncellendi (CORS hatası almamalı)
- [ ] Frontend'de `VITE_API_BASE_URL` gerçek backend URL'ine işaret ediyor
- [ ] Demo seed **çalıştırılmadı**; gerçek admin `create-admin` ile oluşturuldu
- [ ] Vercel'de login → dashboard akışı gerçek veriyle test edildi
- [ ] Tarayıcı konsolunda CORS/401/network hatası yok

## Sonraki Deploy'lar

Her ikisi de `main` branch'e push'ta otomatik deploy olur:
- Render: `preDeployCommand` sayesinde yeni migration dosyaları otomatik uygulanır.
- Vercel: her push'ta yeniden build alır.

Manuel migration/seed gerekirse Render Shell'den `npm run migrate` veya `npm run seed` (yalnızca staging/demo ortamlarında) çalıştırılabilir.
