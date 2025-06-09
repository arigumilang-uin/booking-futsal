# 📚 DOKUMENTASI SWAGGER - SISTEM & AUDIT UPDATES

## 🔄 **RINGKASAN PERUBAHAN DOKUMENTASI SISTEM & AUDIT:**

Dokumentasi Swagger untuk endpoint sistem monitoring, database maintenance, dan audit trail telah diperbarui untuk mencerminkan implementasi terbaru.

---

## 📋 **ENDPOINT YANG DIPERBARUI:**

### **1. 🔧 SYSTEM MAINTENANCE ENDPOINT**

#### **POST /api/staff/supervisor/system-maintenance**
**Perubahan Besar:**
- ✅ **Parameter Structure**: Dari `task` sederhana ke struktur lengkap
- ✅ **Enhanced Validation**: Type, description, scheduling
- ✅ **Response Schema**: Detail hasil maintenance

**BEFORE:**
```yaml
requestBody:
  required: [task]
  properties:
    task:
      type: string
      enum: [cleanup_logs, optimize_database, clear_cache, backup_data]
      example: "cleanup_logs"
    options:
      type: object
      properties:
        days_to_keep:
          type: integer
          example: 30
```

**AFTER:**
```yaml
requestBody:
  required: [type, description]
  properties:
    type:
      type: string
      enum: [database_cleanup, system_restart, cache_clear, log_rotation, security_scan]
      example: "database_cleanup"
      description: "Jenis maintenance yang akan dilakukan"
    description:
      type: string
      example: "Membersihkan data lama dan mengoptimalkan database"
      description: "Deskripsi detail maintenance"
    scheduled_time:
      type: string
      format: date-time
      example: "2025-06-10T02:00:00.000Z"
      description: "Waktu jadwal maintenance (opsional)"
    notify_users:
      type: boolean
      default: true
      example: true
      description: "Apakah akan memberitahu users tentang maintenance"
```

**Enhanced Response:**
```yaml
data:
  type: object
  properties:
    type:
      type: string
      example: "database_cleanup"
    description:
      type: string
      example: "Membersihkan data lama dan mengoptimalkan database"
    scheduled_time:
      type: string
      format: date-time
      example: "2025-06-10T02:00:00.000Z"
    notify_users:
      type: boolean
      example: true
    executed_at:
      type: string
      format: date-time
      example: "2025-06-09T10:30:00.000Z"
    executed_by:
      type: string
      example: "Supervisor Sistem"
    result:
      type: object
      properties:
        cleaned_records:
          type: integer
          example: 1500
        freed_space:
          type: string
          example: "25 MB"
```

### **2. 📊 DATABASE STATISTICS ENDPOINT**

#### **GET /api/staff/supervisor/database-stats**
**Status:** ✅ **SUDAH LENGKAP** - Dokumentasi sudah sesuai implementasi

**Response Schema:**
```yaml
data:
  type: object
  properties:
    database_info:
      type: object
      properties:
        name:
          type: string
        version:
          type: string
        size:
          type: string
    table_stats:
      type: array
      items:
        type: object
        properties:
          table_name:
            type: string
          row_count:
            type: integer
          size:
            type: string
    performance:
      type: object
      properties:
        active_connections:
          type: integer
        slow_queries:
          type: integer
        cache_hit_ratio:
          type: number
```

### **3. 🔍 AUDIT LOGS ENDPOINTS**

#### **A. GET /api/staff/supervisor/audit-logs**
**Status:** ✅ **SUDAH LENGKAP** - Dokumentasi sudah sesuai implementasi

**Parameters:**
```yaml
parameters:
  - in: query
    name: page
    schema:
      type: integer
      default: 1
    description: Halaman data
  - in: query
    name: limit
    schema:
      type: integer
      default: 50
    description: Jumlah data per halaman
  - in: query
    name: action
    schema:
      type: string
      enum: [CREATE, UPDATE, DELETE, LOGIN, LOGOUT, VIEW]
    description: Filter berdasarkan aksi
  - in: query
    name: user_id
    schema:
      type: integer
    description: Filter berdasarkan user ID
  - in: query
    name: table_name
    schema:
      type: string
    description: Filter berdasarkan nama tabel
  - in: query
    name: date_from
    schema:
      type: string
      format: date
    description: Filter tanggal mulai
  - in: query
    name: date_to
    schema:
      type: string
      format: date
    description: Filter tanggal akhir
```

#### **B. GET /api/admin/audit-logs (Enhanced Access)**
**Status:** ✅ **SUDAH LENGKAP** - Dokumentasi sudah sesuai implementasi

**Additional Endpoints:**
- ✅ `GET /api/admin/audit-logs/statistics` - Audit statistics
- ✅ `GET /api/admin/audit-logs/:id` - Audit log detail
- ✅ `GET /api/admin/audit-logs/user/:userId` - User activity logs
- ✅ `GET /api/admin/audit-logs/table/:tableName` - Table activity logs
- ✅ `DELETE /api/admin/audit-logs/cleanup` - Clean old audit logs
- ✅ `GET /api/admin/audit-logs/export` - Export audit logs

### **4. 🖥️ SYSTEM HEALTH ENDPOINT**

#### **GET /api/staff/supervisor/system-health**
**Status:** ✅ **SUDAH LENGKAP** - Dokumentasi sudah sesuai implementasi

**Response Schema:**
```yaml
data:
  type: object
  properties:
    timestamp:
      type: string
      format: date-time
    system_health:
      type: object
      properties:
        status:
          type: string
          example: "healthy"
        response_time:
          type: string
          example: "2ms"
    database_stats:
      type: object
      properties:
        status:
          type: string
        tables:
          type: array
    server_info:
      type: object
      properties:
        uptime:
          type: number
        memory_usage:
          type: object
        cpu_usage:
          type: object
        node_version:
          type: string
        environment:
          type: string
```

### **5. 📋 SYSTEM CONFIG ENDPOINT**

#### **GET /api/staff/supervisor/system-config**
**Status:** ✅ **SUDAH LENGKAP** - Dokumentasi sudah sesuai implementasi

**Response Schema:**
```yaml
data:
  type: object
  properties:
    environment:
      type: string
    database_url:
      type: string
    jwt_secret:
      type: string
    port:
      type: integer
    cors_origins:
      type: array
      items:
        type: string
    features:
      type: object
      properties:
        enhanced_role_system:
          type: boolean
        auto_generation:
          type: boolean
        conflict_detection:
          type: boolean
        payment_gateway:
          type: boolean
        audit_trail:
          type: boolean
        jsonb_support:
          type: boolean
```

---

## 🎯 **FITUR BARU YANG DIDOKUMENTASIKAN:**

### **1. Enhanced Maintenance System:**
- ✅ **Multiple Maintenance Types**: database_cleanup, system_restart, cache_clear, log_rotation, security_scan
- ✅ **Scheduling Support**: Optional scheduled_time parameter
- ✅ **User Notification**: notify_users flag
- ✅ **Detailed Results**: Specific result data per maintenance type

### **2. Comprehensive Audit Trail:**
- ✅ **Multiple Access Levels**: Supervisor dan Admin endpoints
- ✅ **Advanced Filtering**: Action, user, table, date range
- ✅ **Statistics & Analytics**: Audit log statistics
- ✅ **Export Functionality**: CSV/JSON export support
- ✅ **Cleanup Operations**: Automated old log cleanup

### **3. System Monitoring:**
- ✅ **Real-time Health**: System status monitoring
- ✅ **Database Statistics**: Table stats, performance metrics
- ✅ **Server Information**: Memory, CPU, uptime monitoring
- ✅ **Configuration View**: System config inspection

---

## 📖 **CARA MENGAKSES DOKUMENTASI:**

### **1. Swagger UI:**
```
https://booking-futsal-production.up.railway.app/api-docs
```

### **2. Endpoint Categories:**
- **Staff Supervisor**: `/api/staff/supervisor/*` - Supervisor-only access
- **Admin**: `/api/admin/*` - Management-level access

### **3. Authentication:**
- ✅ **Bearer Token**: Authorization header
- ✅ **Cookie Auth**: Session-based authentication
- ✅ **Role Validation**: Supervisor-level access required

---

## 🔐 **ACCESS CONTROL:**

### **Supervisor Endpoints:**
- ✅ `GET /api/staff/supervisor/dashboard` - Dashboard overview
- ✅ `GET /api/staff/supervisor/system-health` - System health monitoring
- ✅ `GET /api/staff/supervisor/database-stats` - Database statistics
- ✅ `GET /api/staff/supervisor/audit-logs` - Basic audit logs
- ✅ `POST /api/staff/supervisor/system-maintenance` - Maintenance tasks
- ✅ `GET /api/staff/supervisor/system-config` - System configuration
- ✅ `GET /api/staff/supervisor/error-logs` - Error logs

### **Admin Endpoints (Enhanced Access):**
- ✅ `GET /api/admin/audit-logs` - Full audit logs access
- ✅ `GET /api/admin/audit-logs/statistics` - Audit statistics
- ✅ `GET /api/admin/audit-logs/:id` - Audit log details
- ✅ `GET /api/admin/audit-logs/user/:userId` - User activity
- ✅ `GET /api/admin/audit-logs/table/:tableName` - Table activity
- ✅ `DELETE /api/admin/audit-logs/cleanup` - Cleanup operations
- ✅ `GET /api/admin/audit-logs/export` - Export functionality

---

## ✅ **STATUS DOKUMENTASI:**

- ✅ **System Maintenance Endpoints** - UPDATED & COMPLETE
- ✅ **Database Statistics Endpoints** - DOCUMENTED & COMPLETE
- ✅ **Audit Trail Endpoints** - COMPREHENSIVE & COMPLETE
- ✅ **System Health Endpoints** - DOCUMENTED & COMPLETE
- ✅ **System Config Endpoints** - DOCUMENTED & COMPLETE
- ✅ **Error Handling** - STANDARDIZED & COMPLETE
- ✅ **Authentication & Authorization** - DOCUMENTED & COMPLETE

**Semua dokumentasi Swagger untuk Sistem & Audit telah diperbarui dan akurat 100%!** 🎉

Dokumentasi sekarang mencerminkan implementasi terbaru dengan fitur maintenance yang enhanced, audit trail yang comprehensive, dan system monitoring yang real-time.
