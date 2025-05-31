-- =====================================================
-- MIGRATION 001: Enhance Existing Tables
-- Add missing columns to existing tables
-- =====================================================

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. ENHANCE USERS TABLE
-- =====================================================
DO $$ 
BEGIN
    -- Add UUID column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'uuid') THEN
        ALTER TABLE users ADD COLUMN uuid UUID DEFAULT uuid_generate_v4() UNIQUE;
    END IF;
    
    -- Add phone column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'phone') THEN
        ALTER TABLE users ADD COLUMN phone VARCHAR(20);
    END IF;
    
    -- Add avatar_url column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'avatar_url') THEN
        ALTER TABLE users ADD COLUMN avatar_url TEXT;
    END IF;
    
    -- Add verification columns if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'email_verified_at') THEN
        ALTER TABLE users ADD COLUMN email_verified_at TIMESTAMP NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'phone_verified_at') THEN
        ALTER TABLE users ADD COLUMN phone_verified_at TIMESTAMP NULL;
    END IF;
    
    -- Add activity tracking columns if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_active') THEN
        ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'last_login_at') THEN
        ALTER TABLE users ADD COLUMN last_login_at TIMESTAMP NULL;
    END IF;
    
    -- Add timestamps if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'created_at') THEN
        ALTER TABLE users ADD COLUMN created_at TIMESTAMP DEFAULT NOW();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'updated_at') THEN
        ALTER TABLE users ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();
    END IF;
END $$;

-- =====================================================
-- 2. ENHANCE FIELDS TABLE
-- =====================================================
DO $$ 
BEGIN
    -- Add UUID column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fields' AND column_name = 'uuid') THEN
        ALTER TABLE fields ADD COLUMN uuid UUID DEFAULT uuid_generate_v4() UNIQUE;
    END IF;
    
    -- Add description column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fields' AND column_name = 'description') THEN
        ALTER TABLE fields ADD COLUMN description TEXT DEFAULT '';
    END IF;
    
    -- Add facilities column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fields' AND column_name = 'facilities') THEN
        ALTER TABLE fields ADD COLUMN facilities JSONB DEFAULT '[]';
    END IF;
    
    -- Add capacity column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fields' AND column_name = 'capacity') THEN
        ALTER TABLE fields ADD COLUMN capacity INTEGER DEFAULT 22;
    END IF;
    
    -- Add location column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fields' AND column_name = 'location') THEN
        ALTER TABLE fields ADD COLUMN location TEXT DEFAULT '';
    END IF;
    
    -- Add address column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fields' AND column_name = 'address') THEN
        ALTER TABLE fields ADD COLUMN address TEXT;
    END IF;
    
    -- Add coordinates column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fields' AND column_name = 'coordinates') THEN
        ALTER TABLE fields ADD COLUMN coordinates JSONB;
    END IF;
    
    -- Add operating_hours column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fields' AND column_name = 'operating_hours') THEN
        ALTER TABLE fields ADD COLUMN operating_hours JSONB DEFAULT '{"start": "09:00", "end": "24:00"}';
    END IF;
    
    -- Add operating_days column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fields' AND column_name = 'operating_days') THEN
        ALTER TABLE fields ADD COLUMN operating_days JSONB DEFAULT '["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]';
    END IF;
    
    -- Add pricing columns if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fields' AND column_name = 'price_weekend') THEN
        ALTER TABLE fields ADD COLUMN price_weekend DECIMAL(10,2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fields' AND column_name = 'price_peak_hours') THEN
        ALTER TABLE fields ADD COLUMN price_peak_hours JSONB;
    END IF;
    
    -- Add gallery column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fields' AND column_name = 'gallery') THEN
        ALTER TABLE fields ADD COLUMN gallery JSONB DEFAULT '[]';
    END IF;
    
    -- Add rating columns if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fields' AND column_name = 'rating') THEN
        ALTER TABLE fields ADD COLUMN rating DECIMAL(3,2) DEFAULT 0.00;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fields' AND column_name = 'total_reviews') THEN
        ALTER TABLE fields ADD COLUMN total_reviews INTEGER DEFAULT 0;
    END IF;
    
    -- Add timestamps if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fields' AND column_name = 'created_at') THEN
        ALTER TABLE fields ADD COLUMN created_at TIMESTAMP DEFAULT NOW();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fields' AND column_name = 'updated_at') THEN
        ALTER TABLE fields ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();
    END IF;
END $$;

-- =====================================================
-- 3. ENHANCE BOOKINGS TABLE
-- =====================================================
DO $$ 
BEGIN
    -- Add UUID column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'uuid') THEN
        ALTER TABLE bookings ADD COLUMN uuid UUID DEFAULT uuid_generate_v4() UNIQUE;
    END IF;
    
    -- Add booking_number column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'booking_number') THEN
        ALTER TABLE bookings ADD COLUMN booking_number VARCHAR(50) UNIQUE;
    END IF;
    
    -- Add email column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'email') THEN
        ALTER TABLE bookings ADD COLUMN email VARCHAR(255);
    END IF;
    
    -- Add notes column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'notes') THEN
        ALTER TABLE bookings ADD COLUMN notes TEXT;
    END IF;
    
    -- Add total_amount column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'total_amount') THEN
        ALTER TABLE bookings ADD COLUMN total_amount DECIMAL(10,2) DEFAULT 0;
    END IF;
    
    -- Add payment_status column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'payment_status') THEN
        ALTER TABLE bookings ADD COLUMN payment_status VARCHAR(20) DEFAULT 'unpaid';
    END IF;
    
    -- Add cancellation tracking columns if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'cancellation_reason') THEN
        ALTER TABLE bookings ADD COLUMN cancellation_reason TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'cancelled_at') THEN
        ALTER TABLE bookings ADD COLUMN cancelled_at TIMESTAMP NULL;
    END IF;
    
    -- Add status tracking columns if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'confirmed_at') THEN
        ALTER TABLE bookings ADD COLUMN confirmed_at TIMESTAMP NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'completed_at') THEN
        ALTER TABLE bookings ADD COLUMN completed_at TIMESTAMP NULL;
    END IF;
    
    -- Add reminder tracking column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'reminder_sent') THEN
        ALTER TABLE bookings ADD COLUMN reminder_sent BOOLEAN DEFAULT false;
    END IF;
    
    -- Add timestamps if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'created_at') THEN
        ALTER TABLE bookings ADD COLUMN created_at TIMESTAMP DEFAULT NOW();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'updated_at') THEN
        ALTER TABLE bookings ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();
    END IF;
END $$;

-- =====================================================
-- 4. ENHANCE PAYMENTS TABLE
-- =====================================================
DO $$ 
BEGIN
    -- Add UUID column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'uuid') THEN
        ALTER TABLE payments ADD COLUMN uuid UUID DEFAULT uuid_generate_v4() UNIQUE;
    END IF;
    
    -- Add payment_number column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'payment_number') THEN
        ALTER TABLE payments ADD COLUMN payment_number VARCHAR(50) UNIQUE;
    END IF;
    
    -- Add provider column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'provider') THEN
        ALTER TABLE payments ADD COLUMN provider VARCHAR(50);
    END IF;
    
    -- Add admin_fee column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'admin_fee') THEN
        ALTER TABLE payments ADD COLUMN admin_fee DECIMAL(10,2) DEFAULT 0;
    END IF;
    
    -- Add external_id column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'external_id') THEN
        ALTER TABLE payments ADD COLUMN external_id VARCHAR(255);
    END IF;
    
    -- Add payment_url column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'payment_url') THEN
        ALTER TABLE payments ADD COLUMN payment_url TEXT;
    END IF;
    
    -- Add expires_at column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'expires_at') THEN
        ALTER TABLE payments ADD COLUMN expires_at TIMESTAMP;
    END IF;
    
    -- Add status tracking columns if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'failed_at') THEN
        ALTER TABLE payments ADD COLUMN failed_at TIMESTAMP NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'refunded_at') THEN
        ALTER TABLE payments ADD COLUMN refunded_at TIMESTAMP NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'refund_amount') THEN
        ALTER TABLE payments ADD COLUMN refund_amount DECIMAL(10,2) DEFAULT 0;
    END IF;
    
    -- Add gateway_response column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'gateway_response') THEN
        ALTER TABLE payments ADD COLUMN gateway_response JSONB;
    END IF;
    
    -- Add notes column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'notes') THEN
        ALTER TABLE payments ADD COLUMN notes TEXT;
    END IF;
    
    -- Add timestamps if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'created_at') THEN
        ALTER TABLE payments ADD COLUMN created_at TIMESTAMP DEFAULT NOW();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'updated_at') THEN
        ALTER TABLE payments ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();
    END IF;
END $$;

-- =====================================================
-- 5. UPDATE EXISTING DATA
-- =====================================================

-- Generate UUIDs for existing records
UPDATE users SET uuid = uuid_generate_v4() WHERE uuid IS NULL;
UPDATE fields SET uuid = uuid_generate_v4() WHERE uuid IS NULL;
UPDATE bookings SET uuid = uuid_generate_v4() WHERE uuid IS NULL;
UPDATE payments SET uuid = uuid_generate_v4() WHERE uuid IS NULL;

-- Generate booking numbers for existing bookings
UPDATE bookings 
SET booking_number = 'BK-' || TO_CHAR(COALESCE(created_at, NOW()), 'YYYYMMDD') || '-' || LPAD(id::text, 3, '0')
WHERE booking_number IS NULL;

-- Generate payment numbers for existing payments
UPDATE payments 
SET payment_number = 'PAY-' || TO_CHAR(COALESCE(created_at, NOW()), 'YYYYMMDD') || '-' || LPAD(id::text, 3, '0')
WHERE payment_number IS NULL;

-- Update total_amount in bookings based on field price and duration
UPDATE bookings 
SET total_amount = (
    SELECT f.price * EXTRACT(EPOCH FROM (bookings.end_time - bookings.start_time)) / 3600
    FROM fields f 
    WHERE f.id = bookings.field_id
)
WHERE total_amount = 0 OR total_amount IS NULL;
