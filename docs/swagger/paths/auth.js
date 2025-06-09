/**
 * Panam Soccer Field - Authentication API Documentation
 * Dokumentasi endpoint untuk autentikasi dan manajemen akun
 */

const authPaths = {
  '/api/auth/register': {
    post: {
      tags: ['Authentication'],
      summary: 'Register pengguna baru ⚪ PUBLIC',
      description: 'Endpoint untuk mendaftarkan pengguna baru dengan role default penyewa di Panam Soccer Field',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['name', 'email', 'password', 'phone'],
              properties: {
                name: {
                  type: 'string',
                  example: 'John Doe',
                  description: 'Nama lengkap'
                },
                email: {
                  type: 'string',
                  format: 'email',
                  example: 'john@example.com',
                  description: 'Email unik'
                },
                password: {
                  type: 'string',
                  example: 'password123',
                  description: 'Password minimal 6 karakter'
                },
                phone: {
                  type: 'string',
                  example: '081234567890',
                  description: 'Nomor telepon'
                },
                role: {
                  type: 'string',
                  enum: ['user', 'penyewa'],
                  default: 'user',
                  description: 'Role (opsional)'
                }
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
                  success: {
                    type: 'boolean',
                    example: true
                  },
                  message: {
                    type: 'string',
                    example: 'Registration successful'
                  },
                  user: {
                    $ref: '#/components/schemas/User'
                  },
                  token: {
                    type: 'string',
                    description: 'JWT token (development only)'
                  }
                }
              }
            }
          }
        },
        400: {
          $ref: '#/components/responses/BadRequest'
        },
        409: {
          $ref: '#/components/responses/Conflict'
        }
      }
    }
  },

  '/api/auth/login': {
    post: {
      tags: ['Authentication'],
      summary: 'Login pengguna ⚪ PUBLIC',
      description: 'Endpoint untuk autentikasi pengguna dengan email dan password di Panam Soccer Field',
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
                  example: 'futsaluas',
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
                  success: {
                    type: 'boolean',
                    example: true
                  },
                  message: {
                    type: 'string',
                    example: 'Login berhasil'
                  },
                  data: {
                    type: 'object',
                    properties: {
                      token: {
                        type: 'string',
                        description: 'JWT token'
                      },
                      user: {
                        $ref: '#/components/schemas/User'
                      }
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
                  success: {
                    type: 'boolean',
                    example: false
                  },
                  error: {
                    type: 'string',
                    example: 'Password salah'
                  }
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
      summary: 'Logout pengguna 🔵 AUTHENTICATED',
      description: 'Endpoint untuk logout pengguna dan menghapus session/token',
      security: [
        { bearerAuth: [] },
        { cookieAuth: [] }
      ],
      responses: {
        200: {
          description: 'Logout berhasil',
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
                    example: 'Logout successful'
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

  '/api/auth/profile': {
    get: {
      tags: ['Authentication'],
      summary: 'Get profil pengguna 🔵 AUTHENTICATED',
      description: 'Endpoint untuk mendapatkan profil pengguna yang sedang login',
      security: [
        { bearerAuth: [] },
        { cookieAuth: [] }
      ],
      responses: {
        200: {
          description: 'Profil berhasil diambil',
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
        }
      }
    }
  },

  '/api/auth/refresh': {
    post: {
      tags: ['Authentication'],
      summary: 'Refresh JWT token 🔵 AUTHENTICATED',
      description: 'Endpoint untuk memperbarui JWT token yang akan expired',
      security: [
        { bearerAuth: [] },
        { cookieAuth: [] }
      ],
      responses: {
        200: {
          description: 'Token berhasil di-refresh',
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
                    example: 'Token refreshed successfully'
                  },
                  data: {
                    type: 'object',
                    properties: {
                      token: {
                        type: 'string',
                        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                        description: 'JWT token baru yang sudah di-refresh'
                      },
                      expires_in: {
                        type: 'string',
                        example: '7d',
                        description: 'Durasi expired token (7 hari)'
                      },
                      user: {
                        type: 'object',
                        properties: {
                          id: {
                            type: 'integer',
                            example: 123
                          },
                          email: {
                            type: 'string',
                            example: 'user@example.com'
                          },
                          name: {
                            type: 'string',
                            example: 'John Doe'
                          },
                          role: {
                            type: 'string',
                            example: 'penyewa'
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
        }
      }
    }
  },

  '/api/auth/roles': {
    get: {
      tags: ['Authentication'],
      summary: 'Mendapatkan daftar role sistem ⚪ PUBLIC',
      description: 'Endpoint untuk mendapatkan semua role yang tersedia dalam sistem Panam Soccer Field 6-level hierarchy',
      responses: {
        200: {
          description: 'Daftar role berhasil diambil',
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
                      roles: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            value: {
                              type: 'string',
                              example: 'penyewa'
                            },
                            label: {
                              type: 'string',
                              example: 'Customer (Penyewa)'
                            },
                            level: {
                              type: 'integer',
                              example: 2
                            },
                            description: {
                              type: 'string',
                              example: 'Customer yang dapat melakukan booking'
                            }
                          }
                        }
                      },
                      hierarchy: {
                        type: 'array',
                        items: {
                          type: 'string'
                        },
                        example: ['pengunjung', 'penyewa', 'staff_kasir', 'operator_lapangan', 'manajer_futsal', 'supervisor_sistem']
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
};

module.exports = authPaths;
