-- =====================================================
-- MIGRATION 002: Create New Tables
-- Create additional tables for enhanced functionality
-- =====================================================

-- =====================================================
-- 1. CREATE NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
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
-- 2. CREATE FIELD_REVIEWS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS field_reviews (
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
-- 3. CREATE PROMOTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS promotions (
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
-- 4. CREATE PROMOTION_USAGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS promotion_usages (
    id SERIAL PRIMARY KEY,
    promotion_id INTEGER REFERENCES promotions(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
    discount_amount DECIMAL(10,2) NOT NULL,
    used_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(promotion_id, booking_id)
);

-- =====================================================
-- 5. CREATE SYSTEM_SETTINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS system_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT false, -- can be accessed by frontend
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 6. CREATE AUDIT_LOGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS audit_logs (
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

-- =====================================================
-- 7. CREATE FIELD_AVAILABILITY TABLE (Optional)
-- For more complex availability management
-- =====================================================
CREATE TABLE IF NOT EXISTS field_availability (
    id SERIAL PRIMARY KEY,
    field_id INTEGER REFERENCES fields(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT true,
    reason VARCHAR(255), -- 'maintenance', 'private_event', etc.
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(field_id, date, start_time, end_time)
);

-- =====================================================
-- 8. CREATE USER_FAVORITES TABLE
-- For user's favorite fields
-- =====================================================
CREATE TABLE IF NOT EXISTS user_favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    field_id INTEGER REFERENCES fields(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, field_id)
);

-- =====================================================
-- 9. CREATE BOOKING_HISTORY TABLE
-- For tracking booking changes
-- =====================================================
CREATE TABLE IF NOT EXISTS booking_history (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL, -- 'created', 'updated', 'cancelled', 'confirmed'
    old_status VARCHAR(20),
    new_status VARCHAR(20),
    changed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 10. CREATE PAYMENT_LOGS TABLE
-- For tracking payment gateway interactions
-- =====================================================
CREATE TABLE IF NOT EXISTS payment_logs (
    id SERIAL PRIMARY KEY,
    payment_id INTEGER REFERENCES payments(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL, -- 'created', 'callback', 'webhook', 'manual_update'
    request_data JSONB,
    response_data JSONB,
    status_code INTEGER,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 11. ADD CONSTRAINTS AND CHECKS
-- =====================================================

-- Add check constraints for better data integrity
ALTER TABLE bookings ADD CONSTRAINT check_booking_time 
    CHECK (start_time < end_time);

ALTER TABLE bookings ADD CONSTRAINT check_booking_date 
    CHECK (date >= CURRENT_DATE - INTERVAL '1 day');

ALTER TABLE field_reviews ADD CONSTRAINT check_rating_range 
    CHECK (rating >= 1 AND rating <= 5);

ALTER TABLE promotions ADD CONSTRAINT check_promotion_dates 
    CHECK (start_date <= end_date);

ALTER TABLE promotions ADD CONSTRAINT check_promotion_value 
    CHECK (value >= 0);

-- =====================================================
-- 12. CREATE FUNCTIONS FOR AUTO-GENERATED FIELDS
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
            WHERE field_id = NEW.field_id AND status = 'active'
        ),
        total_reviews = (
            SELECT COUNT(*) 
            FROM field_reviews 
            WHERE field_id = NEW.field_id AND status = 'active'
        )
    WHERE id = NEW.field_id;
    
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

-- =====================================================
-- 13. CREATE TRIGGERS
-- =====================================================

-- Trigger for auto-generating booking numbers
DROP TRIGGER IF EXISTS trigger_generate_booking_number ON bookings;
CREATE TRIGGER trigger_generate_booking_number
    BEFORE INSERT ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION generate_booking_number();

-- Trigger for auto-generating payment numbers
DROP TRIGGER IF EXISTS trigger_generate_payment_number ON payments;
CREATE TRIGGER trigger_generate_payment_number
    BEFORE INSERT ON payments
    FOR EACH ROW
    EXECUTE FUNCTION generate_payment_number();

-- Trigger for updating field rating
DROP TRIGGER IF EXISTS trigger_update_field_rating ON field_reviews;
CREATE TRIGGER trigger_update_field_rating
    AFTER INSERT OR UPDATE OR DELETE ON field_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_field_rating();

-- Triggers for updating updated_at columns
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
