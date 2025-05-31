-- =====================================================
-- SAFE MIGRATION SCRIPT: ENHANCED ROLE SYSTEM
-- Versi yang aman tanpa drop extension functions
--
-- PERINGATAN: Script ini akan menghapus semua data existing!
-- Pastikan sudah melakukan backup sebelum menjalankan script ini.
--
-- CARA PENGGUNAAN:
-- 1. ROLLBACK transaction yang error: ROLLBACK;
-- 2. Copy-paste script ini ke pgAdmin4 Query Tool
-- 3. Execute script (F5)
-- =====================================================

-- =====================================================
-- SECTION 1: ROLLBACK DAN PREPARATION
-- =====================================================

-- Rollback transaction yang error (jika ada)
ROLLBACK;

-- Start new transaction
BEGIN;

-- Enable error handling
\set ON_ERROR_STOP on

-- Tampilkan informasi database
SELECT
    current_database() as database_name,
    current_user as current_user,
    version() as postgresql_version,
    NOW() as migration_start_time;

DO $$
BEGIN
    RAISE NOTICE '=== SAFE MIGRATION TO ENHANCED ROLE SYSTEM ===';
    RAISE NOTICE 'Migration started at: %', NOW();
    RAISE NOTICE 'Database: %', current_database();
    RAISE NOTICE 'User: %', current_user;
    RAISE NOTICE '==========================================';
END $$;

-- =====================================================
-- SECTION 2: BACKUP EXISTING DATA
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE 'Creating backup tables for existing data...';
END $$;

-- Backup existing users (safe approach)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        DROP TABLE IF EXISTS backup_users_safe;
        CREATE TABLE backup_users_safe AS SELECT * FROM users;
        RAISE NOTICE 'Backed up % users', (SELECT COUNT(*) FROM backup_users_safe);
    ELSE
        CREATE TABLE backup_users_safe (
            id INTEGER, name VARCHAR(255), email VARCHAR(255),
            password VARCHAR(255), role VARCHAR(50), created_at TIMESTAMP
        );
        RAISE NOTICE 'No users table found, created empty backup';
    END IF;
END $$;

-- Backup existing fields
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'fields') THEN
        DROP TABLE IF EXISTS backup_fields_safe;
        CREATE TABLE backup_fields_safe AS SELECT * FROM fields;
        RAISE NOTICE 'Backed up % fields', (SELECT COUNT(*) FROM backup_fields_safe);
    ELSE
        CREATE TABLE backup_fields_safe (
            id INTEGER, name VARCHAR(255), type VARCHAR(100),
            price DECIMAL(10,2), image_url TEXT, status VARCHAR(20), created_at TIMESTAMP
        );
        RAISE NOTICE 'No fields table found, created empty backup';
    END IF;
END $$;

-- Backup existing bookings
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bookings') THEN
        DROP TABLE IF EXISTS backup_bookings_safe;
        CREATE TABLE backup_bookings_safe AS SELECT * FROM bookings;
        RAISE NOTICE 'Backed up % bookings', (SELECT COUNT(*) FROM backup_bookings_safe);
    ELSE
        CREATE TABLE backup_bookings_safe (
            id INTEGER, user_id INTEGER, field_id INTEGER, date DATE,
            start_time TIME, end_time TIME, name VARCHAR(255), phone VARCHAR(20),
            status VARCHAR(20), created_at TIMESTAMP
        );
        RAISE NOTICE 'No bookings table found, created empty backup';
    END IF;
END $$;

-- Backup existing payments
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payments') THEN
        DROP TABLE IF EXISTS backup_payments_safe;
        CREATE TABLE backup_payments_safe AS SELECT * FROM payments;
        RAISE NOTICE 'Backed up % payments', (SELECT COUNT(*) FROM backup_payments_safe);
    ELSE
        CREATE TABLE backup_payments_safe (
            id INTEGER, booking_id INTEGER, amount DECIMAL(10,2),
            method VARCHAR(50), status VARCHAR(20), paid_at TIMESTAMP, created_at TIMESTAMP
        );
        RAISE NOTICE 'No payments table found, created empty backup';
    END IF;
END $$;

-- =====================================================
-- SECTION 3: SAFE CLEANUP (TANPA DROP EXTENSION FUNCTIONS)
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE 'Starting safe cleanup of existing structure...';
END $$;

-- Drop existing tables only (tidak drop functions dari extension)
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS fields CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop custom types (bukan dari extension)
DROP TYPE IF EXISTS booking_status CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

DO $$
BEGIN
    RAISE NOTICE 'Safe cleanup completed (preserved extension functions)';
END $$;

-- =====================================================
-- SECTION 4: ENABLE EXTENSIONS
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

DO $$
BEGIN
    RAISE NOTICE 'Extensions enabled successfully';
END $$;

-- =====================================================
-- SECTION 5: CREATE ENHANCED ROLE SYSTEM
-- =====================================================

-- Create enhanced user role enum
CREATE TYPE user_role AS ENUM (
    'pengunjung',           -- Guest/visitor (read-only access)
    'penyewa',             -- Customer/renter (can book fields)
    'staff_kasir',         -- Cashier staff (handle payments)
    'operator_lapangan',   -- Field operator (manage daily operations)
    'manajer_futsal',      -- Futsal manager (middle management)
    'supervisor_sistem'    -- System supervisor (super admin)
);

-- Create enhanced booking status enum
CREATE TYPE booking_status AS ENUM (
    'pending', 'confirmed', 'cancelled', 'completed', 'no_show'
);

-- Create enhanced payment status enum
CREATE TYPE payment_status AS ENUM (
    'pending', 'paid', 'failed', 'cancelled', 'refunded', 'expired'
);

DO $$
BEGIN
    RAISE NOTICE 'Enhanced enums created successfully';
END $$;

-- =====================================================
-- SECTION 6: CREATE ENHANCED TABLES
-- =====================================================

-- Enhanced Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role user_role DEFAULT 'penyewa' NOT NULL,
    avatar_url TEXT,

    -- Enhanced role-specific fields
    employee_id VARCHAR(50), -- For staff roles
    department VARCHAR(100), -- For staff roles
    hire_date DATE,         -- For staff roles
    supervisor_id INTEGER REFERENCES users(id), -- For staff hierarchy

    -- Verification and status
    email_verified_at TIMESTAMP NULL,
    phone_verified_at TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false, -- For staff verification
    last_login_at TIMESTAMP NULL,

    -- Audit fields
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by INTEGER REFERENCES users(id),

    -- Constraints
    CONSTRAINT check_staff_fields CHECK (
        (role IN ('staff_kasir', 'operator_lapangan', 'manajer_futsal', 'supervisor_sistem') AND employee_id IS NOT NULL)
        OR
        (role IN ('pengunjung', 'penyewa') AND employee_id IS NULL)
    )
);

-- Enhanced Fields Table
CREATE TABLE fields (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    description TEXT DEFAULT '',
    facilities JSONB DEFAULT '[]',
    capacity INTEGER DEFAULT 22,
    location TEXT DEFAULT '',
    address TEXT,
    coordinates JSONB,

    -- Enhanced pricing
    price DECIMAL(10,2) NOT NULL,
    price_weekend DECIMAL(10,2),
    price_peak_hours JSONB,
    price_member DECIMAL(10,2), -- Special price for regular customers

    -- Operating configuration
    operating_hours JSONB DEFAULT '{"start": "09:00", "end": "24:00"}',
    operating_days JSONB DEFAULT '["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]',

    -- Media and presentation
    image_url TEXT,
    gallery JSONB DEFAULT '[]',

    -- Status and ratings
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
    rating DECIMAL(3,2) DEFAULT 0.00 CHECK (rating >= 0 AND rating <= 5),
    total_reviews INTEGER DEFAULT 0,

    -- Management fields
    assigned_operator INTEGER REFERENCES users(id), -- Operator yang bertanggung jawab
    maintenance_schedule JSONB DEFAULT '[]', -- Jadwal maintenance

    -- Audit fields
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by INTEGER REFERENCES users(id),
    updated_by INTEGER REFERENCES users(id)
);

-- Enhanced Bookings Table
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    field_id INTEGER REFERENCES fields(id) ON DELETE CASCADE,
    booking_number VARCHAR(50) UNIQUE NOT NULL,

    -- Booking details
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration_hours DECIMAL(3,1) GENERATED ALWAYS AS (
        EXTRACT(EPOCH FROM (end_time - start_time)) / 3600
    ) STORED,

    -- Customer information
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    notes TEXT,

    -- Pricing and payment
    base_amount DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    admin_fee DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) GENERATED ALWAYS AS (
        base_amount - discount_amount + admin_fee
    ) STORED,

    -- Status management with role-based updates
    status booking_status DEFAULT 'pending' NOT NULL,
    payment_status payment_status DEFAULT 'pending' NOT NULL,

    -- Role-based status tracking
    confirmed_by INTEGER REFERENCES users(id), -- Staff yang konfirmasi
    cancelled_by INTEGER REFERENCES users(id), -- Yang membatalkan
    completed_by INTEGER REFERENCES users(id), -- Staff yang menyelesaikan

    -- Timestamps
    cancellation_reason TEXT,
    cancelled_at TIMESTAMP NULL,
    confirmed_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    reminder_sent BOOLEAN DEFAULT false,

    -- Audit fields
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by INTEGER REFERENCES users(id),
    updated_by INTEGER REFERENCES users(id),

    -- Constraints
    CONSTRAINT check_booking_time CHECK (start_time < end_time),
    CONSTRAINT check_booking_date CHECK (date >= CURRENT_DATE - INTERVAL '1 day'),
    CONSTRAINT check_amounts CHECK (base_amount > 0 AND discount_amount >= 0 AND admin_fee >= 0)
);

-- Enhanced Payments Table
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
    payment_number VARCHAR(50) UNIQUE NOT NULL,

    -- Payment details
    method VARCHAR(50) NOT NULL,
    provider VARCHAR(50),
    amount DECIMAL(10,2) NOT NULL,
    admin_fee DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) GENERATED ALWAYS AS (amount + admin_fee) STORED,

    -- Status and gateway integration
    status payment_status DEFAULT 'pending' NOT NULL,
    external_id VARCHAR(255),
    payment_url TEXT,
    expires_at TIMESTAMP,

    -- Role-based processing
    processed_by INTEGER REFERENCES users(id), -- Staff yang memproses
    verified_by INTEGER REFERENCES users(id),  -- Staff yang verifikasi

    -- Timestamps
    paid_at TIMESTAMP NULL,
    failed_at TIMESTAMP NULL,
    refunded_at TIMESTAMP NULL,
    refund_amount DECIMAL(10,2) DEFAULT 0,

    -- Gateway and audit
    gateway_response JSONB,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by INTEGER REFERENCES users(id),
    updated_by INTEGER REFERENCES users(id)
);

DO $$
BEGIN
    RAISE NOTICE 'Enhanced tables created successfully';
END $$;

-- =====================================================
-- SECTION 7: MIGRATE EXISTING DATA
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE 'Starting data migration from backup tables...';
END $$;

-- Function to map old roles to new roles
CREATE OR REPLACE FUNCTION map_old_role_to_new(old_role VARCHAR) RETURNS user_role AS $$
BEGIN
    RETURN CASE old_role
        WHEN 'user' THEN 'penyewa'::user_role
        WHEN 'pengelola' THEN 'operator_lapangan'::user_role
        WHEN 'admin' THEN 'supervisor_sistem'::user_role
        ELSE 'penyewa'::user_role -- default fallback
    END;
END;
$$ LANGUAGE plpgsql;

-- Migrate Users Data
INSERT INTO users (
    id, name, email, password, phone, role, is_active, created_at
)
SELECT
    id,
    name,
    email,
    password,
    NULL as phone, -- phone tidak ada di struktur lama
    map_old_role_to_new(COALESCE(role, 'user')) as role,
    true as is_active,
    created_at
FROM backup_users_safe
WHERE email IS NOT NULL AND name IS NOT NULL;

-- Update sequence untuk users
SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 1));

-- Migrate Fields Data
INSERT INTO fields (
    id, name, type, price, image_url, status, created_at
)
SELECT
    id,
    name,
    COALESCE(type, 'futsal') as type,
    price,
    image_url,
    COALESCE(status, 'active') as status,
    created_at
FROM backup_fields_safe
WHERE name IS NOT NULL AND price IS NOT NULL;

-- Update sequence untuk fields
SELECT setval('fields_id_seq', COALESCE((SELECT MAX(id) FROM fields), 1));

-- Migrate Bookings Data (jika ada)
INSERT INTO bookings (
    id, user_id, field_id, date, start_time, end_time,
    name, phone, base_amount, status, created_at
)
SELECT
    b.id,
    b.user_id,
    b.field_id,
    b.date,
    b.start_time,
    b.end_time,
    b.name,
    b.phone,
    COALESCE(f.price * EXTRACT(EPOCH FROM (b.end_time - b.start_time)) / 3600, 100000) as base_amount,
    CASE
        WHEN b.status = 'pending' THEN 'pending'::booking_status
        WHEN b.status = 'confirmed' THEN 'confirmed'::booking_status
        WHEN b.status = 'cancelled' THEN 'cancelled'::booking_status
        WHEN b.status = 'completed' THEN 'completed'::booking_status
        ELSE 'pending'::booking_status
    END as status,
    b.created_at
FROM backup_bookings_safe b
LEFT JOIN backup_fields_safe f ON b.field_id = f.id
WHERE b.user_id IS NOT NULL
  AND b.field_id IS NOT NULL
  AND b.date IS NOT NULL
  AND b.start_time IS NOT NULL
  AND b.end_time IS NOT NULL;

-- Generate booking numbers untuk data yang dimigrasikan
UPDATE bookings
SET booking_number = 'BK-' || TO_CHAR(created_at, 'YYYYMMDD') || '-' || LPAD(id::text, 3, '0')
WHERE booking_number IS NULL OR booking_number = '';

-- Update sequence untuk bookings
SELECT setval('bookings_id_seq', COALESCE((SELECT MAX(id) FROM bookings), 1));

-- Migrate Payments Data (jika ada)
INSERT INTO payments (
    id, booking_id, amount, method, status, paid_at, created_at
)
SELECT
    p.id,
    p.booking_id,
    p.amount,
    COALESCE(p.method, 'manual') as method,
    CASE
        WHEN p.status = 'paid' THEN 'paid'::payment_status
        WHEN p.status = 'pending' THEN 'pending'::payment_status
        WHEN p.status = 'failed' THEN 'failed'::payment_status
        WHEN p.status = 'cancelled' THEN 'cancelled'::payment_status
        ELSE 'pending'::payment_status
    END as status,
    p.paid_at,
    p.created_at
FROM backup_payments_safe p
WHERE p.booking_id IS NOT NULL AND p.amount IS NOT NULL;

-- Generate payment numbers untuk data yang dimigrasikan
UPDATE payments
SET payment_number = 'PAY-' || TO_CHAR(created_at, 'YYYYMMDD') || '-' || LPAD(id::text, 3, '0')
WHERE payment_number IS NULL OR payment_number = '';

-- Update sequence untuk payments
SELECT setval('payments_id_seq', COALESCE((SELECT MAX(id) FROM payments), 1));

-- Update payment status di bookings berdasarkan payments
UPDATE bookings
SET payment_status = CASE
    WHEN EXISTS (
        SELECT 1 FROM payments p
        WHERE p.booking_id = bookings.id AND p.status = 'paid'
    ) THEN 'paid'::payment_status
    ELSE 'pending'::payment_status
END;

-- Verify migration
DO $$
DECLARE
    migrated_users INTEGER;
    migrated_fields INTEGER;
    migrated_bookings INTEGER;
    migrated_payments INTEGER;
BEGIN
    SELECT COUNT(*) INTO migrated_users FROM users;
    SELECT COUNT(*) INTO migrated_fields FROM fields;
    SELECT COUNT(*) INTO migrated_bookings FROM bookings;
    SELECT COUNT(*) INTO migrated_payments FROM payments;

    RAISE NOTICE 'Data migration completed:';
    RAISE NOTICE '- Users migrated: %', migrated_users;
    RAISE NOTICE '- Fields migrated: %', migrated_fields;
    RAISE NOTICE '- Bookings migrated: %', migrated_bookings;
    RAISE NOTICE '- Payments migrated: %', migrated_payments;
END $$;

-- =====================================================
-- SECTION 8: CREATE ESSENTIAL FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to generate booking number
CREATE OR REPLACE FUNCTION generate_booking_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.booking_number IS NULL OR NEW.booking_number = '' THEN
        NEW.booking_number := 'BK-' || TO_CHAR(COALESCE(NEW.created_at, NOW()), 'YYYYMMDD') || '-' || LPAD(NEW.id::text, 3, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to generate payment number
CREATE OR REPLACE FUNCTION generate_payment_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.payment_number IS NULL OR NEW.payment_number = '' THEN
        NEW.payment_number := 'PAY-' || TO_CHAR(COALESCE(NEW.created_at, NOW()), 'YYYYMMDD') || '-' || LPAD(NEW.id::text, 3, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER trigger_generate_booking_number
    BEFORE INSERT ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION generate_booking_number();

CREATE TRIGGER trigger_generate_payment_number
    BEFORE INSERT ON payments
    FOR EACH ROW
    EXECUTE FUNCTION generate_payment_number();

CREATE TRIGGER trigger_update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_fields_updated_at
    BEFORE UPDATE ON fields
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create essential indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_uuid ON users(uuid);
CREATE INDEX idx_fields_status ON fields(status);
CREATE INDEX idx_fields_uuid ON fields(uuid);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_field_id ON bookings(field_id);
CREATE INDEX idx_bookings_date ON bookings(date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_uuid ON bookings(uuid);
CREATE INDEX idx_bookings_booking_number ON bookings(booking_number);
CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_uuid ON payments(uuid);
CREATE INDEX idx_payments_payment_number ON payments(payment_number);

DO $$
BEGIN
    RAISE NOTICE 'Essential functions, triggers, and indexes created successfully';
END $$;

-- =====================================================
-- SECTION 9: CLEANUP AND FINALIZATION
-- =====================================================

-- Drop backup tables setelah migration berhasil
DROP TABLE IF EXISTS backup_users_safe CASCADE;
DROP TABLE IF EXISTS backup_fields_safe CASCADE;
DROP TABLE IF EXISTS backup_bookings_safe CASCADE;
DROP TABLE IF EXISTS backup_payments_safe CASCADE;

-- Drop temporary function
DROP FUNCTION IF EXISTS map_old_role_to_new(VARCHAR);

DO $$
BEGIN
    RAISE NOTICE 'Backup tables cleaned up successfully';
END $$;

-- Update table statistics
ANALYZE users;
ANALYZE fields;
ANALYZE bookings;
ANALYZE payments;

-- Final verification dan summary
DO $$
DECLARE
    table_count INTEGER;
    user_count INTEGER;
    field_count INTEGER;
    booking_count INTEGER;
    payment_count INTEGER;
BEGIN
    -- Count database objects
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

    -- Count migrated data
    SELECT COUNT(*) INTO user_count FROM users;
    SELECT COUNT(*) INTO field_count FROM fields;
    SELECT COUNT(*) INTO booking_count FROM bookings;
    SELECT COUNT(*) INTO payment_count FROM payments;

    RAISE NOTICE '=== SAFE MIGRATION TO ENHANCED ROLE SYSTEM COMPLETED ===';
    RAISE NOTICE 'Migration completed at: %', NOW();
    RAISE NOTICE '';
    RAISE NOTICE 'DATABASE STRUCTURE:';
    RAISE NOTICE '- Tables created: %', table_count;
    RAISE NOTICE '';
    RAISE NOTICE 'DATA MIGRATION:';
    RAISE NOTICE '- Users migrated: %', user_count;
    RAISE NOTICE '- Fields migrated: %', field_count;
    RAISE NOTICE '- Bookings migrated: %', booking_count;
    RAISE NOTICE '- Payments migrated: %', payment_count;
    RAISE NOTICE '';
    RAISE NOTICE 'ROLE MAPPING:';
    RAISE NOTICE '- user → penyewa (Customer)';
    RAISE NOTICE '- pengelola → operator_lapangan (Field Operator)';
    RAISE NOTICE '- admin → supervisor_sistem (System Supervisor)';
    RAISE NOTICE '- NEW: pengunjung (Guest)';
    RAISE NOTICE '- NEW: staff_kasir (Cashier)';
    RAISE NOTICE '- NEW: manajer_futsal (Manager)';
    RAISE NOTICE '';
    RAISE NOTICE 'Enhanced role system is ready for production use!';
    RAISE NOTICE '================================================';
END $$;

-- Show user distribution by new roles
SELECT
    'USER DISTRIBUTION BY NEW ROLES' as info;

SELECT
    role,
    COUNT(*) as user_count,
    COUNT(CASE WHEN is_active THEN 1 END) as active_users
FROM users
GROUP BY role
ORDER BY role;

-- Show available roles
SELECT
    'AVAILABLE ROLES IN SYSTEM' as info;

SELECT unnest(enum_range(NULL::user_role)) as available_roles;

-- Commit transaction
COMMIT;

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ SAFE MIGRATION COMPLETED SUCCESSFULLY!';
    RAISE NOTICE '';
    RAISE NOTICE 'NEXT STEPS:';
    RAISE NOTICE '1. Update your application code to use new role names';
    RAISE NOTICE '2. Test all existing functionality with migrated data';
    RAISE NOTICE '3. Configure additional features as needed';
    RAISE NOTICE '';
    RAISE NOTICE 'Your enhanced role system is now ready for production!';
    RAISE NOTICE 'No extension functions were affected during migration.';
END $$;
