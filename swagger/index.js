/**
 * @fileoverview Swagger Documentation Index
 * @description File utama untuk mengumpulkan semua dokumentasi Swagger API
 * @version 2.0.0
 */

// Import semua file dokumentasi swagger
// require('./auth.swagger');
// require('./customer.swagger');
// require('./admin.swagger');
// require('./staff.swagger');
// require('./public.swagger');

/**
 * @swagger
 * info:
 *   title: Panam Soccer Field API
 *   version: 2.0.0
 *   description: "|"
 *     API untuk sistem booking lapangan futsal Panam Soccer Field dengan fitur lengkap:
 *     
 *     ## 🏟️ **FITUR UTAMA**
 *     - **6-Level Role System**: Pengunjung, Penyewa, Kasir, Operator, Manager, Supervisor
 *     - **Real-time Booking**: Sistem booking real-time dengan conflict detection
 *     - **Payment Gateway**: Integrasi pembayaran dengan multiple methods
 *     - **Review & Rating**: Sistem review dan rating lapangan
 *     - **Notification System**: Notifikasi real-time untuk semua aktivitas
 *     - **Analytics Dashboard**: Dashboard analytics untuk management
 *     - **Audit Trail**: Complete audit logging untuk semua aktivitas
 *     - **Promotion System**: Sistem promosi dan diskon yang fleksibel
 *     
 *     ## 🔐 **AUTHENTICATION**
 *     API menggunakan JWT token dengan HttpOnly cookies untuk keamanan optimal.
 *     
 *     **Development Mode**: Token juga dikembalikan dalam response body
 *     **Production Mode**: Token hanya disimpan dalam HttpOnly cookie
 *     
 *     ## 🎯 **ROLE HIERARCHY**
 *     1. **Pengunjung** (Level 1) - Guest access
 *     2. **Penyewa** (Level 2) - Customer booking access
 *     3. **Staff Kasir** (Level 3) - Payment management
 *     4. **Operator Lapangan** (Level 4) - Field operations
 *     5. **Manager Futsal** (Level 5) - Business management
 *     6. **Supervisor Sistem** (Level 6) - Full system access
 *     
 *     ## 📊 **API ENDPOINTS**
 *     - **Authentication**: `/api/auth/*` - Login, register, profile management
 *     - **Public**: `/api/public/*` - Public information, fields, reviews
 *     - **Customer**: `/api/customer/*` - Booking, payments, favorites, reviews
 *     - **Admin**: `/api/admin/*` - System settings, user management, analytics
 *     - **Staff Kasir**: `/api/staff/kasir/*` - Payment confirmation, reports
 *     - **Staff Operator**: `/api/staff/operator/*` - Field management, booking confirmation
 *     - **Staff Manager**: `/api/staff/manager/*` - Business analytics, staff management
 *     - **Staff Supervisor**: `/api/staff/supervisor/*` - System monitoring, audit logs
 *     
 *     ## 🌐 **ENVIRONMENTS**
 *     - **Production**: https://booking-futsal-production.up.railway.app
 *     - **Frontend**: https://booking-futsal-frontend.vercel.app
 *     
 *     ## 📝 **RESPONSE FORMAT**
 *     Semua response menggunakan format JSON standar:
 *     ```json
 *     {
 *       "success": true,
 *       "message": "Success message",
 *       "data": { ... },
 *       "pagination": { ... } // untuk list endpoints
 *     }
 *     ```
 *     
 *     ## ⚠️ **ERROR HANDLING**
 *     Error responses mengikuti format standar:
 *     ```json
 *     {
 *       "success": false,
 *       "message": "Error message",
 *       "errors": ["Detailed error 1", "Detailed error 2"]
 *     }
 *     ```
 *     
 *     ## 🔄 **PAGINATION**
 *     List endpoints mendukung pagination dengan parameter:
 *     - `page`: Nomor halaman (default: 1)
 *     - `limit`: Jumlah item per halaman (default: 10, max: 100)
 *     - `search`: Keyword pencarian (optional)
 *     - `sort`: Field untuk sorting (optional)
 *     - `order`: asc/desc (default: desc)
 *     
 *     ## 🏷️ **FILTERING**
 *     Banyak endpoints mendukung filtering dengan parameter query:
 *     - `status`: Filter berdasarkan status
 *     - `date_from`: Filter tanggal mulai
 *     - `date_to`: Filter tanggal akhir
 *     - `field_id`: Filter berdasarkan lapangan
 *     - `customer_id`: Filter berdasarkan customer
 *     
 *   contact:
 *     name: Panam Soccer Field Support
 *     email: support@panamfutsal.com
 *     url: https://panamfutsal.com
 *   license:
 *     name: MIT
 *     url: https://opensource.org/licenses/MIT
 *   termsOfService: https://panamfutsal.com/terms
 * 
 * servers:
 *   - url: https://booking-futsal-production.up.railway.app/api
 *     description: "Production Server (Railway)"
 *   - url: http://localhost:5000/api
 *     description: Development Server
 * 
 * externalDocs:
 *   description: Frontend Application
 *   url: https://booking-futsal-frontend.vercel.app
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: "|"
 *         JWT token untuk autentikasi. 
 *         
 *         **Development**: Token dikembalikan dalam response body
 *         **Production**: Token disimpan dalam HttpOnly cookie
 *         
 *         Format: `Bearer <token>`
 *     
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: token
 *       description: "|"
 *         HttpOnly cookie authentication (recommended untuk production)
 *         
 *         Cookie akan di-set otomatis setelah login berhasil
 *   
 *   parameters:
 *     PageParam:
 *       name: page
 *       in: query
 *       description: Nomor halaman untuk pagination
 *       required: false
 *       schema:
 *         type: integer
 *         minimum: 1
 *         default: 1
 *         example: 1
 *     
 *     LimitParam:
 *       name: limit
 *       in: query
 *       description: Jumlah item per halaman
 *       required: false
 *       schema:
 *         type: integer
 *         minimum: 1
 *         maximum: 100
 *         default: 10
 *         example: 10
 *     
 *     SearchParam:
 *       name: search
 *       in: query
 *       description: Keyword untuk pencarian
 *       required: false
 *       schema:
 *         type: string
 *         example: "john"
 *     
 *     SortParam:
 *       name: sort
 *       in: query
 *       description: Field untuk sorting
 *       required: false
 *       schema:
 *         type: string
 *         example: "created_at"
 *     
 *     OrderParam:
 *       name: order
 *       in: query
 *       description: Urutan sorting
 *       required: false
 *       schema:
 *         type: string
 *         enum: [asc, desc]
 *         default: desc
 *         example: "desc"
 *     
 *     StatusParam:
 *       name: status
 *       in: query
 *       description: Filter berdasarkan status
 *       required: false
 *       schema:
 *         type: string
 *         example: "active"
 *     
 *     DateFromParam:
 *       name: date_from
 *       in: query
 *       description: "Filter tanggal mulai (YYYY-MM-DD)"
 *       required: false
 *       schema:
 *         type: string
 *         format: date
 *         example: "2025-06-01"
 *     
 *     DateToParam:
 *       name: date_to
 *       in: query
 *       description: "Filter tanggal akhir (YYYY-MM-DD)"
 *       required: false
 *       schema:
 *         type: string
 *         format: date
 *         example: "2025-06-30"
 *   
 *   responses:
 *     Success:
 *       description: Operasi berhasil
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: true
 *               message:
 *                 type: string
 *                 example: "Operasi berhasil"
 *               data:
 *                 type: object
 *                 description: "Data response (varies by endpoint)"
 *     
 *     PaginatedResponse:
 *       description: Response dengan pagination
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: true
 *               message:
 *                 type: string
 *                 example: "Data berhasil diambil"
 *               data:
 *                 type: array
 *                 items:
 *                   type: object
 *               pagination:
 *                 type: object
 *                 properties:
 *                   page:
 *                     type: integer
 *                     example: 1
 *                   limit:
 *                     type: integer
 *                     example: 10
 *                   total:
 *                     type: integer
 *                     example: 100
 *                   total_pages:
 *                     type: integer
 *                     example: 10
 *                   has_next:
 *                     type: boolean
 *                     example: true
 *                   has_prev:
 *                     type: boolean
 *                     example: false
 *     
 *     BadRequest:
 *       description: Request tidak valid
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               message:
 *                 type: string
 *                 example: "Data tidak valid"
 *               errors:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: "[""Email harus valid", "Password minimal 6 karakter"]
 *     
 *     Unauthorized:
 *       description: Token tidak valid atau tidak ada
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               message:
 *                 type: string
 *                 example: "Token tidak valid atau sudah expired"
 *     
 *     Forbidden:
 *       description: Akses ditolak - role tidak memiliki permission
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               message:
 *                 type: string
 *                 example: "Akses ditolak - role tidak memiliki permission"
 *     
 *     NotFound:
 *       description: Data tidak ditemukan
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               message:
 *                 type: string
 *                 example: "Data tidak ditemukan"
 *     
 *     Conflict:
 *       description: "Konflik data (misalnya email sudah terdaftar)"
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               message:
 *                 type: string
 *                 example: "Email sudah terdaftar"
 *     
 *     InternalServerError:
 *       description: Server error
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               message:
 *                 type: string
 *                 example: "Terjadi kesalahan server"
 */

module.exports = {};
