/**
 * @fileoverview Swagger Documentation for Staff Routes
 * @description Dokumentasi API untuk semua endpoint staff (kasir, operator, manager, supervisor)
 * @version 2.0.0
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Payment:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID pembayaran
 *           example: 1
 *         booking_id:
 *           type: integer
 *           description: ID booking terkait
 *           example: 1
 *         amount:
 *           type: number
 *           description: Jumlah pembayaran
 *           example: 100000
 *         payment_method:
 *           type: string
 *           enum: [cash, transfer, card]
 *           description: Metode pembayaran
 *           example: "transfer"
 *         status:
 *           type: string
 *           enum: [pending, paid, failed, refunded]
 *           description: Status pembayaran
 *           example: "pending"
 *         payment_proof:
 *           type: string
 *           description: URL bukti pembayaran
 *           example: "https://example.com/proof.jpg"
 *         confirmed_by:
 *           type: integer
 *           description: ID kasir yang konfirmasi
 *           example: 5
 *         confirmed_at:
 *           type: string
 *           format: date-time
 *           description: Waktu konfirmasi
 *         notes:
 *           type: string
 *           description: Catatan pembayaran
 *           example: "Pembayaran via transfer BCA"
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     
 *     StaffBooking:
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
 *         customer_phone:
 *           type: string
 *           description: Telepon customer
 *           example: "081234567890"
 *         field_name:
 *           type: string
 *           description: Nama lapangan
 *           example: "Lapangan A"
 *         assigned_operator_id:
 *           type: integer
 *           description: ID operator yang ditugaskan
 *           example: 5
 *         confirmed_by:
 *           type: integer
 *           description: ID staff yang konfirmasi
 *           example: 3
 *         confirmed_at:
 *           type: string
 *           format: date-time
 *           description: Waktu konfirmasi
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     
 *     OperatorField:
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
 *         is_active:
 *           type: boolean
 *           description: Status aktif
 *           example: true
 *         assigned_operator_id:
 *           type: integer
 *           description: ID operator yang ditugaskan
 *           example: 5
 *         current_status:
 *           type: string
 *           enum: [available, occupied, maintenance]
 *           description: Status saat ini
 *           example: "available"
 *         today_bookings:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/StaffBooking'
 *           description: Booking hari ini
 *     
 *     ManagerStatistics:
 *       type: object
 *       properties:
 *         revenue:
 *           type: object
 *           properties:
 *             today:
 *               type: number
 *               example: 500000
 *             this_week:
 *               type: number
 *               example: 2500000
 *             this_month:
 *               type: number
 *               example: 10000000
 *             this_year:
 *               type: number
 *               example: 120000000
 *         bookings:
 *           type: object
 *           properties:
 *             today:
 *               type: integer
 *               example: 10
 *             this_week:
 *               type: integer
 *               example: 50
 *             this_month:
 *               type: integer
 *               example: 200
 *             this_year:
 *               type: integer
 *               example: 2400
 *         customers:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *               example: 500
 *             new_this_month:
 *               type: integer
 *               example: 25
 *             active_this_month:
 *               type: integer
 *               example: 150
 *         fields:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *               example: 8
 *             active:
 *               type: integer
 *               example: 7
 *             utilization_rate:
 *               type: number
 *               example: 75.5
 *     
 *     SupervisorSystemHealth:
 *       type: object
 *       properties:
 *         database:
 *           type: object
 *           properties:
 *             status:
 *               type: string
 *               example: "healthy"
 *             response_time:
 *               type: number
 *               example: 25.5
 *             connection_count:
 *               type: integer
 *               example: 5
 *         server:
 *           type: object
 *           properties:
 *             uptime:
 *               type: string
 *               example: "5d 12h 30m"
 *             memory_usage:
 *               type: object
 *               properties:
 *                 used:
 *                   type: number
 *                   example: 128.5
 *                 total:
 *                   type: number
 *                   example: 512
 *                 percentage:
 *                   type: number
 *                   example: 25.1
 *             cpu_usage:
 *               type: number
 *               example: 15.2
 *         api:
 *           type: object
 *           properties:
 *             total_requests:
 *               type: integer
 *               example: 15420
 *             avg_response_time:
 *               type: number
 *               example: 120.5
 *             error_rate:
 *               type: number
 *               example: 0.5
 *         audit:
 *           type: object
 *           properties:
 *             total_logs:
 *               type: integer
 *               example: 5420
 *             today_logs:
 *               type: integer
 *               example: 150
 *             cleanup_status:
 *               type: string
 *               example: "healthy"
 */

/**
 * @swagger
 * tags:
 *   - name: Staff - Kasir
 *     description: "Endpoint untuk kasir (manajemen pembayaran)"
 *   - name: Staff - Operator
 *     description: "Endpoint untuk operator lapangan (manajemen lapangan dan booking)"
 *   - name: Staff - Manager
 *     description: "Endpoint untuk manager (analytics dan manajemen bisnis)"
 *   - name: Staff - Supervisor
 *     description: "Endpoint untuk supervisor sistem (monitoring dan administrasi)"
 */

module.exports = {};
