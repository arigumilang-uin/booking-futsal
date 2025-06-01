-- =====================================================
-- MIGRATION 004: Schema Optimization
-- Optimize database schema untuk production performance
-- =====================================================

-- =====================================================
-- 1. REMOVE REDUNDANT TABLES
-- =====================================================

-- Backup data sebelum drop (jika ada data penting)
-- CREATE TABLE role_change_logs_backup AS SELECT * FROM role_change_logs;
-- CREATE TABLE system_logs_backup AS SELECT * FROM system_logs;
-- CREATE TABLE employee_onboarding_backup AS SELECT * FROM employee_onboarding;

-- Drop redundant tables
DROP TABLE IF EXISTS role_change_logs CASCADE;
DROP TABLE IF EXISTS system_logs CASCADE;
DROP TABLE IF EXISTS employee_onboarding CASCADE;

-- =====================================================
-- 2. STRATEGIC DENORMALIZATION
-- =====================================================

-- Add performance counters to fields
ALTER TABLE fields ADD COLUMN IF NOT EXISTS booking_count INTEGER DEFAULT 0;
ALTER TABLE fields ADD COLUMN IF NOT EXISTS revenue_total DECIMAL(12,2) DEFAULT 0;
ALTER TABLE fields ADD COLUMN IF NOT EXISTS last_booking_date DATE;

-- Add performance counters to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS booking_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_spent DECIMAL(12,2) DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_booking_date DATE;

-- =====================================================
-- 3. PERFORMANCE INDEXES
-- =====================================================

-- Booking performance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_date_time 
    ON bookings(date, start_time, end_time);
    
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_field_date 
    ON bookings(field_id, date) WHERE status IN ('confirmed', 'pending');
    
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_user_status 
    ON bookings(user_id, status, created_at DESC);

-- Payment performance indexes    
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_status_date 
    ON payments(status, created_at DESC);
    
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_booking_id 
    ON payments(booking_id);

-- Notification performance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_read 
    ON notifications(user_id, read_at) WHERE read_at IS NULL;
    
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_type_created 
    ON notifications(type, created_at DESC);

-- Review performance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_field_reviews_field_status 
    ON field_reviews(field_id, status) WHERE status = 'active';
    
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_field_reviews_user_created 
    ON field_reviews(user_id, created_at DESC);

-- JSONB indexes untuk flexible queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fields_facilities_gin 
    ON fields USING GIN(facilities);
    
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_promotions_applicable_gin 
    ON promotions USING GIN(applicable_fields);
    
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_data_gin 
    ON notifications USING GIN(data);

-- =====================================================
-- 4. ENHANCED CONSTRAINTS
-- =====================================================

-- Booking constraints
ALTER TABLE bookings ADD CONSTRAINT IF NOT EXISTS check_booking_duration 
    CHECK (EXTRACT(EPOCH FROM (end_time - start_time))/3600 BETWEEN 1 AND 8);

-- Payment constraints    
ALTER TABLE payments ADD CONSTRAINT IF NOT EXISTS check_payment_amount_positive 
    CHECK (amount > 0);

-- Review constraints
ALTER TABLE field_reviews ADD CONSTRAINT IF NOT EXISTS check_review_length 
    CHECK (review IS NULL OR LENGTH(review) <= 1000);

-- Promotion constraints
ALTER TABLE promotions ADD CONSTRAINT IF NOT EXISTS check_promotion_usage_limit 
    CHECK (usage_limit IS NULL OR usage_limit > 0);

-- =====================================================
-- 5. OPTIMIZED FUNCTIONS
-- =====================================================

-- Function untuk update booking counters
CREATE OR REPLACE FUNCTION update_booking_counters()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Update field counters
        UPDATE fields 
        SET booking_count = booking_count + 1,
            revenue_total = revenue_total + NEW.total_amount,
            last_booking_date = GREATEST(last_booking_date, NEW.date)
        WHERE id = NEW.field_id;
        
        -- Update user counters  
        UPDATE users
        SET booking_count = booking_count + 1,
            total_spent = total_spent + NEW.total_amount,
            last_booking_date = GREATEST(last_booking_date, NEW.date)
        WHERE id = NEW.user_id;
        
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function untuk update payment counters
CREATE OR REPLACE FUNCTION update_payment_counters()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' AND OLD.status != NEW.status AND NEW.status = 'completed' THEN
        -- Update revenue saat payment completed
        UPDATE fields 
        SET revenue_total = revenue_total + NEW.amount
        WHERE id = (SELECT field_id FROM bookings WHERE id = NEW.booking_id);
        
        UPDATE users
        SET total_spent = total_spent + NEW.amount
        WHERE id = (SELECT user_id FROM bookings WHERE id = NEW.booking_id);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. OPTIMIZED TRIGGERS
-- =====================================================

-- Trigger untuk booking counters
DROP TRIGGER IF EXISTS trigger_update_booking_counters ON bookings;
CREATE TRIGGER trigger_update_booking_counters
    AFTER INSERT ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_booking_counters();

-- Trigger untuk payment counters
DROP TRIGGER IF EXISTS trigger_update_payment_counters ON payments;
CREATE TRIGGER trigger_update_payment_counters
    AFTER UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_payment_counters();

-- =====================================================
-- 7. INITIALIZE COUNTERS
-- =====================================================

-- Update existing counters
UPDATE fields SET 
    booking_count = (
        SELECT COUNT(*) FROM bookings 
        WHERE field_id = fields.id AND status = 'completed'
    ),
    revenue_total = (
        SELECT COALESCE(SUM(total_amount), 0) FROM bookings 
        WHERE field_id = fields.id AND status = 'completed'
    ),
    last_booking_date = (
        SELECT MAX(date) FROM bookings 
        WHERE field_id = fields.id AND status = 'completed'
    );

UPDATE users SET 
    booking_count = (
        SELECT COUNT(*) FROM bookings 
        WHERE user_id = users.id AND status = 'completed'
    ),
    total_spent = (
        SELECT COALESCE(SUM(total_amount), 0) FROM bookings 
        WHERE user_id = users.id AND status = 'completed'
    ),
    last_booking_date = (
        SELECT MAX(date) FROM bookings 
        WHERE user_id = users.id AND status = 'completed'
    );

-- =====================================================
-- 8. VACUUM AND ANALYZE
-- =====================================================

-- Optimize table statistics
VACUUM ANALYZE bookings;
VACUUM ANALYZE payments;
VACUUM ANALYZE fields;
VACUUM ANALYZE users;
VACUUM ANALYZE notifications;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
