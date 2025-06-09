/**
 * @fileoverview Swagger Documentation for Customer Routes
 * @description Dokumentasi API untuk semua endpoint customer/penyewa
 * @version 2.0.0
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Booking:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID unik booking
 *           example: 1
 *         booking_number:
 *           type: string
 *           description: Nomor booking unik
 *           example: "BK-20250610-001"
 *         field_id:
 *           type: integer
 *           description: ID lapangan yang dibooking
 *           example: 1
 *         customer_id:
 *           type: integer
 *           description: ID customer yang membuat booking
 *           example: 1
 *         date:
 *           type: string
 *           format: date
 *           description: Tanggal booking
 *           example: "2025-06-15"
 *         start_time:
 *           type: string
 *           format: time
 *           description: Waktu mulai booking
 *           example: "10:00"
 *         end_time:
 *           type: string
 *           format: time
 *           description: Waktu selesai booking
 *           example: "12:00"
 *         duration:
 *           type: integer
 *           description: Durasi booking dalam jam
 *           example: 2
 *         total_amount:
 *           type: number
 *           description: Total biaya booking
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
 *         name:
 *           type: string
 *           description: Nama pemesan
 *           example: "John Doe"
 *         phone:
 *           type: string
 *           description: Nomor telepon pemesan
 *           example: "081234567890"
 *         email:
 *           type: string
 *           format: email
 *           description: Email pemesan
 *           example: "john@example.com"
 *         notes:
 *           type: string
 *           description: Catatan tambahan
 *           example: "Booking untuk turnamen"
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Tanggal pembuatan booking
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Tanggal update terakhir
 *     
 *     CreateBookingRequest:
 *       type: object
 *       required:
 *         - field_id
 *         - date
 *         - start_time
 *         - end_time
 *         - name
 *         - phone
 *       properties:
 *         field_id:
 *           type: integer
 *           description: ID lapangan yang akan dibooking
 *           example: 1
 *         date:
 *           type: string
 *           format: date
 *           description: "Tanggal booking (format YYYY-MM-DD)"
 *           example: "2025-06-15"
 *         start_time:
 *           type: string
 *           format: time
 *           description: "Waktu mulai booking (format HH:MM)"
 *           example: "10:00"
 *         end_time:
 *           type: string
 *           format: time
 *           description: "Waktu selesai booking (format HH:MM)"
 *           example: "12:00"
 *         name:
 *           type: string
 *           description: Nama pemesan
 *           example: "John Doe"
 *         phone:
 *           type: string
 *           description: Nomor telepon pemesan
 *           example: "081234567890"
 *         email:
 *           type: string
 *           format: email
 *           description: "Email pemesan (optional)"
 *           example: "john@example.com"
 *         notes:
 *           type: string
 *           description: "Catatan tambahan (optional)"
 *           example: "Booking untuk turnamen"
 *     
 *     Field:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID unik lapangan
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
 *         is_active:
 *           type: boolean
 *           description: Status aktif lapangan
 *           example: true
 *         description:
 *           type: string
 *           description: Deskripsi lapangan
 *           example: "Lapangan futsal indoor dengan fasilitas lengkap"
 *         image_url:
 *           type: string
 *           description: URL gambar lapangan
 *           example: "https://example.com/field1.jpg"
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Tanggal pembuatan
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Tanggal update terakhir
 *     
 *     CustomerProfile:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID customer
 *           example: 1
 *         email:
 *           type: string
 *           format: email
 *           description: Email customer
 *           example: "customer@example.com"
 *         name:
 *           type: string
 *           description: Nama customer
 *           example: "John Customer"
 *         phone:
 *           type: string
 *           description: Nomor telepon customer
 *           example: "081234567890"
 *         role:
 *           type: string
 *           description: Role customer
 *           example: "penyewa"
 *         total_bookings:
 *           type: integer
 *           description: Total booking yang pernah dibuat
 *           example: 15
 *         total_spent:
 *           type: number
 *           description: Total uang yang dihabiskan
 *           example: 1500000
 *         member_since:
 *           type: string
 *           format: date-time
 *           description: Tanggal bergabung
 *         last_booking:
 *           type: string
 *           format: date-time
 *           description: Tanggal booking terakhir
 *     
 *     CustomerDashboard:
 *       type: object
 *       properties:
 *         profile:
 *           $ref: '#/components/schemas/CustomerProfile'
 *         statistics:
 *           type: object
 *           properties:
 *             total_bookings:
 *               type: integer
 *               example: 15
 *             active_bookings:
 *               type: integer
 *               example: 2
 *             completed_bookings:
 *               type: integer
 *               example: 12
 *             cancelled_bookings:
 *               type: integer
 *               example: 1
 *             total_spent:
 *               type: number
 *               example: 1500000
 *             pending_payments:
 *               type: integer
 *               example: 1
 *         recent_bookings:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Booking'
 *         upcoming_bookings:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Booking'
 */

/**
 * @swagger
 * tags:
 *   - name: Customer
 *     description: Endpoint untuk customer/penyewa lapangan futsal
 */

module.exports = {};
