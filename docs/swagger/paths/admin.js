/**
 * Panam Soccer Field - Admin API Documentation
 * Dokumentasi endpoint untuk administrator sistem (Management + Supervisor)
 */

const adminPaths = {
  '/api/admin/bookings': {
    get: {
      tags: ['Admin'],
      summary: 'Get semua booking untuk admin 🟡 MANAGEMENT',
      description: 'Endpoint untuk mendapatkan semua booking dengan akses admin/management di Panam Soccer Field',
      security: [
        { bearerAuth: [] },
        { cookieAuth: [] }
      ],
      parameters: [
        { $ref: '#/components/parameters/PageParam' },
        { $ref: '#/components/parameters/LimitParam' },
        { $ref: '#/components/parameters/BookingStatusParam' },
        { $ref: '#/components/parameters/UserIdQueryParam' },
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

  '/api/admin/bookings/{id}': {
    get: {
      tags: ['Admin'],
      summary: 'Get detail booking untuk admin 🟡 MANAGEMENT',
      description: 'Endpoint untuk mendapatkan detail booking dengan akses admin',
      security: [
        { bearerAuth: [] },
        { cookieAuth: [] }
      ],
      parameters: [
        { $ref: '#/components/parameters/BookingIdParam' }
      ],
      responses: {
        200: {
          description: 'Detail booking berhasil diambil',
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
                    $ref: '#/components/schemas/Booking'
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

  '/api/admin/bookings/{id}/status': {
    put: {
      tags: ['Admin'],
      summary: 'Update status booking (admin override) 🟡 MANAGEMENT',
      description: 'Endpoint untuk mengupdate status booking dengan override admin',
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
              required: ['status'],
              properties: {
                status: {
                  type: 'string',
                  enum: ['pending', 'confirmed', 'completed', 'cancelled'],
                  description: 'Status booking baru'
                },
                reason: {
                  type: 'string',
                  example: 'Admin override untuk keperluan maintenance',
                  description: 'Alasan perubahan status'
                }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Status booking berhasil diupdate',
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
                    example: 'Booking status updated successfully'
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

  '/api/admin/bookings/statistics': {
    get: {
      tags: ['Admin'],
      summary: 'Get statistik booking 🟡 MANAGEMENT',
      description: 'Endpoint untuk mendapatkan statistik booking untuk admin dashboard',
      security: [
        { bearerAuth: [] },
        { cookieAuth: [] }
      ],
      parameters: [
        { $ref: '#/components/parameters/PeriodParam' },
        { $ref: '#/components/parameters/DateFromParam' },
        { $ref: '#/components/parameters/DateToParam' }
      ],
      responses: {
        200: {
          description: 'Statistik booking berhasil diambil',
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
                      total_bookings: {
                        type: 'integer',
                        example: 150
                      },
                      confirmed_bookings: {
                        type: 'integer',
                        example: 120
                      },
                      pending_bookings: {
                        type: 'integer',
                        example: 20
                      },
                      cancelled_bookings: {
                        type: 'integer',
                        example: 10
                      },
                      total_revenue: {
                        type: 'number',
                        format: 'decimal',
                        example: 15000000
                      },
                      average_booking_value: {
                        type: 'number',
                        format: 'decimal',
                        example: 100000
                      },
                      popular_fields: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            field_id: {
                              type: 'integer'
                            },
                            field_name: {
                              type: 'string'
                            },
                            booking_count: {
                              type: 'integer'
                            }
                          }
                        }
                      },
                      booking_trends: {
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
                            revenue: {
                              type: 'number',
                              format: 'decimal'
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

  '/api/admin/fields': {
    get: {
      tags: ['Admin'],
      summary: 'Get semua lapangan untuk admin 🟡 MANAGEMENT',
      description: 'Endpoint untuk mendapatkan semua lapangan dengan akses admin',
      security: [
        { bearerAuth: [] },
        { cookieAuth: [] }
      ],
      parameters: [
        { $ref: '#/components/parameters/PageParam' },
        { $ref: '#/components/parameters/LimitParam' },
        { $ref: '#/components/parameters/SearchParam' },
        { $ref: '#/components/parameters/FieldTypeParam' },
        { $ref: '#/components/parameters/IsActiveParam' }
      ],
      responses: {
        200: {
          description: 'Daftar lapangan berhasil diambil',
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
                      $ref: '#/components/schemas/Field'
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
      tags: ['Admin'],
      summary: 'Create lapangan baru 🟡 MANAGEMENT',
      description: 'Endpoint untuk membuat lapangan baru di Panam Soccer Field',
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
              required: ['name', 'price'],
              properties: {
                name: {
                  type: 'string',
                  example: 'Lapangan Futsal A',
                  description: 'Nama lapangan'
                },
                type: {
                  type: 'string',
                  enum: ['indoor', 'outdoor'],
                  example: 'indoor',
                  description: 'Jenis lapangan'
                },
                description: {
                  type: 'string',
                  example: 'Lapangan futsal indoor dengan fasilitas lengkap',
                  description: 'Deskripsi lapangan'
                },
                price: {
                  type: 'number',
                  format: 'decimal',
                  example: 100000,
                  description: 'Harga per jam'
                },
                price_weekend: {
                  type: 'number',
                  format: 'decimal',
                  example: 120000,
                  description: 'Harga weekend per jam'
                },
                price_member: {
                  type: 'number',
                  format: 'decimal',
                  example: 90000,
                  description: 'Harga member per jam'
                },
                capacity: {
                  type: 'integer',
                  example: 14,
                  description: 'Kapasitas maksimal pemain'
                },
                location: {
                  type: 'string',
                  example: 'Lantai 2',
                  description: 'Lokasi lapangan'
                },
                address: {
                  type: 'string',
                  example: 'Jl. Panam Raya No. 123',
                  description: 'Alamat lengkap'
                },
                facilities: {
                  type: 'array',
                  items: {
                    type: 'string'
                  },
                  example: ['AC', 'Sound System', 'Toilet', 'Parkir'],
                  description: 'Fasilitas yang tersedia'
                },
                coordinates: {
                  type: 'string',
                  example: '-0.123456,101.654321',
                  description: 'Koordinat GPS'
                },
                operating_hours: {
                  type: 'string',
                  example: '08:00-22:00',
                  description: 'Jam operasional'
                },
                operating_days: {
                  type: 'array',
                  items: {
                    type: 'string'
                  },
                  example: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                  description: 'Hari operasional'
                },
                assigned_operator: {
                  type: 'integer',
                  example: 5,
                  description: 'ID operator yang ditugaskan'
                }
              }
            }
          }
        }
      },
      responses: {
        201: {
          description: 'Lapangan berhasil dibuat',
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
                    example: 'Field created successfully'
                  },
                  data: {
                    $ref: '#/components/schemas/Field'
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

  // =====================================================
  // SYSTEM SETTINGS ROUTES - ADMIN ONLY
  // =====================================================

  '/api/admin/settings': {
    get: {
      tags: ['Admin - System Settings'],
      summary: 'Get all system settings 🔴 SUPERVISOR ONLY',
      description: 'Endpoint untuk mendapatkan semua pengaturan sistem',
      security: [
        { bearerAuth: [] },
        { cookieAuth: [] }
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
                      type: 'object',
                      properties: {
                        key: {
                          type: 'string',
                          example: 'booking_auto_completion_hours'
                        },
                        value: {
                          type: 'string',
                          example: '24'
                        },
                        description: {
                          type: 'string',
                          example: 'Hours after which booking is auto-completed'
                        },
                        is_public: {
                          type: 'boolean',
                          example: false
                        },
                        category: {
                          type: 'string',
                          example: 'booking'
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
    },
    post: {
      tags: ['Admin - System Settings'],
      summary: 'Create new system setting 🔴 SUPERVISOR ONLY',
      description: 'Endpoint untuk membuat pengaturan sistem baru',
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
              required: ['key', 'value'],
              properties: {
                key: {
                  type: 'string',
                  example: 'new_setting_key',
                  description: 'Unique setting key'
                },
                value: {
                  type: 'string',
                  example: 'setting_value',
                  description: 'Setting value'
                },
                description: {
                  type: 'string',
                  example: 'Description of the setting',
                  description: 'Setting description'
                },
                is_public: {
                  type: 'boolean',
                  example: false,
                  description: 'Whether setting is publicly accessible'
                },
                category: {
                  type: 'string',
                  example: 'general',
                  description: 'Setting category'
                }
              }
            }
          }
        }
      },
      responses: {
        201: {
          description: 'Setting berhasil dibuat',
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
                    example: 'Setting created successfully'
                  },
                  data: {
                    type: 'object',
                    properties: {
                      key: {
                        type: 'string'
                      },
                      value: {
                        type: 'string'
                      },
                      description: {
                        type: 'string'
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
        },
        409: {
          $ref: '#/components/responses/Conflict'
        }
      }
    }
  },

  '/api/admin/settings/public': {
    get: {
      tags: ['Admin - System Settings'],
      summary: 'Get public system settings 🔴 SUPERVISOR ONLY',
      description: 'Endpoint untuk mendapatkan pengaturan sistem yang bersifat publik',
      security: [
        { bearerAuth: [] },
        { cookieAuth: [] }
      ],
      responses: {
        200: {
          description: 'Public settings berhasil diambil',
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
                        key: {
                          type: 'string'
                        },
                        value: {
                          type: 'string'
                        },
                        description: {
                          type: 'string'
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

  '/api/admin/settings/{key}': {
    get: {
      tags: ['Admin - System Settings'],
      summary: 'Get specific system setting 🔴 SUPERVISOR ONLY',
      description: 'Endpoint untuk mendapatkan pengaturan sistem berdasarkan key',
      security: [
        { bearerAuth: [] },
        { cookieAuth: [] }
      ],
      parameters: [
        {
          in: 'path',
          name: 'key',
          required: true,
          schema: {
            type: 'string'
          },
          description: 'Setting key',
          example: 'booking_auto_completion_hours'
        }
      ],
      responses: {
        200: {
          description: 'Setting berhasil diambil',
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
                      key: {
                        type: 'string'
                      },
                      value: {
                        type: 'string'
                      },
                      description: {
                        type: 'string'
                      },
                      is_public: {
                        type: 'boolean'
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
    },
    put: {
      tags: ['Admin - System Settings'],
      summary: 'Update system setting 🔴 SUPERVISOR ONLY',
      description: 'Endpoint untuk mengupdate pengaturan sistem',
      security: [
        { bearerAuth: [] },
        { cookieAuth: [] }
      ],
      parameters: [
        {
          in: 'path',
          name: 'key',
          required: true,
          schema: {
            type: 'string'
          },
          description: 'Setting key'
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['value'],
              properties: {
                value: {
                  type: 'string',
                  example: '48',
                  description: 'New setting value'
                },
                description: {
                  type: 'string',
                  example: 'Updated description',
                  description: 'Updated description'
                }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Setting berhasil diupdate',
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
                    example: 'Setting updated successfully'
                  },
                  data: {
                    type: 'object',
                    properties: {
                      key: {
                        type: 'string'
                      },
                      value: {
                        type: 'string'
                      },
                      old_value: {
                        type: 'string'
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
        },
        404: {
          $ref: '#/components/responses/NotFound'
        }
      }
    },
    delete: {
      tags: ['Admin - System Settings'],
      summary: 'Delete system setting 🔴 SUPERVISOR ONLY',
      description: 'Endpoint untuk menghapus pengaturan sistem',
      security: [
        { bearerAuth: [] },
        { cookieAuth: [] }
      ],
      parameters: [
        {
          in: 'path',
          name: 'key',
          required: true,
          schema: {
            type: 'string'
          },
          description: 'Setting key'
        }
      ],
      responses: {
        200: {
          description: 'Setting berhasil dihapus',
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
                    example: 'Setting deleted successfully'
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

module.exports = adminPaths;
