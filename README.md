# Booking Futsal API 🏟️

Sistem backend untuk aplikasi pemesanan lapangan futsal menggunakan Node.js, Express.js, dan PostgreSQL. API ini mendukung otentikasi JWT, manajemen pengguna, lapangan, booking, dan pembayaran.

---

## 📦 Fitur

### 🔐 Auth

- `POST /auth/register` — Registrasi pengguna baru
- `POST /auth/login` — Login dan mendapatkan token
- `GET /auth/me` — Lihat profil pengguna (token)
- `GET /auth/users` — Lihat semua pengguna (admin)

### 🏟️ Fields (Lapangan)

- `GET /fields` — Lihat semua lapangan (public)
- `GET /fields/:id` — Lihat detail 1 lapangan
- `POST /fields` — Tambah lapangan (admin)
- `PUT /fields/:id` — Ubah lapangan (admin)
- `DELETE /fields/:id` — Hapus lapangan (admin)

### 📅 Bookings

- `GET /bookings` — Lihat semua booking milik user
- `POST /bookings` — Buat booking
- `PUT /bookings/:id/status` — Ubah status booking (admin)
- `DELETE /bookings/:id` — Hapus booking (user sendiri)

### 💳 Payments

- `POST /payments` — Buat pembayaran (user)
- `GET /payments` — Lihat semua pembayaran (admin)
- `GET /payments/:id` — Detail pembayaran (admin)
- `DELETE /payments/:id` — Hapus pembayaran (admin)

---

## 🚀 Menjalankan Proyek

1. Clone repository:

   ```bash
   git clone https://github.com/username/booking-futsal.git
   cd booking-futsal
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Buat file `.env` di root project:

   ```
   PORT=5000
   DB_USER=postgres
   DB_HOST=localhost
   DB_NAME=booking_futsal
   DB_PASSWORD=123
   DB_PORT=5432
   DATABASE_URL=postgres://postgres:123@localhost:5432/booking_futsal
   JWT_SECRET=rahasia_super_aman
   ```

4. Jalankan server:
   ```bash
   node server.js
   ```

---

## 🧪 Testing API dengan Postman

1. Buka Postman.
2. Import file koleksi: `booking-futsal-api-full.postman_collection.json`.
3. Siapkan environment:
   - `base_url = http://localhost:5000`
   - `token = <isi token JWT setelah login>`

---

## 🗂️ Struktur Folder

```
booking_futsal/
├── config/
├── controllers/
├── middlewares/
├── models/
├── routes/
├── utils/
├── .env
├── .gitignore
├── app.js
├── server.js
└── README.md
```

---

## ✅ Role Akses

- **User**: Booking, pembayaran, lihat profil
- **Admin**: Manajemen user, field, booking, dan payment

---

## 📄 Lisensi

MIT License © 2025 pwebbbb_uas
