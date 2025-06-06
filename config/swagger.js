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

        // Payment Schema
        Payment: {
          type: 'object',
          properties: {
            id: { type: 'integer', description: 'ID unik payment' },
            uuid: { type: 'string', format: 'uuid', description: 'UUID payment' },
            payment_number: { type: 'string', example: 'PAY-20241201-001', description: 'Nomor payment auto-generated' },
            booking_id: { type: 'integer', description: 'ID booking terkait' },
            amount: { type: 'string', description: 'Jumlah pembayaran' },
            method: {
              type: 'string',
              enum: ['cash', 'bank_transfer', 'debit_card', 'credit_card', 'e_wallet', 'qris'],
              description: 'Metode pembayaran'
            },
            status: {
              type: 'string',
              enum: ['pending', 'paid', 'failed', 'refunded'],
              description: 'Status pembayaran'
            },
            reference_number: { type: 'string', nullable: true, description: 'Nomor referensi pembayaran' },
            notes: { type: 'string', nullable: true, description: 'Catatan pembayaran' },
            processed_by: { type: 'integer', nullable: true, description: 'ID staff yang memproses' },
            processed_at: { type: 'string', format: 'date-time', nullable: true, description: 'Waktu diproses' },
            created_at: { type: 'string', format: 'date-time', description: 'Waktu pembuatan' },
            updated_at: { type: 'string', format: 'date-time', description: 'Waktu update terakhir' }
          }
        },

        // Notification Schema
        Notification: {
          type: 'object',
          properties: {
            id: { type: 'integer', description: 'ID unik notification' },
            uuid: { type: 'string', format: 'uuid', description: 'UUID notification' },
            user_id: { type: 'integer', description: 'ID user penerima' },
            title: { type: 'string', description: 'Judul notifikasi' },
            message: { type: 'string', description: 'Isi notifikasi' },
            type: {
              type: 'string',
              enum: ['booking', 'payment', 'system', 'promotion', 'reminder'],
              description: 'Tipe notifikasi'
            },
            priority: {
              type: 'string',
              enum: ['low', 'normal', 'high', 'urgent'],
              description: 'Prioritas notifikasi'
            },
            is_read: { type: 'boolean', description: 'Status sudah dibaca' },
            read_at: { type: 'string', format: 'date-time', nullable: true, description: 'Waktu dibaca' },
            data: { type: 'object', nullable: true, description: 'Data tambahan notifikasi' },
            created_at: { type: 'string', format: 'date-time', description: 'Waktu pembuatan' }
          }
        },

        // Review Schema
        Review: {
          type: 'object',
          properties: {
            id: { type: 'integer', description: 'ID unik review' },
            uuid: { type: 'string', format: 'uuid', description: 'UUID review' },
            user_id: { type: 'integer', description: 'ID user yang review' },
            field_id: { type: 'integer', description: 'ID lapangan yang direview' },
            booking_id: { type: 'integer', description: 'ID booking terkait' },
            rating: { type: 'integer', minimum: 1, maximum: 5, description: 'Rating 1-5 bintang' },
            comment: { type: 'string', nullable: true, description: 'Komentar review' },
            photos: {
              type: 'array',
              items: { type: 'string' },
              description: 'URL foto review'
            },
            is_approved: { type: 'boolean', description: 'Status persetujuan review' },
            approved_by: { type: 'integer', nullable: true, description: 'ID staff yang approve' },
            approved_at: { type: 'string', format: 'date-time', nullable: true, description: 'Waktu diapprove' },
            created_at: { type: 'string', format: 'date-time', description: 'Waktu pembuatan' },
            updated_at: { type: 'string', format: 'date-time', description: 'Waktu update terakhir' }
          }
        },

        // Promotion Schema
        Promotion: {
          type: 'object',
          properties: {
            id: { type: 'integer', description: 'ID unik promotion' },
            uuid: { type: 'string', format: 'uuid', description: 'UUID promotion' },
            name: { type: 'string', description: 'Nama promosi' },
            description: { type: 'string', description: 'Deskripsi promosi' },
            code: { type: 'string', description: 'Kode promosi' },
            type: {
              type: 'string',
              enum: ['percentage', 'fixed_amount'],
              description: 'Tipe diskon'
            },
            value: { type: 'number', description: 'Nilai diskon' },
            min_booking_amount: { type: 'string', description: 'Minimum amount booking' },
            max_usage: { type: 'integer', nullable: true, description: 'Maksimal penggunaan' },
            current_usage: { type: 'integer', default: 0, description: 'Penggunaan saat ini' },
            valid_from: { type: 'string', format: 'date', description: 'Tanggal mulai berlaku' },
            valid_until: { type: 'string', format: 'date', description: 'Tanggal berakhir' },
            applicable_fields: {
              type: 'array',
              items: { type: 'integer' },
              description: 'ID lapangan yang berlaku'
            },
            applicable_days: {
              type: 'array',
              items: { type: 'string' },
              description: 'Hari yang berlaku'
            },
            is_active: { type: 'boolean', description: 'Status aktif promosi' },
            created_by: { type: 'integer', description: 'ID user yang membuat' },
            created_at: { type: 'string', format: 'date-time', description: 'Waktu pembuatan' },
            updated_at: { type: 'string', format: 'date-time', description: 'Waktu update terakhir' }
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
    './routes/*.js',
    './controllers/**/*.js',
    './docs/swagger/*.yaml'
  ],
  // Complete paths documentation
  paths: {
    // =====================================================
    // HEALTH & SYSTEM ENDPOINTS
    // =====================================================
    '/health': {
      get: {
        tags: ['Public'],
        summary: 'Health check sistem',
        description: 'Endpoint untuk mengecek status kesehatan sistem dan database',
        responses: {
          200: {
            description: 'Sistem sehat',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'healthy' },
                    timestamp: { type: 'string', format: 'date-time' },
                    environment: { type: 'string', example: 'production' },
                    database: { type: 'string', example: 'connected' },
                    uptime: { type: 'integer', description: 'Uptime dalam detik' },
                    version: { type: 'string', example: '2.0.0' }
                  }
                }
              }
            }
          },
          503: {
            description: 'Sistem tidak sehat',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'unhealthy' },
                    error: { type: 'string' },
                    timestamp: { type: 'string', format: 'date-time' }
                  }
                }
              }
            }
          }
        }
      }
    },

    '/api/public/system-info': {
      get: {
        tags: ['Public'],
        summary: 'Mendapatkan informasi sistem',
        description: 'Endpoint untuk mendapatkan informasi sistem dan fitur yang tersedia',
        responses: {
          200: {
            description: 'Informasi sistem berhasil diambil',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        app_name: { type: 'string', example: 'Enhanced Futsal Booking System' },
                        version: { type: 'string', example: '2.0.0' },
                        api_version: { type: 'string', example: 'v1' },
                        enhanced_role_system: { type: 'boolean', example: true },
                        supported_roles: {
                          type: 'array',
                          items: { type: 'string' },
                          example: ['pengunjung', 'penyewa', 'staff_kasir', 'operator_lapangan', 'manajer_futsal', 'supervisor_sistem']
                        },
                        features: {
                          type: 'array',
                          items: { type: 'string' },
                          example: ['role_based_access', 'auto_generation', 'conflict_detection', 'payment_gateway_ready', 'audit_trail', 'jsonb_support']
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },

    // =====================================================
    // PUBLIC ENDPOINTS
    // =====================================================
    '/api/public/fields': {
      get: {
        tags: ['Public'],
        summary: 'Mendapatkan daftar lapangan yang tersedia',
        description: 'Endpoint publik untuk mendapatkan semua lapangan futsal dengan informasi lengkap',
        parameters: [
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', default: 1 },
            description: 'Nomor halaman'
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 10 },
            description: 'Jumlah item per halaman'
          },
          {
            name: 'search',
            in: 'query',
            schema: { type: 'string' },
            description: 'Kata kunci pencarian'
          },
          {
            name: 'type',
            in: 'query',
            schema: { type: 'string', enum: ['futsal', 'mini_soccer', 'basketball'] },
            description: 'Filter berdasarkan jenis lapangan'
          },
          {
            name: 'location',
            in: 'query',
            schema: { type: 'string' },
            description: 'Filter berdasarkan lokasi'
          }
        ],
        responses: {
          200: {
            description: 'Daftar lapangan berhasil diambil',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Daftar lapangan berhasil diambil' },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Field' }
                    },
                    pagination: { $ref: '#/components/schemas/PaginationMeta' }
                  }
                }
              }
            }
          },
          500: { $ref: '#/components/responses/InternalServerError' }
        }
      }
    },

    '/api/public/fields/{id}': {
      get: {
        tags: ['Public'],
        summary: 'Mendapatkan detail lapangan',
        description: 'Endpoint untuk mendapatkan detail lapangan berdasarkan ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'ID lapangan'
          }
        ],
        responses: {
          200: {
            description: 'Detail lapangan berhasil diambil',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Field' }
                  }
                }
              }
            }
          },
          404: { $ref: '#/components/responses/NotFound' },
          500: { $ref: '#/components/responses/InternalServerError' }
        }
      }
    },

    '/api/public/fields/{id}/availability': {
      get: {
        tags: ['Public'],
        summary: 'Cek ketersediaan lapangan',
        description: 'Endpoint untuk mengecek ketersediaan lapangan pada tanggal tertentu',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'ID lapangan'
          },
          {
            name: 'date',
            in: 'query',
            required: true,
            schema: { type: 'string', format: 'date' },
            description: 'Tanggal yang ingin dicek (YYYY-MM-DD)'
          }
        ],
        responses: {
          200: {
            description: 'Ketersediaan lapangan berhasil diambil',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        field_id: { type: 'integer' },
                        date: { type: 'string', format: 'date' },
                        available_slots: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              start_time: { type: 'string', example: '09:00' },
                              end_time: { type: 'string', example: '10:00' },
                              is_available: { type: 'boolean' },
                              price: { type: 'string' }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          404: { $ref: '#/components/responses/NotFound' },
          500: { $ref: '#/components/responses/InternalServerError' }
        }
      }
    },

    // =====================================================
    // AUTHENTICATION ENDPOINTS
    // =====================================================
    '/api/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register pengguna baru',
        description: 'Endpoint untuk mendaftarkan pengguna baru dengan role default penyewa',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password', 'phone'],
                properties: {
                  name: { type: 'string', example: 'John Doe', description: 'Nama lengkap' },
                  email: { type: 'string', format: 'email', example: 'john@example.com', description: 'Email unik' },
                  password: { type: 'string', example: 'password123', description: 'Password minimal 6 karakter' },
                  phone: { type: 'string', example: '081234567890', description: 'Nomor telepon' },
                  role: { type: 'string', enum: ['user', 'penyewa'], default: 'user', description: 'Role (opsional)' }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Registrasi berhasil',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Registration successful' },
                    user: { $ref: '#/components/schemas/User' },
                    token: { type: 'string', description: 'JWT token (development only)' }
                  }
                }
              }
            }
          },
          400: { $ref: '#/components/responses/BadRequest' },
          409: { $ref: '#/components/responses/Conflict' }
        }
      }
    },

    '/api/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Login pengguna',
        description: 'Endpoint untuk autentikasi pengguna dengan email dan password',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'ppwweebb01@gmail.com', description: 'Email pengguna' },
                  password: { type: 'string', example: 'password123', description: 'Password pengguna' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Login berhasil',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Login berhasil' },
                    data: {
                      type: 'object',
                      properties: {
                        token: { type: 'string', description: 'JWT token' },
                        user: { $ref: '#/components/schemas/User' }
                      }
                    }
                  }
                }
              }
            }
          },
          400: {
            description: 'Password salah atau email tidak ditemukan',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    error: { type: 'string', example: 'Password salah' }
                  }
                }
              }
            }
          }
        }
      }
    },

    '/api/auth/logout': {
      post: {
        tags: ['Authentication'],
        summary: 'Logout pengguna',
        description: 'Endpoint untuk logout dan menghapus cookie token',
        responses: {
          200: {
            description: 'Logout berhasil',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Logout successful' }
                  }
                }
              }
            }
          }
        }
      }
    },

    '/api/auth/profile': {
      get: {
        tags: ['Authentication'],
        summary: 'Get profil pengguna',
        description: 'Endpoint untuk mendapatkan profil pengguna yang sedang login',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: {
          200: {
            description: 'Profil berhasil diambil',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/User' }
                  }
                }
              }
            }
          },
          401: { $ref: '#/components/responses/Unauthorized' }
        }
      }
    },

    '/api/auth/roles': {
      get: {
        tags: ['Authentication'],
        summary: 'Mendapatkan daftar role sistem',
        description: 'Endpoint untuk mendapatkan informasi role yang tersedia dalam sistem enhanced 6-level hierarchy',
        responses: {
          200: {
            description: 'Daftar role berhasil diambil',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        roles: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              value: { type: 'string', example: 'user' },
                              label: { type: 'string', example: 'Customer' },
                              description: { type: 'string', example: 'Regular customer who can book fields' },
                              level: { type: 'integer', example: 2 }
                            }
                          }
                        },
                        enhanced_roles: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              value: { type: 'string', example: 'penyewa' },
                              label: { type: 'string', example: 'Customer' },
                              description: { type: 'string', example: 'Customer who can book fields' },
                              level: { type: 'integer', example: 2 }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },

    // =====================================================
    // CUSTOMER ENDPOINTS
    // =====================================================
    '/api/customer/bookings': {
      get: {
        tags: ['Customer'],
        summary: 'Get daftar booking customer',
        description: 'Endpoint untuk mendapatkan semua booking milik customer yang sedang login',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', default: 1 },
            description: 'Nomor halaman'
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 10 },
            description: 'Jumlah item per halaman'
          },
          {
            name: 'status',
            in: 'query',
            schema: { type: 'string', enum: ['pending', 'confirmed', 'completed', 'cancelled'] },
            description: 'Filter berdasarkan status booking'
          }
        ],
        responses: {
          200: {
            description: 'Daftar booking berhasil diambil',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Booking' }
                    },
                    pagination: { $ref: '#/components/schemas/PaginationMeta' }
                  }
                }
              }
            }
          },
          401: { $ref: '#/components/responses/Unauthorized' }
        }
      },
      post: {
        tags: ['Customer'],
        summary: 'Buat booking baru',
        description: 'Endpoint untuk membuat booking lapangan baru',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['field_id', 'date', 'start_time', 'end_time', 'name', 'phone'],
                properties: {
                  field_id: { type: 'integer', example: 1, description: 'ID lapangan' },
                  date: { type: 'string', format: 'date', example: '2024-12-01', description: 'Tanggal booking' },
                  start_time: { type: 'string', example: '10:00', description: 'Waktu mulai (HH:MM)' },
                  end_time: { type: 'string', example: '12:00', description: 'Waktu selesai (HH:MM)' },
                  name: { type: 'string', example: 'John Doe', description: 'Nama pemesan' },
                  phone: { type: 'string', example: '081234567890', description: 'Nomor telepon' },
                  email: { type: 'string', format: 'email', example: 'john@example.com', description: 'Email (opsional)' },
                  notes: { type: 'string', example: 'Booking untuk turnamen', description: 'Catatan tambahan' }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Booking berhasil dibuat',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Booking created successfully' },
                    data: { $ref: '#/components/schemas/Booking' }
                  }
                }
              }
            }
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          409: {
            description: 'Konflik waktu booking',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    error: { type: 'string', example: 'Time slot already booked' }
                  }
                }
              }
            }
          }
        }
      }
    },

    '/api/customer/bookings/{id}': {
      get: {
        tags: ['Customer'],
        summary: 'Get detail booking',
        description: 'Endpoint untuk mendapatkan detail booking berdasarkan ID',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'ID booking'
          }
        ],
        responses: {
          200: {
            description: 'Detail booking berhasil diambil',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Booking' }
                  }
                }
              }
            }
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' }
        }
      },
      delete: {
        tags: ['Customer'],
        summary: 'Cancel booking',
        description: 'Endpoint untuk membatalkan booking',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'ID booking'
          }
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  reason: { type: 'string', description: 'Alasan pembatalan' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Booking berhasil dibatalkan',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Booking cancelled successfully' }
                  }
                }
              }
            }
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' }
        }
      }
    },

    // =====================================================
    // STAFF KASIR ENDPOINTS
    // =====================================================
    '/api/staff/kasir/dashboard': {
      get: {
        tags: ['Staff'],
        summary: 'Dashboard kasir',
        description: 'Endpoint untuk mendapatkan dashboard kasir dengan informasi pembayaran',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: {
          200: {
            description: 'Dashboard kasir berhasil diambil',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        staff_info: {
                          type: 'object',
                          properties: {
                            name: { type: 'string', example: 'Jane Doe' },
                            employee_id: { type: 'string', example: 'EMP001' },
                            department: { type: 'string', example: 'Cashier' },
                            role: { type: 'string', example: 'Kasir' }
                          }
                        },
                        today_summary: {
                          type: 'object',
                          properties: {
                            date: { type: 'string', format: 'date' },
                            total_transactions: { type: 'integer', example: 15 },
                            total_amount: { type: 'number', example: 1500000 },
                            pending_payments: { type: 'integer', example: 5 },
                            cash_payments: { type: 'integer', example: 8 },
                            digital_payments: { type: 'integer', example: 7 }
                          }
                        },
                        recent_transactions: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/Payment' }
                        },
                        pending_payments: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/Payment' }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' }
        }
      }
    },

    '/api/staff/kasir/payments': {
      get: {
        tags: ['Staff'],
        summary: 'Get daftar pembayaran untuk kasir',
        description: 'Endpoint untuk mendapatkan semua pembayaran yang perlu diproses kasir',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', default: 1 },
            description: 'Nomor halaman'
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 10 },
            description: 'Jumlah item per halaman'
          },
          {
            name: 'status',
            in: 'query',
            schema: { type: 'string', enum: ['pending', 'paid', 'failed'] },
            description: 'Filter berdasarkan status pembayaran'
          },
          {
            name: 'method',
            in: 'query',
            schema: { type: 'string', enum: ['cash', 'bank_transfer', 'debit_card'] },
            description: 'Filter berdasarkan metode pembayaran'
          }
        ],
        responses: {
          200: {
            description: 'Daftar pembayaran berhasil diambil',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Payment' }
                    },
                    pagination: { $ref: '#/components/schemas/PaginationMeta' }
                  }
                }
              }
            }
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' }
        }
      }
    },

    '/api/staff/kasir/payments/manual': {
      post: {
        tags: ['Staff'],
        summary: 'Proses pembayaran manual',
        description: 'Endpoint untuk memproses pembayaran manual (cash, transfer)',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['booking_id', 'method', 'amount'],
                properties: {
                  booking_id: { type: 'integer', example: 1, description: 'ID booking' },
                  method: { type: 'string', enum: ['cash', 'bank_transfer', 'debit_card'], description: 'Metode pembayaran' },
                  amount: { type: 'string', example: '200000.00', description: 'Jumlah pembayaran' },
                  reference_number: { type: 'string', example: 'TRF123456', description: 'Nomor referensi (untuk non-cash)' },
                  notes: { type: 'string', description: 'Catatan pembayaran' }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Pembayaran berhasil diproses',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Payment processed successfully' },
                    data: { $ref: '#/components/schemas/Payment' }
                  }
                }
              }
            }
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' }
        }
      }
    },

    // =====================================================
    // STAFF OPERATOR ENDPOINTS
    // =====================================================
    '/api/staff/operator/dashboard': {
      get: {
        tags: ['Staff'],
        summary: 'Dashboard operator lapangan',
        description: 'Endpoint untuk mendapatkan dashboard operator dengan informasi lapangan yang ditugaskan',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: {
          200: {
            description: 'Dashboard operator berhasil diambil',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        staff_info: {
                          type: 'object',
                          properties: {
                            name: { type: 'string', example: 'John Smith' },
                            employee_id: { type: 'string', example: 'EMP002' },
                            department: { type: 'string', example: 'Operations' },
                            role: { type: 'string', example: 'Operator Lapangan' }
                          }
                        },
                        today_schedule: {
                          type: 'object',
                          properties: {
                            date: { type: 'string', format: 'date' },
                            total_bookings: { type: 'integer', example: 12 },
                            confirmed_bookings: { type: 'integer', example: 10 },
                            pending_bookings: { type: 'integer', example: 2 },
                            completed_bookings: { type: 'integer', example: 5 }
                          }
                        },
                        assigned_fields: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              id: { type: 'integer', example: 1 },
                              name: { type: 'string', example: 'Lapangan A' },
                              status: { type: 'string', example: 'active' },
                              current_booking: {
                                type: 'object',
                                nullable: true,
                                properties: {
                                  booking_number: { type: 'string', example: 'BK-20241201-001' },
                                  customer_name: { type: 'string', example: 'John Doe' },
                                  start_time: { type: 'string', example: '10:00' },
                                  end_time: { type: 'string', example: '12:00' }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' }
        }
      }
    },

    '/api/staff/operator/bookings/{id}/confirm': {
      put: {
        tags: ['Staff'],
        summary: 'Konfirmasi booking',
        description: 'Endpoint untuk mengkonfirmasi booking oleh operator lapangan',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'ID booking'
          }
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  notes: { type: 'string', description: 'Catatan konfirmasi' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Booking berhasil dikonfirmasi',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Booking confirmed successfully' },
                    data: { $ref: '#/components/schemas/Booking' }
                  }
                }
              }
            }
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' }
        }
      }
    },

    // =====================================================
    // STAFF MANAGER ENDPOINTS
    // =====================================================
    '/api/staff/manager/dashboard': {
      get: {
        tags: ['Staff'],
        summary: 'Dashboard manager',
        description: 'Endpoint untuk mendapatkan dashboard manager dengan analytics dan overview bisnis',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: {
          200: {
            description: 'Dashboard manager berhasil diambil',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        business_overview: {
                          type: 'object',
                          properties: {
                            today_revenue: { type: 'number', example: 2500000 },
                            today_bookings: { type: 'integer', example: 25 },
                            active_fields: { type: 'integer', example: 4 },
                            total_customers: { type: 'integer', example: 150 }
                          }
                        },
                        monthly_stats: {
                          type: 'object',
                          properties: {
                            total_revenue: { type: 'number', example: 75000000 },
                            total_bookings: { type: 'integer', example: 750 },
                            average_booking_value: { type: 'number', example: 100000 },
                            customer_growth: { type: 'number', example: 15.5 }
                          }
                        },
                        field_performance: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              field_name: { type: 'string', example: 'Lapangan A' },
                              utilization_rate: { type: 'number', example: 85.5 },
                              revenue: { type: 'number', example: 18750000 },
                              bookings_count: { type: 'integer', example: 187 }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' }
        }
      }
    },

    // =====================================================
    // ADMIN ENDPOINTS
    // =====================================================
    '/api/admin/users': {
      get: {
        tags: ['Admin'],
        summary: 'Get semua users untuk admin',
        description: 'Endpoint untuk mendapatkan semua users dengan role management',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', default: 1 },
            description: 'Nomor halaman'
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 10 },
            description: 'Jumlah item per halaman'
          },
          {
            name: 'role',
            in: 'query',
            schema: { type: 'string' },
            description: 'Filter berdasarkan role'
          },
          {
            name: 'search',
            in: 'query',
            schema: { type: 'string' },
            description: 'Pencarian berdasarkan nama atau email'
          },
          {
            name: 'is_active',
            in: 'query',
            schema: { type: 'boolean' },
            description: 'Filter berdasarkan status aktif'
          }
        ],
        responses: {
          200: {
            description: 'Daftar users berhasil diambil',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/User' }
                    },
                    pagination: { $ref: '#/components/schemas/PaginationMeta' }
                  }
                }
              }
            }
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' }
        }
      }
    },

    '/api/admin/users/{id}/role': {
      put: {
        tags: ['Admin'],
        summary: 'Update role user',
        description: 'Endpoint untuk mengubah role user (hanya untuk supervisor)',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'ID user'
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['new_role'],
                properties: {
                  new_role: {
                    type: 'string',
                    enum: ['pengunjung', 'penyewa', 'staff_kasir', 'operator_lapangan', 'manajer_futsal', 'supervisor_sistem'],
                    description: 'Role baru untuk user'
                  },
                  reason: { type: 'string', description: 'Alasan perubahan role' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Role user berhasil diubah',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'User role updated successfully' },
                    data: { $ref: '#/components/schemas/User' }
                  }
                }
              }
            }
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' }
        }
      }
    },

    '/api/admin/analytics/business': {
      get: {
        tags: ['Admin'],
        summary: 'Get business analytics',
        description: 'Endpoint untuk mendapatkan analytics bisnis lengkap',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: 'period',
            in: 'query',
            schema: { type: 'string', enum: ['daily', 'weekly', 'monthly', 'yearly', 'custom'] },
            description: 'Periode analytics'
          },
          {
            name: 'date_from',
            in: 'query',
            schema: { type: 'string', format: 'date' },
            description: 'Tanggal mulai (untuk custom period)'
          },
          {
            name: 'date_to',
            in: 'query',
            schema: { type: 'string', format: 'date' },
            description: 'Tanggal akhir (untuk custom period)'
          }
        ],
        responses: {
          200: {
            description: 'Business analytics berhasil diambil',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        revenue_summary: {
                          type: 'object',
                          properties: {
                            total_revenue: { type: 'number', example: 50000000 },
                            revenue_growth: { type: 'number', example: 12.5 },
                            average_booking_value: { type: 'number', example: 125000 }
                          }
                        },
                        booking_summary: {
                          type: 'object',
                          properties: {
                            total_bookings: { type: 'integer', example: 400 },
                            booking_growth: { type: 'number', example: 8.3 },
                            completion_rate: { type: 'number', example: 95.2 }
                          }
                        },
                        field_performance: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              field_name: { type: 'string' },
                              utilization_rate: { type: 'number' },
                              revenue: { type: 'number' },
                              bookings_count: { type: 'integer' }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' }
        }
      }
    },

    // =====================================================
    // ENHANCED FEATURES ENDPOINTS
    // =====================================================
    '/api/customer/notifications': {
      get: {
        tags: ['Enhanced Features'],
        summary: 'Get notifikasi user',
        description: 'Endpoint untuk mendapatkan semua notifikasi user',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', default: 1 },
            description: 'Nomor halaman'
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 10 },
            description: 'Jumlah item per halaman'
          },
          {
            name: 'type',
            in: 'query',
            schema: { type: 'string', enum: ['booking', 'payment', 'system', 'promotion'] },
            description: 'Filter berdasarkan tipe notifikasi'
          },
          {
            name: 'is_read',
            in: 'query',
            schema: { type: 'boolean' },
            description: 'Filter berdasarkan status baca'
          }
        ],
        responses: {
          200: {
            description: 'Daftar notifikasi berhasil diambil',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Notification' }
                    },
                    pagination: { $ref: '#/components/schemas/PaginationMeta' }
                  }
                }
              }
            }
          },
          401: { $ref: '#/components/responses/Unauthorized' }
        }
      }
    },

    '/api/customer/notifications/{id}/read': {
      put: {
        tags: ['Enhanced Features'],
        summary: 'Mark notifikasi sebagai dibaca',
        description: 'Endpoint untuk menandai notifikasi sebagai sudah dibaca',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'ID notifikasi'
          }
        ],
        responses: {
          200: {
            description: 'Notifikasi berhasil ditandai sebagai dibaca',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Notification marked as read' }
                  }
                }
              }
            }
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' }
        }
      }
    },

    '/api/customer/favorites': {
      get: {
        tags: ['Enhanced Features'],
        summary: 'Get lapangan favorit user',
        description: 'Endpoint untuk mendapatkan daftar lapangan favorit user',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: {
          200: {
            description: 'Daftar lapangan favorit berhasil diambil',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          field: { $ref: '#/components/schemas/Field' },
                          added_at: { type: 'string', format: 'date-time' },
                          last_booking: { type: 'string', format: 'date-time', nullable: true }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          401: { $ref: '#/components/responses/Unauthorized' }
        }
      }
    },

    '/api/customer/favorites/{fieldId}': {
      post: {
        tags: ['Enhanced Features'],
        summary: 'Tambah lapangan ke favorit',
        description: 'Endpoint untuk menambahkan lapangan ke daftar favorit',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: 'fieldId',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'ID lapangan'
          }
        ],
        responses: {
          201: {
            description: 'Lapangan berhasil ditambahkan ke favorit',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Field added to favorites' }
                  }
                }
              }
            }
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
          409: {
            description: 'Lapangan sudah ada di favorit',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    error: { type: 'string', example: 'Field already in favorites' }
                  }
                }
              }
            }
          }
        }
      },
      delete: {
        tags: ['Enhanced Features'],
        summary: 'Hapus lapangan dari favorit',
        description: 'Endpoint untuk menghapus lapangan dari daftar favorit',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: 'fieldId',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'ID lapangan'
          }
        ],
        responses: {
          200: {
            description: 'Lapangan berhasil dihapus dari favorit',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Field removed from favorites' }
                  }
                }
              }
            }
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' }
        }
      }
    },

    '/api/customer/reviews': {
      get: {
        tags: ['Enhanced Features'],
        summary: 'Get review user',
        description: 'Endpoint untuk mendapatkan semua review yang dibuat user',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', default: 1 },
            description: 'Nomor halaman'
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 10 },
            description: 'Jumlah item per halaman'
          }
        ],
        responses: {
          200: {
            description: 'Daftar review berhasil diambil',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Review' }
                    },
                    pagination: { $ref: '#/components/schemas/PaginationMeta' }
                  }
                }
              }
            }
          },
          401: { $ref: '#/components/responses/Unauthorized' }
        }
      },
      post: {
        tags: ['Enhanced Features'],
        summary: 'Buat review lapangan',
        description: 'Endpoint untuk membuat review lapangan setelah booking selesai',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['field_id', 'booking_id', 'rating'],
                properties: {
                  field_id: { type: 'integer', example: 1, description: 'ID lapangan' },
                  booking_id: { type: 'integer', example: 1, description: 'ID booking yang sudah selesai' },
                  rating: { type: 'integer', minimum: 1, maximum: 5, example: 5, description: 'Rating 1-5 bintang' },
                  comment: { type: 'string', example: 'Lapangan bagus dan bersih', description: 'Komentar review' },
                  photos: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'URL foto review (opsional)'
                  }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Review berhasil dibuat',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Review created successfully' },
                    data: { $ref: '#/components/schemas/Review' }
                  }
                }
              }
            }
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' }
        }
      }
    },

    '/api/customer/promotions': {
      get: {
        tags: ['Enhanced Features'],
        summary: 'Get promosi yang tersedia',
        description: 'Endpoint untuk mendapatkan daftar promosi yang tersedia untuk user',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: 'field_id',
            in: 'query',
            schema: { type: 'integer' },
            description: 'Filter promosi berdasarkan lapangan'
          },
          {
            name: 'date',
            in: 'query',
            schema: { type: 'string', format: 'date' },
            description: 'Filter promosi berdasarkan tanggal'
          }
        ],
        responses: {
          200: {
            description: 'Daftar promosi berhasil diambil',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Promotion' }
                    }
                  }
                }
              }
            }
          },
          401: { $ref: '#/components/responses/Unauthorized' }
        }
      }
    },

    '/api/customer/promotions/validate': {
      post: {
        tags: ['Enhanced Features'],
        summary: 'Validasi kode promosi',
        description: 'Endpoint untuk memvalidasi kode promosi sebelum digunakan',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['code', 'field_id', 'booking_amount'],
                properties: {
                  code: { type: 'string', example: 'DISKON50', description: 'Kode promosi' },
                  field_id: { type: 'integer', example: 1, description: 'ID lapangan' },
                  booking_amount: { type: 'string', example: '200000.00', description: 'Total amount booking' },
                  booking_date: { type: 'string', format: 'date', example: '2024-12-01', description: 'Tanggal booking' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Kode promosi valid',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        promotion: { $ref: '#/components/schemas/Promotion' },
                        discount_amount: { type: 'string', example: '20000.00' },
                        final_amount: { type: 'string', example: '180000.00' },
                        is_valid: { type: 'boolean', example: true }
                      }
                    }
                  }
                }
              }
            }
          },
          400: {
            description: 'Kode promosi tidak valid',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    error: { type: 'string', example: 'Invalid promotion code' }
                  }
                }
              }
            }
          },
          401: { $ref: '#/components/responses/Unauthorized' }
        }
      }
    },

    // =====================================================
    // LEGACY ENDPOINTS (Backward Compatibility)
    // =====================================================
    '/api/user/bookings': {
      get: {
        tags: ['Customer'],
        summary: '[LEGACY] Get booking user',
        description: 'Legacy endpoint untuk backward compatibility. Gunakan /api/customer/bookings',
        deprecated: true,
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: {
          200: {
            description: 'Daftar booking berhasil diambil',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Booking' }
                    }
                  }
                }
              }
            }
          },
          401: { $ref: '#/components/responses/Unauthorized' }
        }
      }
    },

    '/api/pengelola/dashboard': {
      get: {
        tags: ['Staff'],
        summary: '[LEGACY] Dashboard pengelola',
        description: 'Legacy endpoint untuk backward compatibility. Gunakan endpoint staff yang sesuai',
        deprecated: true,
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: {
          200: {
            description: 'Dashboard berhasil diambil',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { type: 'object', description: 'Dashboard data' }
                  }
                }
              }
            }
          },
          401: { $ref: '#/components/responses/Unauthorized' }
        }
      }
    },

    // =====================================================
    // TESTING ENDPOINTS
    // =====================================================
    '/api/test/auth': {
      get: {
        tags: ['Public'],
        summary: 'Test autentikasi',
        description: 'Endpoint untuk testing autentikasi dan role system',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: {
          200: {
            description: 'Test autentikasi berhasil',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Authentication test successful' },
                    user: { $ref: '#/components/schemas/User' },
                    timestamp: { type: 'string', format: 'date-time' }
                  }
                }
              }
            }
          },
          401: { $ref: '#/components/responses/Unauthorized' }
        }
      }
    },

    '/api/test/roles': {
      get: {
        tags: ['Public'],
        summary: 'Test role system',
        description: 'Endpoint untuk testing enhanced role system',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: {
          200: {
            description: 'Test role system berhasil',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Role system test successful' },
                    user_role: { type: 'string', example: 'penyewa' },
                    role_level: { type: 'integer', example: 2 },
                    permissions: {
                      type: 'array',
                      items: { type: 'string' },
                      example: ['create_booking', 'view_own_bookings', 'cancel_booking']
                    },
                    enhanced_features: {
                      type: 'object',
                      properties: {
                        role_hierarchy: { type: 'boolean', example: true },
                        auto_generation: { type: 'boolean', example: true },
                        audit_trail: { type: 'boolean', example: true }
                      }
                    }
                  }
                }
              }
            }
          },
          401: { $ref: '#/components/responses/Unauthorized' }
        }
      }
    }
  }
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
