/**
 * @fileoverview Swagger Documentation for Public Routes
 * @description Dokumentasi API untuk semua endpoint public (tidak memerlukan autentikasi)
 * @version 2.0.0
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     PublicField:
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
 *           description: Fasilitas yang tersedia
 *           example: "[""AC", "Sound System", "Lighting"]
 *         description:
 *           type: string
 *           description: Deskripsi lapangan
 *           example: "Lapangan futsal indoor dengan fasilitas lengkap"
 *         image_url:
 *           type: string
 *           description: URL gambar lapangan
 *           example: "https://example.com/field1.jpg"
 *         rating:
 *           type: number
 *           description: Rating rata-rata lapangan
 *           example: 4.5
 *         total_reviews:
 *           type: integer
 *           description: Total review
 *           example: 25
 *         is_available:
 *           type: boolean
 *           description: Status ketersediaan
 *           example: true
 *     
 *     FieldAvailability:
 *       type: object
 *       properties:
 *         field_id:
 *           type: integer
 *           description: ID lapangan
 *           example: 1
 *         date:
 *           type: string
 *           format: date
 *           description: Tanggal yang dicek
 *           example: "2025-06-15"
 *         available_slots:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               start_time:
 *                 type: string
 *                 format: time
 *                 example: "10:00"
 *               end_time:
 *                 type: string
 *                 format: time
 *                 example: "11:00"
 *               price:
 *                 type: number
 *                 example: 50000
 *           description: Slot waktu yang tersedia
 *         booked_slots:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               start_time:
 *                 type: string
 *                 format: time
 *                 example: "14:00"
 *               end_time:
 *                 type: string
 *                 format: time
 *                 example: "16:00"
 *               status:
 *                 type: string
 *                 example: "confirmed"
 *           description: Slot waktu yang sudah dibooking
 *     
 *     SystemInfo:
 *       type: object
 *       properties:
 *         app_name:
 *           type: string
 *           description: Nama aplikasi
 *           example: "Panam Soccer Field"
 *         version:
 *           type: string
 *           description: Versi aplikasi
 *           example: "2.0.0"
 *         environment:
 *           type: string
 *           description: Environment aplikasi
 *           example: "production"
 *         api_version:
 *           type: string
 *           description: Versi API
 *           example: "v1"
 *         features:
 *           type: array
 *           items:
 *             type: string
 *           description: Fitur yang tersedia
 *           example: "[""booking", "payment", "reviews", "notifications"]
 *         contact:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *               example: "info@panamfutsal.com"
 *             phone:
 *               type: string
 *               example: "021-12345678"
 *             address:
 *               type: string
 *               example: "Jl. Futsal No. 123, Jakarta"
 *         operating_hours:
 *           type: object
 *           properties:
 *             weekdays:
 *               type: string
 *               example: "06:00 - 24:00"
 *             weekends:
 *               type: string
 *               example: "06:00 - 24:00"
 *         social_media:
 *           type: object
 *           properties:
 *             instagram:
 *               type: string
 *               example: "@panamfutsal"
 *             facebook:
 *               type: string
 *               example: "Panam Soccer Field"
 *             whatsapp:
 *               type: string
 *               example: "081234567890"
 *     
 *     DatabaseStatus:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [healthy, warning, error]
 *           description: Status database
 *           example: "healthy"
 *         connection:
 *           type: object
 *           properties:
 *             host:
 *               type: string
 *               example: "caboose.proxy.rlwy.net"
 *             port:
 *               type: integer
 *               example: 12902
 *             database:
 *               type: string
 *               example: "railway"
 *             ssl:
 *               type: boolean
 *               example: true
 *         response_time:
 *           type: number
 *           description: Response time dalam ms
 *           example: 25.5
 *         tables:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *               example: 17
 *             active:
 *               type: integer
 *               example: 17
 *             list:
 *               type: array
 *               items:
 *                 type: string
 *               example: "[""users", "bookings", "fields", "payments"]
 *         statistics:
 *           type: object
 *           properties:
 *             total_users:
 *               type: integer
 *               example: 150
 *             total_bookings:
 *               type: integer
 *               example: 1250
 *             total_fields:
 *               type: integer
 *               example: 8
 *             total_payments:
 *               type: integer
 *               example: 980
 *     
 *     PublicReview:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID review
 *           example: 1
 *         field_id:
 *           type: integer
 *           description: ID lapangan
 *           example: 1
 *         customer_name:
 *           type: string
 *           description: "Nama customer (anonymized)"
 *           example: "John D."
 *         rating:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *           description: "Rating (1-5)"
 *           example: 5
 *         comment:
 *           type: string
 *           description: Komentar review
 *           example: "Lapangan bagus, fasilitas lengkap"
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Tanggal review dibuat
 *     
 *     PublicPromotion:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID promosi
 *           example: 1
 *         code:
 *           type: string
 *           description: Kode promosi
 *           example: "NEWUSER20"
 *         name:
 *           type: string
 *           description: Nama promosi
 *           example: "Diskon New User 20%"
 *         description:
 *           type: string
 *           description: Deskripsi promosi
 *           example: "Diskon 20% untuk pengguna baru"
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
 *         start_date:
 *           type: string
 *           format: date-time
 *           description: Tanggal mulai
 *         end_date:
 *           type: string
 *           format: date-time
 *           description: Tanggal berakhir
 *         terms_conditions:
 *           type: string
 *           description: Syarat dan ketentuan
 *           example: "Berlaku untuk pengguna baru, tidak dapat digabung dengan promo lain"
 */

/**
 * @swagger
 * tags:
 *   - name: Public
 *     description: Endpoint public yang dapat diakses tanpa autentikasi
 */

module.exports = {};
