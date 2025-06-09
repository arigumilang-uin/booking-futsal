-- Database Indexing Optimizer untuk Booking Futsal
-- Script untuk menambahkan indexes yang diperlukan untuk optimasi performance

-- =====================================================
-- ANALISIS CURRENT INDEXES
-- =====================================================

-- Cek indexes yang sudah ada
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- =====================================================
-- BOOKINGS TABLE INDEXES (HIGH PRIORITY)
-- =====================================================

-- Index untuk user_id (frequently queried)
CREATE INDEX IF NOT EXISTS idx_bookings_user_id 
ON bookings(user_id);

-- Index untuk field_id (frequently queried)
CREATE INDEX IF NOT EXISTS idx_bookings_field_id 
ON bookings(field_id);

-- Index untuk date (used in availability checks)
CREATE INDEX IF NOT EXISTS idx_bookings_date 
ON bookings(date);

-- Index untuk status (used in filtering)
CREATE INDEX IF NOT EXISTS idx_bookings_status 
ON bookings(status);

-- Index untuk payment_status (used in payment tracking)
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status 
ON bookings(payment_status);

-- Composite index untuk conflict detection (CRITICAL)
CREATE INDEX IF NOT EXISTS idx_bookings_conflict_check 
ON bookings(field_id, date, start_time, end_time, status);

-- Composite index untuk user bookings with status
CREATE INDEX IF NOT EXISTS idx_bookings_user_status 
ON bookings(user_id, status, created_at DESC);

-- Index untuk created_at (used in ordering)
CREATE INDEX IF NOT EXISTS idx_bookings_created_at 
ON bookings(created_at DESC);

-- =====================================================
-- USERS TABLE INDEXES (HIGH PRIORITY)
-- =====================================================

-- Index untuk email (used in authentication)
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_unique 
ON users(email) WHERE is_active = true;

-- Index untuk role (used in role-based queries)
CREATE INDEX IF NOT EXISTS idx_users_role 
ON users(role);

-- Index untuk is_active (used in filtering)
CREATE INDEX IF NOT EXISTS idx_users_is_active 
ON users(is_active);

-- Composite index untuk role and active status
CREATE INDEX IF NOT EXISTS idx_users_role_active 
ON users(role, is_active);

-- =====================================================
-- FIELDS TABLE INDEXES (MEDIUM PRIORITY)
-- =====================================================

-- Index untuk status (used in availability)
CREATE INDEX IF NOT EXISTS idx_fields_status 
ON fields(status);

-- Index untuk assigned_operator (used in operator queries)
CREATE INDEX IF NOT EXISTS idx_fields_assigned_operator 
ON fields(assigned_operator);

-- Index untuk type (used in filtering)
CREATE INDEX IF NOT EXISTS idx_fields_type 
ON fields(type);

-- Composite index untuk active fields by type
CREATE INDEX IF NOT EXISTS idx_fields_active_type 
ON fields(status, type) WHERE status != 'deleted';

-- =====================================================
-- PAYMENTS TABLE INDEXES (MEDIUM PRIORITY)
-- =====================================================

-- Index untuk booking_id (foreign key)
CREATE INDEX IF NOT EXISTS idx_payments_booking_id 
ON payments(booking_id);

-- Index untuk status (used in payment tracking)
CREATE INDEX IF NOT EXISTS idx_payments_status 
ON payments(status);

-- Index untuk created_at (used in reporting)
CREATE INDEX IF NOT EXISTS idx_payments_created_at 
ON payments(created_at DESC);

-- Index untuk method (used in payment analytics)
CREATE INDEX IF NOT EXISTS idx_payments_method 
ON payments(method);

-- Composite index untuk payment tracking
CREATE INDEX IF NOT EXISTS idx_payments_booking_status 
ON payments(booking_id, status, created_at DESC);

-- =====================================================
-- AUDIT_LOGS TABLE INDEXES (LOW PRIORITY)
-- =====================================================

-- Index untuk user_id (used in user activity tracking)
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id 
ON audit_logs(user_id);

-- Index untuk action (used in filtering)
CREATE INDEX IF NOT EXISTS idx_audit_logs_action 
ON audit_logs(action);

-- Index untuk table_name (used in table activity tracking)
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name 
ON audit_logs(table_name);

-- Index untuk created_at (used in time-based queries)
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at 
ON audit_logs(created_at DESC);

-- =====================================================
-- PERFORMANCE ANALYSIS QUERIES
-- =====================================================

-- Query untuk menganalisis penggunaan index
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes 
ORDER BY idx_scan DESC;

-- Query untuk menganalisis table statistics
SELECT 
    schemaname,
    tablename,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes,
    n_live_tup as live_tuples,
    n_dead_tup as dead_tuples
FROM pg_stat_user_tables 
ORDER BY n_live_tup DESC;

-- =====================================================
-- MAINTENANCE COMMANDS
-- =====================================================

-- Update table statistics (run after creating indexes)
ANALYZE bookings;
ANALYZE users;
ANALYZE fields;
ANALYZE payments;
ANALYZE audit_logs;

-- Vacuum tables to reclaim space
VACUUM ANALYZE bookings;
VACUUM ANALYZE users;
VACUUM ANALYZE fields;
VACUUM ANALYZE payments;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify booking conflict query performance
EXPLAIN ANALYZE 
SELECT id, booking_number, start_time, end_time, status
FROM bookings
WHERE field_id = 1
  AND date = '2024-12-01'
  AND status IN ('pending', 'confirmed', 'completed')
  AND ('10:00' < end_time AND '12:00' > start_time);

-- Verify user bookings query performance
EXPLAIN ANALYZE 
SELECT b.id, b.booking_number, b.date, b.start_time, b.status,
       f.name as field_name
FROM bookings b
LEFT JOIN fields f ON b.field_id = f.id
WHERE b.user_id = 1
ORDER BY b.created_at DESC;

-- Verify payment tracking query performance
EXPLAIN ANALYZE 
SELECT p.id, p.amount, p.status, p.created_at,
       b.booking_number
FROM payments p
LEFT JOIN bookings b ON p.booking_id = b.id
WHERE p.status = 'pending'
ORDER BY p.created_at DESC;
