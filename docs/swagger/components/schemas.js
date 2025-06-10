/**
 * Panam Soccer Field - API Schema Definitions
 * Komponen schema yang dapat digunakan kembali untuk dokumentasi API
 */

const schemas = {
  // User Schema
  User: {
    type: 'object',
    properties: {
      id: { type: 'integer', description: 'ID unik user' },
      uuid: { type: 'string', format: 'uuid', description: 'UUID user' },
      name: { type: 'string', description: 'Nama lengkap user' },
      email: { type: 'string', format: 'email', description: 'Email user' },
      phone: { type: 'string', description: 'Nomor telepon user' },
      role: {
        type: 'string',
        enum: ['pengunjung', 'penyewa', 'staff_kasir', 'operator_lapangan', 'manajer_futsal', 'supervisor_sistem'],
        description: 'Role user dalam sistem Panam Soccer Field 6-level hierarchy'
      },
      is_active: { type: 'boolean', description: 'Status aktif user' },
      email_verified: { type: 'boolean', description: 'Status verifikasi email' },
      created_at: { type: 'string', format: 'date-time', description: 'Tanggal dibuat' },
      updated_at: { type: 'string', format: 'date-time', description: 'Tanggal diupdate' }
    }
  },

  // Field Schema
  Field: {
    type: 'object',
    properties: {
      id: { type: 'integer', description: 'ID unik lapangan' },
      name: { type: 'string', description: 'Nama lapangan' },
      type: { type: 'string', description: 'Jenis lapangan (indoor/outdoor)' },
      description: { type: 'string', description: 'Deskripsi lapangan' },
      price: { type: 'number', format: 'decimal', description: 'Harga per jam' },
      price_weekend: { type: 'number', format: 'decimal', description: 'Harga weekend per jam' },
      price_member: { type: 'number', format: 'decimal', description: 'Harga member per jam' },
      capacity: { type: 'integer', description: 'Kapasitas maksimal pemain' },
      location: { type: 'string', description: 'Lokasi lapangan' },
      address: { type: 'string', description: 'Alamat lengkap lapangan' },
      facilities: { type: 'array', items: { type: 'string' }, description: 'Fasilitas yang tersedia' },
      coordinates: { type: 'string', description: 'Koordinat GPS lapangan' },
      operating_hours: { type: 'string', description: 'Jam operasional' },
      operating_days: { type: 'array', items: { type: 'string' }, description: 'Hari operasional' },
      assigned_operator: { type: 'integer', description: 'ID operator yang ditugaskan' },
      is_active: { type: 'boolean', description: 'Status aktif lapangan' },
      created_at: { type: 'string', format: 'date-time', description: 'Tanggal dibuat' },
      updated_at: { type: 'string', format: 'date-time', description: 'Tanggal diupdate' }
    }
  },

  // Booking Schema
  Booking: {
    type: 'object',
    properties: {
      id: { type: 'integer', description: 'ID unik booking' },
      user_id: { type: 'integer', description: 'ID user pemesan' },
      field_id: { type: 'integer', description: 'ID lapangan' },
      date: { type: 'string', format: 'date', description: 'Tanggal booking' },
      start_time: { type: 'string', description: 'Waktu mulai (HH:MM)' },
      end_time: { type: 'string', description: 'Waktu selesai (HH:MM)' },
      duration: { type: 'integer', description: 'Durasi dalam menit' },
      total_amount: { type: 'number', format: 'decimal', description: 'Total biaya' },
      status: {
        type: 'string',
        enum: ['pending', 'confirmed', 'completed', 'cancelled'],
        description: 'Status booking'
      },
      payment_status: {
        type: 'string',
        enum: ['pending', 'paid', 'failed', 'refunded'],
        description: 'Status pembayaran'
      },
      name: { type: 'string', description: 'Nama pemesan' },
      phone: { type: 'string', description: 'Nomor telepon pemesan' },
      email: { type: 'string', format: 'email', description: 'Email pemesan' },
      notes: { type: 'string', description: 'Catatan tambahan' },
      created_at: { type: 'string', format: 'date-time', description: 'Tanggal dibuat' },
      updated_at: { type: 'string', format: 'date-time', description: 'Tanggal diupdate' },
      user: { $ref: '#/components/schemas/User' },
      field: { $ref: '#/components/schemas/Field' }
    }
  },

  // Payment Schema
  Payment: {
    type: 'object',
    properties: {
      id: { type: 'integer', description: 'ID unik pembayaran' },
      booking_id: { type: 'integer', description: 'ID booking terkait' },
      amount: { type: 'number', format: 'decimal', description: 'Jumlah pembayaran' },
      method: {
        type: 'string',
        enum: ['transfer', 'cash', 'ewallet', 'credit_card'],
        description: 'Metode pembayaran'
      },
      status: {
        type: 'string',
        enum: ['pending', 'paid', 'failed', 'refunded'],
        description: 'Status pembayaran'
      },
      reference_number: { type: 'string', description: 'Nomor referensi pembayaran' },
      payment_proof: { type: 'string', description: 'URL bukti pembayaran' },
      processed_by: { type: 'integer', description: 'ID staff yang memproses' },
      processed_at: { type: 'string', format: 'date-time', description: 'Waktu diproses' },
      notes: { type: 'string', description: 'Catatan pembayaran' },
      created_at: { type: 'string', format: 'date-time', description: 'Tanggal dibuat' },
      updated_at: { type: 'string', format: 'date-time', description: 'Tanggal diupdate' }
    }
  },

  // Pagination Meta Schema
  PaginationMeta: {
    type: 'object',
    properties: {
      current_page: { type: 'integer', description: 'Halaman saat ini' },
      per_page: { type: 'integer', description: 'Item per halaman' },
      total: { type: 'integer', description: 'Total item' },
      total_pages: { type: 'integer', description: 'Total halaman' },
      has_next: { type: 'boolean', description: 'Ada halaman selanjutnya' },
      has_prev: { type: 'boolean', description: 'Ada halaman sebelumnya' }
    }
  },

  // Notification Schema
  Notification: {
    type: 'object',
    properties: {
      id: { type: 'integer', description: 'ID unik notifikasi' },
      user_id: { type: 'integer', description: 'ID user penerima' },
      title: { type: 'string', description: 'Judul notifikasi' },
      message: { type: 'string', description: 'Isi pesan notifikasi' },
      type: {
        type: 'string',
        enum: ['booking', 'payment', 'system', 'promotion'],
        description: 'Jenis notifikasi'
      },
      is_read: { type: 'boolean', description: 'Status sudah dibaca' },
      created_at: { type: 'string', format: 'date-time', description: 'Tanggal dibuat' }
    }
  },

  // Review Schema
  Review: {
    type: 'object',
    properties: {
      id: { type: 'integer', description: 'ID unik review' },
      user_id: { type: 'integer', description: 'ID user reviewer' },
      field_id: { type: 'integer', description: 'ID lapangan yang direview' },
      booking_id: { type: 'integer', description: 'ID booking terkait' },
      rating: { type: 'integer', minimum: 1, maximum: 5, description: 'Rating 1-5' },
      comment: { type: 'string', description: 'Komentar review' },
      created_at: { type: 'string', format: 'date-time', description: 'Tanggal dibuat' },
      user: { $ref: '#/components/schemas/User' },
      field: { $ref: '#/components/schemas/Field' }
    }
  },

  // Promotion Schema
  Promotion: {
    type: 'object',
    properties: {
      id: { type: 'integer', description: 'ID unik promosi' },
      code: { type: 'string', description: 'Kode promosi' },
      name: { type: 'string', description: 'Nama promosi' },
      description: { type: 'string', description: 'Deskripsi promosi' },
      discount_type: {
        type: 'string',
        enum: ['percentage', 'fixed'],
        description: 'Jenis diskon'
      },
      discount_value: { type: 'number', format: 'decimal', description: 'Nilai diskon' },
      min_amount: { type: 'number', format: 'decimal', description: 'Minimum pembelian' },
      max_discount: { type: 'number', format: 'decimal', description: 'Maksimum diskon' },
      usage_limit: { type: 'integer', description: 'Batas penggunaan' },
      used_count: { type: 'integer', description: 'Jumlah sudah digunakan' },
      start_date: { type: 'string', format: 'date', description: 'Tanggal mulai' },
      end_date: { type: 'string', format: 'date', description: 'Tanggal berakhir' },
      is_active: { type: 'boolean', description: 'Status aktif promosi' },
      created_at: { type: 'string', format: 'date-time', description: 'Tanggal dibuat' }
    }
  },

  // Audit Log Schema
  AuditLog: {
    type: 'object',
    properties: {
      id: { type: 'integer', description: 'ID unik audit log' },
      user_id: { type: 'integer', description: 'ID user yang melakukan aksi' },
      action: { type: 'string', description: 'Jenis aksi yang dilakukan' },
      table_name: { type: 'string', description: 'Nama tabel yang diubah' },
      record_id: { type: 'integer', description: 'ID record yang diubah' },
      old_values: { type: 'object', description: 'Nilai lama sebelum perubahan' },
      new_values: { type: 'object', description: 'Nilai baru setelah perubahan' },
      ip_address: { type: 'string', description: 'IP address user' },
      user_agent: { type: 'string', description: 'User agent browser' },
      created_at: { type: 'string', format: 'date-time', description: 'Waktu aksi dilakukan' },
      user: { $ref: '#/components/schemas/User' }
    }
  },

  // System Settings Schema
  SystemSetting: {
    type: 'object',
    properties: {
      id: { type: 'integer', description: 'ID unik setting' },
      key: { type: 'string', description: 'Key setting' },
      value: { type: 'string', description: 'Value setting' },
      type: {
        type: 'string',
        enum: ['string', 'number', 'boolean', 'json'],
        description: 'Tipe data setting'
      },
      description: { type: 'string', description: 'Deskripsi setting' },
      category: { type: 'string', description: 'Kategori setting' },
      is_public: { type: 'boolean', description: 'Apakah setting bisa diakses publik' },
      updated_by: { type: 'integer', description: 'ID user yang mengupdate' },
      updated_at: { type: 'string', format: 'date-time', description: 'Waktu diupdate' }
    }
  },

  // Field Availability Schema
  FieldAvailability: {
    type: 'object',
    properties: {
      id: { type: 'integer', description: 'ID unik availability' },
      field_id: { type: 'integer', description: 'ID lapangan' },
      date: { type: 'string', format: 'date', description: 'Tanggal' },
      start_time: { type: 'string', description: 'Waktu mulai tersedia' },
      end_time: { type: 'string', description: 'Waktu selesai tersedia' },
      is_available: { type: 'boolean', description: 'Status ketersediaan' },
      reason: { type: 'string', description: 'Alasan jika tidak tersedia' },
      created_by: { type: 'integer', description: 'ID user yang membuat' },
      created_at: { type: 'string', format: 'date-time', description: 'Tanggal dibuat' }
    }
  },

  // User Favourites Schema
  UserFavourite: {
    type: 'object',
    properties: {
      id: { type: 'integer', description: 'ID unik favourite' },
      user_id: { type: 'integer', description: 'ID user' },
      field_id: { type: 'integer', description: 'ID lapangan favorit' },
      created_at: { type: 'string', format: 'date-time', description: 'Tanggal ditambahkan' },
      field: { $ref: '#/components/schemas/Field' }
    }
  },

  // Booking History Schema
  BookingHistory: {
    type: 'object',
    properties: {
      id: { type: 'integer', description: 'ID unik history' },
      booking_id: { type: 'integer', description: 'ID booking' },
      old_status: { type: 'string', description: 'Status lama' },
      new_status: { type: 'string', description: 'Status baru' },
      changed_by: { type: 'integer', description: 'ID user yang mengubah' },
      reason: { type: 'string', description: 'Alasan perubahan' },
      created_at: { type: 'string', format: 'date-time', description: 'Waktu perubahan' }
    }
  },

  // Payment Log Schema
  PaymentLog: {
    type: 'object',
    properties: {
      id: { type: 'integer', description: 'ID unik payment log' },
      payment_id: { type: 'integer', description: 'ID pembayaran' },
      action: { type: 'string', description: 'Aksi yang dilakukan' },
      request_data: { type: 'object', description: 'Data request' },
      response_data: { type: 'object', description: 'Data response' },
      status: { type: 'string', description: 'Status aksi' },
      created_at: { type: 'string', format: 'date-time', description: 'Waktu aksi' }
    }
  },

  // API Response Schemas
  SuccessResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true, description: 'Status keberhasilan' },
      message: { type: 'string', description: 'Pesan response' },
      data: { type: 'object', description: 'Data response' },
      timestamp: { type: 'string', format: 'date-time', description: 'Waktu response' }
    }
  },

  ErrorResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: false, description: 'Status keberhasilan' },
      error: { type: 'string', description: 'Pesan error' },
      code: { type: 'string', description: 'Kode error' },
      details: { type: 'object', description: 'Detail error tambahan' },
      timestamp: { type: 'string', format: 'date-time', description: 'Waktu error' }
    }
  },

  ValidationErrorResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: false, description: 'Status keberhasilan' },
      error: { type: 'string', example: 'Validation failed', description: 'Pesan error' },
      code: { type: 'string', example: 'VALIDATION_ERROR', description: 'Kode error' },
      details: {
        type: 'object',
        properties: {
          field_errors: {
            type: 'object',
            additionalProperties: {
              type: 'array',
              items: { type: 'string' }
            },
            description: 'Error per field'
          }
        }
      },
      timestamp: { type: 'string', format: 'date-time', description: 'Waktu error' }
    }
  },

  PaginatedResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true, description: 'Status keberhasilan' },
      message: { type: 'string', description: 'Pesan response' },
      data: {
        type: 'array',
        items: { type: 'object' },
        description: 'Array data'
      },
      pagination: { $ref: '#/components/schemas/PaginationMeta' },
      timestamp: { type: 'string', format: 'date-time', description: 'Waktu response' }
    }
  },

  // Analytics Schemas
  BookingAnalytics: {
    type: 'object',
    properties: {
      total_bookings: { type: 'integer', description: 'Total booking' },
      confirmed_bookings: { type: 'integer', description: 'Booking terkonfirmasi' },
      pending_bookings: { type: 'integer', description: 'Booking pending' },
      cancelled_bookings: { type: 'integer', description: 'Booking dibatalkan' },
      total_revenue: { type: 'number', format: 'decimal', description: 'Total pendapatan' },
      average_booking_value: { type: 'number', format: 'decimal', description: 'Rata-rata nilai booking' },
      popular_fields: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            field_id: { type: 'integer' },
            field_name: { type: 'string' },
            booking_count: { type: 'integer' }
          }
        }
      },
      booking_trends: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            date: { type: 'string', format: 'date' },
            count: { type: 'integer' }
          }
        }
      }
    }
  },

  // Role Change Request Schema
  RoleChangeRequest: {
    type: 'object',
    properties: {
      id: { type: 'integer', description: 'ID unik request' },
      user_id: { type: 'integer', description: 'ID user yang request' },
      current_role: { type: 'string', description: 'Role saat ini' },
      requested_role: { type: 'string', description: 'Role yang diminta' },
      reason: { type: 'string', description: 'Alasan request' },
      status: {
        type: 'string',
        enum: ['pending', 'approved', 'rejected'],
        description: 'Status request'
      },
      reviewed_by: { type: 'integer', description: 'ID reviewer' },
      reviewed_at: { type: 'string', format: 'date-time', description: 'Waktu review' },
      review_notes: { type: 'string', description: 'Catatan review' },
      created_at: { type: 'string', format: 'date-time', description: 'Tanggal dibuat' }
    }
  },

  // Promotion Usage Schema
  PromotionUsage: {
    type: 'object',
    properties: {
      id: { type: 'integer', description: 'ID unik usage' },
      promotion_id: { type: 'integer', description: 'ID promosi' },
      user_id: { type: 'integer', description: 'ID user yang menggunakan' },
      booking_id: { type: 'integer', description: 'ID booking terkait' },
      discount_amount: { type: 'number', format: 'decimal', description: 'Jumlah diskon' },
      used_at: { type: 'string', format: 'date-time', description: 'Waktu digunakan' }
    }
  }
};

module.exports = schemas;
