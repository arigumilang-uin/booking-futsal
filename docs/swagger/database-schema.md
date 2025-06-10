# Database Schema - Panam Soccer Field

## Overview
Sistem booking futsal Panam Soccer Field menggunakan 17 tabel database yang saling terhubung untuk mengelola seluruh aspek bisnis dari autentikasi hingga analytics.

## Database Tables (17 Tables)

### 1. users
**Primary table untuk manajemen user dan autentikasi**
```sql
- id (PK, AUTO_INCREMENT)
- name (VARCHAR, NOT NULL)
- email (VARCHAR, UNIQUE, NOT NULL)
- phone (VARCHAR)
- password (VARCHAR, NOT NULL)
- role (ENUM: pengunjung, penyewa, staff_kasir, operator_lapangan, manajer_futsal, supervisor_sistem)
- is_active (BOOLEAN, DEFAULT TRUE)
- email_verified_at (TIMESTAMP)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### 2. fields
**Tabel untuk manajemen lapangan futsal**
```sql
- id (PK, AUTO_INCREMENT)
- name (VARCHAR, NOT NULL)
- type (ENUM: indoor, outdoor)
- description (TEXT)
- price (DECIMAL(10,2), NOT NULL)
- price_weekend (DECIMAL(10,2))
- price_member (DECIMAL(10,2))
- capacity (INT)
- location (VARCHAR)
- address (TEXT)
- facilities (JSON)
- coordinates (VARCHAR)
- operating_hours (VARCHAR)
- operating_days (JSON)
- assigned_operator (INT, FK to users.id)
- is_active (BOOLEAN, DEFAULT TRUE)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### 3. bookings
**Tabel utama untuk manajemen booking lapangan**
```sql
- id (PK, AUTO_INCREMENT)
- user_id (INT, FK to users.id, NOT NULL)
- field_id (INT, FK to fields.id, NOT NULL)
- date (DATE, NOT NULL)
- start_time (TIME, NOT NULL)
- end_time (TIME, NOT NULL)
- duration (INT, calculated in hours)
- total_price (DECIMAL(10,2), NOT NULL)
- status (ENUM: pending, confirmed, completed, cancelled)
- name (VARCHAR, NOT NULL)
- phone (VARCHAR, NOT NULL)
- email (VARCHAR)
- notes (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### 4. payments
**Tabel untuk manajemen pembayaran booking**
```sql
- id (PK, AUTO_INCREMENT)
- booking_id (INT, FK to bookings.id, NOT NULL)
- user_id (INT, FK to users.id, NOT NULL)
- amount (DECIMAL(10,2), NOT NULL)
- payment_method (ENUM: transfer, cash, e_wallet, credit_card)
- status (ENUM: pending, paid, failed, refunded)
- payment_proof (VARCHAR, file path)
- notes (TEXT)
- processed_by (INT, FK to users.id)
- processed_at (TIMESTAMP)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### 5. notifications
**Sistem notifikasi real-time**
```sql
- id (PK, AUTO_INCREMENT)
- user_id (INT, FK to users.id, NOT NULL)
- title (VARCHAR, NOT NULL)
- message (TEXT, NOT NULL)
- type (ENUM: booking, payment, system, promotion)
- data (JSON, additional data)
- is_read (BOOLEAN, DEFAULT FALSE)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### 6. field_reviews
**Sistem review dan rating lapangan**
```sql
- id (PK, AUTO_INCREMENT)
- field_id (INT, FK to fields.id, NOT NULL)
- user_id (INT, FK to users.id, NOT NULL)
- booking_id (INT, FK to bookings.id)
- rating (INT, 1-5, NOT NULL)
- comment (TEXT)
- is_approved (BOOLEAN, DEFAULT FALSE)
- approved_by (INT, FK to users.id)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### 7. promotions
**Manajemen promosi dan diskon**
```sql
- id (PK, AUTO_INCREMENT)
- code (VARCHAR, UNIQUE, NOT NULL)
- name (VARCHAR, NOT NULL)
- description (TEXT)
- discount_type (ENUM: percentage, fixed)
- discount_value (DECIMAL(10,2), NOT NULL)
- min_amount (DECIMAL(10,2))
- max_discount (DECIMAL(10,2))
- usage_limit (INT)
- used_count (INT, DEFAULT 0)
- start_date (DATE)
- end_date (DATE)
- is_active (BOOLEAN, DEFAULT TRUE)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### 8. promotion_usages
**Tracking penggunaan promosi**
```sql
- id (PK, AUTO_INCREMENT)
- promotion_id (INT, FK to promotions.id, NOT NULL)
- user_id (INT, FK to users.id, NOT NULL)
- booking_id (INT, FK to bookings.id, NOT NULL)
- discount_amount (DECIMAL(10,2), NOT NULL)
- used_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
```

### 9. user_favourites
**Lapangan favorit user**
```sql
- id (PK, AUTO_INCREMENT)
- user_id (INT, FK to users.id, NOT NULL)
- field_id (INT, FK to fields.id, NOT NULL)
- created_at (TIMESTAMP)
- UNIQUE KEY (user_id, field_id)
```

### 10. field_availability
**Manajemen ketersediaan lapangan**
```sql
- id (PK, AUTO_INCREMENT)
- field_id (INT, FK to fields.id, NOT NULL)
- date (DATE, NOT NULL)
- start_time (TIME, NOT NULL)
- end_time (TIME, NOT NULL)
- is_available (BOOLEAN, DEFAULT TRUE)
- reason (VARCHAR)
- created_by (INT, FK to users.id)
- created_at (TIMESTAMP)
```

### 11. audit_logs
**Comprehensive audit trail sistem**
```sql
- id (PK, AUTO_INCREMENT)
- user_id (INT, FK to users.id)
- action (VARCHAR, NOT NULL)
- table_name (VARCHAR, NOT NULL)
- record_id (INT)
- old_values (JSON)
- new_values (JSON)
- ip_address (VARCHAR)
- user_agent (TEXT)
- created_at (TIMESTAMP)
```

### 12. system_settings
**Konfigurasi sistem**
```sql
- id (PK, AUTO_INCREMENT)
- key (VARCHAR, UNIQUE, NOT NULL)
- value (TEXT, NOT NULL)
- type (ENUM: string, number, boolean, json)
- description (TEXT)
- category (VARCHAR)
- is_public (BOOLEAN, DEFAULT FALSE)
- updated_by (INT, FK to users.id)
- updated_at (TIMESTAMP)
```

### 13. booking_history
**History perubahan status booking**
```sql
- id (PK, AUTO_INCREMENT)
- booking_id (INT, FK to bookings.id, NOT NULL)
- old_status (VARCHAR)
- new_status (VARCHAR, NOT NULL)
- changed_by (INT, FK to users.id)
- reason (TEXT)
- created_at (TIMESTAMP)
```

### 14. payment_logs
**Detailed payment transaction logs**
```sql
- id (PK, AUTO_INCREMENT)
- payment_id (INT, FK to payments.id, NOT NULL)
- action (VARCHAR, NOT NULL)
- request_data (JSON)
- response_data (JSON)
- status (VARCHAR)
- created_at (TIMESTAMP)
```

### 15. password_resets
**Token untuk reset password**
```sql
- id (PK, AUTO_INCREMENT)
- email (VARCHAR, NOT NULL)
- token (VARCHAR, NOT NULL)
- expires_at (TIMESTAMP, NOT NULL)
- used_at (TIMESTAMP)
- created_at (TIMESTAMP)
```

### 16. role_change_logs
**Log perubahan role user**
```sql
- id (PK, AUTO_INCREMENT)
- user_id (INT, FK to users.id, NOT NULL)
- old_role (VARCHAR)
- new_role (VARCHAR, NOT NULL)
- changed_by (INT, FK to users.id, NOT NULL)
- reason (TEXT)
- created_at (TIMESTAMP)
```

### 17. role_change_request
**Request perubahan role dari user**
```sql
- id (PK, AUTO_INCREMENT)
- user_id (INT, FK to users.id, NOT NULL)
- current_role (VARCHAR, NOT NULL)
- requested_role (VARCHAR, NOT NULL)
- reason (TEXT)
- status (ENUM: pending, approved, rejected)
- reviewed_by (INT, FK to users.id)
- reviewed_at (TIMESTAMP)
- review_notes (TEXT)
- created_at (TIMESTAMP)
```

## Key Relationships

### Primary Relationships
1. **users** → **bookings** (1:N) - User dapat memiliki banyak booking
2. **fields** → **bookings** (1:N) - Lapangan dapat memiliki banyak booking
3. **bookings** → **payments** (1:N) - Booking dapat memiliki banyak pembayaran
4. **users** → **notifications** (1:N) - User dapat memiliki banyak notifikasi
5. **fields** → **field_reviews** (1:N) - Lapangan dapat memiliki banyak review

### Secondary Relationships
6. **users** → **user_favourites** → **fields** (M:N) - Many-to-many relationship
7. **promotions** → **promotion_usages** → **bookings** (M:N) - Tracking promosi
8. **users** → **audit_logs** (1:N) - Tracking aktivitas user
9. **fields** → **field_availability** (1:N) - Manajemen ketersediaan

### Business Logic Constraints
- **Payment before Confirmation**: Booking hanya bisa 'confirmed' setelah payment 'paid'
- **Role Hierarchy**: 6-level role system dengan permissions bertingkat
- **Time Conflict Prevention**: Sistem deteksi konflik waktu booking
- **Audit Trail**: Semua perubahan penting tercatat di audit_logs

## Indexes & Performance
- Primary keys pada semua tabel
- Foreign key constraints untuk data integrity
- Composite indexes pada (user_id, date) untuk booking queries
- Index pada email untuk authentication
- Index pada status fields untuk filtering

## Data Integrity
- Foreign key constraints aktif
- Enum constraints untuk status fields
- NOT NULL constraints pada field critical
- Unique constraints pada email, promotion codes
- Cascade deletes untuk related data
