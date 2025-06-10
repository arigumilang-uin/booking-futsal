/**
 * Panam Soccer Field - Payment API Documentation
 * Dokumentasi endpoint untuk payment operations
 */

const paymentPaths = {
  '/api/customer/payments': {
    get: {
      tags: ['Customer - Payment'],
      summary: 'Get daftar pembayaran customer 🔵 CUSTOMER',
      description: 'Endpoint untuk mendapatkan semua pembayaran milik customer yang sedang login',
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
        }
      }
    }
  },

  '/api/customer/payments/{id}': {
    get: {
      tags: ['Customer - Payment'],
      summary: 'Get detail pembayaran customer 🔵 CUSTOMER',
      description: 'Endpoint untuk mendapatkan detail pembayaran berdasarkan ID',
      security: [
        { bearerAuth: [] },
        { cookieAuth: [] }
      ],
      parameters: [
        { $ref: '#/components/parameters/PaymentIdParam' }
      ],
      responses: {
        200: {
          description: 'Detail pembayaran berhasil diambil',
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
                    $ref: '#/components/schemas/Payment'
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

  '/api/customer/payments/create': {
    post: {
      tags: ['Customer - Payment'],
      summary: 'Buat pembayaran untuk booking 🔵 CUSTOMER',
      description: 'Endpoint untuk membuat pembayaran untuk booking yang sudah dibuat',
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
              required: ['booking_id', 'payment_method'],
              properties: {
                booking_id: {
                  type: 'integer',
                  example: 1,
                  description: 'ID booking yang akan dibayar'
                },
                payment_method: {
                  type: 'string',
                  enum: ['transfer', 'cash', 'e_wallet', 'credit_card'],
                  example: 'transfer',
                  description: 'Metode pembayaran'
                },
                amount: {
                  type: 'number',
                  format: 'decimal',
                  example: 200000,
                  description: 'Jumlah pembayaran (opsional, akan dihitung otomatis)'
                },
                notes: {
                  type: 'string',
                  example: 'Transfer via BCA',
                  description: 'Catatan pembayaran'
                },
                promotion_code: {
                  type: 'string',
                  example: 'DISKON10',
                  description: 'Kode promosi (opsional)'
                }
              }
            }
          }
        }
      },
      responses: {
        201: {
          description: 'Pembayaran berhasil dibuat',
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
                    example: 'Payment created successfully'
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
        404: {
          $ref: '#/components/responses/NotFound'
        }
      }
    }
  },

  '/api/customer/payments/{id}/upload-proof': {
    post: {
      tags: ['Customer - Payment'],
      summary: 'Upload bukti pembayaran 🔵 CUSTOMER',
      description: 'Endpoint untuk mengupload bukti pembayaran (transfer/e-wallet)',
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
          'multipart/form-data': {
            schema: {
              type: 'object',
              required: ['proof_file'],
              properties: {
                proof_file: {
                  type: 'string',
                  format: 'binary',
                  description: 'File bukti pembayaran (JPG, PNG, PDF)'
                },
                notes: {
                  type: 'string',
                  example: 'Transfer dari rekening BCA a.n John Doe',
                  description: 'Catatan tambahan'
                }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Bukti pembayaran berhasil diupload',
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
                    example: 'Payment proof uploaded successfully'
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
        404: {
          $ref: '#/components/responses/NotFound'
        }
      }
    }
  },

  '/api/customer/dashboard/payments': {
    get: {
      tags: ['Customer - Payment'],
      summary: 'Get statistik pembayaran customer 🔵 CUSTOMER',
      description: 'Endpoint untuk mendapatkan statistik pembayaran untuk dashboard customer',
      security: [
        { bearerAuth: [] },
        { cookieAuth: [] }
      ],
      responses: {
        200: {
          description: 'Statistik pembayaran berhasil diambil',
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
                      total_payments: {
                        type: 'integer',
                        example: 15,
                        description: 'Total pembayaran'
                      },
                      paid_payments: {
                        type: 'integer',
                        example: 12,
                        description: 'Pembayaran lunas'
                      },
                      pending_payments: {
                        type: 'integer',
                        example: 2,
                        description: 'Pembayaran pending'
                      },
                      failed_payments: {
                        type: 'integer',
                        example: 1,
                        description: 'Pembayaran gagal'
                      },
                      total_amount: {
                        type: 'number',
                        format: 'decimal',
                        example: 1500000,
                        description: 'Total jumlah pembayaran'
                      },
                      recent_payments: {
                        type: 'array',
                        items: {
                          $ref: '#/components/schemas/Payment'
                        },
                        description: 'Pembayaran terbaru'
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

module.exports = paymentPaths;
