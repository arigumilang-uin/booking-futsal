-- =====================================================
-- BOOKING FUTSAL DATABASE SCHEMA
-- PostgreSQL Complete Database Structure
-- =====================================================

-- Enable UUID extension for unique identifiers
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. USERS TABLE - User Management
-- =====================================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'pengelola', 'admin')),
    avatar_url TEXT,
    email_verified_at TIMESTAMP NULL,
    phone_verified_at TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 2. FIELDS TABLE - Field Management (Enhanced)
-- =====================================================
CREATE TABLE fields (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL, -- 'futsal', 'mini_soccer', 'full_soccer'
    description TEXT DEFAULT '',
    facilities JSONB DEFAULT '[]', -- ['parking', 'toilet', 'canteen', 'shower', 'wifi']
    capacity INTEGER DEFAULT 22, -- max players
    location TEXT DEFAULT '',
    address TEXT,
    coordinates JSONB, -- {"lat": -6.2088, "lng": 106.8456}
    price DECIMAL(10,2) NOT NULL,
    price_weekend DECIMAL(10,2), -- weekend pricing
    price_peak_hours JSONB, -- {"17:00-21:00": 150000}
    operating_hours JSONB DEFAULT '{"start": "09:00", "end": "24:00"}',
    operating_days JSONB DEFAULT '["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]',
    image_url TEXT,
    gallery JSONB DEFAULT '[]', -- array of image URLs
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 3. BOOKINGS TABLE - Booking Management (Enhanced)
-- =====================================================
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    field_id INTEGER REFERENCES fields(id) ON DELETE CASCADE,
    booking_number VARCHAR(50) UNIQUE NOT NULL, -- BK-20241201-001
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration_hours DECIMAL(3,1) GENERATED ALWAYS AS (
        EXTRACT(EPOCH FROM (end_time - start_time)) / 3600
    ) STORED,
    name VARCHAR(255) NOT NULL, -- customer name
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    notes TEXT,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
    payment_status VARCHAR(20) DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'partial', 'refunded')),
    cancellation_reason TEXT,
    cancelled_at TIMESTAMP NULL,
    confirmed_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    reminder_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 4. PAYMENTS TABLE - Payment Management (Enhanced)
-- =====================================================
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
    payment_number VARCHAR(50) UNIQUE NOT NULL, -- PAY-20241201-001
    method VARCHAR(50) NOT NULL, -- 'cash', 'transfer', 'ewallet', 'credit_card'
    provider VARCHAR(50), -- 'midtrans', 'xendit', 'manual'
    amount DECIMAL(10,2) NOT NULL,
    admin_fee DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) GENERATED ALWAYS AS (amount + admin_fee) STORED,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'cancelled', 'refunded', 'expired')),
    external_id VARCHAR(255), -- payment gateway transaction ID
    payment_url TEXT, -- payment gateway URL
    expires_at TIMESTAMP,
    paid_at TIMESTAMP NULL,
    failed_at TIMESTAMP NULL,
    refunded_at TIMESTAMP NULL,
    refund_amount DECIMAL(10,2) DEFAULT 0,
    gateway_response JSONB, -- store gateway response
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 5. NOTIFICATIONS TABLE - Notification System
-- =====================================================
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'booking', 'payment', 'reminder', 'promotion', 'system'
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}', -- additional data
    channels JSONB DEFAULT '["app"]', -- ['app', 'email', 'sms', 'push']
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    read_at TIMESTAMP NULL,
    sent_at TIMESTAMP NULL,
    failed_at TIMESTAMP NULL,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 6. FIELD_REVIEWS TABLE - Field Rating & Reviews
-- =====================================================
CREATE TABLE field_reviews (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    field_id INTEGER REFERENCES fields(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    images JSONB DEFAULT '[]', -- array of image URLs
    is_anonymous BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'hidden', 'reported')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, booking_id) -- one review per booking
);

-- =====================================================
-- 7. PROMOTIONS TABLE - Discount & Promotion Management
-- =====================================================
CREATE TABLE promotions (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(20) NOT NULL CHECK (type IN ('percentage', 'fixed_amount', 'free_hours')),
    value DECIMAL(10,2) NOT NULL, -- percentage (0-100) or fixed amount
    min_amount DECIMAL(10,2) DEFAULT 0, -- minimum booking amount
    max_discount DECIMAL(10,2), -- maximum discount amount
    usage_limit INTEGER, -- total usage limit
    usage_count INTEGER DEFAULT 0,
    user_limit INTEGER DEFAULT 1, -- per user limit
    applicable_fields JSONB, -- specific field IDs or null for all
    applicable_days JSONB, -- specific days or null for all
    applicable_hours JSONB, -- specific hours or null for all
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 8. PROMOTION_USAGES TABLE - Track Promotion Usage
-- =====================================================
CREATE TABLE promotion_usages (
    id SERIAL PRIMARY KEY,
    promotion_id INTEGER REFERENCES promotions(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
    discount_amount DECIMAL(10,2) NOT NULL,
    used_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(promotion_id, booking_id)
);

-- =====================================================
-- 9. SYSTEM_SETTINGS TABLE - Application Settings
-- =====================================================
CREATE TABLE system_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT false, -- can be accessed by frontend
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 10. AUDIT_LOGS TABLE - System Audit Trail
-- =====================================================
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL, -- 'create', 'update', 'delete', 'login', etc.
    table_name VARCHAR(100) NOT NULL,
    record_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
