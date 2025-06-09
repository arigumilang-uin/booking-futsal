/**
 * @fileoverview Swagger Documentation for Authentication Routes
 * @description Dokumentasi API untuk semua endpoint authentication
 * @version 2.0.0
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - name
 *         - phone
 *       properties:
 *         id:
 *           type: integer
 *           description: ID unik pengguna
 *           example: 1
 *         email:
 *           type: string
 *           format: email
 *           description: "Email pengguna (unique)"
 *           example: "customer@example.com"
 *         name:
 *           type: string
 *           description: Nama lengkap pengguna
 *           example: "John Doe"
 *         phone:
 *           type: string
 *           description: Nomor telepon pengguna
 *           example: "081234567890"
 *         role:
 *           type: string
 *           enum: [pengunjung, penyewa, staff_kasir, operator_lapangan, manajer_futsal, supervisor_sistem]
 *           description: Role pengguna dalam sistem
 *           example: "penyewa"
 *         is_active:
 *           type: boolean
 *           description: Status aktif pengguna
 *           example: true
 *         email_verified:
 *           type: boolean
 *           description: Status verifikasi email
 *           example: true
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Tanggal pembuatan akun
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Tanggal update terakhir
 *     
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: Email pengguna
 *           example: "customer@example.com"
 *         password:
 *           type: string
 *           format: password
 *           description: Password pengguna
 *           example: "password123"
 *     
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - name
 *         - phone
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: "Email pengguna (harus unique)"
 *           example: "newuser@example.com"
 *         password:
 *           type: string
 *           format: password
 *           minLength: 6
 *           description: "Password pengguna (minimal 6 karakter)"
 *           example: "password123"
 *         name:
 *           type: string
 *           description: Nama lengkap pengguna
 *           example: "John Doe"
 *         phone:
 *           type: string
 *           description: Nomor telepon pengguna
 *           example: "081234567890"
 *         role:
 *           type: string
 *           enum: [penyewa, staff_kasir, operator_lapangan, manajer_futsal]
 *           description: "Role yang diinginkan (default: penyewa)"
 *           example: "penyewa"
 *     
 *     AuthResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Login berhasil"
 *         data:
 *           type: object
 *           properties:
 *             user:
 *               $ref: '#/components/schemas/User'
 *             token:
 *               type: string
 *               description: "JWT token (hanya untuk development)"
 *               example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     
 *     ChangePasswordRequest:
 *       type: object
 *       required:
 *         - currentPassword
 *         - newPassword
 *       properties:
 *         currentPassword:
 *           type: string
 *           format: password
 *           description: Password saat ini
 *           example: "oldpassword123"
 *         newPassword:
 *           type: string
 *           format: password
 *           minLength: 6
 *           description: "Password baru (minimal 6 karakter)"
 *           example: "newpassword123"
 *     
 *     ForgotPasswordRequest:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: Email pengguna yang lupa password
 *           example: "user@example.com"
 *     
 *     ResetPasswordRequest:
 *       type: object
 *       required:
 *         - token
 *         - newPassword
 *       properties:
 *         token:
 *           type: string
 *           description: Token reset password dari email
 *           example: "reset_token_123456"
 *         newPassword:
 *           type: string
 *           format: password
 *           minLength: 6
 *           description: Password baru
 *           example: "newpassword123"
 *   
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: token
 *   
 *   responses:
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
 *                 example: "Token tidak valid"
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
 *                 example: "Akses ditolak"
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
 *     Conflict:
 *       description: "Konflik data (email sudah terdaftar)"
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
 */

/**
 * @swagger
 * tags:
 *   - name: Authentication
 *     description: Endpoint untuk autentikasi dan manajemen akun pengguna
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Authentication]
 *     summary: Register pengguna baru ⚪ PUBLIC
 *     description: Endpoint untuk mendaftarkan pengguna baru dengan role default penyewa
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *           examples:
 *             customer:
 *               summary: Registrasi Customer
 *               value:
 *                 email: "customer@example.com"
 *                 password: "password123"
 *                 name: "John Customer"
 *                 phone: "081234567890"
 *                 role: "penyewa"
 *             staff:
 *               summary: Registrasi Staff
 *               value:
 *                 email: "staff@example.com"
 *                 password: "password123"
 *                 name: "Jane Staff"
 *                 phone: "081234567891"
 *                 role: "staff_kasir"
 *     responses:
 *       201:
 *         description: Registrasi berhasil
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: Login pengguna ⚪ PUBLIC
 *     description: Endpoint untuk autentikasi pengguna dengan email dan password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           examples:
 *             customer:
 *               summary: Login Customer
 *               value:
 *                 email: "customer@example.com"
 *                 password: "password123"
 *             staff:
 *               summary: Login Staff
 *               value:
 *                 email: "staff@example.com"
 *                 password: "password123"
 *     responses:
 *       200:
 *         description: Login berhasil
 *         headers:
 *           Set-Cookie:
 *             description: HttpOnly cookie dengan JWT token
 *             schema:
 *               type: string
 *               example: "token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; Secure; SameSite=Strict"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         description: Email atau password salah
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Password salah"
 */

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags: [Authentication]
 *     summary: Logout pengguna 🔵 AUTHENTICATED
 *     description: Endpoint untuk logout pengguna dan menghapus session/token
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Logout berhasil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Logout berhasil"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     tags: [Authentication]
 *     summary: Get profil pengguna 🔵 AUTHENTICATED
 *     description: Endpoint untuk mendapatkan profil pengguna yang sedang login
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Profil pengguna berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     tags: [Authentication]
 *     summary: Refresh JWT token 🔵 AUTHENTICATED
 *     description: Endpoint untuk memperbarui JWT token yang akan expired
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Token berhasil diperbarui
 *         headers:
 *           Set-Cookie:
 *             description: HttpOnly cookie dengan JWT token baru
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Token berhasil diperbarui"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     token:
 *                       type: string
 *                       description: "JWT token baru (development only)"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */

/**
 * @swagger
 * /api/auth/roles:
 *   get:
 *     tags: [Authentication]
 *     summary: Mendapatkan daftar role sistem ⚪ PUBLIC
 *     description: Endpoint untuk mendapatkan semua role yang tersedia dalam sistem enhanced 6-level hierarchy
 *     responses:
 *       200:
 *         description: Daftar role berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     roles:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           value:
 *                             type: string
 *                             example: "penyewa"
 *                           label:
 *                             type: string
 *                             example: "Customer (Penyewa)"
 *                           level:
 *                             type: integer
 *                             example: 2
 *                           description:
 *                             type: string
 *                             example: "Customer yang menyewa lapangan"
 *                     hierarchy:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: "[""pengunjung", "penyewa", "staff_kasir", "operator_lapangan", "manajer_futsal", "supervisor_sistem"]
 */

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     tags: [Authentication]
 *     summary: Ubah password pengguna 🔵 AUTHENTICATED
 *     description: Endpoint untuk mengubah password pengguna yang sedang login
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordRequest'
 *     responses:
 *       200:
 *         description: Password berhasil diubah
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Password berhasil diubah"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */

/**
 * @swagger
 * /api/auth/verify:
 *   get:
 *     tags: [Authentication]
 *     summary: Verify authentication status 🔵 AUTHENTICATED
 *     description: Endpoint untuk memverifikasi status autentikasi pengguna
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Token valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Token is valid"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     tags: [Authentication]
 *     summary: Request reset password ⚪ PUBLIC
 *     description: Endpoint untuk meminta reset password melalui email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ForgotPasswordRequest'
 *     responses:
 *       200:
 *         description: Email reset password berhasil dikirim
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Email reset password telah dikirim"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

module.exports = {};
