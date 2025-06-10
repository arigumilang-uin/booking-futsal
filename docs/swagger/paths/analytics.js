/**
 * Panam Soccer Field - Analytics API Documentation
 * Dokumentasi endpoint untuk analytics dan reporting
 */

const analyticsPaths = {
  '/api/analytics/dashboard': {
    get: {
      tags: ['Analytics'],
      summary: 'Get analytics dashboard 🟡 MANAGEMENT+',
      description: 'Endpoint untuk mendapatkan data analytics untuk dashboard management',
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
                    $ref: '#/components/schemas/BookingAnalytics'
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

  '/api/analytics/revenue': {
    get: {
      tags: ['Analytics'],
      summary: 'Get revenue analytics 🟡 MANAGEMENT+',
      description: 'Endpoint untuk mendapatkan analytics pendapatan',
      security: [
        { bearerAuth: [] },
        { cookieAuth: [] }
      ],
      parameters: [
        { $ref: '#/components/parameters/PeriodParam' },
        { $ref: '#/components/parameters/DateFromParam' },
        { $ref: '#/components/parameters/DateToParam' },
        {
          in: 'query',
          name: 'group_by',
          schema: {
            type: 'string',
            enum: ['day', 'week', 'month', 'field', 'payment_method'],
            default: 'day'
          },
          description: 'Pengelompokan data revenue'
        }
      ],
      responses: {
        200: {
          description: 'Data revenue analytics berhasil diambil',
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
                      total_revenue: {
                        type: 'number',
                        format: 'decimal',
                        example: 15000000
                      },
                      growth_percentage: {
                        type: 'number',
                        format: 'decimal',
                        example: 12.5
                      },
                      revenue_by_period: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            period: {
                              type: 'string',
                              example: '2024-01-01'
                            },
                            revenue: {
                              type: 'number',
                              format: 'decimal',
                              example: 500000
                            },
                            bookings_count: {
                              type: 'integer',
                              example: 10
                            }
                          }
                        }
                      },
                      top_revenue_fields: {
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

  '/api/analytics/fields': {
    get: {
      tags: ['Analytics'],
      summary: 'Get field utilization analytics 🟡 MANAGEMENT+',
      description: 'Endpoint untuk mendapatkan analytics utilisasi lapangan',
      security: [
        { bearerAuth: [] },
        { cookieAuth: [] }
      ],
      parameters: [
        { $ref: '#/components/parameters/PeriodParam' },
        { $ref: '#/components/parameters/DateFromParam' },
        { $ref: '#/components/parameters/DateToParam' },
        { $ref: '#/components/parameters/FieldIdQueryParam' }
      ],
      responses: {
        200: {
          description: 'Data field analytics berhasil diambil',
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
                      overall_utilization: {
                        type: 'number',
                        format: 'decimal',
                        example: 75.5,
                        description: 'Persentase utilisasi keseluruhan'
                      },
                      fields_utilization: {
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
                            utilization_percentage: {
                              type: 'number',
                              format: 'decimal'
                            },
                            total_hours_booked: {
                              type: 'number',
                              format: 'decimal'
                            },
                            total_bookings: {
                              type: 'integer'
                            },
                            revenue: {
                              type: 'number',
                              format: 'decimal'
                            }
                          }
                        }
                      },
                      peak_hours: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            hour: {
                              type: 'integer',
                              example: 19
                            },
                            bookings_count: {
                              type: 'integer',
                              example: 25
                            }
                          }
                        }
                      },
                      popular_days: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            day: {
                              type: 'string',
                              example: 'Saturday'
                            },
                            bookings_count: {
                              type: 'integer',
                              example: 45
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

  '/api/analytics/customers': {
    get: {
      tags: ['Analytics'],
      summary: 'Get customer analytics 🟡 MANAGEMENT+',
      description: 'Endpoint untuk mendapatkan analytics customer dan behavior',
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
          description: 'Data customer analytics berhasil diambil',
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
                      total_customers: {
                        type: 'integer',
                        example: 150
                      },
                      new_customers: {
                        type: 'integer',
                        example: 25
                      },
                      active_customers: {
                        type: 'integer',
                        example: 80
                      },
                      customer_retention_rate: {
                        type: 'number',
                        format: 'decimal',
                        example: 65.5
                      },
                      top_customers: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            user_id: {
                              type: 'integer'
                            },
                            name: {
                              type: 'string'
                            },
                            total_bookings: {
                              type: 'integer'
                            },
                            total_spent: {
                              type: 'number',
                              format: 'decimal'
                            }
                          }
                        }
                      },
                      customer_segments: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            segment: {
                              type: 'string',
                              example: 'Regular'
                            },
                            count: {
                              type: 'integer',
                              example: 45
                            },
                            percentage: {
                              type: 'number',
                              format: 'decimal',
                              example: 30.0
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
  }
};

module.exports = analyticsPaths;
