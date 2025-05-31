# 🗄️ **DATABASE RELATIONS DOCUMENTATION**

## **OVERVIEW**
Dokumentasi lengkap relasi antar tabel dalam sistem booking futsal.

## **📊 ENTITY RELATIONSHIP DIAGRAM**

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    USERS    │    │   FIELDS    │    │  BOOKINGS   │
│             │    │             │    │             │
│ id (PK)     │    │ id (PK)     │    │ id (PK)     │
│ uuid        │    │ uuid        │    │ uuid        │
│ name        │    │ name        │    │ user_id (FK)│──┐
│ email       │    │ type        │    │ field_id(FK)│──┼──┐
│ role        │    │ price       │    │ date        │  │  │
│ ...         │    │ ...         │    │ status      │  │  │
└─────────────┘    └─────────────┘    │ ...         │  │  │
       │                  │           └─────────────┘  │  │
       │                  │                  │         │  │
       │                  └──────────────────┘         │  │
       │                                               │  │
       └───────────────────────────────────────────────┘  │
                                                          │
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    │
│  PAYMENTS   │    │NOTIFICATIONS│    │FIELD_REVIEWS│    │
│             │    │             │    │             │    │
│ id (PK)     │    │ id (PK)     │    │ id (PK)     │    │
│ booking_id  │────┼─user_id (FK)│    │ field_id(FK)│────┘
│ amount      │    │ type        │    │ user_id (FK)│
│ status      │    │ message     │    │ rating      │
│ ...         │    │ ...         │    │ ...         │
└─────────────┘    └─────────────┘    └─────────────┘
```

## **🔗 TABLE RELATIONSHIPS**

### **1. USERS (Central Entity)**
**Primary Key:** `id`
**Relationships:**
- **1:N** with `bookings` (user_id)
- **1:N** with `notifications` (user_id)
- **1:N** with `field_reviews` (user_id)
- **1:N** with `promotion_usages` (user_id)
- **1:N** with `user_favorites` (user_id)
- **1:N** with `audit_logs` (user_id)

### **2. FIELDS (Core Business Entity)**
**Primary Key:** `id`
**Relationships:**
- **1:N** with `bookings` (field_id)
- **1:N** with `field_reviews` (field_id)
- **1:N** with `field_availability` (field_id)
- **1:N** with `user_favorites` (field_id)

### **3. BOOKINGS (Transaction Entity)**
**Primary Key:** `id`
**Foreign Keys:**
- `user_id` → `users.id`
- `field_id` → `fields.id`

**Relationships:**
- **N:1** with `users` (user_id)
- **N:1** with `fields` (field_id)
- **1:N** with `payments` (booking_id)
- **1:1** with `field_reviews` (booking_id)
- **1:N** with `promotion_usages` (booking_id)
- **1:N** with `booking_history` (booking_id)

### **4. PAYMENTS (Financial Entity)**
**Primary Key:** `id`
**Foreign Keys:**
- `booking_id` → `bookings.id`

**Relationships:**
- **N:1** with `bookings` (booking_id)
- **1:N** with `payment_logs` (payment_id)

### **5. NOTIFICATIONS (Communication Entity)**
**Primary Key:** `id`
**Foreign Keys:**
- `user_id` → `users.id`

**Relationships:**
- **N:1** with `users` (user_id)

## **📋 DETAILED FIELD DESCRIPTIONS**

### **USERS TABLE**
| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| `id` | SERIAL | Primary key | PRIMARY KEY |
| `uuid` | UUID | Unique identifier | UNIQUE, NOT NULL |
| `name` | VARCHAR(255) | Full name | NOT NULL |
| `email` | VARCHAR(255) | Email address | UNIQUE, NOT NULL |
| `password` | VARCHAR(255) | Hashed password | NOT NULL |
| `phone` | VARCHAR(20) | Phone number | - |
| `role` | VARCHAR(20) | User role | CHECK: user/pengelola/admin |
| `avatar_url` | TEXT | Profile picture URL | - |
| `email_verified_at` | TIMESTAMP | Email verification time | - |
| `phone_verified_at` | TIMESTAMP | Phone verification time | - |
| `is_active` | BOOLEAN | Account status | DEFAULT: true |
| `last_login_at` | TIMESTAMP | Last login time | - |
| `created_at` | TIMESTAMP | Creation time | DEFAULT: NOW() |
| `updated_at` | TIMESTAMP | Last update time | DEFAULT: NOW() |

### **FIELDS TABLE**
| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| `id` | SERIAL | Primary key | PRIMARY KEY |
| `uuid` | UUID | Unique identifier | UNIQUE, NOT NULL |
| `name` | VARCHAR(255) | Field name | NOT NULL |
| `type` | VARCHAR(100) | Field type | NOT NULL |
| `description` | TEXT | Field description | DEFAULT: '' |
| `facilities` | JSONB | Available facilities | DEFAULT: '[]' |
| `capacity` | INTEGER | Maximum players | DEFAULT: 22 |
| `location` | TEXT | Location/area | DEFAULT: '' |
| `address` | TEXT | Full address | - |
| `coordinates` | JSONB | GPS coordinates | - |
| `price` | DECIMAL(10,2) | Base price per hour | NOT NULL |
| `price_weekend` | DECIMAL(10,2) | Weekend price | - |
| `price_peak_hours` | JSONB | Peak hour pricing | - |
| `operating_hours` | JSONB | Operating hours | DEFAULT: {"start":"09:00","end":"24:00"} |
| `operating_days` | JSONB | Operating days | DEFAULT: all days |
| `image_url` | TEXT | Main image URL | - |
| `gallery` | JSONB | Image gallery URLs | DEFAULT: '[]' |
| `status` | VARCHAR(20) | Field status | CHECK: active/inactive/maintenance |
| `rating` | DECIMAL(3,2) | Average rating | DEFAULT: 0.00 |
| `total_reviews` | INTEGER | Total reviews count | DEFAULT: 0 |
| `created_at` | TIMESTAMP | Creation time | DEFAULT: NOW() |
| `updated_at` | TIMESTAMP | Last update time | DEFAULT: NOW() |

### **BOOKINGS TABLE**
| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| `id` | SERIAL | Primary key | PRIMARY KEY |
| `uuid` | UUID | Unique identifier | UNIQUE, NOT NULL |
| `user_id` | INTEGER | User reference | FOREIGN KEY → users.id |
| `field_id` | INTEGER | Field reference | FOREIGN KEY → fields.id |
| `booking_number` | VARCHAR(50) | Unique booking number | UNIQUE, NOT NULL |
| `date` | DATE | Booking date | NOT NULL |
| `start_time` | TIME | Start time | NOT NULL |
| `end_time` | TIME | End time | NOT NULL |
| `duration_hours` | DECIMAL(3,1) | Duration in hours | COMPUTED |
| `name` | VARCHAR(255) | Customer name | NOT NULL |
| `phone` | VARCHAR(20) | Customer phone | NOT NULL |
| `email` | VARCHAR(255) | Customer email | - |
| `notes` | TEXT | Additional notes | - |
| `total_amount` | DECIMAL(10,2) | Total amount | NOT NULL |
| `status` | VARCHAR(20) | Booking status | CHECK: pending/confirmed/cancelled/completed/no_show |
| `payment_status` | VARCHAR(20) | Payment status | CHECK: unpaid/paid/partial/refunded |
| `cancellation_reason` | TEXT | Cancellation reason | - |
| `cancelled_at` | TIMESTAMP | Cancellation time | - |
| `confirmed_at` | TIMESTAMP | Confirmation time | - |
| `completed_at` | TIMESTAMP | Completion time | - |
| `reminder_sent` | BOOLEAN | Reminder sent flag | DEFAULT: false |
| `created_at` | TIMESTAMP | Creation time | DEFAULT: NOW() |
| `updated_at` | TIMESTAMP | Last update time | DEFAULT: NOW() |

### **PAYMENTS TABLE**
| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| `id` | SERIAL | Primary key | PRIMARY KEY |
| `uuid` | UUID | Unique identifier | UNIQUE, NOT NULL |
| `booking_id` | INTEGER | Booking reference | FOREIGN KEY → bookings.id |
| `payment_number` | VARCHAR(50) | Unique payment number | UNIQUE, NOT NULL |
| `method` | VARCHAR(50) | Payment method | NOT NULL |
| `provider` | VARCHAR(50) | Payment provider | - |
| `amount` | DECIMAL(10,2) | Payment amount | NOT NULL |
| `admin_fee` | DECIMAL(10,2) | Admin fee | DEFAULT: 0 |
| `total_amount` | DECIMAL(10,2) | Total amount | COMPUTED |
| `status` | VARCHAR(20) | Payment status | CHECK: pending/paid/failed/cancelled/refunded/expired |
| `external_id` | VARCHAR(255) | Gateway transaction ID | - |
| `payment_url` | TEXT | Payment gateway URL | - |
| `expires_at` | TIMESTAMP | Payment expiry time | - |
| `paid_at` | TIMESTAMP | Payment completion time | - |
| `failed_at` | TIMESTAMP | Payment failure time | - |
| `refunded_at` | TIMESTAMP | Refund time | - |
| `refund_amount` | DECIMAL(10,2) | Refund amount | DEFAULT: 0 |
| `gateway_response` | JSONB | Gateway response data | - |
| `notes` | TEXT | Additional notes | - |
| `created_at` | TIMESTAMP | Creation time | DEFAULT: NOW() |
| `updated_at` | TIMESTAMP | Last update time | DEFAULT: NOW() |

## **🔄 BUSINESS RULES & CONSTRAINTS**

### **Booking Rules:**
1. **No Double Booking:** Same field cannot be booked for overlapping times
2. **Time Validation:** `start_time` must be before `end_time`
3. **Date Validation:** Booking date cannot be in the past (with 1-day grace period)
4. **Operating Hours:** Booking must be within field's operating hours
5. **Status Flow:** pending → confirmed → completed/cancelled

### **Payment Rules:**
1. **One Payment Per Booking:** Each booking can have multiple payment attempts but only one successful payment
2. **Amount Validation:** Payment amount must match booking total_amount
3. **Status Synchronization:** Payment status affects booking status
4. **Expiry Handling:** Expired payments automatically cancel pending bookings

### **User Rules:**
1. **Email Uniqueness:** Each email can only be associated with one account
2. **Role-Based Access:** Different permissions based on user role
3. **Account Status:** Inactive users cannot make new bookings

### **Field Rules:**
1. **Status Management:** Only active fields can be booked
2. **Rating Calculation:** Automatically calculated from reviews
3. **Pricing Flexibility:** Support for different pricing models

## **📈 PERFORMANCE CONSIDERATIONS**

### **Critical Indexes:**
- `bookings(field_id, date, start_time, end_time)` - Conflict detection
- `bookings(user_id, date DESC)` - User booking history
- `payments(booking_id, status)` - Payment lookup
- `notifications(user_id, read_at)` - Unread notifications

### **Query Optimization:**
- Use partial indexes for active records only
- JSONB indexes for facility and operating hours searches
- Composite indexes for common filter combinations

### **Data Archival:**
- Consider archiving old bookings (>1 year)
- Implement soft deletes for audit trail
- Regular cleanup of expired notifications

## **🔒 SECURITY CONSIDERATIONS**

### **Data Protection:**
- Password hashing with bcrypt
- Sensitive data encryption for payment information
- Audit logging for all critical operations

### **Access Control:**
- Row-level security for user data
- Role-based permissions
- API rate limiting

### **Data Integrity:**
- Foreign key constraints
- Check constraints for valid values
- Triggers for automatic calculations
