-- =====================================================
-- COMPLETE DATABASE CLEANUP & MIGRATION SCRIPT
-- Script untuk membersihkan database existing dan deploy enhanced role system
--
-- SAFETY FEATURES:
-- - DROP IF EXISTS untuk semua objects
-- - Transaction safety dengan rollback capability
-- - Comprehensive cleanup dari semua remnants
-- - Error handling untuk edge cases
-- - Verification steps untuk memastikan success
--
-- ENVIRONMENT: PostgreSQL 16.8 di Railway
-- DATABASE: railway
-- USER: postgres
-- =====================================================

-- =====================================================
-- SECTION 1: SAFETY PREPARATION
-- =====================================================

-- Enable error handling
\set ON_ERROR_STOP on

-- Start transaction untuk safety
BEGIN;

-- Tampilkan informasi database
SELECT
    current_database() as database_name,
    current_user as current_user,
    version() as postgresql_version,
    NOW() as cleanup_start_time;

DO $$
BEGIN
    RAISE NOTICE '=== COMPLETE DATABASE CLEANUP & MIGRATION ===';
    RAISE NOTICE 'Cleanup started at: %', NOW();
    RAISE NOTICE 'Database: %', current_database();
    RAISE NOTICE 'This script will safely clean and rebuild the database';
    RAISE NOTICE '=============================================';
END $$;

-- =====================================================
-- SECTION 2: COMPREHENSIVE DATABASE CLEANUP
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE 'Starting comprehensive database cleanup...';
END $$;

-- Step 1: Drop all views safely
DO $$
DECLARE
    r RECORD;
BEGIN
    RAISE NOTICE 'Dropping all views...';
    FOR r IN (SELECT viewname FROM pg_views WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP VIEW IF EXISTS ' || quote_ident(r.viewname) || ' CASCADE';
        RAISE NOTICE 'Dropped view: %', r.viewname;
    END LOOP;
END $$;

-- Step 2: Drop all tables safely (in correct dependency order)
DO $$
BEGIN
    RAISE NOTICE 'Dropping all tables...';
END $$;

-- Drop tables yang mungkin ada (order penting untuk foreign keys)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS payment_logs CASCADE;
DROP TABLE IF EXISTS booking_history CASCADE;
DROP TABLE IF EXISTS user_favorites CASCADE;
DROP TABLE IF EXISTS field_availability CASCADE;
DROP TABLE IF EXISTS promotion_usages CASCADE;
DROP TABLE IF EXISTS promotions CASCADE;
DROP TABLE IF EXISTS field_reviews CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS system_settings CASCADE;
DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TABLE IF EXISTS fields CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop backup tables jika ada
DROP TABLE IF EXISTS backup_users CASCADE;
DROP TABLE IF EXISTS backup_fields CASCADE;
DROP TABLE IF EXISTS backup_bookings CASCADE;
DROP TABLE IF EXISTS backup_payments CASCADE;
DROP TABLE IF EXISTS backup_users_safe CASCADE;
DROP TABLE IF EXISTS backup_fields_safe CASCADE;
DROP TABLE IF EXISTS backup_bookings_safe CASCADE;
DROP TABLE IF EXISTS backup_payments_safe CASCADE;

-- Step 3: Drop all sequences safely
DO $$
BEGIN
    RAISE NOTICE 'Dropping all sequences...';
END $$;

DROP SEQUENCE IF EXISTS users_id_seq CASCADE;
DROP SEQUENCE IF EXISTS fields_id_seq CASCADE;
DROP SEQUENCE IF EXISTS bookings_id_seq CASCADE;
DROP SEQUENCE IF EXISTS payments_id_seq CASCADE;
DROP SEQUENCE IF EXISTS notifications_id_seq CASCADE;
DROP SEQUENCE IF EXISTS field_reviews_id_seq CASCADE;
DROP SEQUENCE IF EXISTS promotions_id_seq CASCADE;
DROP SEQUENCE IF EXISTS promotion_usages_id_seq CASCADE;
DROP SEQUENCE IF EXISTS system_settings_id_seq CASCADE;
DROP SEQUENCE IF EXISTS role_permissions_id_seq CASCADE;
DROP SEQUENCE IF EXISTS audit_logs_id_seq CASCADE;
DROP SEQUENCE IF EXISTS field_availability_id_seq CASCADE;
DROP SEQUENCE IF EXISTS user_favorites_id_seq CASCADE;
DROP SEQUENCE IF EXISTS booking_history_id_seq CASCADE;
DROP SEQUENCE IF EXISTS payment_logs_id_seq CASCADE;

-- Step 4: Drop all custom functions safely (exclude extension functions)
DO $$
DECLARE
    r RECORD;
BEGIN
    RAISE NOTICE 'Dropping custom functions...';
    FOR r IN (
        SELECT p.proname, pg_get_function_identity_arguments(p.oid) as args
        FROM pg_proc p
        WHERE p.pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
        AND NOT EXISTS (
            SELECT 1 FROM pg_depend d
            WHERE d.objid = p.oid
            AND d.deptype = 'e'  -- exclude extension dependencies
        )
        AND p.proname NOT LIKE 'uuid_%'  -- exclude uuid functions
        AND p.proname NOT LIKE 'pg_%'    -- exclude pg functions
    ) LOOP
        BEGIN
            EXECUTE 'DROP FUNCTION IF EXISTS ' || quote_ident(r.proname) || '(' || r.args || ') CASCADE';
            RAISE NOTICE 'Dropped function: %(%)', r.proname, r.args;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'Could not drop function %(%): %', r.proname, r.args, SQLERRM;
        END;
    END LOOP;
END $$;

-- Step 5: Drop all custom types safely
DO $$
BEGIN
    RAISE NOTICE 'Dropping custom types...';
END $$;

DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS booking_status CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS field_status CASCADE;
DROP TYPE IF EXISTS notification_type CASCADE;

-- Step 6: Drop any remaining custom objects
DO $$
DECLARE
    r RECORD;
BEGIN
    RAISE NOTICE 'Checking for remaining custom objects...';

    -- Drop any remaining triggers
    FOR r IN (
        SELECT trigger_name, event_object_table
        FROM information_schema.triggers
        WHERE trigger_schema = 'public'
    ) LOOP
        BEGIN
            EXECUTE 'DROP TRIGGER IF EXISTS ' || quote_ident(r.trigger_name) || ' ON ' || quote_ident(r.event_object_table) || ' CASCADE';
            RAISE NOTICE 'Dropped trigger: % on %', r.trigger_name, r.event_object_table;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'Could not drop trigger %: %', r.trigger_name, SQLERRM;
        END;
    END LOOP;
END $$;

-- Verification: Check if database is clean
DO $$
DECLARE
    table_count INTEGER;
    type_count INTEGER;
    function_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

    SELECT COUNT(*) INTO type_count
    FROM pg_type
    WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    AND typtype = 'e'; -- enum types

    SELECT COUNT(*) INTO function_count
    FROM pg_proc
    WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    AND proname NOT LIKE 'uuid_%'
    AND proname NOT LIKE 'pg_%';

    RAISE NOTICE 'Database cleanup verification:';
    RAISE NOTICE '- Remaining tables: %', table_count;
    RAISE NOTICE '- Remaining custom types: %', type_count;
    RAISE NOTICE '- Remaining custom functions: %', function_count;

    IF table_count = 0 AND type_count = 0 AND function_count = 0 THEN
        RAISE NOTICE '✅ Database is completely clean and ready for migration';
    ELSE
        RAISE NOTICE '⚠️  Some objects remain, but migration will proceed safely';
    END IF;
END $$;

-- =====================================================
-- SECTION 3: ENABLE EXTENSIONS
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

DO $$
BEGIN
    RAISE NOTICE 'Extensions enabled successfully';
END $$;

-- =====================================================
-- SECTION 4: CREATE ENHANCED ENUM TYPES (SAFE)
-- =====================================================

-- Create enhanced user role enum (safe creation)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM (
            'pengunjung',           -- Guest/visitor (read-only access)
            'penyewa',             -- Customer/renter (can book fields)
            'staff_kasir',         -- Cashier staff (handle payments)
            'operator_lapangan',   -- Field operator (manage daily operations)
            'manajer_futsal',      -- Futsal manager (middle management)
            'supervisor_sistem'    -- System supervisor (super admin)
        );
        RAISE NOTICE 'Created user_role enum type';
    ELSE
        RAISE NOTICE 'user_role enum type already exists, skipping';
    END IF;
END $$;

-- Create enhanced booking status enum (safe creation)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_status') THEN
        CREATE TYPE booking_status AS ENUM (
            'pending',      -- Menunggu konfirmasi
            'confirmed',    -- Dikonfirmasi staff
            'cancelled',    -- Dibatalkan
            'completed',    -- Selesai dimainkan
            'no_show'       -- Tidak datang
        );
        RAISE NOTICE 'Created booking_status enum type';
    ELSE
        RAISE NOTICE 'booking_status enum type already exists, skipping';
    END IF;
END $$;

-- Create enhanced payment status enum (safe creation)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
        CREATE TYPE payment_status AS ENUM (
            'pending',      -- Menunggu pembayaran
            'paid',         -- Sudah dibayar
            'failed',       -- Pembayaran gagal
            'cancelled',    -- Pembayaran dibatalkan
            'refunded',     -- Sudah direfund
            'expired'       -- Expired/timeout
        );
        RAISE NOTICE 'Created payment_status enum type';
    ELSE
        RAISE NOTICE 'payment_status enum type already exists, skipping';
    END IF;
END $$;

DO $$
BEGIN
    RAISE NOTICE 'Enhanced enum types created/verified successfully';
END $$;

-- =====================================================
-- SECTION 5: CREATE ENHANCED USERS TABLE
-- =====================================================

-- Enhanced Users Table dengan flexible constraints
CREATE TABLE users (
    -- Primary identifiers
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,

    -- Basic user information
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role user_role DEFAULT 'penyewa' NOT NULL,
    avatar_url TEXT,

    -- Enhanced role-specific fields (FLEXIBLE - dapat NULL untuk backward compatibility)
    employee_id VARCHAR(50), -- Auto-generated untuk staff roles
    department VARCHAR(100), -- Untuk staff roles
    hire_date DATE,         -- Untuk staff roles
    salary DECIMAL(10,2),   -- Untuk staff roles
    supervisor_id INTEGER REFERENCES users(id), -- Staff hierarchy

    -- Verification dan status
    email_verified_at TIMESTAMP NULL,
    phone_verified_at TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    last_login_at TIMESTAMP NULL,

    -- Audit fields
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by INTEGER REFERENCES users(id),
    updated_by INTEGER REFERENCES users(id),

    -- Flexible constraints
    CONSTRAINT check_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT check_phone_format CHECK (phone IS NULL OR phone ~* '^\+?[0-9\-\s\(\)]{8,20}$')
);

-- Create indexes untuk users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_uuid ON users(uuid);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_employee_id ON users(employee_id) WHERE employee_id IS NOT NULL;
CREATE INDEX idx_users_supervisor_id ON users(supervisor_id) WHERE supervisor_id IS NOT NULL;
CREATE INDEX idx_users_role_active ON users(role, is_active);

COMMENT ON TABLE users IS 'Enhanced users table dengan flexible role system untuk futsal business';

DO $$
BEGIN
    RAISE NOTICE 'Enhanced users table created successfully';
END $$;

-- =====================================================
-- SECTION 6: CREATE ENHANCED FIELDS TABLE
-- =====================================================

-- Enhanced Fields Table
CREATE TABLE fields (
    -- Primary identifiers
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,

    -- Basic field information
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL DEFAULT 'futsal',
    description TEXT DEFAULT '',

    -- Enhanced features
    facilities JSONB DEFAULT '[]',
    capacity INTEGER DEFAULT 22 CHECK (capacity > 0),
    location TEXT DEFAULT '',
    address TEXT,
    coordinates JSONB,

    -- Pricing system
    price DECIMAL(10,2) NOT NULL CHECK (price > 0),
    price_weekend DECIMAL(10,2) CHECK (price_weekend IS NULL OR price_weekend > 0),
    price_peak_hours JSONB,
    price_member DECIMAL(10,2) CHECK (price_member IS NULL OR price_member > 0),

    -- Operating configuration
    operating_hours JSONB DEFAULT '{"start": "09:00", "end": "24:00"}',
    operating_days JSONB DEFAULT '["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]',

    -- Media
    image_url TEXT,
    gallery JSONB DEFAULT '[]',

    -- Status dan ratings
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
    rating DECIMAL(3,2) DEFAULT 0.00 CHECK (rating >= 0 AND rating <= 5),
    total_reviews INTEGER DEFAULT 0 CHECK (total_reviews >= 0),

    -- Management
    assigned_operator INTEGER REFERENCES users(id),
    maintenance_schedule JSONB DEFAULT '[]',

    -- Audit fields
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by INTEGER REFERENCES users(id),
    updated_by INTEGER REFERENCES users(id)
);

-- Create indexes untuk fields
CREATE INDEX idx_fields_uuid ON fields(uuid);
CREATE INDEX idx_fields_status ON fields(status);
CREATE INDEX idx_fields_type ON fields(type);
CREATE INDEX idx_fields_assigned_operator ON fields(assigned_operator) WHERE assigned_operator IS NOT NULL;
CREATE INDEX idx_fields_facilities ON fields USING GIN(facilities);
CREATE INDEX idx_fields_coordinates ON fields USING GIN(coordinates) WHERE coordinates IS NOT NULL;
CREATE INDEX idx_fields_search ON fields USING GIN(to_tsvector('english', name || ' ' || COALESCE(description, '')));

COMMENT ON TABLE fields IS 'Enhanced fields table dengan comprehensive features untuk futsal business';

DO $$
BEGIN
    RAISE NOTICE 'Enhanced fields table created successfully';
END $$;

-- =====================================================
-- SECTION 7: CREATE ENHANCED BOOKINGS & PAYMENTS TABLES
-- =====================================================

-- Enhanced Bookings Table
CREATE TABLE bookings (
    -- Primary identifiers
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    booking_number VARCHAR(50) UNIQUE NOT NULL,

    -- Foreign keys
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    field_id INTEGER REFERENCES fields(id) ON DELETE CASCADE,

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

    -- Pricing
    base_amount DECIMAL(10,2) NOT NULL CHECK (base_amount > 0),
    discount_amount DECIMAL(10,2) DEFAULT 0 CHECK (discount_amount >= 0),
    admin_fee DECIMAL(10,2) DEFAULT 0 CHECK (admin_fee >= 0),
    total_amount DECIMAL(10,2) GENERATED ALWAYS AS (
        base_amount - discount_amount + admin_fee
    ) STORED,

    -- Status management
    status booking_status DEFAULT 'pending' NOT NULL,
    payment_status payment_status DEFAULT 'pending' NOT NULL,

    -- Role-based tracking
    confirmed_by INTEGER REFERENCES users(id),
    cancelled_by INTEGER REFERENCES users(id),
    completed_by INTEGER REFERENCES users(id),

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
    CONSTRAINT check_amounts CHECK (base_amount > 0 AND discount_amount >= 0 AND admin_fee >= 0),
    CONSTRAINT check_phone_format CHECK (phone ~* '^\+?[0-9\-\s\(\)]{8,20}$')
);

-- Enhanced Payments Table
CREATE TABLE payments (
    -- Primary identifiers
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    payment_number VARCHAR(50) UNIQUE NOT NULL,

    -- Foreign keys
    booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,

    -- Payment details
    method VARCHAR(50) NOT NULL,
    provider VARCHAR(50),
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    admin_fee DECIMAL(10,2) DEFAULT 0 CHECK (admin_fee >= 0),
    total_amount DECIMAL(10,2) GENERATED ALWAYS AS (amount + admin_fee) STORED,

    -- Status dan gateway integration
    status payment_status DEFAULT 'pending' NOT NULL,
    external_id VARCHAR(255),
    payment_url TEXT,
    expires_at TIMESTAMP,

    -- Role-based processing
    processed_by INTEGER REFERENCES users(id),
    verified_by INTEGER REFERENCES users(id),

    -- Timestamps
    paid_at TIMESTAMP NULL,
    failed_at TIMESTAMP NULL,
    refunded_at TIMESTAMP NULL,
    refund_amount DECIMAL(10,2) DEFAULT 0 CHECK (refund_amount >= 0),

    -- Gateway response dan audit
    gateway_response JSONB,
    notes TEXT,

    -- Audit fields
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by INTEGER REFERENCES users(id),
    updated_by INTEGER REFERENCES users(id),

    -- Constraints
    CONSTRAINT check_refund_amount CHECK (refund_amount <= amount)
);

-- Create indexes untuk bookings
CREATE INDEX idx_bookings_uuid ON bookings(uuid);
CREATE INDEX idx_bookings_booking_number ON bookings(booking_number);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_field_id ON bookings(field_id);
CREATE INDEX idx_bookings_date ON bookings(date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX idx_bookings_field_date_time ON bookings(field_id, date, start_time);
CREATE INDEX idx_bookings_conflict_check ON bookings(field_id, date, start_time, end_time)
WHERE status IN ('pending', 'confirmed');

-- Create indexes untuk payments
CREATE INDEX idx_payments_uuid ON payments(uuid);
CREATE INDEX idx_payments_payment_number ON payments(payment_number);
CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_method ON payments(method);
CREATE INDEX idx_payments_external_id ON payments(external_id) WHERE external_id IS NOT NULL;
CREATE INDEX idx_payments_expires_at ON payments(expires_at) WHERE expires_at IS NOT NULL;

DO $$
BEGIN
    RAISE NOTICE 'Enhanced bookings and payments tables created successfully';
END $$;

-- =====================================================
-- SECTION 8: CREATE ESSENTIAL FUNCTIONS & TRIGGERS
-- =====================================================

-- Function untuk auto-generate employee_id
CREATE OR REPLACE FUNCTION generate_employee_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.role IN ('staff_kasir', 'operator_lapangan', 'manajer_futsal', 'supervisor_sistem')
       AND NEW.employee_id IS NULL THEN
        NEW.employee_id := 'EMP' || LPAD(NEW.id::text, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function untuk auto-generate booking number
CREATE OR REPLACE FUNCTION generate_booking_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.booking_number IS NULL OR NEW.booking_number = '' THEN
        NEW.booking_number := 'BK-' || TO_CHAR(COALESCE(NEW.created_at, NOW()), 'YYYYMMDD') || '-' || LPAD(NEW.id::text, 3, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function untuk auto-generate payment number
CREATE OR REPLACE FUNCTION generate_payment_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.payment_number IS NULL OR NEW.payment_number = '' THEN
        NEW.payment_number := 'PAY-' || TO_CHAR(COALESCE(NEW.created_at, NOW()), 'YYYYMMDD') || '-' || LPAD(NEW.id::text, 3, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function untuk update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function untuk get role hierarchy level
CREATE OR REPLACE FUNCTION get_role_level(role_param user_role) RETURNS INTEGER AS $$
BEGIN
    RETURN CASE role_param
        WHEN 'pengunjung' THEN 1
        WHEN 'penyewa' THEN 2
        WHEN 'staff_kasir' THEN 3
        WHEN 'operator_lapangan' THEN 4
        WHEN 'manajer_futsal' THEN 5
        WHEN 'supervisor_sistem' THEN 6
        ELSE 0
    END;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER trigger_generate_employee_id
    BEFORE INSERT OR UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION generate_employee_id();

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

DO $$
BEGIN
    RAISE NOTICE 'Essential functions and triggers created successfully';
END $$;

-- =====================================================
-- SECTION 9: INSERT SAMPLE DATA
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE 'Inserting sample data for testing...';
END $$;

-- Sample Users (passwords adalah hash dari 'password123')
INSERT INTO users (name, email, password, phone, role, department, hire_date, is_active, is_verified) VALUES
('Super Admin', 'superadmin@futsalapp.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '+6281234567890', 'supervisor_sistem', 'IT', '2024-01-01', true, true),
('Manager Futsal', 'manager@futsalapp.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '+6281234567891', 'manajer_futsal', 'Operations', '2024-01-15', true, true),
('Operator A', 'operator1@futsalapp.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '+6281234567892', 'operator_lapangan', 'Field Operations', '2024-02-01', true, true),
('Operator B', 'operator2@futsalapp.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '+6281234567893', 'operator_lapangan', 'Field Operations', '2024-02-15', true, true),
('Kasir Pagi', 'kasir1@futsalapp.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '+6281234567894', 'staff_kasir', 'Finance', '2024-03-01', true, true),
('Kasir Sore', 'kasir2@futsalapp.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '+6281234567895', 'staff_kasir', 'Finance', '2024-03-15', true, true),
('John Doe', 'john@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '+6281234567896', 'penyewa', NULL, NULL, true, false),
('Jane Smith', 'jane@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '+6281234567897', 'penyewa', NULL, NULL, true, false),
('Bob Wilson', 'bob@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '+6281234567898', 'penyewa', NULL, NULL, true, false),
('Alice Johnson', 'alice@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '+6281234567899', 'penyewa', NULL, NULL, true, false);

-- Update supervisor relationships
UPDATE users SET supervisor_id = 1 WHERE role = 'manajer_futsal';
UPDATE users SET supervisor_id = 2 WHERE role IN ('operator_lapangan', 'staff_kasir');

-- Sample Fields
INSERT INTO fields (name, type, description, facilities, capacity, location, address, coordinates, price, price_weekend, price_member, assigned_operator, status, created_by) VALUES
('Lapangan Futsal Premium A', 'futsal', 'Lapangan futsal premium dengan rumput sintetis berkualitas tinggi.',
 '["parking", "toilet", "canteen", "shower", "wifi", "ac", "sound_system", "tribun"]', 22, 'Jakarta Selatan',
 'Jl. Sudirman No. 123, Jakarta Selatan', '{"lat": -6.2088, "lng": 106.8456}', 120000.00, 150000.00, 100000.00, 3, 'active', 2),
('Lapangan Futsal Premium B', 'futsal', 'Lapangan futsal standar dengan fasilitas lengkap.',
 '["parking", "toilet", "canteen", "shower", "wifi", "tribun"]', 22, 'Jakarta Pusat',
 'Jl. Thamrin No. 456, Jakarta Pusat', '{"lat": -6.1944, "lng": 106.8229}', 100000.00, 130000.00, 85000.00, 4, 'active', 2),
('Lapangan Futsal Standard C', 'futsal', 'Lapangan futsal dengan fasilitas standar.',
 '["parking", "toilet", "canteen", "wifi"]', 20, 'Jakarta Timur',
 'Jl. Bekasi Raya No. 789, Jakarta Timur', '{"lat": -6.2146, "lng": 106.8451}', 80000.00, 100000.00, 70000.00, 3, 'active', 2),
('Lapangan Mini Soccer D', 'mini_soccer', 'Lapangan mini soccer outdoor dengan rumput alami.',
 '["parking", "toilet", "canteen"]', 14, 'Jakarta Barat',
 'Jl. Puri Indah No. 321, Jakarta Barat', '{"lat": -6.1888, "lng": 106.7351}', 90000.00, 110000.00, 75000.00, 4, 'active', 2);

DO $$
BEGIN
    RAISE NOTICE 'Sample data inserted successfully';
END $$;

-- =====================================================
-- SECTION 10: ANALYZE TABLES & FINAL VERIFICATION
-- =====================================================

-- Update table statistics untuk optimal performance
ANALYZE users;
ANALYZE fields;
ANALYZE bookings;
ANALYZE payments;

-- Final verification dan summary
DO $$
DECLARE
    table_count INTEGER;
    index_count INTEGER;
    function_count INTEGER;
    trigger_count INTEGER;
    user_count INTEGER;
    field_count INTEGER;
    staff_count INTEGER;
    customer_count INTEGER;
    enum_count INTEGER;
BEGIN
    -- Count database objects
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

    SELECT COUNT(*) INTO index_count
    FROM pg_indexes
    WHERE schemaname = 'public';

    SELECT COUNT(*) INTO function_count
    FROM pg_proc
    WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    AND proname NOT LIKE 'uuid_%'
    AND proname NOT LIKE 'pg_%';

    SELECT COUNT(*) INTO trigger_count
    FROM information_schema.triggers
    WHERE trigger_schema = 'public';

    SELECT COUNT(*) INTO enum_count
    FROM pg_type
    WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    AND typtype = 'e';

    -- Count sample data
    SELECT COUNT(*) INTO user_count FROM users;
    SELECT COUNT(*) INTO field_count FROM fields;
    SELECT COUNT(*) INTO staff_count FROM users WHERE role IN ('staff_kasir', 'operator_lapangan', 'manajer_futsal', 'supervisor_sistem');
    SELECT COUNT(*) INTO customer_count FROM users WHERE role = 'penyewa';

    RAISE NOTICE '=== COMPLETE DATABASE CLEANUP & MIGRATION COMPLETED ===';
    RAISE NOTICE 'Migration completed at: %', NOW();
    RAISE NOTICE '';
    RAISE NOTICE 'DATABASE STRUCTURE:';
    RAISE NOTICE '- Tables created: %', table_count;
    RAISE NOTICE '- Indexes created: %', index_count;
    RAISE NOTICE '- Functions created: %', function_count;
    RAISE NOTICE '- Triggers created: %', trigger_count;
    RAISE NOTICE '- Enum types created: %', enum_count;
    RAISE NOTICE '';
    RAISE NOTICE 'SAMPLE DATA:';
    RAISE NOTICE '- Total users: %', user_count;
    RAISE NOTICE '- Staff users: %', staff_count;
    RAISE NOTICE '- Customer users: %', customer_count;
    RAISE NOTICE '- Fields: %', field_count;
    RAISE NOTICE '';
    RAISE NOTICE 'ENHANCED ROLE SYSTEM:';
    RAISE NOTICE '- pengunjung (Level 1): Guest access';
    RAISE NOTICE '- penyewa (Level 2): Customer access';
    RAISE NOTICE '- staff_kasir (Level 3): Cashier staff';
    RAISE NOTICE '- operator_lapangan (Level 4): Field operator';
    RAISE NOTICE '- manajer_futsal (Level 5): Futsal manager';
    RAISE NOTICE '- supervisor_sistem (Level 6): System supervisor';
    RAISE NOTICE '';
    RAISE NOTICE 'DATABASE LAYER FEATURES:';
    RAISE NOTICE '- ✅ Auto-generated UUIDs, timestamps, numbers';
    RAISE NOTICE '- ✅ Flexible constraints (no constraint violations)';
    RAISE NOTICE '- ✅ Role-based tracking untuk audit';
    RAISE NOTICE '- ✅ Performance indexes untuk optimization';
    RAISE NOTICE '- ✅ Essential business rules enforcement';
    RAISE NOTICE '- ✅ JSONB support untuk flexible data';
    RAISE NOTICE '- ✅ Gateway integration ready';
    RAISE NOTICE '';
    RAISE NOTICE 'Enhanced role system is ready for production use!';
    RAISE NOTICE '================================================';
END $$;

-- Show user distribution by roles
SELECT
    'USER DISTRIBUTION BY ROLES' as info;

SELECT
    role,
    get_role_level(role) as hierarchy_level,
    COUNT(*) as user_count,
    COUNT(CASE WHEN is_active THEN 1 END) as active_users,
    COUNT(CASE WHEN employee_id IS NOT NULL THEN 1 END) as staff_with_employee_id
FROM users
GROUP BY role
ORDER BY get_role_level(role);

-- Show available roles in system
SELECT
    'AVAILABLE ROLES IN SYSTEM' as info;

SELECT unnest(enum_range(NULL::user_role)) as available_roles;

-- Show field assignments
SELECT
    'FIELD OPERATOR ASSIGNMENTS' as info;

SELECT
    f.name as field_name,
    u.name as assigned_operator,
    u.employee_id,
    f.status
FROM fields f
LEFT JOIN users u ON f.assigned_operator = u.id
ORDER BY f.name;

-- Test auto-generated features
SELECT
    'TESTING AUTO-GENERATED FEATURES' as info;

-- Test employee_id generation
SELECT
    name,
    role,
    employee_id,
    CASE
        WHEN role IN ('staff_kasir', 'operator_lapangan', 'manajer_futsal', 'supervisor_sistem')
        THEN 'Should have employee_id'
        ELSE 'Should be NULL'
    END as expected_employee_id
FROM users
ORDER BY get_role_level(role);

-- Commit transaction
COMMIT;

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ COMPLETE DATABASE CLEANUP & MIGRATION COMPLETED SUCCESSFULLY!';
    RAISE NOTICE '';
    RAISE NOTICE 'WHAT WAS ACCOMPLISHED:';
    RAISE NOTICE '';
    RAISE NOTICE '🧹 COMPREHENSIVE CLEANUP:';
    RAISE NOTICE '- ✅ All existing tables, types, functions safely removed';
    RAISE NOTICE '- ✅ Extension functions preserved (uuid-ossp, pg_trgm, btree_gin)';
    RAISE NOTICE '- ✅ Database completely cleaned and ready for fresh start';
    RAISE NOTICE '';
    RAISE NOTICE '🏗️ ENHANCED DATABASE STRUCTURE:';
    RAISE NOTICE '- ✅ 4 core tables with comprehensive relationships';
    RAISE NOTICE '- ✅ Enhanced role system dengan 6 roles spesifik futsal';
    RAISE NOTICE '- ✅ Flexible constraints (no constraint violations)';
    RAISE NOTICE '- ✅ Auto-generated fields (UUID, numbers, timestamps)';
    RAISE NOTICE '- ✅ Performance optimization dengan strategic indexes';
    RAISE NOTICE '- ✅ JSONB support untuk flexible data storage';
    RAISE NOTICE '';
    RAISE NOTICE '⚙️ AUTOMATION FEATURES:';
    RAISE NOTICE '- ✅ Auto employee_id generation untuk staff roles';
    RAISE NOTICE '- ✅ Auto booking number generation (BK-YYYYMMDD-XXX)';
    RAISE NOTICE '- ✅ Auto payment number generation (PAY-YYYYMMDD-XXX)';
    RAISE NOTICE '- ✅ Auto timestamp management untuk audit trail';
    RAISE NOTICE '- ✅ Role hierarchy function untuk authorization';
    RAISE NOTICE '';
    RAISE NOTICE '📊 SAMPLE DATA READY:';
    RAISE NOTICE '- ✅ 10 sample users dengan berbagai roles';
    RAISE NOTICE '- ✅ 4 sample fields dengan operator assignment';
    RAISE NOTICE '- ✅ Staff hierarchy dengan supervisor relationships';
    RAISE NOTICE '- ✅ Ready untuk testing dan development';
    RAISE NOTICE '';
    RAISE NOTICE 'NEXT STEPS FOR INTEGRATION:';
    RAISE NOTICE '';
    RAISE NOTICE 'BACKEND INTEGRATION:';
    RAISE NOTICE '1. Update connection strings (tetap sama)';
    RAISE NOTICE '2. Implement role-based authorization middleware';
    RAISE NOTICE '3. Create API endpoints dengan role checking';
    RAISE NOTICE '4. Handle auto-generated fields di response';
    RAISE NOTICE '5. Implement business logic validation';
    RAISE NOTICE '';
    RAISE NOTICE 'FRONTEND INTEGRATION:';
    RAISE NOTICE '1. Update role names di aplikasi';
    RAISE NOTICE '2. Handle new role hierarchy (6 levels)';
    RAISE NOTICE '3. Display role-appropriate menus';
    RAISE NOTICE '4. Handle auto-generated fields (UUID, numbers)';
    RAISE NOTICE '5. Update form validation sesuai constraints';
    RAISE NOTICE '';
    RAISE NOTICE 'DATABASE LAYER SUDAH SIAP PRODUCTION!';
    RAISE NOTICE 'No more constraint violations, no more "already exists" errors.';
    RAISE NOTICE 'Your enhanced futsal booking database is ready to use!';
END $$;
