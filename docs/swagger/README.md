# Panam Soccer Field - API Documentation

## 📋 Overview

Dokumentasi API lengkap untuk sistem manajemen booking lapangan futsal **Panam Soccer Field**. Sistem ini menyediakan fitur komprehensif untuk manajemen booking, pembayaran, dan operasional lapangan futsal dengan 6-level role hierarchy.

## 🌐 Production URLs

- **Frontend:** https://booking-futsal-frontend.vercel.app
- **Backend API:** https://booking-futsal-production.up.railway.app
- **API Documentation:** https://booking-futsal-production.up.railway.app/api-docs
- **Swagger JSON:** https://booking-futsal-production.up.railway.app/api-docs.json

## 📁 Documentation Structure

```
docs/swagger/
├── index.js                    # Main Swagger configuration
├── components/
│   ├── schemas.js             # Data models and schemas
│   ├── responses.js           # Reusable response definitions
│   └── parameters.js          # Common parameters
├── paths/
│   ├── auth.js               # Authentication endpoints
│   ├── customer.js           # Customer operations
│   ├── staff.js              # Staff operations (Kasir, Operator, Manager)
│   ├── admin.js              # Admin operations
│   ├── admin-audit.js        # Admin audit endpoints
│   ├── admin-notifications.js # Admin notification management
│   ├── public.js             # Public endpoints
│   ├── payment.js            # Payment operations
│   ├── analytics.js          # Analytics and reporting
│   └── audit.js              # Audit logs and system monitoring
├── database-schema.md         # Complete database documentation
├── role-permissions.md        # Role-based access control guide
└── README.md                 # This file
```

## 🎯 Key Features

### 🔐 Authentication & Authorization
- **JWT-based authentication** with HttpOnly cookies
- **6-level role hierarchy** with granular permissions
- **Role change request system** with approval workflow
- **Comprehensive audit trail** for all user actions

### 📅 Booking Management
- **Real-time conflict detection** for time slots
- **Multi-status booking workflow** (pending → confirmed → completed)
- **Automatic booking completion** with cron jobs
- **Booking history tracking** with status changes

### 💳 Payment System
- **Multi-method payments** (transfer, cash, e-wallet, credit card)
- **Payment proof upload** with file management
- **Payment confirmation workflow** by kasir staff
- **Payment-to-booking linking** with business rules

### 📊 Analytics & Reporting
- **Revenue analytics** with trend analysis
- **Field utilization reports** with peak hour analysis
- **Customer behavior analytics** with segmentation
- **Real-time dashboard** for management

### 🔧 System Administration
- **System health monitoring** with performance metrics
- **Configurable system settings** with category management
- **Database backup system** with automated scheduling
- **Comprehensive audit logs** with detailed tracking

## 👥 Role Hierarchy

| Level | Role | Description | Key Permissions |
|-------|------|-------------|-----------------|
| 1 | **pengunjung** | Guest | Public field info, registration |
| 2 | **penyewa** | Customer | Booking, payment, reviews |
| 3 | **staff_kasir** | Cashier | Payment processing, confirmation |
| 4 | **operator_lapangan** | Field Operator | Booking confirmation, field management |
| 5 | **manajer_futsal** | Manager | Analytics, reports, staff management |
| 6 | **supervisor_sistem** | System Supervisor | Full system access, user management |

## 🗄️ Database Schema

### Core Tables (17 Total)
1. **users** - User management and authentication
2. **fields** - Field information and configuration
3. **bookings** - Booking records and status
4. **payments** - Payment transactions and tracking
5. **notifications** - Real-time notification system
6. **field_reviews** - Review and rating system
7. **promotions** - Discount and promotion management
8. **promotion_usages** - Promotion usage tracking
9. **user_favourites** - User favorite fields
10. **field_availability** - Field availability management
11. **audit_logs** - Comprehensive audit trail
12. **system_settings** - System configuration
13. **booking_history** - Booking status change history
14. **payment_logs** - Detailed payment transaction logs
15. **password_resets** - Password reset token management
16. **role_change_logs** - Role change tracking
17. **role_change_request** - Role change request system

## 🚀 API Endpoints Summary

### Authentication (5 endpoints)
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Customer Operations (8 endpoints)
- Customer profile management
- Field browsing and booking
- Payment creation and tracking
- Booking history and cancellation
- Dashboard with statistics

### Staff Operations (12 endpoints)
- **Kasir**: Payment processing and confirmation
- **Operator**: Booking confirmation and field management
- **Manager**: Analytics and business reporting
- **Supervisor**: User management and system monitoring

### Admin Operations (15 endpoints)
- Complete booking management
- Field CRUD operations
- User administration
- System settings management
- Audit log access

### Analytics & Reporting (4 endpoints)
- Revenue analytics with trends
- Field utilization analysis
- Customer behavior insights
- Dashboard metrics

### Payment System (5 endpoints)
- Payment creation and tracking
- Payment proof upload
- Payment confirmation workflow
- Payment statistics

## 🔧 Technical Specifications

### API Standards
- **REST API** with JSON responses
- **OpenAPI 3.0** specification
- **Consistent response format** with success/error flags
- **Comprehensive error handling** with detailed messages

### Security Features
- **JWT authentication** with secure token management
- **CORS configuration** for production deployment
- **Input validation** with detailed error responses
- **SQL injection protection** with parameterized queries
- **XSS protection** with input sanitization

### Performance Optimizations
- **Database indexing** on frequently queried fields
- **Pagination** for large data sets
- **Caching strategies** for static data
- **Optimized queries** with proper joins

## 📖 Usage Examples

### Authentication
```bash
# Login
curl -X POST https://booking-futsal-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password"}'
```

### Create Booking
```bash
# Create booking (requires authentication)
curl -X POST https://booking-futsal-production.up.railway.app/api/customer/bookings \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "field_id": 1,
    "date": "2024-12-01",
    "start_time": "10:00",
    "end_time": "12:00",
    "name": "John Doe",
    "phone": "081234567890"
  }'
```

### Get Analytics (Manager+)
```bash
# Get revenue analytics
curl -X GET "https://booking-futsal-production.up.railway.app/api/analytics/revenue?period=monthly" \
  -H "Authorization: Bearer <token>"
```

## 🧪 Testing Credentials

### Development/Testing Accounts
- **Manager:** ppwweebb02@gmail.com / futsaluas
- **Operator:** ppwweebb03@gmail.com / futsaluas
- **Kasir:** ppwweebb04@gmail.com / futsaluas
- **Customer:** ppwweebb05@gmail.com / futsaluas
- **Supervisor:** ppwweebb01@gmail.com / futsaluas

## 📞 Support & Contact

- **Project:** Panam Soccer Field Booking System
- **Documentation:** Complete API documentation available at `/api-docs`
- **Environment:** Production deployment on Railway + Vercel
- **Database:** MySQL with 17 tables and comprehensive relationships

## 🔄 Version History

- **v2.0.0** - Complete system with 6-level role hierarchy
- **v1.5.0** - Enhanced features: analytics, audit logs, system monitoring
- **v1.0.0** - Core booking and payment system

---

**Note:** This documentation covers the complete Panam Soccer Field booking system with all 17 database tables, 6 user roles, and comprehensive API endpoints for production deployment.
