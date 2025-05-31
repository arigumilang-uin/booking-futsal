-- =====================================================
-- SAMPLE DATA FOR TESTING
-- Comprehensive test data for booking futsal system
-- =====================================================

-- Clear existing data (be careful in production!)
-- TRUNCATE TABLE audit_logs, payment_logs, booking_history, user_favorites, 
--          field_availability, promotion_usages, promotions, field_reviews, 
--          notifications, payments, bookings, fields, users RESTART IDENTITY CASCADE;

-- =====================================================
-- 1. SAMPLE USERS
-- =====================================================

INSERT INTO users (name, email, password, phone, role, is_active, created_at) VALUES
-- Admin/Pengelola
('Admin Futsal', 'admin@futsalapp.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '081234567890', 'pengelola', true, NOW() - INTERVAL '30 days'),
('Manager Lapangan', 'manager@futsalapp.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '081234567891', 'pengelola', true, NOW() - INTERVAL '25 days'),

-- Regular Users
('John Doe', 'john@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '081234567892', 'user', true, NOW() - INTERVAL '20 days'),
('Jane Smith', 'jane@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '081234567893', 'user', true, NOW() - INTERVAL '18 days'),
('Bob Wilson', 'bob@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '081234567894', 'user', true, NOW() - INTERVAL '15 days'),
('Alice Johnson', 'alice@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '081234567895', 'user', true, NOW() - INTERVAL '12 days'),
('Charlie Brown', 'charlie@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '081234567896', 'user', true, NOW() - INTERVAL '10 days'),
('Diana Prince', 'diana@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '081234567897', 'user', true, NOW() - INTERVAL '8 days'),
('Edward Norton', 'edward@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '081234567898', 'user', true, NOW() - INTERVAL '5 days'),
('Fiona Green', 'fiona@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '081234567899', 'user', true, NOW() - INTERVAL '3 days');

-- =====================================================
-- 2. SAMPLE FIELDS
-- =====================================================

INSERT INTO fields (name, type, description, facilities, capacity, location, address, coordinates, price, price_weekend, operating_hours, gallery, status, created_at) VALUES
-- Premium Fields
('Lapangan Futsal A1', 'futsal', 'Lapangan futsal premium dengan rumput sintetis berkualitas tinggi dan pencahayaan LED.', 
 '["parking", "toilet", "canteen", "shower", "wifi", "ac", "sound_system"]', 22, 'Jakarta Selatan', 
 'Jl. Sudirman No. 123, Jakarta Selatan', '{"lat": -6.2088, "lng": 106.8456}', 120000.00, 150000.00,
 '{"start": "08:00", "end": "24:00"}', 
 '["https://example.com/field1-1.jpg", "https://example.com/field1-2.jpg"]', 'active', NOW() - INTERVAL '25 days'),

('Lapangan Futsal B1', 'futsal', 'Lapangan futsal standar dengan fasilitas lengkap untuk pertandingan profesional.', 
 '["parking", "toilet", "canteen", "shower", "wifi", "tribun"]', 22, 'Jakarta Pusat', 
 'Jl. Thamrin No. 456, Jakarta Pusat', '{"lat": -6.1944, "lng": 106.8229}', 100000.00, 130000.00,
 '{"start": "09:00", "end": "23:00"}', 
 '["https://example.com/field2-1.jpg", "https://example.com/field2-2.jpg"]', 'active', NOW() - INTERVAL '23 days'),

-- Standard Fields
('Lapangan Futsal C1', 'futsal', 'Lapangan futsal dengan fasilitas standar, cocok untuk bermain santai.', 
 '["parking", "toilet", "canteen", "wifi"]', 20, 'Jakarta Timur', 
 'Jl. Bekasi Raya No. 789, Jakarta Timur', '{"lat": -6.2146, "lng": 106.8451}', 80000.00, 100000.00,
 '{"start": "10:00", "end": "22:00"}', 
 '["https://example.com/field3-1.jpg"]', 'active', NOW() - INTERVAL '20 days'),

('Lapangan Mini Soccer D1', 'mini_soccer', 'Lapangan mini soccer outdoor dengan rumput alami.', 
 '["parking", "toilet", "canteen"]', 14, 'Jakarta Barat', 
 'Jl. Puri Indah No. 321, Jakarta Barat', '{"lat": -6.1888, "lng": 106.7351}', 90000.00, 110000.00,
 '{"start": "08:00", "end": "21:00"}', 
 '["https://example.com/field4-1.jpg", "https://example.com/field4-2.jpg"]', 'active', NOW() - INTERVAL '18 days'),

-- Budget Fields
('Lapangan Futsal E1', 'futsal', 'Lapangan futsal ekonomis dengan fasilitas dasar.', 
 '["parking", "toilet"]', 18, 'Jakarta Utara', 
 'Jl. Kelapa Gading No. 654, Jakarta Utara', '{"lat": -6.1588, "lng": 106.8997}', 60000.00, 75000.00,
 '{"start": "09:00", "end": "22:00"}', 
 '["https://example.com/field5-1.jpg"]', 'active', NOW() - INTERVAL '15 days'),

('Lapangan Futsal F1', 'futsal', 'Lapangan futsal indoor dengan AC dan sound system.', 
 '["parking", "toilet", "canteen", "ac", "sound_system"]', 22, 'Tangerang', 
 'Jl. BSD Raya No. 987, Tangerang', '{"lat": -6.2615, "lng": 106.6492}', 110000.00, 140000.00,
 '{"start": "08:00", "end": "24:00"}', 
 '["https://example.com/field6-1.jpg", "https://example.com/field6-2.jpg", "https://example.com/field6-3.jpg"]', 'active', NOW() - INTERVAL '12 days');

-- =====================================================
-- 3. SAMPLE SYSTEM SETTINGS
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
('contact_email', '"support@futsalapp.com"', 'Contact email', true),
('social_media', '{"instagram": "@futsalapp", "facebook": "FutsalApp", "twitter": "@futsalapp"}', 'Social media accounts', true);

-- =====================================================
-- 4. SAMPLE PROMOTIONS
-- =====================================================

INSERT INTO promotions (code, name, description, type, value, min_amount, max_discount, usage_limit, user_limit, start_date, end_date, is_active) VALUES
('WELCOME10', 'Welcome Discount', 'Diskon 10% untuk pengguna baru', 'percentage', 10.00, 50000.00, 20000.00, 100, 1, CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE + INTERVAL '30 days', true),
('WEEKEND20', 'Weekend Special', 'Diskon 20% untuk booking weekend', 'percentage', 20.00, 100000.00, 50000.00, 50, 2, CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '60 days', true),
('STUDENT15', 'Student Discount', 'Diskon khusus pelajar', 'percentage', 15.00, 75000.00, 30000.00, 200, 3, CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE + INTERVAL '90 days', true),
('FREEHOUR', 'Free Hour', 'Gratis 1 jam untuk booking 3 jam', 'free_hours', 1.00, 200000.00, NULL, 30, 1, CURRENT_DATE, CURRENT_DATE + INTERVAL '45 days', true),
('CASHBACK50', 'Cashback 50K', 'Cashback Rp 50.000 untuk booking minimal Rp 300.000', 'fixed_amount', 50000.00, 300000.00, 50000.00, 20, 1, CURRENT_DATE + INTERVAL '5 days', CURRENT_DATE + INTERVAL '35 days', true);

-- =====================================================
-- 5. SAMPLE BOOKINGS (Past, Present, Future)
-- =====================================================

-- Past bookings (completed)
INSERT INTO bookings (user_id, field_id, date, start_time, end_time, name, phone, email, total_amount, status, payment_status, confirmed_at, completed_at, created_at) VALUES
(3, 1, CURRENT_DATE - INTERVAL '5 days', '19:00', '21:00', 'John Doe', '081234567892', 'john@example.com', 240000.00, 'completed', 'paid', NOW() - INTERVAL '5 days 2 hours', NOW() - INTERVAL '3 days', NOW() - INTERVAL '6 days'),
(4, 2, CURRENT_DATE - INTERVAL '4 days', '20:00', '22:00', 'Jane Smith', '081234567893', 'jane@example.com', 200000.00, 'completed', 'paid', NOW() - INTERVAL '4 days 3 hours', NOW() - INTERVAL '2 days', NOW() - INTERVAL '5 days'),
(5, 3, CURRENT_DATE - INTERVAL '3 days', '18:00', '20:00', 'Bob Wilson', '081234567894', 'bob@example.com', 160000.00, 'completed', 'paid', NOW() - INTERVAL '3 days 1 hour', NOW() - INTERVAL '1 day', NOW() - INTERVAL '4 days'),

-- Current/Recent bookings
(6, 1, CURRENT_DATE, '16:00', '18:00', 'Alice Johnson', '081234567895', 'alice@example.com', 240000.00, 'confirmed', 'paid', NOW() - INTERVAL '2 hours', NULL, NOW() - INTERVAL '1 day'),
(7, 4, CURRENT_DATE, '19:00', '21:00', 'Charlie Brown', '081234567896', 'charlie@example.com', 180000.00, 'confirmed', 'paid', NOW() - INTERVAL '3 hours', NULL, NOW() - INTERVAL '2 days'),

-- Future bookings
(8, 2, CURRENT_DATE + INTERVAL '1 day', '20:00', '22:00', 'Diana Prince', '081234567897', 'diana@example.com', 200000.00, 'confirmed', 'paid', NOW() - INTERVAL '1 hour', NULL, NOW() - INTERVAL '1 day'),
(9, 5, CURRENT_DATE + INTERVAL '2 days', '18:00', '20:00', 'Edward Norton', '081234567898', 'edward@example.com', 120000.00, 'pending', 'unpaid', NULL, NULL, NOW() - INTERVAL '2 hours'),
(10, 6, CURRENT_DATE + INTERVAL '3 days', '19:00', '21:00', 'Fiona Green', '081234567899', 'fiona@example.com', 220000.00, 'pending', 'unpaid', NULL, NULL, NOW() - INTERVAL '1 hour'),

-- Weekend bookings
(3, 1, CURRENT_DATE + INTERVAL '5 days', '15:00', '17:00', 'John Doe', '081234567892', 'john@example.com', 300000.00, 'confirmed', 'paid', NOW() - INTERVAL '30 minutes', NULL, NOW() - INTERVAL '3 hours'),
(4, 2, CURRENT_DATE + INTERVAL '6 days', '16:00', '18:00', 'Jane Smith', '081234567893', 'jane@example.com', 260000.00, 'pending', 'unpaid', NULL, NULL, NOW() - INTERVAL '1 hour');

-- =====================================================
-- 6. SAMPLE PAYMENTS
-- =====================================================

INSERT INTO payments (booking_id, method, provider, amount, admin_fee, status, external_id, paid_at, created_at) VALUES
-- Completed payments
(1, 'ewallet', 'midtrans', 240000.00, 6000.00, 'paid', 'MT-20241201-001', NOW() - INTERVAL '5 days 1 hour', NOW() - INTERVAL '6 days'),
(2, 'transfer', 'manual', 200000.00, 0.00, 'paid', NULL, NOW() - INTERVAL '4 days 2 hours', NOW() - INTERVAL '5 days'),
(3, 'credit_card', 'midtrans', 160000.00, 4000.00, 'paid', 'MT-20241202-002', NOW() - INTERVAL '3 days 30 minutes', NOW() - INTERVAL '4 days'),
(4, 'ewallet', 'xendit', 240000.00, 6000.00, 'paid', 'XD-20241203-001', NOW() - INTERVAL '2 hours 30 minutes', NOW() - INTERVAL '1 day'),
(5, 'transfer', 'manual', 180000.00, 0.00, 'paid', NULL, NOW() - INTERVAL '3 hours 15 minutes', NOW() - INTERVAL '2 days'),
(6, 'ewallet', 'midtrans', 200000.00, 5000.00, 'paid', 'MT-20241204-003', NOW() - INTERVAL '1 hour 45 minutes', NOW() - INTERVAL '1 day'),

-- Pending payments
(7, 'ewallet', 'midtrans', 120000.00, 3000.00, 'pending', 'MT-20241205-004', NULL, NOW() - INTERVAL '2 hours'),
(8, 'transfer', 'manual', 220000.00, 0.00, 'pending', NULL, NULL, NOW() - INTERVAL '1 hour'),

-- Confirmed future payments
(9, 'ewallet', 'xendit', 300000.00, 7500.00, 'paid', 'XD-20241206-002', NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '3 hours'),

-- Pending future payment
(10, 'credit_card', 'midtrans', 260000.00, 6500.00, 'pending', 'MT-20241207-005', NULL, NOW() - INTERVAL '1 hour');

-- =====================================================
-- 7. SAMPLE FIELD REVIEWS
-- =====================================================

INSERT INTO field_reviews (field_id, user_id, booking_id, rating, review, created_at) VALUES
(1, 3, 1, 5, 'Lapangan sangat bagus! Rumput sintetis berkualitas tinggi dan fasilitas lengkap. Pasti akan booking lagi.', NOW() - INTERVAL '3 days'),
(2, 4, 2, 4, 'Lapangan cukup bagus, tapi parkiran agak sempit. Overall recommended.', NOW() - INTERVAL '2 days'),
(3, 5, 3, 4, 'Harga terjangkau dengan kualitas yang baik. Cocok untuk main santai.', NOW() - INTERVAL '1 day'),
(1, 6, 4, 5, 'Pelayanan excellent! Lapangan bersih dan pencahayaan sangat baik.', NOW() - INTERVAL '12 hours'),
(4, 7, 5, 3, 'Lapangan outdoor cukup bagus, tapi cuaca panas jadi agak tidak nyaman.', NOW() - INTERVAL '6 hours');

-- =====================================================
-- 8. SAMPLE NOTIFICATIONS
-- =====================================================

INSERT INTO notifications (user_id, type, title, message, data, priority, read_at, created_at) VALUES
-- Booking confirmations
(3, 'booking', 'Booking Dikonfirmasi', 'Booking Anda untuk Lapangan Futsal A1 pada 2024-12-01 telah dikonfirmasi.', '{"booking_id": 1}', 'normal', NOW() - INTERVAL '2 days', NOW() - INTERVAL '5 days'),
(4, 'booking', 'Booking Dikonfirmasi', 'Booking Anda untuk Lapangan Futsal B1 pada 2024-12-02 telah dikonfirmasi.', '{"booking_id": 2}', 'normal', NOW() - INTERVAL '1 day', NOW() - INTERVAL '4 days'),

-- Payment notifications
(3, 'payment', 'Pembayaran Berhasil', 'Pembayaran sebesar Rp 246.000 untuk booking BK-20241201-001 telah berhasil.', '{"payment_id": 1, "amount": 246000}', 'high', NOW() - INTERVAL '3 days', NOW() - INTERVAL '5 days'),
(4, 'payment', 'Pembayaran Berhasil', 'Pembayaran sebesar Rp 200.000 untuk booking BK-20241202-002 telah berhasil.', '{"payment_id": 2, "amount": 200000}', 'high', NOW() - INTERVAL '2 days', NOW() - INTERVAL '4 days'),

-- Reminders
(9, 'reminder', 'Reminder Booking', 'Jangan lupa! Anda memiliki booking besok jam 20:00 di Lapangan Futsal B1.', '{"booking_id": 6}', 'normal', NULL, NOW() - INTERVAL '2 hours'),
(7, 'reminder', 'Pembayaran Pending', 'Segera lakukan pembayaran untuk booking Anda. Batas waktu: 2 jam lagi.', '{"booking_id": 7}', 'urgent', NULL, NOW() - INTERVAL '1 hour'),

-- Promotions
(3, 'promotion', 'Promo Weekend!', 'Dapatkan diskon 20% untuk booking weekend. Gunakan kode WEEKEND20.', '{"promo_code": "WEEKEND20"}', 'low', NULL, NOW() - INTERVAL '6 hours'),
(4, 'promotion', 'Promo Weekend!', 'Dapatkan diskon 20% untuk booking weekend. Gunakan kode WEEKEND20.', '{"promo_code": "WEEKEND20"}', 'low', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '6 hours');

-- =====================================================
-- 9. SAMPLE USER FAVORITES
-- =====================================================

INSERT INTO user_favorites (user_id, field_id, created_at) VALUES
(3, 1, NOW() - INTERVAL '4 days'),
(3, 2, NOW() - INTERVAL '3 days'),
(4, 2, NOW() - INTERVAL '3 days'),
(4, 6, NOW() - INTERVAL '2 days'),
(5, 3, NOW() - INTERVAL '2 days'),
(6, 1, NOW() - INTERVAL '1 day'),
(7, 4, NOW() - INTERVAL '1 day'),
(8, 2, NOW() - INTERVAL '12 hours'),
(9, 5, NOW() - INTERVAL '6 hours');

-- =====================================================
-- 10. UPDATE FIELD RATINGS BASED ON REVIEWS
-- =====================================================

UPDATE fields SET 
    rating = (
        SELECT ROUND(AVG(rating)::numeric, 2) 
        FROM field_reviews 
        WHERE field_id = fields.id AND status = 'active'
    ),
    total_reviews = (
        SELECT COUNT(*) 
        FROM field_reviews 
        WHERE field_id = fields.id AND status = 'active'
    )
WHERE id IN (SELECT DISTINCT field_id FROM field_reviews);

-- =====================================================
-- 11. SAMPLE PROMOTION USAGES
-- =====================================================

INSERT INTO promotion_usages (promotion_id, user_id, booking_id, discount_amount, used_at) VALUES
(1, 3, 1, 20000.00, NOW() - INTERVAL '5 days'),
(2, 4, 6, 40000.00, NOW() - INTERVAL '1 day'),
(3, 5, 3, 15000.00, NOW() - INTERVAL '3 days');

-- Update promotion usage counts
UPDATE promotions SET usage_count = (
    SELECT COUNT(*) FROM promotion_usages WHERE promotion_id = promotions.id
) WHERE id IN (1, 2, 3);
