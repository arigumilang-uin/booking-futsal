/**
 * Panam Soccer Field - Public API Documentation
 * Dokumentasi endpoint publik yang dapat diakses tanpa autentikasi
 */

const publicPaths = {
  '/api/public/fields': {
    get: {
      tags: ['Public'],
      summary: 'Get daftar lapangan publik ⚪ PUBLIC',
      description: 'Endpoint untuk mendapatkan daftar lapangan yang tersedia untuk umum di Panam Soccer Field',
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
                      allOf: [
                        { $ref: '#/components/schemas/Field' },
                        {
                          type: 'object',
                          properties: {
                            availability: {
                              type: 'object',
                              properties: {
                                today: {
                                  type: 'array',
                                  items: {
                                    type: 'object',
                                    properties: {
                                      time: {
                                        type: 'string',
                                        example: '10:00-12:00'
                                      },
                                      available: {
                                        type: 'boolean',
                                        example: true
                                      }
                                    }
                                  }
                                },
                                tomorrow: {
                                  type: 'array',
                                  items: {
                                    type: 'object',
                                    properties: {
                                      time: {
                                        type: 'string',
                                        example: '14:00-16:00'
                                      },
                                      available: {
                                        type: 'boolean',
                                        example: false
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      ]
                    }
                  },
                  pagination: {
                    $ref: '#/components/schemas/PaginationMeta'
                  }
                }
              }
            }
          }
        }
      }
    }
  },

  '/api/public/fields/{id}': {
    get: {
      tags: ['Public'],
      summary: 'Get detail lapangan publik ⚪ PUBLIC',
      description: 'Endpoint untuk mendapatkan detail lapangan berdasarkan ID',
      parameters: [
        { $ref: '#/components/parameters/FieldIdParam' }
      ],
      responses: {
        200: {
          description: 'Detail lapangan berhasil diambil',
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
                    allOf: [
                      { $ref: '#/components/schemas/Field' },
                      {
                        type: 'object',
                        properties: {
                          reviews: {
                            type: 'array',
                            items: {
                              $ref: '#/components/schemas/Review'
                            }
                          },
                          average_rating: {
                            type: 'number',
                            format: 'decimal',
                            example: 4.5
                          },
                          total_reviews: {
                            type: 'integer',
                            example: 25
                          },
                          availability: {
                            type: 'object',
                            properties: {
                              next_7_days: {
                                type: 'array',
                                items: {
                                  type: 'object',
                                  properties: {
                                    date: {
                                      type: 'string',
                                      format: 'date'
                                    },
                                    slots: {
                                      type: 'array',
                                      items: {
                                        type: 'object',
                                        properties: {
                                          time: {
                                            type: 'string',
                                            example: '08:00-10:00'
                                          },
                                          available: {
                                            type: 'boolean'
                                          },
                                          price: {
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
                      }
                    ]
                  }
                }
              }
            }
          }
        },
        404: {
          $ref: '#/components/responses/NotFound'
        }
      }
    }
  },

  '/api/public/fields/{id}/availability': {
    get: {
      tags: ['Public'],
      summary: 'Get ketersediaan lapangan ⚪ PUBLIC',
      description: 'Endpoint untuk mengecek ketersediaan lapangan pada tanggal tertentu',
      parameters: [
        { $ref: '#/components/parameters/FieldIdParam' },
        {
          in: 'query',
          name: 'date',
          required: true,
          schema: {
            type: 'string',
            format: 'date'
          },
          description: 'Tanggal yang ingin dicek (YYYY-MM-DD)'
        }
      ],
      responses: {
        200: {
          description: 'Ketersediaan lapangan berhasil diambil',
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
                      field_id: {
                        type: 'integer',
                        example: 1
                      },
                      field_name: {
                        type: 'string',
                        example: 'Lapangan Futsal A'
                      },
                      date: {
                        type: 'string',
                        format: 'date',
                        example: '2024-12-01'
                      },
                      operating_hours: {
                        type: 'string',
                        example: '08:00-22:00'
                      },
                      time_slots: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            start_time: {
                              type: 'string',
                              example: '08:00'
                            },
                            end_time: {
                              type: 'string',
                              example: '10:00'
                            },
                            available: {
                              type: 'boolean',
                              example: true
                            },
                            price: {
                              type: 'number',
                              format: 'decimal',
                              example: 100000
                            },
                            booking_id: {
                              type: 'integer',
                              nullable: true,
                              example: null,
                              description: 'ID booking jika slot sudah dipesan'
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
        404: {
          $ref: '#/components/responses/NotFound'
        }
      }
    }
  },

  '/api/public/promotions': {
    get: {
      tags: ['Public'],
      summary: 'Get daftar promosi aktif ⚪ PUBLIC',
      description: 'Endpoint untuk mendapatkan daftar promosi yang sedang aktif di Panam Soccer Field',
      parameters: [
        { $ref: '#/components/parameters/PageParam' },
        { $ref: '#/components/parameters/LimitParam' }
      ],
      responses: {
        200: {
          description: 'Daftar promosi berhasil diambil',
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
                      $ref: '#/components/schemas/Promotion'
                    }
                  },
                  pagination: {
                    $ref: '#/components/schemas/PaginationMeta'
                  }
                }
              }
            }
          }
        }
      }
    }
  },

  '/api/public/reviews': {
    get: {
      tags: ['Public'],
      summary: 'Get daftar review lapangan ⚪ PUBLIC',
      description: 'Endpoint untuk mendapatkan review lapangan dari customer',
      parameters: [
        { $ref: '#/components/parameters/PageParam' },
        { $ref: '#/components/parameters/LimitParam' },
        { $ref: '#/components/parameters/FieldIdQueryParam' },
        { $ref: '#/components/parameters/RatingParam' }
      ],
      responses: {
        200: {
          description: 'Daftar review berhasil diambil',
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
                      $ref: '#/components/schemas/Review'
                    }
                  },
                  pagination: {
                    $ref: '#/components/schemas/PaginationMeta'
                  },
                  statistics: {
                    type: 'object',
                    properties: {
                      average_rating: {
                        type: 'number',
                        format: 'decimal',
                        example: 4.3
                      },
                      total_reviews: {
                        type: 'integer',
                        example: 150
                      },
                      rating_distribution: {
                        type: 'object',
                        properties: {
                          '5': {
                            type: 'integer',
                            example: 75
                          },
                          '4': {
                            type: 'integer',
                            example: 45
                          },
                          '3': {
                            type: 'integer',
                            example: 20
                          },
                          '2': {
                            type: 'integer',
                            example: 7
                          },
                          '1': {
                            type: 'integer',
                            example: 3
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

  '/api/public/contact': {
    get: {
      tags: ['Public'],
      summary: 'Get informasi kontak ⚪ PUBLIC',
      description: 'Endpoint untuk mendapatkan informasi kontak Panam Soccer Field',
      responses: {
        200: {
          description: 'Informasi kontak berhasil diambil',
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
                      name: {
                        type: 'string',
                        example: 'Panam Soccer Field'
                      },
                      address: {
                        type: 'string',
                        example: 'Jl. Panam Raya No. 123, Pekanbaru, Riau'
                      },
                      phone: {
                        type: 'string',
                        example: '+62 761 123456'
                      },
                      email: {
                        type: 'string',
                        example: 'info@panamsoccerfield.com'
                      },
                      website: {
                        type: 'string',
                        example: 'https://panamsoccerfield.com'
                      },
                      social_media: {
                        type: 'object',
                        properties: {
                          instagram: {
                            type: 'string',
                            example: '@panamsoccerfield'
                          },
                          facebook: {
                            type: 'string',
                            example: 'Panam Soccer Field'
                          },
                          whatsapp: {
                            type: 'string',
                            example: '+62 812 3456 7890'
                          }
                        }
                      },
                      operating_hours: {
                        type: 'object',
                        properties: {
                          weekdays: {
                            type: 'string',
                            example: '08:00 - 22:00'
                          },
                          weekends: {
                            type: 'string',
                            example: '07:00 - 23:00'
                          }
                        }
                      },
                      coordinates: {
                        type: 'object',
                        properties: {
                          latitude: {
                            type: 'number',
                            format: 'decimal',
                            example: 0.507068
                          },
                          longitude: {
                            type: 'number',
                            format: 'decimal',
                            example: 101.449539
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
  }
};

module.exports = publicPaths;
