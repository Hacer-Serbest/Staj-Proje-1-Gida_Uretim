# Gıda Üretim Kontrol Sistemi

Gıda üretimi yapan firmaların üretim takibi ve planlaması, hammadde/stok yönetimi ve B2B sipariş takibini yaptığı web uygulaması.

## Tech Stack

- **Frontend:** React + Tailwind CSS
- **Backend:** Node.js + Express
- **Veritabanı:** PostgreSQL
- **Deployment:** Vercel (frontend) + Render (backend)

## Proje Yapısı

```
backend/    Express API (REST), PostgreSQL erişimi, JWT auth
frontend/   React + Tailwind istemci uygulaması
docs/       Veritabanı şeması ve API dokümantasyonu
```

## Geliştirme Ortamı

### Backend

```bash
cd backend
cp .env.example .env   # değerleri kendi ortamınıza göre doldurun
npm install
npm run dev
```

API varsayılan olarak `http://localhost:5000` üzerinde çalışır. Sağlık kontrolü: `GET /api/health`.

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Ortam Değişkenleri

Her iki dizindeki `.env.example` dosyalarına bakın.
