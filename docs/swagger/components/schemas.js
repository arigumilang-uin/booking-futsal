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
  }
};

module.exports = schemas;
