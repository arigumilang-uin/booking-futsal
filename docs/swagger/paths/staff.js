/**
 * Panam Soccer Field - Staff API Documentation
 * Dokumentasi endpoint untuk staff operations (Kasir, Operator, Manager, Supervisor)
 */

const staffPaths = {
  // Staff Kasir Endpoints
  '/api/staff/kasir/payments': {
    get: {
      tags: ['Staff Kasir'],
      summary: 'Get daftar pembayaran untuk kasir 🟠 KASIR',
      description: 'Endpoint untuk mendapatkan daftar pembayaran yang perlu diproses kasir',
      security: [
        { bearerAuth: [] },
        { cookieAuth: [] }
      ],
      parameters: [
        { $ref: '#/components/parameters/PageParam' },
        { $ref: '#/components/parameters/LimitParam' },
        { $ref: '#/components/parameters/PaymentStatusParam' },
        { $ref: '#/components/parameters/DateFromParam' },
        { $ref: '#/components/parameters/DateToParam' }
      ],
      responses: {
        200: {
          description: 'Daftar pembayaran berhasil diambil',
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
                      $ref: '#/components/schemas/Payment'
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

  '/api/staff/kasir/payments/{id}/confirm': {
    put: {
      tags: ['Staff Kasir'],
      summary: 'Konfirmasi pembayaran 🟠 KASIR',
      description: 'Endpoint untuk mengkonfirmasi pembayaran yang sudah diterima',
      security: [
        { bearerAuth: [] },
        { cookieAuth: [] }
      ],
      parameters: [
        { $ref: '#/components/parameters/PaymentIdParam' }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                notes: {
                  type: 'string',
                  example: 'Pembayaran diterima via transfer BCA',
                  description: 'Catatan konfirmasi pembayaran'
                }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Pembayaran berhasil dikonfirmasi',
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
                    example: 'Payment confirmed successfully'
                  },
                  data: {
                    $ref: '#/components/schemas/Payment'
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
        },
        404: {
          $ref: '#/components/responses/NotFound'
        }
      }
    }
  },

  // Staff Operator Endpoints
  '/api/staff/operator/bookings': {
    get: {
      tags: ['Staff Operator'],
      summary: 'Get booking untuk operator lapangan 🔴 OPERATOR',
      description: 'Endpoint untuk mendapatkan booking yang ditugaskan ke operator lapangan',
      security: [
        { bearerAuth: [] },
        { cookieAuth: [] }
      ],
      parameters: [
        { $ref: '#/components/parameters/PageParam' },
        { $ref: '#/components/parameters/LimitParam' },
        { $ref: '#/components/parameters/BookingStatusParam' },
        { $ref: '#/components/parameters/DateFromParam' },
        { $ref: '#/components/parameters/DateToParam' }
      ],
      responses: {
        200: {
          description: 'Daftar booking berhasil diambil',
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
                      $ref: '#/components/schemas/Booking'
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

  '/api/staff/operator/bookings/{id}/confirm': {
    put: {
      tags: ['Staff Operator'],
      summary: 'Konfirmasi booking lapangan 🔴 OPERATOR',
      description: 'Endpoint untuk mengkonfirmasi booking setelah pembayaran lunas',
      security: [
        { bearerAuth: [] },
        { cookieAuth: [] }
      ],
      parameters: [
        { $ref: '#/components/parameters/BookingIdParam' }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                notes: {
                  type: 'string',
                  example: 'Lapangan siap digunakan, fasilitas sudah diperiksa',
                  description: 'Catatan konfirmasi dari operator'
                }
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
                  success: {
                    type: 'boolean',
                    example: true
                  },
                  message: {
                    type: 'string',
                    example: 'Booking confirmed successfully'
                  },
                  data: {
                    $ref: '#/components/schemas/Booking'
                  }
                }
              }
            }
          }
        },
        400: {
          $ref: '#/components/responses/PaymentRequired'
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

  // Staff Manager Endpoints
  '/api/staff/manager/bookings': {
    get: {
      tags: ['Staff Manager'],
      summary: 'Get booking untuk manager 🟡 MANAGER',
      description: 'Endpoint untuk mendapatkan semua booking dengan akses manager',
      security: [
        { bearerAuth: [] },
        { cookieAuth: [] }
      ],
      parameters: [
        { $ref: '#/components/parameters/PageParam' },
        { $ref: '#/components/parameters/LimitParam' },
        { $ref: '#/components/parameters/BookingStatusParam' },
        { $ref: '#/components/parameters/FieldIdQueryParam' },
        { $ref: '#/components/parameters/DateFromParam' },
        { $ref: '#/components/parameters/DateToParam' }
      ],
      responses: {
        200: {
          description: 'Daftar booking berhasil diambil',
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
                      $ref: '#/components/schemas/Booking'
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

  '/api/staff/manager/analytics': {
    get: {
      tags: ['Staff Manager'],
      summary: 'Get analytics untuk manager 🟡 MANAGER',
      description: 'Endpoint untuk mendapatkan analytics bisnis untuk manager',
      security: [
        { bearerAuth: [] },
        { cookieAuth: [] }
      ],
      parameters: [
        { $ref: '#/components/parameters/PeriodParam' },
        { $ref: '#/components/parameters/MetricParam' },
        { $ref: '#/components/parameters/DateFromParam' },
        { $ref: '#/components/parameters/DateToParam' }
      ],
      responses: {
        200: {
          description: 'Data analytics berhasil diambil',
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
                      revenue: {
                        type: 'object',
                        properties: {
                          total: {
                            type: 'number',
                            format: 'decimal'
                          },
                          growth: {
                            type: 'number',
                            format: 'decimal'
                          },
                          trend: {
                            type: 'array',
                            items: {
                              type: 'object'
                            }
                          }
                        }
                      },
                      bookings: {
                        type: 'object',
                        properties: {
                          total: {
                            type: 'integer'
                          },
                          confirmed: {
                            type: 'integer'
                          },
                          pending: {
                            type: 'integer'
                          },
                          cancelled: {
                            type: 'integer'
                          }
                        }
                      },
                      fields: {
                        type: 'object',
                        properties: {
                          utilization: {
                            type: 'number',
                            format: 'decimal'
                          },
                          popular: {
                            type: 'array',
                            items: {
                              type: 'object'
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
        401: {
          $ref: '#/components/responses/Unauthorized'
        },
        403: {
          $ref: '#/components/responses/Forbidden'
        }
      }
    }
  },

  // Staff Supervisor Endpoints
  '/api/staff/supervisor/users': {
    get: {
      tags: ['Staff Supervisor'],
      summary: 'Get semua user untuk supervisor 🔴 SUPERVISOR',
      description: 'Endpoint untuk mendapatkan semua user dengan akses supervisor sistem',
      security: [
        { bearerAuth: [] },
        { cookieAuth: [] }
      ],
      parameters: [
        { $ref: '#/components/parameters/PageParam' },
        { $ref: '#/components/parameters/LimitParam' },
        { $ref: '#/components/parameters/SearchParam' },
        { $ref: '#/components/parameters/UserRoleParam' },
        { $ref: '#/components/parameters/IsActiveParam' }
      ],
      responses: {
        200: {
          description: 'Daftar user berhasil diambil',
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
                      $ref: '#/components/schemas/User'
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

  '/api/staff/supervisor/system/status': {
    get: {
      tags: ['Staff Supervisor'],
      summary: 'Get status sistem 🔴 SUPERVISOR',
      description: 'Endpoint untuk mendapatkan status kesehatan sistem Panam Soccer Field',
      security: [
        { bearerAuth: [] },
        { cookieAuth: [] }
      ],
      responses: {
        200: {
          description: 'Status sistem berhasil diambil',
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
                            example: 15.5
                          }
                        }
                      },
                      memory: {
                        type: 'object',
                        properties: {
                          used: {
                            type: 'number',
                            example: 2.5
                          },
                          total: {
                            type: 'number',
                            example: 8.0
                          },
                          unit: {
                            type: 'string',
                            example: 'GB'
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

  '/api/staff/supervisor/audit-logs': {
    get: {
      tags: ['Staff Supervisor'],
      summary: 'Get audit logs sistem 🔴 SUPERVISOR',
      description: 'Endpoint untuk mendapatkan audit logs aktivitas sistem',
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
        }
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
                      type: 'object',
                      properties: {
                        id: {
                          type: 'integer'
                        },
                        user_id: {
                          type: 'integer'
                        },
                        action: {
                          type: 'string'
                        },
                        table_name: {
                          type: 'string'
                        },
                        record_id: {
                          type: 'integer'
                        },
                        old_values: {
                          type: 'object'
                        },
                        new_values: {
                          type: 'object'
                        },
                        ip_address: {
                          type: 'string'
                        },
                        user_agent: {
                          type: 'string'
                        },
                        created_at: {
                          type: 'string',
                          format: 'date-time'
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
  }
};

module.exports = staffPaths;
