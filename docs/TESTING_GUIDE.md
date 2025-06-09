# 🧪 PANDUAN TESTING COMPREHENSIVE CUSTOMER BOOKING

## 📋 CHECKLIST TESTING

### **PERSIAPAN TESTING**
- [ ] Development server berjalan di `http://localhost:5173/`
- [ ] Browser developer tools terbuka (F12)
- [ ] Network tab aktif untuk monitoring API calls
- [ ] Console tab terbuka untuk melihat logs

---

## **1. 🔐 LOGIN TESTING**

### **Langkah Testing:**
1. **Buka halaman login**: `http://localhost:5173/login`
2. **Verifikasi UI login page**:
   - [ ] Form login tampil dengan benar
   - [ ] Test users info box tampil
   - [ ] Email dan password fields tersedia
   - [ ] Login button tersedia

3. **Test login dengan customer account**:
   - Email: `ari@gmail.com`
   - Password: `password123`
   - [ ] Klik "LOGIN"

4. **Verifikasi hasil login**:
   - [ ] Redirect ke `/dashboard` berhasil
   - [ ] Loading state tampil saat login
   - [ ] User name tampil di dashboard
   - [ ] Role "Customer" atau "Penyewa" tampil
   - [ ] Dashboard stats dimuat (Total Booking, etc.)

### **Expected API Calls:**
```
POST /auth/login
GET /auth/profile
GET /customer/bookings
GET /public/fields
```

### **Hasil Testing:**
- [ ] ✅ Login berhasil
- [ ] ✅ Redirect benar
- [ ] ✅ User data tampil
- [ ] ❌ Error: _______________

---

## **2. 🏟️ FIELD LIST TESTING**

### **Langkah Testing:**
1. **Akses daftar lapangan**:
   - Dari dashboard, klik "Daftar Lapangan"
   - Atau navigasi ke `/fields`

2. **Verifikasi field list page**:
   - [ ] Loading spinner tampil saat memuat
   - [ ] Daftar lapangan tampil dalam grid
   - [ ] Filter section tersedia
   - [ ] Search box berfungsi

3. **Test filter functionality**:
   - [ ] Filter by jenis lapangan (Futsal, Mini Soccer, etc.)
   - [ ] Filter by rentang harga
   - [ ] Filter by lokasi
   - [ ] Search by nama lapangan

4. **Verifikasi field cards**:
   - [ ] Gambar lapangan tampil
   - [ ] Nama lapangan tampil
   - [ ] Harga per jam tampil
   - [ ] Status ketersediaan tampil
   - [ ] Button "Lihat Detail" dan "Booking Sekarang" tersedia

5. **Test field detail modal**:
   - [ ] Klik "Lihat Detail" pada salah satu lapangan
   - [ ] Modal detail terbuka
   - [ ] Informasi lengkap lapangan tampil
   - [ ] Fasilitas lapangan tampil
   - [ ] Jam operasional tampil
   - [ ] Button "Booking Sekarang" di modal berfungsi

### **Expected API Calls:**
```
GET /public/fields
```

### **Hasil Testing:**
- [ ] ✅ Field list dimuat
- [ ] ✅ Filter berfungsi
- [ ] ✅ Detail modal berfungsi
- [ ] ❌ Error: _______________

---

## **3. 📝 BOOKING FORM TESTING**

### **Langkah Testing:**
1. **Akses booking form**:
   - Dari field list, klik "Booking Sekarang"
   - Atau navigasi ke `/bookings/new`

2. **Verifikasi booking form**:
   - [ ] Form booking tampil lengkap
   - [ ] Dropdown lapangan tersedia
   - [ ] Date picker tersedia
   - [ ] Time slot dropdown tersedia
   - [ ] Duration selector tersedia
   - [ ] Notes textarea tersedia

3. **Test form functionality**:
   - [ ] Pilih lapangan dari dropdown
   - [ ] Pilih tanggal (besok atau hari setelahnya)
   - [ ] Verifikasi time slots dimuat setelah pilih lapangan & tanggal
   - [ ] Pilih slot waktu (contoh: 10:00-11:00)
   - [ ] Set durasi (1-2 jam)
   - [ ] Tambahkan catatan: "Test booking dari frontend"

4. **Verifikasi booking summary**:
   - [ ] Ringkasan booking tampil
   - [ ] Total biaya dihitung dengan benar
   - [ ] Semua detail booking benar

5. **Submit booking**:
   - [ ] Klik "Buat Booking"
   - [ ] Loading state tampil
   - [ ] Success message tampil
   - [ ] Redirect ke booking list

### **Expected API Calls:**
```
GET /public/fields
GET /public/fields/:id/availability (optional)
POST /customer/bookings
```

### **Test Data:**
```javascript
{
  field_id: 1,
  date: "2024-01-XX", // tomorrow
  time_slot: "10:00-11:00",
  duration: 1,
  notes: "Test booking dari frontend"
}
```

### **Hasil Testing:**
- [ ] ✅ Form tampil benar
- [ ] ✅ Validation berfungsi
- [ ] ✅ Booking berhasil dibuat
- [ ] ❌ Error: _______________

---

## **4. 📋 BOOKING LIST TESTING**

### **Langkah Testing:**
1. **Akses booking list**:
   - Dari dashboard, klik "Lihat Semua Booking"
   - Atau navigasi ke `/bookings`

2. **Verifikasi booking list page**:
   - [ ] Loading spinner tampil saat memuat
   - [ ] Filter section tersedia
   - [ ] Booking table tampil
   - [ ] Stats cards tampil (Total, Pending, etc.)

3. **Verifikasi booking yang baru dibuat**:
   - [ ] Booking test tampil dalam list
   - [ ] Status "Menunggu Konfirmasi" atau "pending"
   - [ ] Detail booking benar (lapangan, tanggal, waktu)
   - [ ] Total amount benar

4. **Test filter functionality**:
   - [ ] Filter by status (Semua, Pending, Dikonfirmasi, etc.)
   - [ ] Search by nama lapangan atau kode booking
   - [ ] Filter by date range
   - [ ] Clear filters button berfungsi

5. **Test booking actions**:
   - [ ] Klik "Detail" pada booking
   - [ ] Modal detail terbuka dengan info lengkap
   - [ ] Jika status pending, button "Batal" tersedia
   - [ ] Test cancel booking (jika tersedia)

### **Expected API Calls:**
```
GET /customer/bookings
DELETE /customer/bookings/:id (untuk cancel)
```

### **Hasil Testing:**
- [ ] ✅ Booking list dimuat
- [ ] ✅ Filter berfungsi
- [ ] ✅ Booking baru tampil
- [ ] ✅ Actions berfungsi
- [ ] ❌ Error: _______________

---

## **5. ⚠️ ERROR HANDLING TESTING**

### **Langkah Testing:**

#### **A. Form Validation Testing:**
1. **Test empty fields**:
   - [ ] Submit form tanpa pilih lapangan
   - [ ] Submit form tanpa pilih tanggal
   - [ ] Submit form tanpa pilih waktu
   - [ ] Verifikasi error messages tampil

2. **Test invalid data**:
   - [ ] Pilih tanggal yang sudah lewat
   - [ ] Verifikasi validation error

#### **B. Network Error Testing:**
1. **Disconnect internet**:
   - [ ] Coba akses field list
   - [ ] Verifikasi error handling
   - [ ] Reconnect dan test recovery

2. **API Error Simulation**:
   - [ ] Monitor console untuk API errors
   - [ ] Verifikasi user-friendly error messages

### **Hasil Testing:**
- [ ] ✅ Validation berfungsi
- [ ] ✅ Error messages jelas
- [ ] ✅ Network error handling baik
- [ ] ❌ Error: _______________

---

## **6. 📱 RESPONSIVE DESIGN TESTING**

### **Langkah Testing:**
1. **Desktop Testing** (1920x1080):
   - [ ] Layout tampil dengan benar
   - [ ] Grid responsive
   - [ ] Navigation berfungsi

2. **Tablet Testing** (768px):
   - [ ] Toggle device mode di DevTools
   - [ ] Verifikasi layout tablet
   - [ ] Touch interactions berfungsi

3. **Mobile Testing** (375px):
   - [ ] Layout mobile responsive
   - [ ] Form inputs mudah digunakan
   - [ ] Buttons cukup besar untuk touch

### **Hasil Testing:**
- [ ] ✅ Desktop responsive
- [ ] ✅ Tablet responsive  
- [ ] ✅ Mobile responsive
- [ ] ❌ Error: _______________

---

## **7. 🔍 API INTEGRATION VERIFICATION**

### **Network Tab Monitoring:**
1. **Successful API Calls**:
   - [ ] Status 200 untuk GET requests
   - [ ] Status 201 untuk POST requests
   - [ ] Response format sesuai: `{success: true, data: {...}}`

2. **Error Handling**:
   - [ ] 401 errors trigger logout
   - [ ] 400 errors show validation messages
   - [ ] 500 errors show generic error message

3. **Cookie Authentication**:
   - [ ] Cookies dikirim otomatis
   - [ ] Session persistence
   - [ ] Logout clears session

### **Console Monitoring:**
- [ ] No JavaScript errors
- [ ] API calls logged (in dev mode)
- [ ] Test runner available: `runCustomerBookingTests()`

### **Hasil Testing:**
- [ ] ✅ API integration benar
- [ ] ✅ Error handling baik
- [ ] ✅ Authentication berfungsi
- [ ] ❌ Error: _______________

---

## **📊 TESTING SUMMARY**

### **Overall Results:**
- **Login Testing**: ___/4 passed
- **Field List Testing**: ___/5 passed  
- **Booking Form Testing**: ___/5 passed
- **Booking List Testing**: ___/5 passed
- **Error Handling Testing**: ___/4 passed
- **Responsive Design Testing**: ___/3 passed
- **API Integration Testing**: ___/3 passed

### **Total Score**: ___/29 tests passed

### **Critical Issues Found:**
1. ________________________________
2. ________________________________
3. ________________________________

### **Minor Issues Found:**
1. ________________________________
2. ________________________________
3. ________________________________

### **Recommendations:**
1. ________________________________
2. ________________________________
3. ________________________________

---

## **🚀 AUTOMATED TESTING**

### **Run Automated Tests:**
1. Open browser console (F12)
2. Run: `runCustomerBookingTests()`
3. Monitor console output
4. Review test results

### **Expected Output:**
```
🧪 Test Runner loaded! Use runCustomerBookingTests() in console to run tests.
🚀 Starting comprehensive customer booking tests...
✅ Test passed: Customer Login
✅ Test passed: Field List Loading
✅ Test passed: Booking Creation
...
🎉 All tests passed! Customer booking flow is working correctly.
```

---

*Gunakan checklist ini untuk memastikan semua aspek customer booking flow telah ditest dengan comprehensive.*
