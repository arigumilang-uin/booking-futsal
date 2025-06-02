# 🔗 API ENDPOINTS - Dokumentasi Lengkap

## 🌐 **BASE URL**

```
Production: https://booking-futsal-production.up.railway.app/api
Development: http://localhost:5000/api
```

## 🔐 **AUTHENTICATION ENDPOINTS**

### **POST /auth/register**

Registrasi user baru

```javascript
// Request
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "081234567890",
  "role": "penyewa" // optional, default: penyewa
}

// Response
{
  "success": true,
  "message": "Registration successful",
  "user": {
    "id": 15,
    "uuid": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "penyewa",
    "is_active": true
  }
}
```

### **POST /auth/login**

Login user

```javascript
// Request
{
  "email": "john@example.com",
  "password": "password123"
}

// Response
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": 15,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "penyewa",
    "last_login_at": "2025-06-02T00:00:00.000Z"
  }
  // Note: JWT token disimpan di HttpOnly cookie
}
```

### **POST /auth/logout**

Logout user

```javascript
// Response
{
  "success": true,
  "message": "Logout berhasil"
}
```

### **GET /auth/profile**

Get user profile (Requires Auth)

```javascript
// Response
{
  "success": true,
  "user": {
    "id": 15,
    "uuid": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "081234567890",
    "role": "penyewa",
    "employee_id": null,
    "department": null,
    "is_active": true,
    "is_verified": false
  }
}
```

## 🏟️ **PUBLIC ENDPOINTS**

### **GET /public/fields**

List semua lapangan aktif

```javascript
// Response
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Lapangan Futsal A",
      "type": "futsal",
      "price_per_hour": "100000.00",
      "facilities": ["AC", "Sound System", "Toilet"],
      "coordinates": {"lat": -6.2, "lng": 106.8},
      "is_active": true
    }
  ]
}
```

### **GET /public/fields/:id/availability**

Cek ketersediaan lapangan

```javascript
// Query: ?date=2025-06-02
// Response
{
  "success": true,
  "data": {
    "field_id": 1,
    "date": "2025-06-02",
    "available_slots": [
      {"start_time": "08:00", "end_time": "10:00", "available": true},
      {"start_time": "10:00", "end_time": "12:00", "available": false},
      {"start_time": "14:00", "end_time": "16:00", "available": true}
    ],
    "booked_slots": [
      {"start_time": "10:00", "end_time": "12:00", "booking_id": 123}
    ]
  }
}
```

## 👤 **CUSTOMER ENDPOINTS** (Role: penyewa)

### **GET /customer/bookings**

List booking user

```javascript
// Query: ?status=confirmed&page=1&limit=10
// Response
{
  "success": true,
  "data": [
    {
      "id": 123,
      "field": {
        "id": 1,
        "name": "Lapangan Futsal A"
      },
      "date": "2025-06-02",
      "start_time": "10:00:00",
      "end_time": "12:00:00",
      "duration_hours": 2,
      "total_amount": "200000.00",
      "status": "confirmed",
      "payment_status": "paid",
      "created_at": "2025-06-01T10:00:00.000Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 3,
    "total_items": 25,
    "items_per_page": 10
  }
}
```

### **POST /customer/bookings**

Buat booking baru

```javascript
// Request
{
  "field_id": 1,
  "date": "2025-06-02",
  "start_time": "14:00",
  "end_time": "16:00",
  "name": "John Doe",
  "phone": "081234567890",
  "notes": "Booking untuk turnamen"
}

// Response
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "id": 124,
    "field_id": 1,
    "user_id": 15,
    "date": "2025-06-02",
    "start_time": "14:00:00",
    "end_time": "16:00:00",
    "duration_hours": 2,
    "total_amount": "200000.00",
    "status": "pending",
    "payment_status": "pending"
  }
}
```

### **PUT /customer/bookings/:id**

Update booking

```javascript
// Request
{
  "date": "2025-06-03",
  "start_time": "15:00",
  "end_time": "17:00",
  "notes": "Updated booking time"
}

// Response
{
  "success": true,
  "message": "Booking updated successfully",
  "data": { /* updated booking object */ }
}
```

### **DELETE /customer/bookings/:id**

Cancel booking

```javascript
// Response
{
  "success": true,
  "message": "Booking cancelled successfully"
}
```

## 💰 **STAFF KASIR ENDPOINTS** (Role: staff_kasir)

### **GET /staff/kasir/dashboard**

Dashboard kasir

```javascript
// Response
{
  "success": true,
  "data": {
    "today_stats": {
      "total_bookings": 15,
      "pending_payments": 5,
      "completed_payments": 10,
      "total_revenue": "1500000.00"
    },
    "pending_payments": [
      {
        "booking_id": 123,
        "customer_name": "John Doe",
        "amount": "200000.00",
        "booking_date": "2025-06-02",
        "created_at": "2025-06-01T10:00:00.000Z"
      }
    ]
  }
}
```

### **POST /staff/kasir/payments**

Process payment

```javascript
// Request
{
  "booking_id": 123,
  "amount": "200000.00",
  "method": "cash", // cash, transfer, card
  "notes": "Payment received"
}

// Response
{
  "success": true,
  "message": "Payment processed successfully",
  "data": {
    "payment_id": 456,
    "booking_id": 123,
    "amount": "200000.00",
    "method": "cash",
    "status": "completed",
    "processed_by": 7,
    "processed_at": "2025-06-02T08:00:00.000Z"
  }
}
```

## 🏟️ **OPERATOR LAPANGAN ENDPOINTS** (Role: operator_lapangan)

### **GET /staff/operator/dashboard**

Dashboard operator

```javascript
// Response
{
  "success": true,
  "data": {
    "today_schedule": [
      {
        "booking_id": 123,
        "field_name": "Lapangan Futsal A",
        "customer_name": "John Doe",
        "time_slot": "10:00 - 12:00",
        "status": "confirmed",
        "payment_status": "paid"
      }
    ],
    "field_status": [
      {
        "field_id": 1,
        "name": "Lapangan Futsal A",
        "current_status": "available",
        "next_booking": "14:00 - 16:00"
      }
    ]
  }
}
```

### **PUT /staff/operator/bookings/:id/status**

Update booking status

```javascript
// Request
{
  "status": "completed", // pending, confirmed, in_progress, completed, cancelled
  "notes": "Booking completed successfully"
}

// Response
{
  "success": true,
  "message": "Booking status updated",
  "data": { /* updated booking */ }
}
```

## 👨‍💼 **MANAGER ENDPOINTS** (Role: manajer_futsal)

### **GET /staff/manager/dashboard**

Dashboard manager

```javascript
// Response
{
  "success": true,
  "data": {
    "business_metrics": {
      "monthly_revenue": "15000000.00",
      "total_bookings": 150,
      "customer_growth": "12%",
      "field_utilization": "78%"
    },
    "staff_performance": [
      {
        "staff_id": 7,
        "name": "Kasir 1",
        "role": "staff_kasir",
        "processed_payments": 45,
        "total_amount": "4500000.00"
      }
    ]
  }
}
```

### **GET /admin/analytics/business**

Business analytics

```javascript
// Query: ?period=monthly&start_date=2025-01-01&end_date=2025-06-30
// Response
{
  "success": true,
  "data": {
    "revenue_trend": [
      {"month": "2025-01", "revenue": "12000000.00", "bookings": 120},
      {"month": "2025-02", "revenue": "15000000.00", "bookings": 150}
    ],
    "field_performance": [
      {"field_id": 1, "name": "Lapangan A", "utilization": 85, "revenue": "8000000.00"}
    ],
    "customer_analytics": {
      "new_customers": 25,
      "returning_customers": 45,
      "customer_retention": "75%"
    }
  }
}
```

## 👨‍💻 **SUPERVISOR ENDPOINTS** (Role: supervisor_sistem)

### **GET /staff/supervisor/dashboard**

Dashboard supervisor

```javascript
// Response
{
  "success": true,
  "data": {
    "system_health": {
      "uptime": "99.9%",
      "memory_usage": "75MB",
      "database_status": "healthy",
      "active_users": 45
    },
    "security_alerts": [
      {
        "type": "failed_login_attempts",
        "count": 3,
        "user_email": "suspicious@email.com",
        "timestamp": "2025-06-02T08:00:00.000Z"
      }
    ]
  }
}
```

### **GET /admin/role-management/dashboard**

Role management dashboard

```javascript
// Response
{
  "success": true,
  "data": {
    "admin_info": {
      "id": 1,
      "role": "supervisor_sistem",
      "permissions": ["view_users", "manage_all_roles", "system_administration"]
    },
    "role_statistics": {
      "total_users": 14,
      "by_role": {
        "supervisor_sistem": 1,
        "manajer_futsal": 2,
        "operator_lapangan": 3,
        "staff_kasir": 3,
        "penyewa": 5
      }
    },
    "pending_requests": {
      "count": 2,
      "requests": [/* role change requests */]
    }
  }
}
```

### **PUT /admin/role-management/change-role**

Change user role

```javascript
// Request
{
  "user_id": 10,
  "new_role": "staff_kasir",
  "reason": "Promote to cashier staff",
  "bypass_approval": true // supervisor only
}

// Response
{
  "success": true,
  "message": "User role changed successfully",
  "data": {
    "user": { /* updated user object */ },
    "change_info": {
      "old_role": "penyewa",
      "new_role": "staff_kasir",
      "changed_by": 1,
      "reason": "Promote to cashier staff"
    }
  }
}
```

## 🔧 **ADMIN ENDPOINTS** (Role: manajer_futsal+)

### **GET /admin/users**

List all users

```javascript
// Query: ?role=penyewa&status=active&page=1&limit=20&search=john
// Response
{
  "success": true,
  "data": [
    {
      "id": 15,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "penyewa",
      "is_active": true,
      "booking_count": 5,
      "total_spent": "1000000.00",
      "last_booking_date": "2025-06-01"
    }
  ],
  "pagination": { /* pagination info */ }
}
```

### **GET /admin/bookings**

List all bookings

```javascript
// Query: ?status=confirmed&date_from=2025-06-01&date_to=2025-06-30
// Response
{
  "success": true,
  "data": [
    {
      "id": 123,
      "customer": {
        "id": 15,
        "name": "John Doe",
        "email": "john@example.com"
      },
      "field": {
        "id": 1,
        "name": "Lapangan Futsal A"
      },
      "date": "2025-06-02",
      "time_slot": "10:00 - 12:00",
      "total_amount": "200000.00",
      "status": "confirmed",
      "payment_status": "paid"
    }
  ]
}
```

### **GET /admin/fields**

Manage fields

```javascript
// Response
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Lapangan Futsal A",
      "type": "futsal",
      "price_per_hour": "100000.00",
      "facilities": ["AC", "Sound System"],
      "coordinates": {"lat": -6.2, "lng": 106.8},
      "is_active": true,
      "utilization_rate": "85%",
      "monthly_revenue": "8000000.00"
    }
  ]
}
```

## 🔍 **SYSTEM ENDPOINTS**

### **GET /health**

System health check

```javascript
// Response
{
  "success": true,
  "status": "healthy",
  "timestamp": "2025-06-02T00:00:00.000Z",
  "uptime": 775.829815239,
  "memory": {
    "rss": 80285696,
    "heapTotal": 16621568,
    "heapUsed": 15151960
  },
  "environment": "production"
}
```

## ⚠️ **ERROR RESPONSES**

### **Authentication Errors**

```javascript
// 401 Unauthorized
{
  "success": false,
  "error": "Authentication required"
}

// 403 Forbidden
{
  "success": false,
  "message": "Access denied",
  "required_category": "MANAGEMENT",
  "user_role": "penyewa"
}
```

### **Validation Errors**

```javascript
// 400 Bad Request
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "email": "Email is required",
    "password": "Password must be at least 6 characters"
  }
}
```

### **Business Logic Errors**

```javascript
// 409 Conflict
{
  "success": false,
  "error": "Time slot not available",
  "details": "Lapangan sudah dibooking pada waktu tersebut"
}

// 404 Not Found
{
  "success": false,
  "error": "Resource not found",
  "details": "Booking dengan ID 999 tidak ditemukan"
}
```

---

**Next: 03_AUTHENTICATION_GUIDE.md untuk panduan autentikasi dan RBAC**
