/**
 * Panam Soccer Field - Admin Audit Logs API Documentation
 * Dokumentasi endpoint untuk audit logs sistem (Supervisor Only)
 */

const adminAuditPaths = {
  '/api/admin/audit-logs': {
    get: {
      tags: ['Admin - Audit System'],
      summary: 'Get all audit logs 🔴 SUPERVISOR ONLY',
      description: `
        Endpoint untuk mendapatkan semua log audit sistem
        
        **🔐 ACCESS LEVEL:**
        - ✅ **Supervisor Sistem** (supervisor_sistem) ONLY
        - ❌ Manager dan staff lainnya TIDAK dapat mengakses
      `,
      security: [
        { bearerAuth: [] },
        { cookieAuth: [] }
      ],
      parameters: [
        { $ref: '#/components/parameters/PageParam' },
        { $ref: '#/components/parameters/LimitParam' },
        {
          in: 'query',
          name: 'user_id',
          schema: {
            type: 'integer'
          },
          description: 'Filter berdasarkan user ID'
        },
        {
          in: 'query',
          name: 'action',
          schema: {
            type: 'string',
            enum: ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT']
          },
          description: 'Filter berdasarkan action'
        },
        {
          in: 'query',
          name: 'table_name',
          schema: {
            type: 'string'
          },
          description: 'Filter berdasarkan nama tabel'
        },
        { $ref: '#/components/parameters/DateFromParam' },
        { $ref: '#/components/parameters/DateToParam' }
      ],
      responses: {
        200: {
          description: 'Daftar audit logs berhasil diambil',
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
                      type: 'object',
                      properties: {
                        id: {
                          type: 'integer',
                          example: 123
                        },
                        user_id: {
                          type: 'integer',
                          example: 5
                        },
                        action: {
                          type: 'string',
                          example: 'UPDATE'
                        },
                        table_name: {
                          type: 'string',
                          example: 'bookings'
                        },
                        record_id: {
                          type: 'integer',
                          example: 456
                        },
                        old_values: {
                          type: 'object',
                          example: { status: 'pending' }
                        },
                        new_values: {
                          type: 'object',
                          example: { status: 'confirmed' }
                        },
                        ip_address: {
                          type: 'string',
                          example: '192.168.1.100'
                        },
                        user_agent: {
                          type: 'string',
                          example: 'Mozilla/5.0...'
                        },
                        created_at: {
                          type: 'string',
                          format: 'date-time',
                          example: '2024-12-01T10:30:00Z'
                        },
                        user: {
                          type: 'object',
                          properties: {
                            name: {
                              type: 'string',
                              example: 'John Doe'
                            },
                            email: {
                              type: 'string',
                              example: 'john@example.com'
                            },
                            role: {
                              type: 'string',
                              example: 'manajer_futsal'
                            }
                          }
                        }
                      }
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
    }
  },

  '/api/admin/audit-logs/statistics': {
    get: {
      tags: ['Admin - Audit System'],
      summary: 'Get audit logs statistics 🔴 SUPERVISOR ONLY',
      description: `
        Endpoint untuk mendapatkan statistik audit logs sistem
        
        **🔐 ACCESS LEVEL:**
        - ✅ **Supervisor Sistem** (supervisor_sistem) ONLY
        - ❌ Manager dan staff lainnya TIDAK dapat mengakses
      `,
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
          description: 'Periode hari untuk statistik (default 30 hari)'
        }
      ],
      responses: {
        200: {
          description: 'Statistik audit logs berhasil diambil',
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
                      period_days: {
                        type: 'integer',
                        example: 30
                      },
                      statistics: {
                        type: 'object',
                        properties: {
                          total_logs: {
                            type: 'integer',
                            example: 150
                          },
                          today_logs: {
                            type: 'integer',
                            example: 25
                          },
                          unique_users: {
                            type: 'integer',
                            example: 8
                          },
                          critical_actions: {
                            type: 'integer',
                            example: 3
                          },
                          create_actions: {
                            type: 'integer',
                            example: 45
                          },
                          update_actions: {
                            type: 'integer',
                            example: 67
                          },
                          delete_actions: {
                            type: 'integer',
                            example: 12
                          },
                          login_actions: {
                            type: 'integer',
                            example: 89
                          },
                          logout_actions: {
                            type: 'integer',
                            example: 76
                          }
                        }
                      },
                      trends: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            date: {
                              type: 'string',
                              format: 'date'
                            },
                            count: {
                              type: 'integer'
                            },
                            actions: {
                              type: 'object',
                              properties: {
                                CREATE: { type: 'integer' },
                                UPDATE: { type: 'integer' },
                                DELETE: { type: 'integer' },
                                LOGIN: { type: 'integer' },
                                LOGOUT: { type: 'integer' }
                              }
                            }
                          }
                        }
                      },
                      top_users: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            user_id: { type: 'integer' },
                            user_name: { type: 'string' },
                            user_role: { type: 'string' },
                            activity_count: { type: 'integer' }
                          }
                        }
                      },
                      top_tables: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            table_name: { type: 'string' },
                            activity_count: { type: 'integer' }
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
  },

  '/api/admin/audit-logs/{id}': {
    get: {
      tags: ['Admin - Audit System'],
      summary: 'Get audit log detail 🔴 SUPERVISOR ONLY',
      description: 'Endpoint untuk mendapatkan detail audit log berdasarkan ID',
      security: [
        { bearerAuth: [] },
        { cookieAuth: [] }
      ],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: {
            type: 'integer'
          },
          description: 'Audit log ID'
        }
      ],
      responses: {
        200: {
          description: 'Detail audit log berhasil diambil',
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
                      id: { type: 'integer' },
                      user_id: { type: 'integer' },
                      action: { type: 'string' },
                      table_name: { type: 'string' },
                      record_id: { type: 'integer' },
                      old_values: { type: 'object' },
                      new_values: { type: 'object' },
                      ip_address: { type: 'string' },
                      user_agent: { type: 'string' },
                      created_at: { type: 'string', format: 'date-time' },
                      user: {
                        type: 'object',
                        properties: {
                          name: { type: 'string' },
                          email: { type: 'string' },
                          role: { type: 'string' }
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
        },
        404: {
          $ref: '#/components/responses/NotFound'
        }
      }
    }
  }
};

module.exports = adminAuditPaths;
