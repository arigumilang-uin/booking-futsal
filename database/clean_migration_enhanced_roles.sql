-- =====================================================
-- CLEAN MIGRATION SCRIPT: ENHANCED ROLE SYSTEM
-- Script migration bersih untuk database kosong
--
-- PEMBAGIAN TANGGUNG JAWAB:
-- - DATABASE: Constraints, triggers, auto-numbering, data integrity, business rules
-- - BACKEND: Business logic, validation, API endpoints, authentication, authorization
-- - FRONTEND: UI/UX, form validation, user interaction
--
-- FITUR DATABASE LAYER:
-- - Enhanced role system dengan 6 roles spesifik futsal
-- - Auto-generated UUID, timestamps, booking/payment numbers
-- - Proper constraints untuk data integrity
-- - Essential triggers untuk audit trail
-- - Performance indexes untuk query optimization
-- - Role-based structure untuk backend authorization
-- =====================================================

-- =====================================================
-- SECTION 1: PREPARATION & SAFETY
-- =====================================================

-- Enable error handling
\set ON_ERROR_STOP on

-- Start transaction
BEGIN;

-- Tampilkan informasi database
SELECT
    current_database() as database_name,
    current_user as current_user,
    version() as postgresql_version,
    NOW() as migration_start_time;

DO $$
BEGIN
    RAISE NOTICE '=== CLEAN MIGRATION: ENHANCED ROLE SYSTEM ===';
    RAISE NOTICE 'Migration started at: %', NOW();
    RAISE NOTICE 'Database: %', current_database();
    RAISE NOTICE 'Target: Clean database with enhanced role system';
    RAISE NOTICE '=============================================';
END $$;

-- =====================================================
-- SECTION 2: ENABLE EXTENSIONS
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
-- SECTION 3: CREATE ENHANCED ENUM TYPES
-- =====================================================

-- Enhanced user role enum untuk konteks bisnis futsal
CREATE TYPE user_role AS ENUM (
    'pengunjung',           -- Guest/visitor (read-only access)
    'penyewa',             -- Customer/renter (can book fields)
    'staff_kasir',         -- Cashier staff (handle payments)
    'operator_lapangan',   -- Field operator (manage daily operations)
    'manajer_futsal',      -- Futsal manager (middle management)
    'supervisor_sistem'    -- System supervisor (super admin)
);

COMMENT ON TYPE user_role IS 'Enhanced role system untuk konteks bisnis futsal dengan hierarchy yang jelas';

-- Enhanced booking status enum
CREATE TYPE booking_status AS ENUM (
    'pending',      -- Menunggu konfirmasi
    'confirmed',    -- Dikonfirmasi staff
    'cancelled',    -- Dibatalkan
    'completed',    -- Selesai dimainkan
    'no_show'       -- Tidak datang
);

COMMENT ON TYPE booking_status IS 'Status booking dengan lifecycle yang jelas';

-- Enhanced payment status enum
CREATE TYPE payment_status AS ENUM (
    'pending',      -- Menunggu pembayaran
    'paid',         -- Sudah dibayar
    'failed',       -- Pembayaran gagal
    'cancelled',    -- Pembayaran dibatalkan
    'refunded',     -- Sudah direfund
    'expired'       -- Expired/timeout
);

COMMENT ON TYPE payment_status IS 'Status pembayaran dengan gateway integration support';

DO $$
BEGIN
    RAISE NOTICE 'Enhanced enum types created successfully';
END $$;

-- =====================================================
-- SECTION 4: CREATE ENHANCED USERS TABLE
-- =====================================================

-- Tabel users dengan enhanced role system dan flexible constraints
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
    employee_id VARCHAR(50), -- Untuk staff roles (auto-generated jika NULL)
    department VARCHAR(100), -- Untuk staff roles
    hire_date DATE,         -- Untuk staff roles
    salary DECIMAL(10,2),   -- Untuk staff roles (encrypted di aplikasi)
    supervisor_id INTEGER REFERENCES users(id), -- Untuk staff hierarchy

    -- Verification dan status
    email_verified_at TIMESTAMP NULL,
    phone_verified_at TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false, -- Untuk staff verification
    last_login_at TIMESTAMP NULL,

    -- Audit fields (DATABASE RESPONSIBILITY)
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by INTEGER REFERENCES users(id),
    updated_by INTEGER REFERENCES users(id),

    -- FLEXIBLE CONSTRAINTS - tidak memaksa employee_id untuk staff
    -- Backend akan handle business logic untuk staff management
    CONSTRAINT check_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT check_phone_format CHECK (phone IS NULL OR phone ~* '^\+?[0-9\-\s\(\)]{8,20}$')
);

-- Indexes untuk performance (DATABASE RESPONSIBILITY)
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_uuid ON users(uuid);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_employee_id ON users(employee_id) WHERE employee_id IS NOT NULL;
CREATE INDEX idx_users_supervisor_id ON users(supervisor_id) WHERE supervisor_id IS NOT NULL;
CREATE INDEX idx_users_role_active ON users(role, is_active);
CREATE INDEX idx_users_role_verified ON users(role, is_verified) WHERE role != 'pengunjung';

COMMENT ON TABLE users IS 'Enhanced users table dengan role system yang fleksibel untuk futsal business';
COMMENT ON COLUMN users.role IS 'Role hierarchy: pengunjung(1) < penyewa(2) < staff_kasir(3) < operator_lapangan(4) < manajer_futsal(5) < supervisor_sistem(6)';
COMMENT ON COLUMN users.employee_id IS 'Auto-generated untuk staff roles, dapat NULL untuk backward compatibility';

DO $$
BEGIN
    RAISE NOTICE 'Enhanced users table created with flexible constraints';
END $$;

-- =====================================================
-- SECTION 5: CREATE ENHANCED FIELDS TABLE
-- =====================================================

-- Tabel fields dengan enhanced features untuk futsal business
CREATE TABLE fields (
    -- Primary identifiers
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,

    -- Basic field information
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL DEFAULT 'futsal',
    description TEXT DEFAULT '',

    -- Enhanced field features (DATABASE RESPONSIBILITY)
    facilities JSONB DEFAULT '[]', -- ["parking", "toilet", "canteen", "shower", "wifi", "ac"]
    capacity INTEGER DEFAULT 22 CHECK (capacity > 0),
    location TEXT DEFAULT '',
    address TEXT,
    coordinates JSONB, -- {"lat": -6.2088, "lng": 106.8456}

    -- Enhanced pricing system
    price DECIMAL(10,2) NOT NULL CHECK (price > 0),
    price_weekend DECIMAL(10,2) CHECK (price_weekend IS NULL OR price_weekend > 0),
    price_peak_hours JSONB, -- {"17:00-21:00": 150000, "21:00-24:00": 120000}
    price_member DECIMAL(10,2) CHECK (price_member IS NULL OR price_member > 0),

    -- Operating configuration (DATABASE RESPONSIBILITY)
    operating_hours JSONB DEFAULT '{"start": "09:00", "end": "24:00"}',
    operating_days JSONB DEFAULT '["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]',

    -- Media dan presentation
    image_url TEXT,
    gallery JSONB DEFAULT '[]', -- Array of image URLs

    -- Status dan ratings (DATABASE RESPONSIBILITY)
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
    rating DECIMAL(3,2) DEFAULT 0.00 CHECK (rating >= 0 AND rating <= 5),
    total_reviews INTEGER DEFAULT 0 CHECK (total_reviews >= 0),

    -- Management fields untuk operational
    assigned_operator INTEGER REFERENCES users(id), -- Operator yang bertanggung jawab
    maintenance_schedule JSONB DEFAULT '[]', -- Jadwal maintenance

    -- Audit fields (DATABASE RESPONSIBILITY)
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by INTEGER REFERENCES users(id),
    updated_by INTEGER REFERENCES users(id)
);

-- Indexes untuk performance (DATABASE RESPONSIBILITY)
CREATE INDEX idx_fields_uuid ON fields(uuid);
CREATE INDEX idx_fields_status ON fields(status);
CREATE INDEX idx_fields_type ON fields(type);
CREATE INDEX idx_fields_assigned_operator ON fields(assigned_operator) WHERE assigned_operator IS NOT NULL;
CREATE INDEX idx_fields_status_type ON fields(status, type);
CREATE INDEX idx_fields_facilities ON fields USING GIN(facilities);
CREATE INDEX idx_fields_coordinates ON fields USING GIN(coordinates) WHERE coordinates IS NOT NULL;
CREATE INDEX idx_fields_search ON fields USING GIN(to_tsvector('english', name || ' ' || COALESCE(description, '')));
CREATE INDEX idx_fields_price_range ON fields(price, price_weekend);

COMMENT ON TABLE fields IS 'Enhanced fields table dengan features lengkap untuk futsal business management';
COMMENT ON COLUMN fields.facilities IS 'JSONB array fasilitas: ["parking", "toilet", "canteen", "shower", "wifi", "ac", "sound_system", "tribun"]';
COMMENT ON COLUMN fields.coordinates IS 'JSONB coordinates: {"lat": latitude, "lng": longitude}';
COMMENT ON COLUMN fields.price_peak_hours IS 'JSONB pricing per jam: {"17:00-21:00": 150000}';

DO $$
BEGIN
    RAISE NOTICE 'Enhanced fields table created with comprehensive features';
END $$;

-- =====================================================
-- SECTION 6: CREATE ENHANCED BOOKINGS TABLE
-- =====================================================

-- Tabel bookings dengan enhanced features dan role-based tracking
CREATE TABLE bookings (
    -- Primary identifiers
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    booking_number VARCHAR(50) UNIQUE NOT NULL, -- Auto-generated: BK-YYYYMMDD-XXX

    -- Foreign keys
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    field_id INTEGER REFERENCES fields(id) ON DELETE CASCADE,

    -- Booking details (DATABASE RESPONSIBILITY)
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

    -- Pricing dan payment (DATABASE RESPONSIBILITY)
    base_amount DECIMAL(10,2) NOT NULL CHECK (base_amount > 0),
    discount_amount DECIMAL(10,2) DEFAULT 0 CHECK (discount_amount >= 0),
    admin_fee DECIMAL(10,2) DEFAULT 0 CHECK (admin_fee >= 0),
    total_amount DECIMAL(10,2) GENERATED ALWAYS AS (
        base_amount - discount_amount + admin_fee
    ) STORED,

    -- Status management dengan role-based updates
    status booking_status DEFAULT 'pending' NOT NULL,
    payment_status payment_status DEFAULT 'pending' NOT NULL,

    -- Role-based tracking (DATABASE RESPONSIBILITY)
    confirmed_by INTEGER REFERENCES users(id), -- Staff yang konfirmasi
    cancelled_by INTEGER REFERENCES users(id), -- Yang membatalkan
    completed_by INTEGER REFERENCES users(id), -- Staff yang menyelesaikan

    -- Timestamps untuk lifecycle tracking
    cancellation_reason TEXT,
    cancelled_at TIMESTAMP NULL,
    confirmed_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    reminder_sent BOOLEAN DEFAULT false,

    -- Audit fields (DATABASE RESPONSIBILITY)
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by INTEGER REFERENCES users(id),
    updated_by INTEGER REFERENCES users(id),

    -- Business constraints (DATABASE RESPONSIBILITY)
    CONSTRAINT check_booking_time CHECK (start_time < end_time),
    CONSTRAINT check_booking_date CHECK (date >= CURRENT_DATE - INTERVAL '1 day'),
    CONSTRAINT check_amounts CHECK (base_amount > 0 AND discount_amount >= 0 AND admin_fee >= 0),
    CONSTRAINT check_phone_format CHECK (phone ~* '^\+?[0-9\-\s\(\)]{8,20}$')
);

-- Indexes untuk performance dan conflict detection (DATABASE RESPONSIBILITY)
CREATE INDEX idx_bookings_uuid ON bookings(uuid);
CREATE INDEX idx_bookings_booking_number ON bookings(booking_number);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_field_id ON bookings(field_id);
CREATE INDEX idx_bookings_date ON bookings(date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX idx_bookings_user_date ON bookings(user_id, date DESC);
CREATE INDEX idx_bookings_field_date_time ON bookings(field_id, date, start_time);
CREATE INDEX idx_bookings_status_date ON bookings(status, date);

-- Critical index untuk conflict detection (DATABASE RESPONSIBILITY)
CREATE INDEX idx_bookings_conflict_check ON bookings(field_id, date, start_time, end_time)
WHERE status IN ('pending', 'confirmed');

-- Role-based tracking indexes
CREATE INDEX idx_bookings_confirmed_by ON bookings(confirmed_by) WHERE confirmed_by IS NOT NULL;
CREATE INDEX idx_bookings_cancelled_by ON bookings(cancelled_by) WHERE cancelled_by IS NOT NULL;
CREATE INDEX idx_bookings_completed_by ON bookings(completed_by) WHERE completed_by IS NOT NULL;

COMMENT ON TABLE bookings IS 'Enhanced bookings table dengan role-based tracking dan comprehensive business logic';
COMMENT ON COLUMN bookings.booking_number IS 'Auto-generated format: BK-YYYYMMDD-XXX';
COMMENT ON COLUMN bookings.duration_hours IS 'Auto-calculated dari start_time dan end_time';
COMMENT ON COLUMN bookings.total_amount IS 'Auto-calculated: base_amount - discount_amount + admin_fee';

DO $$
BEGIN
    RAISE NOTICE 'Enhanced bookings table created with role-based tracking';
END $$;

-- =====================================================
-- SECTION 7: CREATE ENHANCED PAYMENTS TABLE
-- =====================================================

-- Tabel payments dengan gateway integration dan role-based processing
CREATE TABLE payments (
    -- Primary identifiers
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    payment_number VARCHAR(50) UNIQUE NOT NULL, -- Auto-generated: PAY-YYYYMMDD-XXX

    -- Foreign keys
    booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,

    -- Payment details (DATABASE RESPONSIBILITY)
    method VARCHAR(50) NOT NULL, -- manual, ewallet, transfer, credit_card
    provider VARCHAR(50), -- midtrans, xendit, manual, etc
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    admin_fee DECIMAL(10,2) DEFAULT 0 CHECK (admin_fee >= 0),
    total_amount DECIMAL(10,2) GENERATED ALWAYS AS (amount + admin_fee) STORED,

    -- Status dan gateway integration
    status payment_status DEFAULT 'pending' NOT NULL,
    external_id VARCHAR(255), -- ID dari payment gateway
    payment_url TEXT, -- URL untuk pembayaran
    expires_at TIMESTAMP, -- Waktu expired pembayaran

    -- Role-based processing (DATABASE RESPONSIBILITY)
    processed_by INTEGER REFERENCES users(id), -- Staff yang memproses
    verified_by INTEGER REFERENCES users(id),  -- Staff yang verifikasi

    -- Timestamps untuk lifecycle tracking
    paid_at TIMESTAMP NULL,
    failed_at TIMESTAMP NULL,
    refunded_at TIMESTAMP NULL,
    refund_amount DECIMAL(10,2) DEFAULT 0 CHECK (refund_amount >= 0),

    -- Gateway response dan audit
    gateway_response JSONB, -- Response dari payment gateway
    notes TEXT, -- Catatan staff

    -- Audit fields (DATABASE RESPONSIBILITY)
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by INTEGER REFERENCES users(id),
    updated_by INTEGER REFERENCES users(id),

    -- Business constraints (DATABASE RESPONSIBILITY)
    CONSTRAINT check_refund_amount CHECK (refund_amount <= amount)
);

-- Indexes untuk performance (DATABASE RESPONSIBILITY)
CREATE INDEX idx_payments_uuid ON payments(uuid);
CREATE INDEX idx_payments_payment_number ON payments(payment_number);
CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_method ON payments(method);
CREATE INDEX idx_payments_provider ON payments(provider) WHERE provider IS NOT NULL;
CREATE INDEX idx_payments_external_id ON payments(external_id) WHERE external_id IS NOT NULL;
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);
CREATE INDEX idx_payments_expires_at ON payments(expires_at) WHERE expires_at IS NOT NULL;

-- Role-based processing indexes
CREATE INDEX idx_payments_processed_by ON payments(processed_by) WHERE processed_by IS NOT NULL;
CREATE INDEX idx_payments_verified_by ON payments(verified_by) WHERE verified_by IS NOT NULL;

-- Gateway integration indexes
CREATE INDEX idx_payments_gateway_response ON payments USING GIN(gateway_response) WHERE gateway_response IS NOT NULL;

COMMENT ON TABLE payments IS 'Enhanced payments table dengan gateway integration dan role-based processing';
COMMENT ON COLUMN payments.payment_number IS 'Auto-generated format: PAY-YYYYMMDD-XXX';
COMMENT ON COLUMN payments.total_amount IS 'Auto-calculated: amount + admin_fee';
COMMENT ON COLUMN payments.gateway_response IS 'JSONB response dari payment gateway untuk debugging';

DO $$
BEGIN
    RAISE NOTICE 'Enhanced payments table created with gateway integration';
END $$;

-- =====================================================
-- SECTION 8: CREATE ESSENTIAL FUNCTIONS (DATABASE RESPONSIBILITY)
-- =====================================================

-- Function untuk auto-generate employee_id untuk staff roles
CREATE OR REPLACE FUNCTION generate_employee_id()
RETURNS TRIGGER AS $$
BEGIN
    -- Auto-generate employee_id untuk staff roles jika NULL
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

-- Function untuk update timestamps (DATABASE RESPONSIBILITY)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function untuk get role hierarchy level (DATABASE RESPONSIBILITY)
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

-- Function untuk conflict detection (DATABASE RESPONSIBILITY)
CREATE OR REPLACE FUNCTION check_booking_conflict(
    field_id_param INTEGER,
    date_param DATE,
    start_time_param TIME,
    end_time_param TIME,
    exclude_booking_id INTEGER DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    conflict_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO conflict_count
    FROM bookings
    WHERE field_id = field_id_param
      AND date = date_param
      AND status IN ('pending', 'confirmed')
      AND (exclude_booking_id IS NULL OR id != exclude_booking_id)
      AND (
        (start_time_param < end_time AND end_time_param > start_time)
      );

    RETURN conflict_count > 0;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
    RAISE NOTICE 'Essential functions created successfully';
END $$;

-- =====================================================
-- SECTION 9: CREATE TRIGGERS (DATABASE RESPONSIBILITY)
-- =====================================================

-- Trigger untuk auto-generate employee_id
CREATE TRIGGER trigger_generate_employee_id
    BEFORE INSERT OR UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION generate_employee_id();

-- Trigger untuk auto-generate booking number
CREATE TRIGGER trigger_generate_booking_number
    BEFORE INSERT ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION generate_booking_number();

-- Trigger untuk auto-generate payment number
CREATE TRIGGER trigger_generate_payment_number
    BEFORE INSERT ON payments
    FOR EACH ROW
    EXECUTE FUNCTION generate_payment_number();

-- Triggers untuk update timestamps (DATABASE RESPONSIBILITY)
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
    RAISE NOTICE 'Essential triggers created successfully';
END $$;

-- =====================================================
-- SECTION 10: INSERT SAMPLE DATA UNTUK TESTING
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE 'Inserting sample data for testing...';
END $$;

-- Sample Users dengan berbagai roles (passwords adalah hash dari 'password123')
INSERT INTO users (name, email, password, phone, role, department, hire_date, is_active, is_verified) VALUES

-- System Supervisor (Highest Level)
('Super Admin', 'superadmin@futsalapp.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '+6281234567890', 'supervisor_sistem', 'IT', '2024-01-01', true, true),

-- Futsal Manager (Middle Management)
('Manager Futsal', 'manager@futsalapp.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '+6281234567891', 'manajer_futsal', 'Operations', '2024-01-15', true, true),

-- Field Operators
('Operator Lapangan A', 'operator1@futsalapp.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '+6281234567892', 'operator_lapangan', 'Field Operations', '2024-02-01', true, true),
('Operator Lapangan B', 'operator2@futsalapp.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '+6281234567893', 'operator_lapangan', 'Field Operations', '2024-02-15', true, true),

-- Cashier Staff
('Kasir Pagi', 'kasir1@futsalapp.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '+6281234567894', 'staff_kasir', 'Finance', '2024-03-01', true, true),
('Kasir Sore', 'kasir2@futsalapp.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '+6281234567895', 'staff_kasir', 'Finance', '2024-03-15', true, true),

-- Regular Customers (Penyewa)
('John Doe', 'john@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '+6281234567896', 'penyewa', NULL, NULL, true, false),
('Jane Smith', 'jane@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '+6281234567897', 'penyewa', NULL, NULL, true, false),
('Bob Wilson', 'bob@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '+6281234567898', 'penyewa', NULL, NULL, true, false),
('Alice Johnson', 'alice@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '+6281234567899', 'penyewa', NULL, NULL, true, false);

-- Update supervisor relationships
UPDATE users SET supervisor_id = 1 WHERE role = 'manajer_futsal'; -- Manager reports to Super Admin
UPDATE users SET supervisor_id = 2 WHERE role IN ('operator_lapangan', 'staff_kasir'); -- Staff reports to Manager

-- Sample Fields dengan operator assignment
INSERT INTO fields (name, type, description, facilities, capacity, location, address, coordinates, price, price_weekend, price_member, assigned_operator, status, created_by) VALUES

-- Premium Fields
('Lapangan Futsal Premium A', 'futsal', 'Lapangan futsal premium dengan rumput sintetis berkualitas tinggi dan pencahayaan LED yang sempurna.',
 '["parking", "toilet", "canteen", "shower", "wifi", "ac", "sound_system", "tribun"]', 22, 'Jakarta Selatan',
 'Jl. Sudirman No. 123, Jakarta Selatan', '{"lat": -6.2088, "lng": 106.8456}', 120000.00, 150000.00, 100000.00, 3, 'active', 2),

('Lapangan Futsal Premium B', 'futsal', 'Lapangan futsal standar dengan fasilitas lengkap untuk pertandingan profesional.',
 '["parking", "toilet", "canteen", "shower", "wifi", "tribun"]', 22, 'Jakarta Pusat',
 'Jl. Thamrin No. 456, Jakarta Pusat', '{"lat": -6.1944, "lng": 106.8229}', 100000.00, 130000.00, 85000.00, 4, 'active', 2),

-- Standard Fields
('Lapangan Futsal Standard C', 'futsal', 'Lapangan futsal dengan fasilitas standar, cocok untuk bermain santai.',
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
-- SECTION 11: ANALYZE TABLES FOR PERFORMANCE
-- =====================================================

-- Update table statistics untuk optimal query performance (DATABASE RESPONSIBILITY)
ANALYZE users;
ANALYZE fields;
ANALYZE bookings;
ANALYZE payments;

DO $$
BEGIN
    RAISE NOTICE 'Table statistics updated for optimal performance';
END $$;

-- =====================================================
-- SECTION 12: FINAL VERIFICATION & SUMMARY
-- =====================================================

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
    AND proname NOT LIKE 'uuid_%'; -- Exclude extension functions

    SELECT COUNT(*) INTO trigger_count
    FROM information_schema.triggers
    WHERE trigger_schema = 'public';

    -- Count sample data
    SELECT COUNT(*) INTO user_count FROM users;
    SELECT COUNT(*) INTO field_count FROM fields;
    SELECT COUNT(*) INTO staff_count FROM users WHERE role IN ('staff_kasir', 'operator_lapangan', 'manajer_futsal', 'supervisor_sistem');
    SELECT COUNT(*) INTO customer_count FROM users WHERE role = 'penyewa';

    RAISE NOTICE '=== CLEAN MIGRATION ENHANCED ROLE SYSTEM COMPLETED ===';
    RAISE NOTICE 'Migration completed at: %', NOW();
    RAISE NOTICE '';
    RAISE NOTICE 'DATABASE STRUCTURE:';
    RAISE NOTICE '- Tables created: %', table_count;
    RAISE NOTICE '- Indexes created: %', index_count;
    RAISE NOTICE '- Functions created: %', function_count;
    RAISE NOTICE '- Triggers created: %', trigger_count;
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
    RAISE NOTICE 'DATABASE LAYER RESPONSIBILITIES:';
    RAISE NOTICE '- ✅ Auto-generated UUIDs, timestamps, numbers';
    RAISE NOTICE '- ✅ Data integrity dengan constraints';
    RAISE NOTICE '- ✅ Role-based tracking untuk audit';
    RAISE NOTICE '- ✅ Performance indexes untuk query optimization';
    RAISE NOTICE '- ✅ Essential business rules enforcement';
    RAISE NOTICE '- ✅ Conflict detection untuk booking';
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
    RAISE NOTICE '✅ CLEAN MIGRATION COMPLETED SUCCESSFULLY!';
    RAISE NOTICE '';
    RAISE NOTICE 'NEXT STEPS FOR INTEGRATION:';
    RAISE NOTICE '';
    RAISE NOTICE 'BACKEND RESPONSIBILITIES:';
    RAISE NOTICE '1. Implement role-based authorization middleware';
    RAISE NOTICE '2. Create API endpoints dengan role checking';
    RAISE NOTICE '3. Implement business logic validation';
    RAISE NOTICE '4. Handle authentication dan session management';
    RAISE NOTICE '5. Implement payment gateway integration';
    RAISE NOTICE '6. Create notification system';
    RAISE NOTICE '';
    RAISE NOTICE 'FRONTEND RESPONSIBILITIES:';
    RAISE NOTICE '1. Update UI untuk role-based features';
    RAISE NOTICE '2. Implement form validation';
    RAISE NOTICE '3. Handle user interaction dan UX';
    RAISE NOTICE '4. Display role-appropriate menus';
    RAISE NOTICE '5. Implement responsive design';
    RAISE NOTICE '';
    RAISE NOTICE 'DATABASE LAYER SUDAH SIAP:';
    RAISE NOTICE '- ✅ Enhanced role system dengan 6 roles';
    RAISE NOTICE '- ✅ Auto-generated fields (UUID, numbers, timestamps)';
    RAISE NOTICE '- ✅ Data integrity dengan proper constraints';
    RAISE NOTICE '- ✅ Performance optimization dengan indexes';
    RAISE NOTICE '- ✅ Essential business rules enforcement';
    RAISE NOTICE '- ✅ Role-based tracking untuk audit trail';
    RAISE NOTICE '- ✅ Conflict detection untuk booking management';
    RAISE NOTICE '- ✅ Sample data untuk testing';
    RAISE NOTICE '';
    RAISE NOTICE 'Your enhanced futsal booking database is ready for production!';
END $$;
