/**
 * Panam Soccer Field - Admin Notifications API Documentation
 * Dokumentasi endpoint untuk manajemen notifikasi sistem (Management Level)
 */

const adminNotificationPaths = {
  '/api/admin/notifications': {
    get: {
      tags: ['Admin - Notification Management'],
      summary: 'Get all notifications 🟡 MANAGEMENT',
      description: 'Endpoint untuk mendapatkan semua notifikasi sistem',
      security: [
        { bearerAuth: [] },
        { cookieAuth: [] }
      ],
      parameters: [
        { $ref: '#/components/parameters/PageParam' },
        { $ref: '#/components/parameters/LimitParam' },
        {
          in: 'query',
          name: 'type',
          schema: {
            type: 'string',
            enum: ['booking', 'payment', 'system', 'promotion']
          },
          description: 'Filter berdasarkan jenis notifikasi'
        },
        {
          in: 'query',
          name: 'is_read',
          schema: {
            type: 'boolean'
          },
          description: 'Filter berdasarkan status baca'
        },
        { $ref: '#/components/parameters/DateFromParam' },
        { $ref: '#/components/parameters/DateToParam' }
      ],
      responses: {
        200: {
          description: 'Daftar notifikasi berhasil diambil',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true
                  },
                  data: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/Notification'
                    }
                  },
                  pagination: {
                    $ref: '#/components/schemas/PaginationMeta'
                  }
                }
              }
            }
          }
        },
        401: {
          $ref: '#/components/responses/Unauthorized'
        },
        403: {
          $ref: '#/components/responses/Forbidden'
        }
      }
    },
    post: {
      tags: ['Admin - Notification Management'],
      summary: 'Create system notification 🟡 MANAGEMENT',
      description: 'Endpoint untuk membuat notifikasi sistem baru',
      security: [
        { bearerAuth: [] },
        { cookieAuth: [] }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['title', 'message', 'type'],
              properties: {
                title: {
                  type: 'string',
                  example: 'Maintenance Scheduled',
                  description: 'Judul notifikasi'
                },
                message: {
                  type: 'string',
                  example: 'System maintenance will be performed tonight from 2-4 AM',
                  description: 'Isi pesan notifikasi'
                },
                type: {
                  type: 'string',
                  enum: ['booking', 'payment', 'system', 'promotion'],
                  example: 'system',
                  description: 'Jenis notifikasi'
                },
                user_ids: {
                  type: 'array',
                  items: {
                    type: 'integer'
                  },
                  example: [1, 2, 3],
                  description: 'Array ID user yang akan menerima notifikasi (opsional, jika kosong akan dikirim ke semua user)'
                },
                data: {
                  type: 'object',
                  example: { maintenance_duration: '2 hours' },
                  description: 'Data tambahan untuk notifikasi'
                },
                priority: {
                  type: 'string',
                  enum: ['low', 'normal', 'high', 'urgent'],
                  example: 'high',
                  description: 'Prioritas notifikasi'
                },
                channels: {
                  type: 'array',
                  items: {
                    type: 'string',
                    enum: ['in_app', 'email', 'sms', 'push']
                  },
                  example: ['in_app', 'email'],
                  description: 'Channel pengiriman notifikasi'
                }
              }
            }
          }
        }
      },
      responses: {
        201: {
          description: 'Notifikasi berhasil dibuat',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true
                  },
                  message: {
                    type: 'string',
                    example: 'Notification created successfully'
                  },
                  data: {
                    type: 'object',
                    properties: {
                      notification_id: {
                        type: 'integer',
                        example: 123
                      },
                      recipients_count: {
                        type: 'integer',
                        example: 25
                      },
                      delivery_status: {
                        type: 'object',
                        properties: {
                          in_app: { type: 'integer', example: 25 },
                          email: { type: 'integer', example: 20 },
                          sms: { type: 'integer', example: 0 },
                          push: { type: 'integer', example: 15 }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        400: {
          $ref: '#/components/responses/BadRequest'
        },
        401: {
          $ref: '#/components/responses/Unauthorized'
        },
        403: {
          $ref: '#/components/responses/Forbidden'
        }
      }
    }
  },

  '/api/admin/notifications/broadcast': {
    post: {
      tags: ['Admin - Notification Management'],
      summary: 'Broadcast notification to multiple users 🟡 MANAGEMENT',
      description: 'Endpoint untuk mengirim notifikasi broadcast ke multiple user',
      security: [
        { bearerAuth: [] },
        { cookieAuth: [] }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['title', 'message'],
              properties: {
                title: {
                  type: 'string',
                  example: 'Important Announcement',
                  description: 'Judul broadcast'
                },
                message: {
                  type: 'string',
                  example: 'New booking policies effective immediately',
                  description: 'Isi pesan broadcast'
                },
                user_filter: {
                  type: 'object',
                  properties: {
                    roles: {
                      type: 'array',
                      items: {
                        type: 'string',
                        enum: ['penyewa', 'staff_kasir', 'operator_lapangan', 'manajer_futsal', 'supervisor_sistem']
                      },
                      example: ['penyewa'],
                      description: 'Filter berdasarkan role'
                    },
                    is_active: {
                      type: 'boolean',
                      example: true,
                      description: 'Filter user aktif saja'
                    },
                    last_login_days: {
                      type: 'integer',
                      example: 30,
                      description: 'Filter user yang login dalam X hari terakhir'
                    }
                  },
                  description: 'Filter untuk menentukan target user'
                },
                channels: {
                  type: 'array',
                  items: {
                    type: 'string',
                    enum: ['in_app', 'email', 'sms', 'push']
                  },
                  example: ['in_app', 'email'],
                  description: 'Channel pengiriman'
                },
                priority: {
                  type: 'string',
                  enum: ['low', 'normal', 'high', 'urgent'],
                  example: 'normal',
                  description: 'Prioritas broadcast'
                },
                schedule_at: {
                  type: 'string',
                  format: 'date-time',
                  example: '2024-12-01T10:00:00Z',
                  description: 'Jadwal pengiriman (opsional, jika kosong akan dikirim langsung)'
                }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Broadcast berhasil dikirim',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true
                  },
                  message: {
                    type: 'string',
                    example: 'Broadcast sent successfully'
                  },
                  data: {
                    type: 'object',
                    properties: {
                      broadcast_id: {
                        type: 'string',
                        example: 'bc_20241201_001'
                      },
                      total_recipients: {
                        type: 'integer',
                        example: 150
                      },
                      delivery_summary: {
                        type: 'object',
                        properties: {
                          in_app: { type: 'integer', example: 150 },
                          email: { type: 'integer', example: 120 },
                          sms: { type: 'integer', example: 0 },
                          push: { type: 'integer', example: 80 }
                        }
                      },
                      scheduled: {
                        type: 'boolean',
                        example: false
                      }
                    }
                  }
                }
              }
            }
          }
        },
        400: {
          $ref: '#/components/responses/BadRequest'
        },
        401: {
          $ref: '#/components/responses/Unauthorized'
        },
        403: {
          $ref: '#/components/responses/Forbidden'
        }
      }
    }
  },

  '/api/admin/notifications/statistics': {
    get: {
      tags: ['Admin - Notification Management'],
      summary: 'Get notification statistics 🟡 MANAGEMENT',
      description: 'Endpoint untuk mendapatkan statistik notifikasi sistem',
      security: [
        { bearerAuth: [] },
        { cookieAuth: [] }
      ],
      parameters: [
        {
          in: 'query',
          name: 'days',
          schema: {
            type: 'integer',
            default: 30
          },
          description: 'Periode hari untuk statistik'
        }
      ],
      responses: {
        200: {
          description: 'Statistik notifikasi berhasil diambil',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true
                  },
                  data: {
                    type: 'object',
                    properties: {
                      total_sent: {
                        type: 'integer',
                        example: 1250
                      },
                      total_read: {
                        type: 'integer',
                        example: 980
                      },
                      read_rate: {
                        type: 'number',
                        format: 'decimal',
                        example: 78.4
                      },
                      by_type: {
                        type: 'object',
                        properties: {
                          booking: { type: 'integer', example: 450 },
                          payment: { type: 'integer', example: 320 },
                          system: { type: 'integer', example: 280 },
                          promotion: { type: 'integer', example: 200 }
                        }
                      },
                      by_channel: {
                        type: 'object',
                        properties: {
                          in_app: { type: 'integer', example: 1250 },
                          email: { type: 'integer', example: 800 },
                          sms: { type: 'integer', example: 50 },
                          push: { type: 'integer', example: 600 }
                        }
                      },
                      trends: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            date: { type: 'string', format: 'date' },
                            sent: { type: 'integer' },
                            read: { type: 'integer' }
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
        401: {
          $ref: '#/components/responses/Unauthorized'
        },
        403: {
          $ref: '#/components/responses/Forbidden'
        }
      }
    }
  }
};

module.exports = adminNotificationPaths;
