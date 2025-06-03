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
      title: 'Futsal Booking System API',
      version: '2.0.0',
      description: `
        API untuk sistem booking lapangan futsal dengan fitur lengkap:
        - Sistem autentikasi dan otorisasi berbasis role
        - Manajemen booking dengan deteksi konflik
        - Sistem pembayaran multi-metode
        - Notifikasi real-time
        - Analytics dan reporting
        - Auto-completion booking
        - Audit trail lengkap
      `,
      contact: {
        name: 'Futsal Booking System',
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
        description: 'Production Server'
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
        // User Schemas
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
              description: 'Role user dalam sistem'
            },
            employee_id: { type: 'string', description: 'ID karyawan (untuk staff)' },
            department: { type: 'string', description: 'Departemen (untuk staff)' },
            is_active: { type: 'boolean', description: 'Status aktif user' },
            is_verified: { type: 'boolean', description: 'Status verifikasi email' },
            last_login_at: { type: 'string', format: 'date-time', description: 'Waktu login terakhir' },
            created_at: { type: 'string', format: 'date-time', description: 'Waktu pembuatan akun' },
            updated_at: { type: 'string', format: 'date-time', description: 'Waktu update terakhir' }
          }
        },

        // Field Schemas
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
              description: 'Fasilitas yang tersedia'
            },
            capacity: { type: 'integer', description: 'Kapasitas maksimal pemain' },
            location: { type: 'string', description: 'Lokasi lapangan' },
            address: { type: 'string', description: 'Alamat lengkap' },
            price: { type: 'string', description: 'Harga per jam (weekday)' },
            price_weekend: { type: 'string', description: 'Harga per jam (weekend)' },
            operating_hours: {
              type: 'object',
              properties: {
                start: { type: 'string', description: 'Jam buka' },
                end: { type: 'string', description: 'Jam tutup' }
              }
            },
            rating: { type: 'string', description: 'Rating rata-rata' },
            total_reviews: { type: 'integer', description: 'Total review' }
          }
        },

        // Booking Schemas
        Booking: {
          type: 'object',
          properties: {
            id: { type: 'integer', description: 'ID unik booking' },
            uuid: { type: 'string', format: 'uuid', description: 'UUID booking' },
            booking_number: { type: 'string', description: 'Nomor booking unik' },
            user_id: { type: 'integer', description: 'ID user yang booking' },
            field_id: { type: 'integer', description: 'ID lapangan' },
            date: { type: 'string', format: 'date', description: 'Tanggal booking' },
            start_time: { type: 'string', description: 'Waktu mulai (HH:MM)' },
            end_time: { type: 'string', description: 'Waktu selesai (HH:MM)' },
            duration_hours: { type: 'number', description: 'Durasi dalam jam' },
            name: { type: 'string', description: 'Nama pemesan' },
            phone: { type: 'string', description: 'Nomor telepon pemesan' },
            email: { type: 'string', format: 'email', description: 'Email pemesan' },
            notes: { type: 'string', description: 'Catatan tambahan' },
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
            created_at: { type: 'string', format: 'date-time', description: 'Waktu pembuatan booking' }
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
        description: 'Endpoint untuk customer (penyewa)'
      },
      {
        name: 'Staff',
        description: 'Endpoint untuk staff (kasir, operator, manager)'
      },
      {
        name: 'Admin',
        description: 'Endpoint untuk administrator sistem'
      },
      {
        name: 'Enhanced Features',
        description: 'Fitur tambahan seperti notifikasi, review, favorit'
      }
    ]
  },
  apis: [
    './routes/*.js',
    './controllers/**/*.js',
    './docs/swagger/*.yaml'
  ],
  // Contoh endpoint berdasarkan testing aktual
  paths: {
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
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'integer', example: 1 },
                          uuid: { type: 'string', example: '22e2640d-c134-445f-be94-3acfb540efc9' },
                          name: { type: 'string', example: 'Updated Field Name' },
                          type: { type: 'string', example: 'futsal' },
                          description: { type: 'string', example: 'Updated description' },
                          facilities: {
                            type: 'array',
                            items: { type: 'string' },
                            example: ['parking', 'toilet', 'canteen', 'shower', 'wifi', 'ac', 'sound_system', 'tribun']
                          },
                          capacity: { type: 'integer', example: 22 },
                          location: { type: 'string', example: 'Jakarta Selatan' },
                          address: { type: 'string', example: 'Jl. Sudirman No. 123, Jakarta Selatan' },
                          coordinates: {
                            type: 'object',
                            properties: {
                              lat: { type: 'number', example: -6.2088 },
                              lng: { type: 'number', example: 106.8456 }
                            }
                          },
                          price: { type: 'string', example: '120000.00' },
                          price_weekend: { type: 'string', example: '150000.00' },
                          price_member: { type: 'string', example: '100000.00' },
                          operating_hours: {
                            type: 'object',
                            properties: {
                              start: { type: 'string', example: '09:00' },
                              end: { type: 'string', example: '24:00' }
                            }
                          },
                          operating_days: {
                            type: 'array',
                            items: { type: 'string' },
                            example: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
                          },
                          rating: { type: 'string', example: '0.00' },
                          total_reviews: { type: 'integer', example: 0 }
                        }
                      }
                    },
                    pagination: {
                      type: 'object',
                      properties: {
                        current_page: { type: 'integer', example: 1 },
                        per_page: { type: 'integer', example: 10 },
                        total: { type: 'integer', example: 4 },
                        total_pages: { type: 'integer', example: 1 }
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
                        app_name: { type: 'string', example: 'Booking Futsal System' },
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
                  email: {
                    type: 'string',
                    format: 'email',
                    example: 'ppwweebb01@gmail.com',
                    description: 'Email pengguna'
                  },
                  password: {
                    type: 'string',
                    example: 'password123',
                    description: 'Password pengguna'
                  }
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
                    error: { type: 'string', example: 'Password salah' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/auth/roles': {
      get: {
        tags: ['Authentication'],
        summary: 'Mendapatkan daftar role sistem',
        description: 'Endpoint untuk mendapatkan informasi role yang tersedia dalam sistem',
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
                    timestamp: { type: 'string', format: 'date-time', example: '2025-06-03T02:24:17.714Z' },
                    environment: { type: 'string', example: 'production' },
                    database: { type: 'string', example: 'connected' },
                    uptime: { type: 'integer', example: 3909, description: 'Uptime dalam detik' },
                    version: { type: 'string', example: '1.0.0' }
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
                    error: { type: 'string', example: 'Database connection failed' },
                    timestamp: { type: 'string', format: 'date-time' }
                  }
                }
              }
            }
          }
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
  `,
  customSiteTitle: 'Futsal Booking API Documentation'
};

module.exports = {
  specs,
  swaggerUi,
  swaggerUiOptions
};
