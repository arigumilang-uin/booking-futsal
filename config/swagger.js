// config/swagger.js - Konfigurasi Swagger/OpenAPI Documentation
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

/**
 * Konfigurasi dasar Swagger/OpenAPI
 */
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Enhanced Futsal Booking System API',
      version: '2.0.0',
      description: `
        API untuk sistem booking lapangan futsal dengan fitur lengkap:
        - Sistem autentikasi dan otorisasi berbasis role (6-level hierarchy)
        - Manajemen booking dengan deteksi konflik real-time
        - Sistem pembayaran multi-metode dengan auto-generation
        - Notifikasi real-time dan audit trail
        - Analytics dan reporting untuk business intelligence
        - Auto-completion booking dengan cron jobs
        - Enhanced features: reviews, favorites, promotions
        
        **Role Hierarchy:**
        1. pengunjung (Guest) - Public access
        2. penyewa (Customer) - Booking and payment
        3. staff_kasir (Cashier) - Payment processing
        4. operator_lapangan (Field Operator) - Field management
        5. manajer_futsal (Manager) - Business analytics
        6. supervisor_sistem (System Supervisor) - Full system access
      `,
      contact: {
        name: 'Enhanced Futsal Booking System',
        email: 'admin@futsalbooking.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'https://booking-futsal-production.up.railway.app',
        description: 'Production Server (Railway)'
      },
      {
        url: 'http://localhost:5000',
        description: 'Development Server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token untuk autentikasi. Format: Bearer <token>'
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'token',
          description: 'JWT token dalam cookie (HttpOnly)'
        }
      },
      schemas: {
        // User Schema
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', description: 'ID unik user' },
            uuid: { type: 'string', format: 'uuid', description: 'UUID user' },
            name: { type: 'string', description: 'Nama lengkap user' },
            email: { type: 'string', format: 'email', description: 'Email user' },
            phone: { type: 'string', description: 'Nomor telepon user' },
            role: { 
              type: 'string', 
              enum: ['pengunjung', 'penyewa', 'staff_kasir', 'operator_lapangan', 'manajer_futsal', 'supervisor_sistem'],
              description: 'Role user dalam sistem enhanced 6-level hierarchy'
            },
            employee_id: { type: 'string', nullable: true, description: 'ID karyawan (untuk staff)' },
            department: { type: 'string', nullable: true, description: 'Departemen (untuk staff)' },
            hire_date: { type: 'string', format: 'date', nullable: true, description: 'Tanggal bergabung (untuk staff)' },
            is_active: { type: 'boolean', description: 'Status aktif user' },
            is_verified: { type: 'boolean', description: 'Status verifikasi email' },
            last_login_at: { type: 'string', format: 'date-time', nullable: true, description: 'Waktu login terakhir' },
            created_at: { type: 'string', format: 'date-time', description: 'Waktu pembuatan akun' },
            updated_at: { type: 'string', format: 'date-time', description: 'Waktu update terakhir' }
          }
        },

        // Field Schema
        Field: {
          type: 'object',
          properties: {
            id: { type: 'integer', description: 'ID unik lapangan' },
            uuid: { type: 'string', format: 'uuid', description: 'UUID lapangan' },
            name: { type: 'string', description: 'Nama lapangan' },
            type: { 
              type: 'string', 
              enum: ['futsal', 'mini_soccer', 'basketball'],
              description: 'Jenis lapangan'
            },
            description: { type: 'string', description: 'Deskripsi lapangan' },
            facilities: { 
              type: 'array', 
              items: { type: 'string' },
              description: 'Fasilitas yang tersedia',
              example: ['parking', 'toilet', 'canteen', 'shower', 'wifi', 'ac', 'sound_system', 'tribun']
            },
            capacity: { type: 'integer', description: 'Kapasitas maksimal pemain' },
            location: { type: 'string', description: 'Lokasi lapangan' },
            address: { type: 'string', description: 'Alamat lengkap' },
            coordinates: {
              type: 'object',
              properties: {
                lat: { type: 'number', description: 'Latitude' },
                lng: { type: 'number', description: 'Longitude' }
              }
            },
            price: { type: 'string', description: 'Harga per jam (weekday)' },
            price_weekend: { type: 'string', description: 'Harga per jam (weekend)' },
            price_member: { type: 'string', description: 'Harga member (diskon)' },
            operating_hours: {
              type: 'object',
              properties: {
                start: { type: 'string', example: '09:00', description: 'Jam buka' },
                end: { type: 'string', example: '24:00', description: 'Jam tutup' }
              }
            },
            operating_days: {
              type: 'array',
              items: { type: 'string' },
              example: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
              description: 'Hari operasional'
            },
            rating: { type: 'string', description: 'Rating rata-rata' },
            total_reviews: { type: 'integer', description: 'Total review' },
            is_active: { type: 'boolean', description: 'Status aktif lapangan' },
            created_at: { type: 'string', format: 'date-time', description: 'Waktu pembuatan' },
            updated_at: { type: 'string', format: 'date-time', description: 'Waktu update terakhir' }
          }
        },

        // Booking Schema
        Booking: {
          type: 'object',
          properties: {
            id: { type: 'integer', description: 'ID unik booking' },
            uuid: { type: 'string', format: 'uuid', description: 'UUID booking' },
            booking_number: { type: 'string', example: 'BK-20241201-001', description: 'Nomor booking auto-generated' },
            user_id: { type: 'integer', description: 'ID user yang booking' },
            field_id: { type: 'integer', description: 'ID lapangan' },
            date: { type: 'string', format: 'date', description: 'Tanggal booking' },
            start_time: { type: 'string', example: '10:00', description: 'Waktu mulai (HH:MM)' },
            end_time: { type: 'string', example: '12:00', description: 'Waktu selesai (HH:MM)' },
            duration_hours: { type: 'number', description: 'Durasi dalam jam' },
            name: { type: 'string', description: 'Nama pemesan' },
            phone: { type: 'string', description: 'Nomor telepon pemesan' },
            email: { type: 'string', format: 'email', nullable: true, description: 'Email pemesan' },
            notes: { type: 'string', nullable: true, description: 'Catatan tambahan' },
            base_amount: { type: 'string', description: 'Harga dasar' },
            discount_amount: { type: 'string', description: 'Jumlah diskon' },
            admin_fee: { type: 'string', description: 'Biaya admin' },
            total_amount: { type: 'string', description: 'Total pembayaran' },
            status: { 
              type: 'string', 
              enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'],
              description: 'Status booking'
            },
            payment_status: { 
              type: 'string', 
              enum: ['pending', 'paid', 'failed', 'refunded'],
              description: 'Status pembayaran'
            },
            confirmed_at: { type: 'string', format: 'date-time', nullable: true, description: 'Waktu konfirmasi' },
            confirmed_by: { type: 'integer', nullable: true, description: 'ID staff yang konfirmasi' },
            completed_at: { type: 'string', format: 'date-time', nullable: true, description: 'Waktu selesai' },
            completed_by: { type: 'string', nullable: true, description: 'Yang menyelesaikan (user/system)' },
            cancelled_at: { type: 'string', format: 'date-time', nullable: true, description: 'Waktu dibatalkan' },
            cancelled_by: { type: 'integer', nullable: true, description: 'ID yang membatalkan' },
            cancellation_reason: { type: 'string', nullable: true, description: 'Alasan pembatalan' },
            created_at: { type: 'string', format: 'date-time', description: 'Waktu pembuatan booking' },
            updated_at: { type: 'string', format: 'date-time', description: 'Waktu update terakhir' }
          }
        },

        // Response Schemas
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', description: 'Pesan sukses' },
            data: { type: 'object', description: 'Data response' }
          }
        },

        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', description: 'Pesan error' },
            error: { type: 'string', description: 'Detail error' }
          }
        },

        // Pagination Schema
        PaginationMeta: {
          type: 'object',
          properties: {
            current_page: { type: 'integer', description: 'Halaman saat ini' },
            per_page: { type: 'integer', description: 'Item per halaman' },
            total: { type: 'integer', description: 'Total item' },
            total_pages: { type: 'integer', description: 'Total halaman' }
          }
        },

        // Pagination Schema (alias untuk kompatibilitas)
        Pagination: {
          type: 'object',
          properties: {
            current_page: { type: 'integer', description: 'Halaman saat ini', example: 1 },
            per_page: { type: 'integer', description: 'Jumlah item per halaman', example: 10 },
            total: { type: 'integer', description: 'Total item', example: 100 },
            total_pages: { type: 'integer', description: 'Total halaman', example: 10 },
            has_next: { type: 'boolean', description: 'Apakah ada halaman selanjutnya', example: true },
            has_prev: { type: 'boolean', description: 'Apakah ada halaman sebelumnya', example: false }
          }
        }
      },
      responses: {
        BadRequest: {
          description: 'Bad Request - Input tidak valid',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        },
        Unauthorized: {
          description: 'Unauthorized - Token tidak valid atau tidak ada',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        },
        Forbidden: {
          description: 'Forbidden - Tidak memiliki akses',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        },
        NotFound: {
          description: 'Not Found - Resource tidak ditemukan',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        },
        Conflict: {
          description: 'Conflict - Data sudah ada atau konflik',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        },
        InternalServerError: {
          description: 'Internal Server Error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'Endpoint untuk autentikasi dan manajemen akun'
      },
      {
        name: 'Public',
        description: 'Endpoint publik yang dapat diakses tanpa autentikasi'
      },
      {
        name: 'Customer',
        description: 'Endpoint untuk customer (penyewa) - Level 2'
      },
      {
        name: 'Staff',
        description: 'Endpoint untuk staff (kasir, operator, manager) - Level 3-5'
      },
      {
        name: 'Admin',
        description: 'Endpoint untuk administrator sistem - Level 6'
      },
      {
        name: 'Enhanced Features',
        description: 'Fitur tambahan: notifikasi, review, favorit, promosi'
      }
    ]
  },
  apis: [
    './routes/authRoutes.js',
    './routes/publicRoutes.js',
    './routes/customerRoutes.js',
    './routes/kasirRoutes.js',
    './routes/operatorRoutes.js',
    './routes/manajerRoutes.js',
    './routes/supervisorRoutes.js',
    './routes/adminRoutes.js',
    './routes/*.js',
    './controllers/**/*.js'
  ]
};

/**
 * Generate spesifikasi Swagger
 */
const specs = swaggerJsdoc(swaggerOptions);

/**
 * Konfigurasi Swagger UI
 */
const swaggerUiOptions = {
  explorer: true,
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    docExpansion: 'none'
  },
  customCss: `
    .swagger-ui .topbar { display: none; }
    .swagger-ui .info { margin: 20px 0; }
    .swagger-ui .scheme-container { margin: 20px 0; }
    .swagger-ui .info .title { color: #2c3e50; }
    .swagger-ui .info .description { color: #34495e; }
  `,
  customSiteTitle: 'Enhanced Futsal Booking API Documentation'
};

module.exports = {
  specs,
  swaggerUi,
  swaggerUiOptions
};
