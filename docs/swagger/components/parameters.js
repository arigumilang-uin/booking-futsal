/**
 * Panam Soccer Field - API Parameter Definitions
 * Komponen parameter yang dapat digunakan kembali untuk dokumentasi API
 */

const parameters = {
  // Common Parameters
  PageParam: {
    in: 'query',
    name: 'page',
    schema: {
      type: 'integer',
      minimum: 1,
      default: 1
    },
    description: 'Nomor halaman untuk pagination'
  },

  LimitParam: {
    in: 'query',
    name: 'limit',
    schema: {
      type: 'integer',
      minimum: 1,
      maximum: 100,
      default: 10
    },
    description: 'Jumlah item per halaman'
  },

  SearchParam: {
    in: 'query',
    name: 'search',
    schema: {
      type: 'string'
    },
    description: 'Kata kunci pencarian'
  },

  SortParam: {
    in: 'query',
    name: 'sort',
    schema: {
      type: 'string',
      enum: ['asc', 'desc'],
      default: 'desc'
    },
    description: 'Urutan sorting (ascending/descending)'
  },

  SortByParam: {
    in: 'query',
    name: 'sort_by',
    schema: {
      type: 'string',
      default: 'created_at'
    },
    description: 'Field yang digunakan untuk sorting'
  },

  // Date Parameters
  DateFromParam: {
    in: 'query',
    name: 'date_from',
    schema: {
      type: 'string',
      format: 'date'
    },
    description: 'Filter tanggal mulai (YYYY-MM-DD)'
  },

  DateToParam: {
    in: 'query',
    name: 'date_to',
    schema: {
      type: 'string',
      format: 'date'
    },
    description: 'Filter tanggal akhir (YYYY-MM-DD)'
  },

  // ID Parameters
  UserIdParam: {
    in: 'path',
    name: 'id',
    required: true,
    schema: {
      type: 'integer'
    },
    description: 'ID unik user'
  },

  BookingIdParam: {
    in: 'path',
    name: 'id',
    required: true,
    schema: {
      type: 'integer'
    },
    description: 'ID unik booking'
  },

  FieldIdParam: {
    in: 'path',
    name: 'id',
    required: true,
    schema: {
      type: 'integer'
    },
    description: 'ID unik lapangan'
  },

  PaymentIdParam: {
    in: 'path',
    name: 'id',
    required: true,
    schema: {
      type: 'integer'
    },
    description: 'ID unik pembayaran'
  },

  // Status Parameters
  BookingStatusParam: {
    in: 'query',
    name: 'status',
    schema: {
      type: 'string',
      enum: ['pending', 'confirmed', 'completed', 'cancelled']
    },
    description: 'Filter berdasarkan status booking'
  },

  PaymentStatusParam: {
    in: 'query',
    name: 'payment_status',
    schema: {
      type: 'string',
      enum: ['pending', 'paid', 'failed', 'refunded']
    },
    description: 'Filter berdasarkan status pembayaran'
  },

  UserRoleParam: {
    in: 'query',
    name: 'role',
    schema: {
      type: 'string',
      enum: ['pengunjung', 'penyewa', 'staff_kasir', 'operator_lapangan', 'manajer_futsal', 'supervisor_sistem']
    },
    description: 'Filter berdasarkan role user'
  },

  // Field Parameters
  FieldTypeParam: {
    in: 'query',
    name: 'type',
    schema: {
      type: 'string',
      enum: ['indoor', 'outdoor']
    },
    description: 'Filter berdasarkan jenis lapangan'
  },

  LocationParam: {
    in: 'query',
    name: 'location',
    schema: {
      type: 'string'
    },
    description: 'Filter berdasarkan lokasi lapangan'
  },

  // Booking Parameters
  FieldIdQueryParam: {
    in: 'query',
    name: 'field_id',
    schema: {
      type: 'integer'
    },
    description: 'Filter berdasarkan ID lapangan'
  },

  UserIdQueryParam: {
    in: 'query',
    name: 'user_id',
    schema: {
      type: 'integer'
    },
    description: 'Filter berdasarkan ID user'
  },

  // Analytics Parameters
  PeriodParam: {
    in: 'query',
    name: 'period',
    schema: {
      type: 'string',
      enum: ['daily', 'weekly', 'monthly', 'yearly'],
      default: 'monthly'
    },
    description: 'Periode untuk analytics'
  },

  MetricParam: {
    in: 'query',
    name: 'metric',
    schema: {
      type: 'string',
      enum: ['revenue', 'bookings', 'users', 'fields']
    },
    description: 'Jenis metrik untuk analytics'
  },

  // Notification Parameters
  NotificationTypeParam: {
    in: 'query',
    name: 'type',
    schema: {
      type: 'string',
      enum: ['booking', 'payment', 'system', 'promotion']
    },
    description: 'Filter berdasarkan jenis notifikasi'
  },

  IsReadParam: {
    in: 'query',
    name: 'is_read',
    schema: {
      type: 'boolean'
    },
    description: 'Filter berdasarkan status baca notifikasi'
  },

  // Review Parameters
  RatingParam: {
    in: 'query',
    name: 'rating',
    schema: {
      type: 'integer',
      minimum: 1,
      maximum: 5
    },
    description: 'Filter berdasarkan rating review'
  },

  // Promotion Parameters
  PromotionCodeParam: {
    in: 'query',
    name: 'code',
    schema: {
      type: 'string'
    },
    description: 'Kode promosi untuk validasi'
  },

  IsActiveParam: {
    in: 'query',
    name: 'is_active',
    schema: {
      type: 'boolean'
    },
    description: 'Filter berdasarkan status aktif'
  }
};

module.exports = parameters;
