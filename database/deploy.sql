-- =====================================================
-- COMPLETE DEPLOYMENT SCRIPT
-- Deploy booking futsal database from scratch
-- =====================================================

-- =====================================================
-- 1. DATABASE SETUP
-- =====================================================

-- Create database (run this separately as superuser)
-- CREATE DATABASE booking_futsal_production;
-- CREATE DATABASE booking_futsal_development;

-- Connect to the database
-- \c booking_futsal_production;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search
CREATE EXTENSION IF NOT EXISTS "btree_gin"; -- For composite indexes

-- =====================================================
-- 2. CREATE TABLES (Full Schema)
-- =====================================================

-- USERS TABLE
CREATE TABLE IF NOT EXISTS users (
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

-- FIELDS TABLE
CREATE TABLE IF NOT EXISTS fields (
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
    price DECIMAL(10,2) NOT NULL,
    price_weekend DECIMAL(10,2),
    price_peak_hours JSONB,
    operating_hours JSONB DEFAULT '{"start": "09:00", "end": "24:00"}',
    operating_days JSONB DEFAULT '["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]',
    image_url TEXT,
    gallery JSONB DEFAULT '[]',
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    field_id INTEGER REFERENCES fields(id) ON DELETE CASCADE,
    booking_number VARCHAR(50) UNIQUE NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration_hours DECIMAL(3,1) GENERATED ALWAYS AS (
        EXTRACT(EPOCH FROM (end_time - start_time)) / 3600
    ) STORED,
    name VARCHAR(255) NOT NULL,
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

-- PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
    payment_number VARCHAR(50) UNIQUE NOT NULL,
    method VARCHAR(50) NOT NULL,
    provider VARCHAR(50),
    amount DECIMAL(10,2) NOT NULL,
    admin_fee DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) GENERATED ALWAYS AS (amount + admin_fee) STORED,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'cancelled', 'refunded', 'expired')),
    external_id VARCHAR(255),
    payment_url TEXT,
    expires_at TIMESTAMP,
    paid_at TIMESTAMP NULL,
    failed_at TIMESTAMP NULL,
    refunded_at TIMESTAMP NULL,
    refund_amount DECIMAL(10,2) DEFAULT 0,
    gateway_response JSONB,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    channels JSONB DEFAULT '["app"]',
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    read_at TIMESTAMP NULL,
    sent_at TIMESTAMP NULL,
    failed_at TIMESTAMP NULL,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- FIELD_REVIEWS TABLE
CREATE TABLE IF NOT EXISTS field_reviews (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    field_id INTEGER REFERENCES fields(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    images JSONB DEFAULT '[]',
    is_anonymous BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'hidden', 'reported')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, booking_id)
);

-- PROMOTIONS TABLE
CREATE TABLE IF NOT EXISTS promotions (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(20) NOT NULL CHECK (type IN ('percentage', 'fixed_amount', 'free_hours')),
    value DECIMAL(10,2) NOT NULL,
    min_amount DECIMAL(10,2) DEFAULT 0,
    max_discount DECIMAL(10,2),
    usage_limit INTEGER,
    usage_count INTEGER DEFAULT 0,
    user_limit INTEGER DEFAULT 1,
    applicable_fields JSONB,
    applicable_days JSONB,
    applicable_hours JSONB,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- PROMOTION_USAGES TABLE
CREATE TABLE IF NOT EXISTS promotion_usages (
    id SERIAL PRIMARY KEY,
    promotion_id INTEGER REFERENCES promotions(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
    discount_amount DECIMAL(10,2) NOT NULL,
    used_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(promotion_id, booking_id)
);

-- SYSTEM_SETTINGS TABLE
CREATE TABLE IF NOT EXISTS system_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- AUDIT_LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- HELPER TABLES
CREATE TABLE IF NOT EXISTS field_availability (
    id SERIAL PRIMARY KEY,
    field_id INTEGER REFERENCES fields(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT true,
    reason VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(field_id, date, start_time, end_time)
);

CREATE TABLE IF NOT EXISTS user_favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    field_id INTEGER REFERENCES fields(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, field_id)
);

CREATE TABLE IF NOT EXISTS booking_history (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    old_status VARCHAR(20),
    new_status VARCHAR(20),
    changed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payment_logs (
    id SERIAL PRIMARY KEY,
    payment_id INTEGER REFERENCES payments(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    request_data JSONB,
    response_data JSONB,
    status_code INTEGER,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 3. ADD CONSTRAINTS
-- =====================================================

ALTER TABLE bookings ADD CONSTRAINT IF NOT EXISTS check_booking_time 
    CHECK (start_time < end_time);

ALTER TABLE bookings ADD CONSTRAINT IF NOT EXISTS check_booking_date 
    CHECK (date >= CURRENT_DATE - INTERVAL '1 day');

ALTER TABLE field_reviews ADD CONSTRAINT IF NOT EXISTS check_rating_range 
    CHECK (rating >= 1 AND rating <= 5);

ALTER TABLE promotions ADD CONSTRAINT IF NOT EXISTS check_promotion_dates 
    CHECK (start_date <= end_date);

ALTER TABLE promotions ADD CONSTRAINT IF NOT EXISTS check_promotion_value 
    CHECK (value >= 0);

-- =====================================================
-- 4. CREATE FUNCTIONS
-- =====================================================

-- Function to generate booking number
CREATE OR REPLACE FUNCTION generate_booking_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.booking_number IS NULL THEN
        NEW.booking_number := 'BK-' || TO_CHAR(NEW.created_at, 'YYYYMMDD') || '-' || LPAD(NEW.id::text, 3, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to generate payment number
CREATE OR REPLACE FUNCTION generate_payment_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.payment_number IS NULL THEN
        NEW.payment_number := 'PAY-' || TO_CHAR(NEW.created_at, 'YYYYMMDD') || '-' || LPAD(NEW.id::text, 3, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update field rating
CREATE OR REPLACE FUNCTION update_field_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE fields 
    SET 
        rating = (
            SELECT ROUND(AVG(rating)::numeric, 2) 
            FROM field_reviews 
            WHERE field_id = COALESCE(NEW.field_id, OLD.field_id) AND status = 'active'
        ),
        total_reviews = (
            SELECT COUNT(*) 
            FROM field_reviews 
            WHERE field_id = COALESCE(NEW.field_id, OLD.field_id) AND status = 'active'
        )
    WHERE id = COALESCE(NEW.field_id, OLD.field_id);
    
    RETURN COALESCE(NEW, OLD);
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

-- =====================================================
-- 5. CREATE TRIGGERS
-- =====================================================

-- Booking number generation
DROP TRIGGER IF EXISTS trigger_generate_booking_number ON bookings;
CREATE TRIGGER trigger_generate_booking_number
    BEFORE INSERT ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION generate_booking_number();

-- Payment number generation
DROP TRIGGER IF EXISTS trigger_generate_payment_number ON payments;
CREATE TRIGGER trigger_generate_payment_number
    BEFORE INSERT ON payments
    FOR EACH ROW
    EXECUTE FUNCTION generate_payment_number();

-- Field rating updates
DROP TRIGGER IF EXISTS trigger_update_field_rating ON field_reviews;
CREATE TRIGGER trigger_update_field_rating
    AFTER INSERT OR UPDATE OR DELETE ON field_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_field_rating();

-- Updated_at triggers
DROP TRIGGER IF EXISTS trigger_update_users_updated_at ON users;
CREATE TRIGGER trigger_update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_fields_updated_at ON fields;
CREATE TRIGGER trigger_update_fields_updated_at
    BEFORE UPDATE ON fields
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_bookings_updated_at ON bookings;
CREATE TRIGGER trigger_update_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_payments_updated_at ON payments;
CREATE TRIGGER trigger_update_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 6. CREATE INDEXES (Performance Critical)
-- =====================================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_uuid ON users(uuid);
CREATE INDEX IF NOT EXISTS idx_users_role_active ON users(role, is_active);

-- Fields indexes
CREATE INDEX IF NOT EXISTS idx_fields_uuid ON fields(uuid);
CREATE INDEX IF NOT EXISTS idx_fields_status_type ON fields(status, type);
CREATE INDEX IF NOT EXISTS idx_fields_facilities ON fields USING GIN(facilities);
CREATE INDEX IF NOT EXISTS idx_fields_search ON fields USING GIN(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Bookings indexes (CRITICAL for performance)
CREATE INDEX IF NOT EXISTS idx_bookings_uuid ON bookings(uuid);
CREATE INDEX IF NOT EXISTS idx_bookings_user_date ON bookings(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_field_date_time ON bookings(field_id, date, start_time);
CREATE INDEX IF NOT EXISTS idx_bookings_conflict_check ON bookings(field_id, date, start_time, end_time) 
WHERE status IN ('pending', 'confirmed');

-- Payments indexes
CREATE INDEX IF NOT EXISTS idx_payments_uuid ON payments(uuid);
CREATE INDEX IF NOT EXISTS idx_payments_booking_status ON payments(booking_id, status);
CREATE INDEX IF NOT EXISTS idx_payments_external_id ON payments(external_id);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, read_at) WHERE read_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Reviews indexes
CREATE INDEX IF NOT EXISTS idx_field_reviews_field_status ON field_reviews(field_id, status);

-- =====================================================
-- 7. INSERT SYSTEM SETTINGS
-- =====================================================

INSERT INTO system_settings (key, value, description, is_public) VALUES
('app_name', '"Booking Futsal App"', 'Application name', true),
('app_version', '"1.0.0"', 'Application version', true),
('booking_advance_days', '30', 'Maximum days in advance for booking', true),
('booking_min_duration', '1', 'Minimum booking duration in hours', true),
('booking_max_duration', '4', 'Maximum booking duration in hours', true),
('payment_timeout_minutes', '30', 'Payment timeout in minutes', false),
('admin_fee_percentage', '2.5', 'Admin fee percentage', false),
('cancellation_deadline_hours', '24', 'Cancellation deadline in hours', true),
('operating_hours_default', '{"start": "09:00", "end": "24:00"}', 'Default operating hours', false),
('contact_phone', '"+62812345678"', 'Contact phone number', true),
('contact_email', '"support@futsalapp.com"', 'Contact email', true)
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- 8. ANALYZE TABLES
-- =====================================================

ANALYZE users;
ANALYZE fields;
ANALYZE bookings;
ANALYZE payments;
ANALYZE notifications;
ANALYZE field_reviews;
ANALYZE promotions;
ANALYZE system_settings;

-- =====================================================
-- 9. GRANT PERMISSIONS (Adjust as needed)
-- =====================================================

-- Create application user (run as superuser)
-- CREATE USER booking_futsal_app WITH PASSWORD 'secure_password_here';

-- Grant permissions
-- GRANT CONNECT ON DATABASE booking_futsal_production TO booking_futsal_app;
-- GRANT USAGE ON SCHEMA public TO booking_futsal_app;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO booking_futsal_app;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO booking_futsal_app;

-- =====================================================
-- DEPLOYMENT COMPLETE
-- =====================================================

SELECT 'Database deployment completed successfully!' as status;
