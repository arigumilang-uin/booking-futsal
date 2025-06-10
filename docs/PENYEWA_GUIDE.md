# 🏃 Role Penyewa (Customer) - Panduan Lengkap

## 🎯 Apa itu Penyewa?

**Penyewa** adalah role customer dengan **Level 2** yang merupakan pengguna utama sistem Panam Soccer Field. Ini adalah "customer" yang bisa melakukan booking lapangan, pembayaran, dan menikmati semua layanan yang disediakan.

### 🏆 Posisi dalam Hierarki
```
Level 6: 👑 supervisor_sistem - Master admin sistem
Level 5: 📊 manajer_futsal - Manajemen bisnis
Level 4: ⚽ operator_lapangan - Operasional lapangan  
Level 3: 💰 staff_kasir - Pembayaran & keuangan
Level 2: 🏃 penyewa (ANDA) - Customer yang bisa booking
Level 1: 👤 pengunjung - Tamu/guest
```

**Penyewa = Customer yang bisa booking dan menikmati semua layanan Panam Soccer Field!** 🏃

## 🔑 Fungsi Utama Penyewa

### 1. **📅 Booking Management**
Penyewa bisa mengelola semua aspek booking lapangan:

- **Browse available fields** - lihat lapangan yang tersedia dengan detail
- **Check field availability** - cek ketersediaan lapangan per tanggal dan waktu
- **Create new booking** - buat booking baru dengan pilihan lapangan dan waktu
- **View booking history** - lihat riwayat semua booking yang pernah dibuat
- **Modify bookings** - ubah detail booking (jika masih memungkinkan)
- **Cancel bookings** - batalkan booking dengan policy yang berlaku

**Analogi:** Seperti customer di hotel yang bisa book room, lihat reservation, dan manage booking.

### 2. **💳 Payment Management**
Mengelola semua aspek pembayaran booking:

- **View payment details** - lihat detail pembayaran untuk setiap booking
- **Make payments** - lakukan pembayaran dengan berbagai metode
- **Upload payment proof** - upload bukti transfer atau e-wallet
- **Track payment status** - monitor status pembayaran dari pending ke paid
- **Payment history** - lihat riwayat semua pembayaran yang pernah dilakukan
- **Download receipts** - download receipt pembayaran untuk record

**Analogi:** Seperti customer e-commerce yang bisa bayar, upload bukti, dan track payment.

### 3. **⭐ Field Reviews & Ratings**
Memberikan feedback tentang kualitas lapangan:

- **Rate fields** - berikan rating 1-5 untuk lapangan yang sudah digunakan
- **Write reviews** - tulis review detail tentang pengalaman bermain
- **View other reviews** - baca review dari customer lain untuk referensi
- **Photo uploads** - upload foto lapangan atau fasilitas (jika ada)
- **Review history** - lihat semua review yang pernah ditulis
- **Helpful votes** - vote review orang lain yang helpful

**Analogi:** Seperti customer di TripAdvisor yang bisa review hotel dan baca review orang lain.

### 4. **❤️ Favorites & Preferences**
Mengelola preferensi dan lapangan favorit:

- **Add to favorites** - tambahkan lapangan favorit untuk akses cepat
- **Favorite fields list** - lihat daftar semua lapangan favorit
- **Quick booking** - booking cepat dari lapangan favorit
- **Preference settings** - set preferensi waktu, lapangan, dan notifikasi
- **Booking patterns** - sistem learn dari pattern booking untuk suggestions
- **Personalized recommendations** - dapat rekomendasi lapangan berdasarkan history

**Analogi:** Seperti customer di Spotify yang bisa favorite songs dan dapat recommendations.

### 5. **🔔 Notifications & Communication**
Menerima dan mengelola notifikasi:

- **Booking notifications** - notifikasi tentang status booking (confirmed, completed, dll)
- **Payment reminders** - reminder untuk pembayaran yang pending
- **Promotional offers** - notifikasi tentang promo dan diskon special
- **Field updates** - update tentang maintenance atau perubahan lapangan
- **System announcements** - pengumuman penting dari management
- **Communication preferences** - set preferensi jenis notifikasi yang diterima

**Analogi:** Seperti customer app yang bisa set notification preferences dan terima updates.

## 🎮 Fitur yang Sudah Terintegrasi di Frontend

### 🏠 **Customer Dashboard**
**Lokasi:** `booking-futsal-frontend/src/pages/customer/Dashboard.jsx`

Dashboard personal customer dengan:
- **Upcoming bookings** - booking yang akan datang dengan countdown
- **Recent activity** - aktivitas terbaru (booking, payment, review)
- **Quick stats** - total booking, total spent, favorite fields
- **Weather info** - info cuaca untuk outdoor fields (jika ada)
- **Promotional banners** - promo dan diskon yang sedang berlaku
- **Quick actions** - shortcut untuk book field, view history, favorites

### 📅 **Booking System**
**Lokasi:** `booking-futsal-frontend/src/pages/customer/BookingSystem.jsx`

Interface lengkap untuk booking:
- **Field browser** - browse semua lapangan dengan filter (type, location, price)
- **Availability calendar** - calendar view untuk cek ketersediaan
- **Time slot selection** - pilih waktu dengan visual time slots
- **Booking form** - form booking dengan detail customer dan special requests
- **Price calculator** - hitung total harga dengan breakdown detail
- **Booking confirmation** - konfirmasi booking sebelum submit

### 💳 **Payment Center**
**Lokasi:** `booking-futsal-frontend/src/pages/customer/PaymentCenter.jsx`

Pusat manajemen pembayaran:
- **Payment dashboard** - overview semua pembayaran dengan status
- **Payment methods** - pilihan metode pembayaran (transfer, e-wallet, cash)
- **Payment proof upload** - upload bukti transfer dengan preview
- **Payment tracking** - track status pembayaran real-time
- **Payment history** - history semua pembayaran dengan filter dan search
- **Receipt download** - download receipt dalam format PDF

### 📋 **Booking History**
**Lokasi:** `booking-futsal-frontend/src/pages/customer/BookingHistory.jsx`

Riwayat lengkap booking:
- **Booking list** - list semua booking dengan filter by status, date, field
- **Booking details** - detail lengkap setiap booking dengan timeline
- **Status tracking** - track progress booking dari pending ke completed
- **Action buttons** - cancel, modify, atau repeat booking
- **Export functionality** - export booking history untuk record
- **Statistics view** - basic stats tentang booking patterns

### ⭐ **Reviews & Ratings**
**Lokasi:** `booking-futsal-frontend/src/pages/customer/ReviewsRatings.jsx`

Interface untuk review dan rating:
- **Write reviews** - form untuk tulis review dengan rating stars
- **Review history** - semua review yang pernah ditulis
- **Field reviews** - baca review lapangan dari customer lain
- **Photo gallery** - lihat foto lapangan dari customer lain
- **Review analytics** - basic analytics tentang review yang ditulis
- **Helpful voting** - vote review orang lain yang helpful

### ❤️ **Favorites Management**
**Lokasi:** `booking-futsal-frontend/src/pages/customer/Favorites.jsx`

Kelola lapangan favorit:
- **Favorites list** - daftar semua lapangan favorit dengan quick info
- **Quick booking** - booking langsung dari favorites dengan shortcut
- **Availability check** - cek ketersediaan favorites untuk hari ini/besok
- **Favorite analytics** - stats tentang usage favorites
- **Recommendations** - rekomendasi lapangan baru berdasarkan favorites
- **Share favorites** - share daftar favorites dengan teman

## 🔗 Hubungan dengan Role Lain

### 💰 **Dengan Staff Kasir (Level 3)**
- **Penyewa** submit pembayaran dan bukti transfer ke kasir
- **Kasir** verifikasi dan konfirmasi pembayaran dari penyewa
- **Penyewa** contact kasir untuk payment issues atau questions
- **Kasir** provide payment assistance dan guidance ke penyewa
- **Both** work together untuk smooth payment process

**Analogi:** Penyewa = Customer, Kasir = Customer Finance Representative

### ⚽ **Dengan Operator Lapangan (Level 4)**
- **Penyewa** interact dengan operator saat datang ke lapangan
- **Operator** ensure field quality untuk satisfaction penyewa
- **Penyewa** provide feedback tentang field condition ke operator
- **Operator** handle customer service untuk penyewa di lapangan
- **Both** work together untuk excellent field experience

**Analogi:** Penyewa = Guest, Operator = Venue Manager

### 📊 **Dengan Manajer Futsal (Level 5)**
- **Manajer** analyze behavior dan preferences penyewa untuk business insights
- **Penyewa** benefit dari improvements yang dibuat manajer berdasarkan data
- **Manajer** create targeted promotions untuk penyewa
- **Penyewa** provide feedback yang manajer gunakan untuk strategic decisions
- **Manajer** handle VIP penyewa atau corporate accounts

**Analogi:** Penyewa = Customer, Manajer = Customer Experience Director

### 👑 **Dengan Supervisor Sistem (Level 6)**
- **Supervisor** set policies dan procedures yang affect penyewa experience
- **Penyewa** escalate major issues ke supervisor jika tidak resolved di level bawah
- **Supervisor** handle komplain tingkat tinggi dari penyewa
- **Supervisor** ensure system reliability untuk smooth penyewa experience

**Analogi:** Penyewa = Customer, Supervisor = Customer Service Director

### 👤 **Dengan Pengunjung (Level 1)**
- **Penyewa** bisa refer pengunjung untuk join sebagai customer
- **Pengunjung** bisa lihat public reviews yang ditulis penyewa
- **Penyewa** share experience untuk attract pengunjung
- **Both** bisa interact di public areas atau social media

## 🎯 Fokus Utama Penyewa

### 🏟️ **Field Experience Excellence**
- **Find best fields** untuk kebutuhan dan budget
- **Optimal booking** dengan waktu dan harga terbaik
- **Quality assurance** melalui reviews dan ratings
- **Consistent experience** dengan lapangan favorit
- **Value for money** - dapat experience terbaik dengan harga reasonable

### ⚡ **Convenience & Efficiency**
- **Easy booking process** dengan minimal steps
- **Fast payment** dengan berbagai metode yang convenient
- **Quick access** ke favorites dan frequent bookings
- **Mobile-friendly** experience untuk booking on-the-go
- **Time-saving** features untuk repeat customers

### 💰 **Cost Optimization**
- **Best pricing** dengan memanfaatkan promo dan diskon
- **Budget planning** dengan payment tracking dan history
- **Value comparison** antar lapangan untuk best deals
- **Loyalty benefits** dari frequent bookings
- **Transparent pricing** tanpa hidden costs

## 🛠️ Tools dan Features untuk Penyewa

### 📱 **Customer Tools:**
- **Field browser** dengan advanced filters
- **Availability calendar** dengan real-time updates
- **Price calculator** dengan promo integration
- **Payment tracker** dengan status notifications
- **Review system** dengan photo uploads
- **Favorites manager** dengan quick booking

### 📊 **Personal Analytics:**
- **Booking patterns** - frequency, preferred times, favorite fields
- **Spending analysis** - total spent, average per booking, savings from promos
- **Field preferences** - most booked fields, ratings given, review activity
- **Payment behavior** - preferred payment methods, payment timing
- **Loyalty metrics** - customer since, total bookings, loyalty tier

## 📁 File-File Penting untuk Role Penyewa

### 🎯 **Backend Files:**
- `routes/customerRoutes.js` - Route khusus customer
- `controllers/customer/customerController.js` - Logic untuk customer functions
- `models/core/Booking.js` - Model untuk booking management
- `models/core/Payment.js` - Model untuk payment management
- `models/engagement/UserFavourite.js` - Model untuk favorites

### 🎨 **Frontend Files:**
- `src/pages/customer/Dashboard.jsx` - Dashboard utama customer
- `src/pages/customer/BookingSystem.jsx` - System booking lapangan
- `src/pages/customer/PaymentCenter.jsx` - Pusat pembayaran
- `src/pages/customer/BookingHistory.jsx` - Riwayat booking
- `src/pages/customer/ReviewsRatings.jsx` - Reviews dan ratings
- `src/pages/customer/Favorites.jsx` - Kelola favorites

### 📊 **API Endpoints:**
- `/api/customer/bookings` - Booking management APIs
- `/api/customer/payments` - Payment management APIs
- `/api/customer/reviews` - Review dan rating APIs
- `/api/customer/favorites` - Favorites management APIs
- `/api/customer/dashboard` - Dashboard data APIs

## 🎯 Tips untuk Penyewa

### ✅ **Best Practices:**
1. **Book early** - book lapangan jauh-jauh hari untuk dapat slot terbaik
2. **Check weather** - cek cuaca untuk outdoor fields
3. **Read reviews** - baca review customer lain sebelum booking
4. **Use favorites** - tambahkan lapangan bagus ke favorites untuk akses cepat
5. **Upload payment proof quickly** - upload bukti bayar segera untuk konfirmasi cepat
6. **Write honest reviews** - bantu customer lain dengan review yang honest

### ⚠️ **Yang Harus Dihindari:**
1. **Jangan late payment** - bayar sesuai deadline untuk avoid cancellation
2. **Jangan no-show** - inform jika tidak bisa datang untuk avoid penalty
3. **Jangan fake reviews** - tulis review yang honest dan constructive
4. **Jangan book duplicate** - avoid double booking yang bisa confusing
5. **Jangan ignore notifications** - baca notifikasi penting tentang booking
6. **Jangan share account** - jaga keamanan account untuk protect data pribadi

## 🎉 Kesimpulan

**Penyewa** adalah role customer yang bisa menikmati:

- 📅 **Full booking access** - book lapangan dengan mudah dan flexible
- 💳 **Multiple payment options** - bayar dengan metode yang convenient
- ⭐ **Review system** - share dan baca experience customer lain
- ❤️ **Personalization** - favorites, preferences, dan recommendations
- 🔔 **Stay informed** - notifikasi dan updates tentang booking dan promo

**Enjoy the best futsal experience at Panam Soccer Field!**

Role ini perfect untuk:
- **Futsal enthusiasts** - yang suka main futsal regular
- **Event organizers** - yang organize futsal events atau tournaments
- **Corporate teams** - yang butuh venue untuk team building
- **Casual players** - yang main futsal sesekali dengan teman
- **Sports communities** - yang aktif di komunitas olahraga

**🎯 Penyewa = Valued Customer yang menikmati premium futsal experience!** 🏃

### 🏆 **Customer Journey:**
1. **Discovery** - browse fields dan baca reviews
2. **Booking** - pilih field, waktu, dan buat booking
3. **Payment** - bayar dengan metode pilihan dan upload bukti
4. **Confirmation** - terima konfirmasi booking dari staff
5. **Experience** - datang dan nikmati bermain di lapangan
6. **Feedback** - tulis review dan rating untuk help others

### 💎 **VIP Benefits** (untuk frequent customers):
- **Priority booking** - akses lebih dulu ke slot premium
- **Special discounts** - diskon khusus untuk loyal customers
- **Dedicated support** - customer service priority
- **Exclusive events** - invitation ke tournament atau events
- **Loyalty rewards** - points atau rewards untuk frequent bookings

**📚 Baca panduan lengkap di: `docs/PENYEWA_GUIDE.md`** 🚀
