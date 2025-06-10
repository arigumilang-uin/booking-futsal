# Role-Based Access Control - Panam Soccer Field

## Role Hierarchy (6 Levels)

### Level 1: pengunjung (Guest)
**Public access - No authentication required**
- ✅ View public field information
- ✅ View field availability
- ✅ View public reviews and ratings
- ✅ Register new account
- ❌ Cannot make bookings
- ❌ Cannot access private data

**Accessible Endpoints:**
- `GET /api/public/fields`
- `GET /api/public/fields/{id}`
- `GET /api/public/reviews`
- `POST /api/auth/register`
- `POST /api/auth/login`

### Level 2: penyewa (Customer)
**Authenticated customer - Can book and pay**
- ✅ All pengunjung permissions
- ✅ Create and manage bookings
- ✅ Make payments for bookings
- ✅ View personal booking history
- ✅ Add/remove favorite fields
- ✅ Write reviews for completed bookings
- ✅ Receive notifications
- ✅ Update personal profile
- ❌ Cannot access staff functions
- ❌ Cannot view other users' data

**Accessible Endpoints:**
- All public endpoints
- `GET/PUT /api/customer/profile`
- `GET/POST /api/customer/bookings`
- `GET/PUT /api/customer/bookings/{id}`
- `PUT /api/customer/bookings/{id}/cancel`
- `GET /api/customer/dashboard`
- `GET/POST /api/customer/payments`
- `POST /api/customer/payments/{id}/upload-proof`

### Level 3: staff_kasir (Cashier)
**Payment processing staff**
- ✅ All penyewa permissions
- ✅ View all payments requiring processing
- ✅ Confirm/reject payments
- ✅ Process cash payments
- ✅ Generate payment reports
- ✅ View payment statistics
- ❌ Cannot confirm bookings
- ❌ Cannot manage fields or users

**Accessible Endpoints:**
- All customer endpoints
- `GET /api/staff/kasir/payments`
- `PUT /api/staff/kasir/payments/{id}/confirm`
- `PUT /api/staff/kasir/payments/{id}/reject`
- `GET /api/staff/kasir/statistics`

### Level 4: operator_lapangan (Field Operator)
**Field operations and booking confirmation**
- ✅ All penyewa permissions
- ✅ View assigned field bookings
- ✅ Confirm bookings (after payment)
- ✅ Update field availability
- ✅ Manage field maintenance schedules
- ✅ View field utilization reports
- ❌ Cannot process payments
- ❌ Cannot access user management

**Accessible Endpoints:**
- All customer endpoints
- `GET /api/staff/operator/bookings`
- `PUT /api/staff/operator/bookings/{id}/confirm`
- `PUT /api/staff/operator/bookings/{id}/complete`
- `GET/PUT /api/staff/operator/fields/{id}/availability`
- `GET /api/staff/operator/statistics`

### Level 5: manajer_futsal (Manager)
**Business management and analytics**
- ✅ All operator_lapangan permissions
- ✅ View all bookings and payments
- ✅ Access business analytics
- ✅ Generate comprehensive reports
- ✅ Manage staff assignments
- ✅ View revenue analytics
- ✅ Manage promotions
- ❌ Cannot modify system settings
- ❌ Cannot access audit logs

**Accessible Endpoints:**
- All operator endpoints
- `GET /api/staff/manager/bookings`
- `GET /api/staff/manager/analytics`
- `GET /api/staff/manager/reports`
- `GET /api/analytics/dashboard`
- `GET /api/analytics/revenue`
- `GET /api/analytics/fields`
- `GET /api/analytics/customers`
- `GET/POST/PUT /api/admin/promotions`

### Level 6: supervisor_sistem (System Supervisor)
**Full system access and administration**
- ✅ All manajer_futsal permissions
- ✅ Full user management (CRUD)
- ✅ System settings management
- ✅ Audit logs access
- ✅ System health monitoring
- ✅ Database backup/restore
- ✅ Role change approvals
- ✅ Complete system administration

**Accessible Endpoints:**
- All manager endpoints
- `GET/POST/PUT/DELETE /api/admin/users`
- `GET/PUT /api/admin/settings`
- `GET /api/audit/logs`
- `GET /api/system/health`
- `POST /api/system/backup`
- `GET/PUT /api/admin/role-requests`
- `GET /api/staff/supervisor/system/status`

## Permission Matrix

| Feature | Guest | Customer | Kasir | Operator | Manager | Supervisor |
|---------|-------|----------|-------|----------|---------|------------|
| **Public Access** |
| View fields | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View reviews | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Authentication** |
| Register/Login | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Customer Functions** |
| Create booking | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Make payment | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Write reviews | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Staff Functions** |
| Process payments | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ |
| Confirm bookings | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Manage fields | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Management Functions** |
| View analytics | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Manage promotions | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Staff reports | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **System Administration** |
| User management | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| System settings | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Audit logs | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| System backup | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

## Business Rules

### Payment → Booking Confirmation Flow
1. **Customer** creates booking (status: 'pending')
2. **Customer** creates payment (status: 'pending')
3. **Kasir** confirms payment (status: 'paid')
4. **Operator** can now confirm booking (status: 'confirmed')
5. **Operator** completes booking after use (status: 'completed')

### Role Change Process
1. **User** submits role change request
2. **Supervisor** reviews and approves/rejects
3. **System** logs role change in audit trail
4. **User** receives notification of decision

### Data Access Rules
- **Own Data Only**: Customers can only access their own bookings/payments
- **Assigned Data**: Operators can only access their assigned fields
- **Department Data**: Kasir can access all payments, Operators all field bookings
- **Full Access**: Managers and Supervisors can access all business data
- **System Data**: Only Supervisors can access system logs and settings

## Security Implementation

### Authentication
- JWT tokens for API access
- HttpOnly cookies for web sessions
- Token expiration and refresh mechanism
- Password hashing with bcrypt

### Authorization
- Role-based middleware on all protected routes
- Hierarchical permission checking
- Resource ownership validation
- IP-based access logging

### Audit Trail
- All CRUD operations logged
- User action tracking
- IP address and user agent logging
- Sensitive data change monitoring

## API Security Headers

### Required Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
Origin: https://booking-futsal-frontend.vercel.app
```

### CORS Configuration
```
Access-Control-Allow-Origin: https://booking-futsal-frontend.vercel.app
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, Cookie
```

## Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Unauthorized access",
  "message": "Please login to access this resource"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "Access forbidden",
  "message": "Insufficient permissions for this operation"
}
```

### 422 Validation Error
```json
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "field_errors": {
      "email": ["Email format is invalid"],
      "role": ["Invalid role specified"]
    }
  }
}
```
