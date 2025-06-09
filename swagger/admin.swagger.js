/**
 * @fileoverview Swagger Documentation for Admin Routes
 * @description Dokumentasi API untuk semua endpoint admin/management
 * @version 2.0.0
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     SystemSetting:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID unik setting
 *           example: 1
 *         key:
 *           type: string
 *           description: Key setting
 *           example: "booking_advance_days"
 *         value:
 *           type: string
 *           description: Value setting
 *           example: "30"
 *         category:
 *           type: string
 *           description: Kategori setting
 *           example: "booking"
 *         description:
 *           type: string
 *           description: Deskripsi setting
 *           example: "Maksimal hari booking di muka"
 *         data_type:
 *           type: string
 *           enum: [string, integer, boolean, json]
 *           description: Tipe data setting
 *           example: "integer"
 *         is_public:
 *           type: boolean
 *           description: Apakah setting bisa diakses public
 *           example: false
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     
 *     AuditLog:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID unik audit log
 *           example: 1
 *         user_id:
 *           type: integer
 *           description: ID user yang melakukan aksi
 *           example: 1
 *         action:
 *           type: string
 *           description: Aksi yang dilakukan
 *           example: "CREATE"
 *         table_name:
 *           type: string
 *           description: Nama tabel yang diubah
 *           example: "bookings"
 *         resource_type:
 *           type: string
 *           description: Tipe resource
 *           example: "booking"
 *         resource_id:
 *           type: integer
 *           description: ID resource yang diubah
 *           example: 123
 *         old_values:
 *           type: object
 *           description: "Nilai lama (untuk UPDATE/DELETE)"
 *         new_values:
 *           type: object
 *           description: "Nilai baru (untuk CREATE/UPDATE)"
 *         ip_address:
 *           type: string
 *           description: IP address user
 *           example: "192.168.1.1"
 *         user_agent:
 *           type: string
 *           description: User agent browser
 *           example: "Mozilla/5.0..."
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Waktu audit log dibuat
 *     
 *     AdminUser:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID user
 *           example: 1
 *         email:
 *           type: string
 *           format: email
 *           description: Email user
 *           example: "user@example.com"
 *         name:
 *           type: string
 *           description: Nama user
 *           example: "John Doe"
 *         phone:
 *           type: string
 *           description: Nomor telepon
 *           example: "081234567890"
 *         role:
 *           type: string
 *           description: Role user
 *           example: "penyewa"
 *         is_active:
 *           type: boolean
 *           description: Status aktif user
 *           example: true
 *         email_verified:
 *           type: boolean
 *           description: Status verifikasi email
 *           example: true
 *         last_login:
 *           type: string
 *           format: date-time
 *           description: Login terakhir
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     
 *     AdminField:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID lapangan
 *           example: 1
 *         name:
 *           type: string
 *           description: Nama lapangan
 *           example: "Lapangan A"
 *         type:
 *           type: string
 *           description: Jenis lapangan
 *           example: "Futsal"
 *         location:
 *           type: string
 *           description: Lokasi lapangan
 *           example: "Lantai 1"
 *         price_per_hour:
 *           type: number
 *           description: Harga per jam
 *           example: 50000
 *         facilities:
 *           type: array
 *           items:
 *             type: string
 *           description: Fasilitas
 *           example: "[""AC", "Sound System"]
 *         is_active:
 *           type: boolean
 *           description: Status aktif
 *           example: true
 *         assigned_operator_id:
 *           type: integer
 *           description: ID operator yang ditugaskan
 *           example: 5
 *         description:
 *           type: string
 *           description: Deskripsi lapangan
 *         image_url:
 *           type: string
 *           description: URL gambar
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     
 *     AdminBooking:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID booking
 *           example: 1
 *         booking_number:
 *           type: string
 *           description: Nomor booking
 *           example: "BK-20250610-001"
 *         field_id:
 *           type: integer
 *           description: ID lapangan
 *           example: 1
 *         customer_id:
 *           type: integer
 *           description: ID customer
 *           example: 1
 *         date:
 *           type: string
 *           format: date
 *           description: Tanggal booking
 *           example: "2025-06-15"
 *         start_time:
 *           type: string
 *           format: time
 *           description: Waktu mulai
 *           example: "10:00"
 *         end_time:
 *           type: string
 *           format: time
 *           description: Waktu selesai
 *           example: "12:00"
 *         total_amount:
 *           type: number
 *           description: Total biaya
 *           example: 100000
 *         status:
 *           type: string
 *           enum: [pending, confirmed, completed, cancelled]
 *           description: Status booking
 *           example: "pending"
 *         payment_status:
 *           type: string
 *           enum: [pending, paid, failed]
 *           description: Status pembayaran
 *           example: "pending"
 *         customer_name:
 *           type: string
 *           description: Nama customer
 *           example: "John Doe"
 *         field_name:
 *           type: string
 *           description: Nama lapangan
 *           example: "Lapangan A"
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     
 *     Notification:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID notifikasi
 *           example: 1
 *         user_id:
 *           type: integer
 *           description: ID user penerima
 *           example: 1
 *         title:
 *           type: string
 *           description: Judul notifikasi
 *           example: "Booking Confirmed"
 *         message:
 *           type: string
 *           description: Pesan notifikasi
 *           example: "Your booking has been confirmed"
 *         type:
 *           type: string
 *           enum: [info, success, warning, error]
 *           description: Tipe notifikasi
 *           example: "success"
 *         is_read:
 *           type: boolean
 *           description: Status baca
 *           example: false
 *         related_type:
 *           type: string
 *           description: Tipe resource terkait
 *           example: "booking"
 *         related_id:
 *           type: integer
 *           description: ID resource terkait
 *           example: 123
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     
 *     Promotion:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID promosi
 *           example: 1
 *         code:
 *           type: string
 *           description: Kode promosi
 *           example: "DISCOUNT20"
 *         name:
 *           type: string
 *           description: Nama promosi
 *           example: "Diskon 20%"
 *         description:
 *           type: string
 *           description: Deskripsi promosi
 *           example: "Diskon 20% untuk booking pertama"
 *         type:
 *           type: string
 *           enum: [percentage, fixed_amount]
 *           description: Tipe diskon
 *           example: "percentage"
 *         value:
 *           type: number
 *           description: Nilai diskon
 *           example: 20
 *         min_amount:
 *           type: number
 *           description: Minimal pembelian
 *           example: 100000
 *         max_discount:
 *           type: number
 *           description: Maksimal diskon
 *           example: 50000
 *         usage_limit:
 *           type: integer
 *           description: Batas penggunaan
 *           example: 100
 *         used_count:
 *           type: integer
 *           description: Jumlah yang sudah digunakan
 *           example: 25
 *         start_date:
 *           type: string
 *           format: date-time
 *           description: Tanggal mulai
 *         end_date:
 *           type: string
 *           format: date-time
 *           description: Tanggal berakhir
 *         is_active:
 *           type: boolean
 *           description: Status aktif
 *           example: true
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * tags:
 *   - name: Admin - System Settings
 *     description: Endpoint untuk manajemen pengaturan sistem
 *   - name: Admin - Audit System
 *     description: Endpoint untuk sistem audit dan logging
 *   - name: Admin - User Management
 *     description: Endpoint untuk manajemen pengguna
 *   - name: Admin - Field Management
 *     description: Endpoint untuk manajemen lapangan
 *   - name: Admin - Booking Management
 *     description: Endpoint untuk manajemen booking
 *   - name: Admin - Notifications
 *     description: Endpoint untuk manajemen notifikasi
 *   - name: Admin - Promotions
 *     description: Endpoint untuk manajemen promosi
 */

module.exports = {};
