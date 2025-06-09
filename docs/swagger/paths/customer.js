/**
 * Panam Soccer Field - Customer API Documentation
 * Dokumentasi endpoint untuk customer (penyewa) operations
 */

const customerPaths = {
  '/api/customer/profile': {
    get: {
      tags: ['Customer'],
      summary: 'Get profil customer 🔵 CUSTOMER',
      description: 'Endpoint untuk mendapatkan profil customer yang sedang login di Panam Soccer Field',
      security: [
        { bearerAuth: [] },
        { cookieAuth: [] }
      ],
      responses: {
        200: {
          description: 'Profil customer berhasil diambil',
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
                    $ref: '#/components/schemas/User'
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
      tags: ['Customer'],
      summary: 'Update profil customer 🔵 CUSTOMER',
      description: 'Endpoint untuk mengupdate profil customer yang sedang login',
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
                name: {
                  type: 'string',
                  example: 'John Doe Updated',
                  description: 'Nama lengkap customer'
                },
                email: {
                  type: 'string',
                  format: 'email',
                  example: 'john.updated@example.com',
                  description: 'Email customer'
                },
                phone: {
                  type: 'string',
                  example: '081234567890',
                  description: 'Nomor telepon customer'
                }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Profil berhasil diupdate',
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
                    example: 'Profile updated successfully'
                  },
                  data: {
                    $ref: '#/components/schemas/User'
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
        }
      }
    }
  },

  '/api/customer/fields': {
    get: {
      tags: ['Customer'],
      summary: 'Get daftar lapangan tersedia 🔵 CUSTOMER',
      description: 'Endpoint untuk mendapatkan daftar lapangan yang tersedia untuk booking',
      security: [
        { bearerAuth: [] },
        { cookieAuth: [] }
      ],
      parameters: [
        { $ref: '#/components/parameters/PageParam' },
        { $ref: '#/components/parameters/LimitParam' },
        { $ref: '#/components/parameters/SearchParam' },
        { $ref: '#/components/parameters/FieldTypeParam' },
        { $ref: '#/components/parameters/LocationParam' }
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
        }
      }
    }
  },

  '/api/customer/bookings': {
    post: {
      tags: ['Customer'],
      summary: 'Buat booking baru 🔵 CUSTOMER',
      description: 'Endpoint untuk membuat booking lapangan baru di Panam Soccer Field',
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
              required: ['field_id', 'date', 'start_time', 'end_time', 'name', 'phone'],
              properties: {
                field_id: {
                  type: 'integer',
                  example: 1,
                  description: 'ID lapangan'
                },
                date: {
                  type: 'string',
                  format: 'date',
                  example: '2024-12-01',
                  description: 'Tanggal booking'
                },
                start_time: {
                  type: 'string',
                  example: '10:00',
                  description: 'Waktu mulai (HH:MM)'
                },
                end_time: {
                  type: 'string',
                  example: '12:00',
                  description: 'Waktu selesai (HH:MM)'
                },
                name: {
                  type: 'string',
                  example: 'John Doe',
                  description: 'Nama pemesan'
                },
                phone: {
                  type: 'string',
                  example: '081234567890',
                  description: 'Nomor telepon'
                },
                email: {
                  type: 'string',
                  format: 'email',
                  example: 'john@example.com',
                  description: 'Email (opsional)'
                },
                notes: {
                  type: 'string',
                  example: 'Booking untuk turnamen',
                  description: 'Catatan tambahan'
                }
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
                  success: {
                    type: 'boolean',
                    example: true
                  },
                  message: {
                    type: 'string',
                    example: 'Booking created successfully'
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
        409: {
          $ref: '#/components/responses/BookingConflict'
        }
      }
    },
    get: {
      tags: ['Customer'],
      summary: 'Get daftar booking customer 🔵 CUSTOMER',
      description: 'Endpoint untuk mendapatkan semua booking milik customer yang sedang login',
      security: [
        { bearerAuth: [] },
        { cookieAuth: [] }
      ],
      parameters: [
        { $ref: '#/components/parameters/PageParam' },
        { $ref: '#/components/parameters/LimitParam' },
        { $ref: '#/components/parameters/BookingStatusParam' }
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
        }
      }
    }
  },

  '/api/customer/bookings/{id}': {
    get: {
      tags: ['Customer'],
      summary: 'Get detail booking customer 🔵 CUSTOMER',
      description: 'Endpoint untuk mendapatkan detail booking berdasarkan ID',
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
        404: {
          $ref: '#/components/responses/NotFound'
        }
      }
    }
  },

  '/api/customer/bookings/{id}/cancel': {
    put: {
      tags: ['Customer'],
      summary: 'Batalkan booking customer 🔵 CUSTOMER',
      description: 'Endpoint untuk membatalkan booking yang sudah dibuat',
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
          description: 'ID booking yang akan dibatalkan'
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['reason'],
              properties: {
                reason: {
                  type: 'string',
                  example: 'Perubahan jadwal mendadak',
                  description: 'Alasan pembatalan'
                }
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
                  success: {
                    type: 'boolean',
                    example: true
                  },
                  message: {
                    type: 'string',
                    example: 'Booking cancelled successfully'
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
        404: {
          $ref: '#/components/responses/NotFound'
        }
      }
    }
  },

  '/api/customer/dashboard': {
    get: {
      tags: ['Customer'],
      summary: 'Get dashboard customer 🔵 CUSTOMER',
      description: 'Endpoint untuk mendapatkan data dashboard customer dengan statistik dan informasi terkini',
      security: [
        { bearerAuth: [] },
        { cookieAuth: [] }
      ],
      responses: {
        200: {
          description: 'Data dashboard berhasil diambil',
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
                      stats: {
                        type: 'object',
                        properties: {
                          total_bookings: {
                            type: 'integer',
                            example: 15
                          },
                          active_bookings: {
                            type: 'integer',
                            example: 3
                          },
                          completed_bookings: {
                            type: 'integer',
                            example: 10
                          },
                          total_spent: {
                            type: 'number',
                            format: 'decimal',
                            example: 1500000
                          }
                        }
                      },
                      recent_bookings: {
                        type: 'array',
                        items: {
                          $ref: '#/components/schemas/Booking'
                        }
                      },
                      favorite_fields: {
                        type: 'array',
                        items: {
                          $ref: '#/components/schemas/Field'
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
        }
      }
    }
  }
};

module.exports = customerPaths;
