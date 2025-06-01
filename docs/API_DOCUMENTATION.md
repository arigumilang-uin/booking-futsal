# 📚 API Documentation

Complete API documentation for Enhanced Futsal Booking System backend.

## 🌐 Base URL

- **Development:** `http://localhost:5000/api`
- **Production:** `https://your-domain.com/api`

## 🔐 Authentication

All protected endpoints require JWT token in header:

```
Authorization: Bearer <your-jwt-token>
```

## 📋 API Endpoints Structure

### 🔓 Public Access (No Authentication)

Public endpoints accessible without authentication for guest users.

```
GET    /api/public/fields              # List available fields
GET    /api/public/fields/:id          # Field details
GET    /api/public/fields/:id/availability # Check availability
GET    /api/public/field-types         # Available field types
GET    /api/public/field-locations     # Available locations
GET    /api/public/system-info         # System information
```

### 🔐 Authentication Endpoints

User authentication and session management.

```
POST   /api/auth/register              # User registration
POST   /api/auth/login                 # User login
GET    /api/auth/profile               # Get user profile
POST   /api/auth/logout                # User logout
POST   /api/auth/refresh               # Refresh token
```

### 👤 Customer Access (penyewa)

Endpoints for customer role - Level 2 access.

```
GET    /api/customer/profile           # Get customer profile
PUT    /api/customer/profile           # Update profile
GET    /api/customer/fields            # Browse fields
POST   /api/customer/bookings          # Create booking
GET    /api/customer/bookings          # Get customer bookings
GET    /api/customer/bookings/:id      # Get booking details
DELETE /api/customer/bookings/:id      # Cancel booking
```

### 💰 Staff Kasir Access

Endpoints for cashier staff - Level 3 access.

```
GET    /api/staff/kasir/payments       # All payments
GET    /api/staff/kasir/payments/:id   # Payment details
POST   /api/staff/kasir/payments/manual # Process manual payment
PUT    /api/staff/kasir/payments/:id/confirm # Confirm payment
GET    /api/staff/kasir/payments/pending # Pending payments
GET    /api/staff/kasir/reports/daily  # Daily cash report
```

### ⚽ Staff Operator Access

Endpoints for field operator staff - Level 4 access.

```
GET    /api/staff/operator/dashboard   # Operator dashboard
GET    /api/staff/operator/fields      # Assigned fields
PUT    /api/staff/operator/fields/:id  # Update field status
GET    /api/staff/operator/bookings    # Field bookings
PUT    /api/staff/operator/bookings/:id/confirm # Confirm booking
PUT    /api/staff/operator/bookings/:id/complete # Complete booking
GET    /api/staff/operator/schedule/today # Today's schedule
```

### 📊 Staff Manager Access

Endpoints for futsal manager - Level 5 access.

```
GET    /api/staff/manager/dashboard    # Manager dashboard
GET    /api/staff/manager/users        # All users management
PUT    /api/staff/manager/users/:id/role # Update user role
PUT    /api/staff/manager/users/:id/status # Update user status
GET    /api/staff/manager/fields       # All fields management
POST   /api/staff/manager/fields       # Create new field
PUT    /api/staff/manager/fields/:id   # Update field
GET    /api/staff/manager/analytics    # Business analytics
```

### 🔧 Staff Supervisor Access

Endpoints for system supervisor - Level 6 access (highest).

```
GET    /api/staff/supervisor/dashboard # System dashboard
GET    /api/staff/supervisor/health    # System health
POST   /api/staff/supervisor/users     # Create staff user
GET    /api/staff/supervisor/audit     # Audit logs
GET    /api/staff/supervisor/backup    # Database backup
```

### 👥 Admin Role Management

Administrative endpoints for role management system.

```
GET    /api/admin/role-management/users # User management
POST   /api/admin/role-management/request-change # Request role change
GET    /api/admin/role-management/requests # Role change requests
PUT    /api/admin/role-management/requests/:id # Approve/reject request
```

## 🔒 Role-Based Access Control

### Role Hierarchy

1. **pengunjung** (Level 1) - Guest access, view public fields
2. **penyewa** (Level 2) - Customer access, create bookings, manage profile
3. **staff_kasir** (Level 3) - Payment processing, cash management
4. **operator_lapangan** (Level 4) - Field operations, booking confirmation
5. **manajer_futsal** (Level 5) - Business management, analytics, user management
6. **supervisor_sistem** (Level 6) - Full system access, system administration

### Access Rules

- Higher level roles inherit permissions from lower levels
- Each endpoint specifies minimum required role level
- JWT token contains user role information for authorization
- Middleware validates role permissions before endpoint access

## 📝 Request/Response Examples

### Authentication Example

**Login Request:**
```json
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Login Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "user@example.com",
      "role": "penyewa"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Booking Creation Example

**Create Booking Request:**
```json
POST /api/customer/bookings
Authorization: Bearer <token>
{
  "field_id": 1,
  "date": "2024-01-15",
  "start_time": "14:00",
  "end_time": "16:00",
  "notes": "Birthday party booking"
}
```

**Create Booking Response:**
```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "id": 123,
    "booking_number": "BK-2024-001",
    "field_id": 1,
    "user_id": 1,
    "date": "2024-01-15",
    "start_time": "14:00:00",
    "end_time": "16:00:00",
    "status": "pending",
    "total_amount": 150000,
    "created_at": "2024-01-10T10:30:00Z"
  }
}
```

## 🚨 Error Handling

### Standard Error Response Format

```json
{
  "error": "Error message description",
  "details": "Additional error details (optional)"
}
```

### Common HTTP Status Codes

- **200 OK** - Successful request
- **201 Created** - Resource created successfully
- **400 Bad Request** - Invalid request data
- **401 Unauthorized** - Authentication required
- **403 Forbidden** - Insufficient permissions
- **404 Not Found** - Resource not found
- **500 Internal Server Error** - Server error

## 🧪 Testing

### Postman Collection

Complete Postman collection available in `/postman` folder:

- **Collection:** Enhanced_Futsal_Booking_System.postman_collection.json
- **Development Environment:** Development.postman_environment.json
- **Production Environment:** Production.postman_environment.json

### Testing Guide

1. Import Postman collection and environments
2. Set appropriate environment (development/production)
3. Test authentication endpoints first
4. Use returned JWT token for protected endpoints
5. Test role-based access controls
6. Verify error handling scenarios

---

**For more information, see the main [README.md](../README.md) or [Contributing Guidelines](../CONTRIBUTING.md)**
