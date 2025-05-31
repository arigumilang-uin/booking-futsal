-- =====================================================
-- MIGRATION SCRIPT: ENHANCED ROLE SYSTEM (FIXED)
-- Migrasi dari struktur database existing ke enhanced role system
--
-- PERINGATAN: Script ini akan menghapus semua data existing!
-- Pastikan sudah melakukan backup sebelum menjalankan script ini.
--
-- CARA PENGGUNAAN:
-- 1. ROLLBACK transaction yang error: ROLLBACK;
-- 2. Copy-paste script ini ke pgAdmin4 Query Tool
-- 3. Execute script (F5)
-- 4. Verifikasi hasil migration
-- =====================================================

-- =====================================================
-- SECTION 1: SAFETY CHECKS & PREPARATION
-- =====================================================

-- Enable error handling dan transaction
\set ON_ERROR_STOP on
BEGIN;

-- Tampilkan informasi database
SELECT
    current_database() as database_name,
    current_user as current_user,
    version() as postgresql_version,
    NOW() as migration_start_time;

DO $$
BEGIN
    RAISE NOTICE '=== MIGRATION TO ENHANCED ROLE SYSTEM (FIXED) ===';
    RAISE NOTICE 'Migration started at: %', NOW();
    RAISE NOTICE 'Database: %', current_database();
    RAISE NOTICE 'User: %', current_user;
    RAISE NOTICE '==========================================';
END $$;

-- =====================================================
-- SECTION 2: BACKUP EXISTING DATA
-- =====================================================

-- Create temporary backup tables untuk preserve data existing
DO $$
BEGIN
    RAISE NOTICE 'Creating backup tables for existing data...';
END $$;

-- Backup existing users (jika tabel backup_users sudah ada, skip)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'backup_users') THEN
        CREATE TABLE backup_users AS SELECT * FROM users WHERE 1=1;
        RAISE NOTICE 'Created backup_users table';
    ELSE
        RAISE NOTICE 'backup_users table already exists, skipping...';
    END IF;
EXCEPTION
    WHEN undefined_table THEN
        RAISE NOTICE 'users table does not exist, creating empty backup_users';
        CREATE TABLE backup_users (
            id INTEGER,
            name VARCHAR(255),
            email VARCHAR(255),
            password VARCHAR(255),
            role VARCHAR(50),
            created_at TIMESTAMP
        );
END $$;

-- Backup existing fields
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'backup_fields') THEN
        CREATE TABLE backup_fields AS SELECT * FROM fields WHERE 1=1;
        RAISE NOTICE 'Created backup_fields table';
    ELSE
        RAISE NOTICE 'backup_fields table already exists, skipping...';
    END IF;
EXCEPTION
    WHEN undefined_table THEN
        RAISE NOTICE 'fields table does not exist, creating empty backup_fields';
        CREATE TABLE backup_fields (
            id INTEGER,
            name VARCHAR(255),
            type VARCHAR(100),
            price DECIMAL(10,2),
            image_url TEXT,
            status VARCHAR(20),
            created_at TIMESTAMP
        );
END $$;

-- Backup existing bookings
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'backup_bookings') THEN
        CREATE TABLE backup_bookings AS SELECT * FROM bookings WHERE 1=1;
        RAISE NOTICE 'Created backup_bookings table';
    ELSE
        RAISE NOTICE 'backup_bookings table already exists, skipping...';
    END IF;
EXCEPTION
    WHEN undefined_table THEN
        RAISE NOTICE 'bookings table does not exist, creating empty backup_bookings';
        CREATE TABLE backup_bookings (
            id INTEGER,
            user_id INTEGER,
            field_id INTEGER,
            date DATE,
            start_time TIME,
            end_time TIME,
            name VARCHAR(255),
            phone VARCHAR(20),
            status VARCHAR(20),
            created_at TIMESTAMP
        );
END $$;

-- Backup existing payments
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'backup_payments') THEN
        CREATE TABLE backup_payments AS SELECT * FROM payments WHERE 1=1;
        RAISE NOTICE 'Created backup_payments table';
    ELSE
        RAISE NOTICE 'backup_payments table already exists, skipping...';
    END IF;
EXCEPTION
    WHEN undefined_table THEN
        RAISE NOTICE 'payments table does not exist, creating empty backup_payments';
        CREATE TABLE backup_payments (
            id INTEGER,
            booking_id INTEGER,
            amount DECIMAL(10,2),
            method VARCHAR(50),
            status VARCHAR(20),
            paid_at TIMESTAMP,
            created_at TIMESTAMP
        );
END $$;

-- Verify backup
DO $$
DECLARE
    users_count INTEGER;
    fields_count INTEGER;
    bookings_count INTEGER;
    payments_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO users_count FROM backup_users;
    SELECT COUNT(*) INTO fields_count FROM backup_fields;
    SELECT COUNT(*) INTO bookings_count FROM backup_bookings;
    SELECT COUNT(*) INTO payments_count FROM backup_payments;

    RAISE NOTICE 'Backup completed:';
    RAISE NOTICE '- Users: % records', users_count;
    RAISE NOTICE '- Fields: % records', fields_count;
    RAISE NOTICE '- Bookings: % records', bookings_count;
    RAISE NOTICE '- Payments: % records', payments_count;
END $$;

-- =====================================================
-- SECTION 3: SAFE CLEANUP OF EXISTING STRUCTURE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE 'Starting safe cleanup of existing structure...';
END $$;

-- Drop existing views
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT viewname FROM pg_views WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP VIEW IF EXISTS ' || quote_ident(r.viewname) || ' CASCADE';
        RAISE NOTICE 'Dropped view: %', r.viewname;
    END LOOP;
END $$;

-- Drop existing functions and triggers (exclude extension functions)
DO $$
DECLARE
    r RECORD;
BEGIN
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

-- Drop existing tables (preserve backup tables)
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS fields CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop existing sequences
DROP SEQUENCE IF EXISTS users_id_seq CASCADE;
DROP SEQUENCE IF EXISTS fields_id_seq CASCADE;
DROP SEQUENCE IF EXISTS bookings_id_seq CASCADE;
DROP SEQUENCE IF EXISTS payments_id_seq CASCADE;

-- Drop existing custom types
DROP TYPE IF EXISTS booking_status CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

DO $$
BEGIN
    RAISE NOTICE 'Existing structure cleanup completed';
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

COMMENT ON TYPE user_role IS 'Enhanced role system for futsal booking business context';

-- Create enhanced booking status enum
CREATE TYPE booking_status AS ENUM (
    'pending',
    'confirmed',
    'cancelled',
    'completed',
    'no_show'
);

-- Create enhanced payment status enum
CREATE TYPE payment_status AS ENUM (
    'pending',
    'paid',
    'failed',
    'cancelled',
    'refunded',
    'expired'
);

DO $$
BEGIN
    RAISE NOTICE 'Enhanced enums created successfully';
END $$;