/**
 * Panam Soccer Field - API Response Definitions
 * Komponen response yang dapat digunakan kembali untuk dokumentasi API
 */

const responses = {
  // Success Responses
  Success: {
    description: 'Operasi berhasil',
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
              example: 'Operation successful'
            },
            data: {
              type: 'object',
              description: 'Data hasil operasi'
            }
          }
        }
      }
    }
  },

  Created: {
    description: 'Resource berhasil dibuat',
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
              example: 'Resource created successfully'
            },
            data: {
              type: 'object',
              description: 'Data resource yang dibuat'
            }
          }
        }
      }
    }
  },

  // Error Responses
  BadRequest: {
    description: 'Request tidak valid atau parameter salah',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'string',
              example: 'Invalid request parameters'
            },
            details: {
              type: 'object',
              description: 'Detail error validasi'
            }
          }
        }
      }
    }
  },

  Unauthorized: {
    description: 'Tidak terautentikasi - Token tidak valid atau tidak ada',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'string',
              example: 'Unauthorized access'
            },
            message: {
              type: 'string',
              example: 'Please login to access this resource'
            }
          }
        }
      }
    }
  },

  Forbidden: {
    description: 'Akses ditolak - Role tidak memiliki permission',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'string',
              example: 'Access forbidden'
            },
            message: {
              type: 'string',
              example: 'Insufficient permissions for this operation'
            }
          }
        }
      }
    }
  },

  NotFound: {
    description: 'Resource tidak ditemukan',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'string',
              example: 'Resource not found'
            },
            message: {
              type: 'string',
              example: 'The requested resource was not found'
            }
          }
        }
      }
    }
  },

  Conflict: {
    description: 'Konflik data - Resource sudah ada atau konflik business rule',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'string',
              example: 'Data conflict'
            },
            message: {
              type: 'string',
              example: 'Resource already exists or conflicts with business rules'
            }
          }
        }
      }
    }
  },

  ValidationError: {
    description: 'Error validasi input',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'string',
              example: 'Validation failed'
            },
            details: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string',
                    example: 'email'
                  },
                  message: {
                    type: 'string',
                    example: 'Email format is invalid'
                  }
                }
              }
            }
          }
        }
      }
    }
  },

  InternalServerError: {
    description: 'Internal server error',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'string',
              example: 'Internal server error'
            },
            message: {
              type: 'string',
              example: 'An unexpected error occurred'
            }
          }
        }
      }
    }
  },

  // Booking Specific Responses
  BookingConflict: {
    description: 'Konflik waktu booking - Slot sudah dipesan',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'string',
              example: 'Booking conflict'
            },
            message: {
              type: 'string',
              example: 'Time slot already booked'
            },
            conflicting_bookings: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Booking'
              }
            }
          }
        }
      }
    }
  },

  PaymentRequired: {
    description: 'Pembayaran diperlukan untuk melanjutkan',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'string',
              example: 'Payment required'
            },
            message: {
              type: 'string',
              example: 'Payment must be completed before confirming booking'
            },
            payment_info: {
              type: 'object',
              properties: {
                amount: {
                  type: 'number',
                  format: 'decimal'
                },
                methods: {
                  type: 'array',
                  items: {
                    type: 'string'
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

module.exports = responses;
