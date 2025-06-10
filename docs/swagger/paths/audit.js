/**
 * Panam Soccer Field - Audit & System Monitoring API Documentation
 * Dokumentasi endpoint untuk audit logs dan system monitoring
 */

const auditPaths = {
  '/api/audit/logs': {
    get: {
      tags: ['Audit & System'],
      summary: 'Get audit logs 🔴 SUPERVISOR ONLY',
      description: 'Endpoint untuk mendapatkan audit logs sistem Panam Soccer Field',
      security: [
        { bearerAuth: [] },
        { cookieAuth: [] }
      ],
      parameters: [
        { $ref: '#/components/parameters/PageParam' },
        { $ref: '#/components/parameters/LimitParam' },
        { $ref: '#/components/parameters/DateFromParam' },
        { $ref: '#/components/parameters/DateToParam' },
        {
          in: 'query',
          name: 'action',
          schema: {
            type: 'string',
            enum: ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT']
          },
          description: 'Filter berdasarkan jenis aksi'
        },
        {
          in: 'query',
          name: 'table_name',
          schema: {
            type: 'string'
          },
          description: 'Filter berdasarkan nama tabel'
        },
        { $ref: '#/components/parameters/UserIdQueryParam' }
      ],
      responses: {
        200: {
          description: 'Audit logs berhasil diambil',
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
                      $ref: '#/components/schemas/AuditLog'
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

  '/api/audit/logs/{id}': {
    get: {
      tags: ['Audit & System'],
      summary: 'Get detail audit log 🔴 SUPERVISOR ONLY',
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
          description: 'ID audit log'
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
                    $ref: '#/components/schemas/AuditLog'
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
  },

  '/api/system/health': {
    get: {
      tags: ['Audit & System'],
      summary: 'Get system health status 🔴 SUPERVISOR ONLY',
      description: 'Endpoint untuk mendapatkan status kesehatan sistem',
      security: [
        { bearerAuth: [] },
        { cookieAuth: [] }
      ],
      responses: {
        200: {
          description: 'System health status berhasil diambil',
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
                      status: {
                        type: 'string',
                        enum: ['Aman', 'Perhatian', 'Kritis'],
                        example: 'Aman'
                      },
                      uptime: {
                        type: 'string',
                        example: '99.9%'
                      },
                      database: {
                        type: 'object',
                        properties: {
                          status: {
                            type: 'string',
                            example: 'Connected'
                          },
                          response_time: {
                            type: 'number',
                            example: 15.5,
                            description: 'Response time dalam ms'
                          },
                          connections: {
                            type: 'integer',
                            example: 5
                          }
                        }
                      },
                      server: {
                        type: 'object',
                        properties: {
                          cpu_usage: {
                            type: 'number',
                            format: 'decimal',
                            example: 45.2
                          },
                          memory_usage: {
                            type: 'number',
                            format: 'decimal',
                            example: 68.5
                          },
                          disk_usage: {
                            type: 'number',
                            format: 'decimal',
                            example: 32.1
                          }
                        }
                      },
                      api: {
                        type: 'object',
                        properties: {
                          response_time: {
                            type: 'number',
                            example: 120.5
                          },
                          error_rate: {
                            type: 'number',
                            format: 'decimal',
                            example: 0.1
                          },
                          requests_per_minute: {
                            type: 'integer',
                            example: 150
                          }
                        }
                      },
                      last_checked: {
                        type: 'string',
                        format: 'date-time',
                        example: '2024-01-15T10:30:00Z'
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

  '/api/system/settings': {
    get: {
      tags: ['Audit & System'],
      summary: 'Get system settings 🔴 SUPERVISOR ONLY',
      description: 'Endpoint untuk mendapatkan pengaturan sistem',
      security: [
        { bearerAuth: [] },
        { cookieAuth: [] }
      ],
      parameters: [
        {
          in: 'query',
          name: 'category',
          schema: {
            type: 'string',
            enum: ['general', 'booking', 'payment', 'notification', 'security']
          },
          description: 'Filter berdasarkan kategori setting'
        },
        { $ref: '#/components/parameters/IsActiveParam' }
      ],
      responses: {
        200: {
          description: 'System settings berhasil diambil',
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
                      $ref: '#/components/schemas/SystemSetting'
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
    },
    put: {
      tags: ['Audit & System'],
      summary: 'Update system settings 🔴 SUPERVISOR ONLY',
      description: 'Endpoint untuk mengupdate pengaturan sistem',
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
              required: ['settings'],
              properties: {
                settings: {
                  type: 'array',
                  items: {
                    type: 'object',
                    required: ['key', 'value'],
                    properties: {
                      key: {
                        type: 'string',
                        example: 'booking_advance_days'
                      },
                      value: {
                        type: 'string',
                        example: '30'
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: 'System settings berhasil diupdate',
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
                    example: 'System settings updated successfully'
                  },
                  data: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/SystemSetting'
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

  '/api/system/backup': {
    post: {
      tags: ['Audit & System'],
      summary: 'Create system backup 🔴 SUPERVISOR ONLY',
      description: 'Endpoint untuk membuat backup sistem dan database',
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
              properties: {
                backup_type: {
                  type: 'string',
                  enum: ['full', 'database_only', 'files_only'],
                  default: 'full',
                  description: 'Jenis backup'
                },
                description: {
                  type: 'string',
                  example: 'Monthly backup before system update',
                  description: 'Deskripsi backup'
                }
              }
            }
          }
        }
      },
      responses: {
        202: {
          description: 'Backup process started',
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
                    example: 'Backup process started'
                  },
                  data: {
                    type: 'object',
                    properties: {
                      backup_id: {
                        type: 'string',
                        example: 'backup_20240115_103000'
                      },
                      estimated_completion: {
                        type: 'string',
                        format: 'date-time'
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

module.exports = auditPaths;
