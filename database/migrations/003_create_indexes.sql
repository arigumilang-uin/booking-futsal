-- =====================================================
-- MIGRATION 003: Create Indexes for Performance
-- Optimize database performance with strategic indexes
-- =====================================================

-- =====================================================
-- 1. USERS TABLE INDEXES
-- =====================================================

-- Primary lookup indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_uuid ON users(uuid);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Activity tracking indexes
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login_at);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_users_role_active ON users(role, is_active);
CREATE INDEX IF NOT EXISTS idx_users_email_active ON users(email, is_active);

-- =====================================================
-- 2. FIELDS TABLE INDEXES
-- =====================================================

-- Basic lookup indexes
CREATE INDEX IF NOT EXISTS idx_fields_uuid ON fields(uuid);
CREATE INDEX IF NOT EXISTS idx_fields_status ON fields(status);
CREATE INDEX IF NOT EXISTS idx_fields_type ON fields(type);

-- Search and filtering indexes
CREATE INDEX IF NOT EXISTS idx_fields_name ON fields(name);
CREATE INDEX IF NOT EXISTS idx_fields_location ON fields(location);
CREATE INDEX IF NOT EXISTS idx_fields_price ON fields(price);
CREATE INDEX IF NOT EXISTS idx_fields_rating ON fields(rating);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_fields_status_type ON fields(status, type);
CREATE INDEX IF NOT EXISTS idx_fields_status_rating ON fields(status, rating DESC);
CREATE INDEX IF NOT EXISTS idx_fields_type_price ON fields(type, price);

-- JSONB indexes for facilities and operating hours
CREATE INDEX IF NOT EXISTS idx_fields_facilities ON fields USING GIN(facilities);
CREATE INDEX IF NOT EXISTS idx_fields_operating_hours ON fields USING GIN(operating_hours);
CREATE INDEX IF NOT EXISTS idx_fields_coordinates ON fields USING GIN(coordinates);

-- Full-text search index for name and description
CREATE INDEX IF NOT EXISTS idx_fields_search ON fields USING GIN(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- =====================================================
-- 3. BOOKINGS TABLE INDEXES
-- =====================================================

-- Primary lookup indexes
CREATE INDEX IF NOT EXISTS idx_bookings_uuid ON bookings(uuid);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_number ON bookings(booking_number);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_field_id ON bookings(field_id);

-- Date and time indexes
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);
CREATE INDEX IF NOT EXISTS idx_bookings_start_time ON bookings(start_time);
CREATE INDEX IF NOT EXISTS idx_bookings_date_time ON bookings(date, start_time);

-- Status indexes
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_bookings_user_date ON bookings(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_field_date ON bookings(field_id, date, start_time);
CREATE INDEX IF NOT EXISTS idx_bookings_status_date ON bookings(status, date);
CREATE INDEX IF NOT EXISTS idx_bookings_date_status ON bookings(date, status);

-- Conflict detection index (critical for performance)
CREATE INDEX IF NOT EXISTS idx_bookings_conflict_check ON bookings(field_id, date, start_time, end_time) 
WHERE status IN ('pending', 'confirmed');

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at);
CREATE INDEX IF NOT EXISTS idx_bookings_completed_at ON bookings(completed_at);
CREATE INDEX IF NOT EXISTS idx_bookings_cancelled_at ON bookings(cancelled_at);

-- Customer contact indexes
CREATE INDEX IF NOT EXISTS idx_bookings_phone ON bookings(phone);
CREATE INDEX IF NOT EXISTS idx_bookings_email ON bookings(email);

-- =====================================================
-- 4. PAYMENTS TABLE INDEXES
-- =====================================================

-- Primary lookup indexes
CREATE INDEX IF NOT EXISTS idx_payments_uuid ON payments(uuid);
CREATE INDEX IF NOT EXISTS idx_payments_payment_number ON payments(payment_number);
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_external_id ON payments(external_id);

-- Status and method indexes
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_method ON payments(method);
CREATE INDEX IF NOT EXISTS idx_payments_provider ON payments(provider);

-- Date and time indexes
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);
CREATE INDEX IF NOT EXISTS idx_payments_paid_at ON payments(paid_at);
CREATE INDEX IF NOT EXISTS idx_payments_expires_at ON payments(expires_at);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_payments_status_created ON payments(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_booking_status ON payments(booking_id, status);
CREATE INDEX IF NOT EXISTS idx_payments_method_status ON payments(method, status);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_payments_amount ON payments(amount);
CREATE INDEX IF NOT EXISTS idx_payments_paid_date ON payments(DATE(paid_at)) WHERE paid_at IS NOT NULL;

-- =====================================================
-- 5. NOTIFICATIONS TABLE INDEXES
-- =====================================================

-- Primary lookup indexes
CREATE INDEX IF NOT EXISTS idx_notifications_uuid ON notifications(uuid);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- Status indexes
CREATE INDEX IF NOT EXISTS idx_notifications_read_at ON notifications(read_at);
CREATE INDEX IF NOT EXISTS idx_notifications_sent_at ON notifications(sent_at);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, read_at) WHERE read_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_user_type ON notifications(user_id, type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- JSONB indexes
CREATE INDEX IF NOT EXISTS idx_notifications_data ON notifications USING GIN(data);
CREATE INDEX IF NOT EXISTS idx_notifications_channels ON notifications USING GIN(channels);

-- =====================================================
-- 6. FIELD_REVIEWS TABLE INDEXES
-- =====================================================

-- Primary lookup indexes
CREATE INDEX IF NOT EXISTS idx_field_reviews_uuid ON field_reviews(uuid);
CREATE INDEX IF NOT EXISTS idx_field_reviews_field_id ON field_reviews(field_id);
CREATE INDEX IF NOT EXISTS idx_field_reviews_user_id ON field_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_field_reviews_booking_id ON field_reviews(booking_id);

-- Rating and status indexes
CREATE INDEX IF NOT EXISTS idx_field_reviews_rating ON field_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_field_reviews_status ON field_reviews(status);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_field_reviews_field_status ON field_reviews(field_id, status);
CREATE INDEX IF NOT EXISTS idx_field_reviews_field_rating ON field_reviews(field_id, rating DESC) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_field_reviews_created_at ON field_reviews(created_at DESC);

-- =====================================================
-- 7. PROMOTIONS TABLE INDEXES
-- =====================================================

-- Primary lookup indexes
CREATE INDEX IF NOT EXISTS idx_promotions_uuid ON promotions(uuid);
CREATE INDEX IF NOT EXISTS idx_promotions_code ON promotions(code);
CREATE INDEX IF NOT EXISTS idx_promotions_type ON promotions(type);

-- Date and status indexes
CREATE INDEX IF NOT EXISTS idx_promotions_dates ON promotions(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_promotions_is_active ON promotions(is_active);
CREATE INDEX IF NOT EXISTS idx_promotions_active_dates ON promotions(is_active, start_date, end_date);

-- Usage tracking indexes
CREATE INDEX IF NOT EXISTS idx_promotions_usage_count ON promotions(usage_count);
CREATE INDEX IF NOT EXISTS idx_promotions_usage_limit ON promotions(usage_limit);

-- JSONB indexes for applicability
CREATE INDEX IF NOT EXISTS idx_promotions_applicable_fields ON promotions USING GIN(applicable_fields);
CREATE INDEX IF NOT EXISTS idx_promotions_applicable_days ON promotions USING GIN(applicable_days);
CREATE INDEX IF NOT EXISTS idx_promotions_applicable_hours ON promotions USING GIN(applicable_hours);

-- =====================================================
-- 8. PROMOTION_USAGES TABLE INDEXES
-- =====================================================

-- Primary lookup indexes
CREATE INDEX IF NOT EXISTS idx_promotion_usages_promotion_id ON promotion_usages(promotion_id);
CREATE INDEX IF NOT EXISTS idx_promotion_usages_user_id ON promotion_usages(user_id);
CREATE INDEX IF NOT EXISTS idx_promotion_usages_booking_id ON promotion_usages(booking_id);

-- Composite indexes for usage tracking
CREATE INDEX IF NOT EXISTS idx_promotion_usages_user_promotion ON promotion_usages(user_id, promotion_id);
CREATE INDEX IF NOT EXISTS idx_promotion_usages_used_at ON promotion_usages(used_at DESC);

-- =====================================================
-- 9. SYSTEM_SETTINGS TABLE INDEXES
-- =====================================================

-- Primary lookup indexes
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(key);
CREATE INDEX IF NOT EXISTS idx_system_settings_is_public ON system_settings(is_public);

-- JSONB index for value searching
CREATE INDEX IF NOT EXISTS idx_system_settings_value ON system_settings USING GIN(value);

-- =====================================================
-- 10. AUDIT_LOGS TABLE INDEXES
-- =====================================================

-- Primary lookup indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_record_id ON audit_logs(record_id);

-- Date index for log retention
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_action ON audit_logs(user_id, action);

-- JSONB indexes for value searching
CREATE INDEX IF NOT EXISTS idx_audit_logs_old_values ON audit_logs USING GIN(old_values);
CREATE INDEX IF NOT EXISTS idx_audit_logs_new_values ON audit_logs USING GIN(new_values);

-- =====================================================
-- 11. ADDITIONAL HELPER TABLES INDEXES
-- =====================================================

-- Field availability indexes
CREATE INDEX IF NOT EXISTS idx_field_availability_field_date ON field_availability(field_id, date);
CREATE INDEX IF NOT EXISTS idx_field_availability_date_time ON field_availability(date, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_field_availability_is_available ON field_availability(is_available);

-- User favorites indexes
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_field_id ON user_favorites(field_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_created_at ON user_favorites(created_at DESC);

-- Booking history indexes
CREATE INDEX IF NOT EXISTS idx_booking_history_booking_id ON booking_history(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_history_action ON booking_history(action);
CREATE INDEX IF NOT EXISTS idx_booking_history_created_at ON booking_history(created_at DESC);

-- Payment logs indexes
CREATE INDEX IF NOT EXISTS idx_payment_logs_payment_id ON payment_logs(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_logs_action ON payment_logs(action);
CREATE INDEX IF NOT EXISTS idx_payment_logs_created_at ON payment_logs(created_at DESC);

-- =====================================================
-- 12. PARTIAL INDEXES FOR SPECIFIC USE CASES
-- =====================================================

-- Active users only
CREATE INDEX IF NOT EXISTS idx_users_active_only ON users(id, email, name) WHERE is_active = true;

-- Available fields only
CREATE INDEX IF NOT EXISTS idx_fields_available_only ON fields(id, name, type, price) WHERE status = 'active';

-- Pending bookings only
CREATE INDEX IF NOT EXISTS idx_bookings_pending_only ON bookings(field_id, date, start_time, end_time) WHERE status = 'pending';

-- Unpaid payments only
CREATE INDEX IF NOT EXISTS idx_payments_unpaid_only ON payments(booking_id, created_at) WHERE status IN ('pending', 'failed');

-- Unread notifications only
CREATE INDEX IF NOT EXISTS idx_notifications_unread_only ON notifications(user_id, created_at DESC) WHERE read_at IS NULL;

-- =====================================================
-- 13. EXPRESSION INDEXES FOR COMPUTED VALUES
-- =====================================================

-- Booking duration in hours
CREATE INDEX IF NOT EXISTS idx_bookings_duration ON bookings(EXTRACT(EPOCH FROM (end_time - start_time)) / 3600);

-- Payment total amount
CREATE INDEX IF NOT EXISTS idx_payments_total_amount ON payments((amount + admin_fee));

-- Field name lowercase for case-insensitive search
CREATE INDEX IF NOT EXISTS idx_fields_name_lower ON fields(LOWER(name));

-- User email lowercase for case-insensitive search
CREATE INDEX IF NOT EXISTS idx_users_email_lower ON users(LOWER(email));

-- =====================================================
-- 14. ANALYZE TABLES FOR STATISTICS
-- =====================================================

-- Update table statistics for query planner
ANALYZE users;
ANALYZE fields;
ANALYZE bookings;
ANALYZE payments;
ANALYZE notifications;
ANALYZE field_reviews;
ANALYZE promotions;
ANALYZE promotion_usages;
ANALYZE system_settings;
ANALYZE audit_logs;
