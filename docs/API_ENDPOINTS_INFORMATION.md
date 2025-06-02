# 🔗 API ENDPOINTS INFORMATION - Sistem Booking Futsal

## 🎯 **OVERVIEW ENDPOINT STRUCTURE**

Sistem booking futsal menyediakan API endpoints yang terorganisir berdasarkan role-based access control dengan 6 level hierarki. Setiap endpoint memiliki business logic spesifik, validation rules, dan expected behavior yang disesuaikan dengan kebutuhan user role.

## 🌐 **BASE URL & ENVIRONMENT**

### **Production Environment**

```
Base URL: https://booking-futsal-production.up.railway.app/api
Health Check: /health
System Info: /api/public/system-info
```

### **API Architecture**

- **RESTful Design:** Consistent HTTP methods (GET, POST, PUT, DELETE)
- **Role-Based Organization:** Endpoints dikelompokkan berdasarkan access level
- **Standardized Response:** Uniform JSON response format dengan success/error handling
- **Authentication:** JWT token dengan HttpOnly cookie storage
- **Authorization:** Middleware validation untuk setiap endpoint berdasarkan role hierarchy

## 🔓 **PUBLIC ENDPOINTS (Guest Access)**

### **System Information Endpoints**

#### **GET /api/public/system-info**

**Purpose:** Memberikan informasi sistem dan konfigurasi aplikasi
**Business Logic:**

- Menampilkan informasi aplikasi, versi, dan fitur yang tersedia
- Menyediakan daftar supported roles untuk frontend role management
- Menampilkan feature flags untuk conditional frontend rendering

**Expected Behavior:**

- Response berisi app metadata, supported roles, dan available features
- Tidak memerlukan authentication
- Dapat digunakan untuk system health check dan feature detection

**Validation Rules:**

- Tidak ada validation khusus
- Response selalu konsisten tanpa data sensitif

---

#### **GET /api/health**

**Purpose:** Health check endpoint untuk monitoring sistem
**Business Logic:**

- Melakukan database connectivity test
- Menampilkan system uptime dan memory usage
- Memberikan status kesehatan aplikasi

**Expected Behavior:**

- Response 200 jika sistem healthy dengan database connection
- Response 503 jika database connection failed
- Menyediakan metrics untuk monitoring tools

### **Field Information Endpoints**

#### **GET /api/public/fields**

**Purpose:** Menampilkan daftar lapangan yang tersedia untuk umum
**Business Logic:**

- Menampilkan semua field dengan status 'active'
- Menyertakan informasi dasar: nama, tipe, harga, fasilitas
- Mendukung pagination dan basic filtering

**Expected Behavior:**

- Response berisi array fields dengan informasi publik
- Harga ditampilkan untuk transparency
- Tidak menampilkan data operasional internal

**Validation Rules:**

- Query parameters: page, limit, type, location
- Default pagination: 10 items per page
- Filter validation untuk type dan location

---

#### **GET /api/public/fields/:id**

**Purpose:** Menampilkan detail lengkap lapangan spesifik
**Business Logic:**

- Menampilkan informasi detail field termasuk fasilitas, koordinat, rating
- Menyertakan gallery images dan operating hours
- Menampilkan average rating dari field reviews

**Expected Behavior:**

- Response berisi complete field information
- Rating calculation real-time dari review data
- Operating hours dalam format yang user-friendly

**Validation Rules:**

- Field ID harus valid dan field harus active
- Response 404 jika field tidak ditemukan atau inactive

---

#### **GET /api/public/fields/:id/availability**

**Purpose:** Mengecek ketersediaan slot waktu untuk field tertentu
**Business Logic:**

- Menghitung available time slots berdasarkan operating hours
- Mengecek conflict dengan existing bookings
- Menampilkan booked slots untuk transparency

**Expected Behavior:**

- Response berisi available dan booked time slots
- Real-time calculation berdasarkan current bookings
- Time slots dalam format yang mudah dipahami

**Validation Rules:**

- Requires date parameter (YYYY-MM-DD format)
- Date tidak boleh di masa lalu
- Field ID harus valid dan active

### **Reference Data Endpoints**

#### **GET /api/public/field-types**

**Purpose:** Menampilkan daftar tipe lapangan yang tersedia
**Business Logic:**

- Menampilkan semua field types yang supported sistem
- Menyertakan deskripsi dan karakteristik setiap tipe

**Expected Behavior:**

- Response berisi array field types dengan metadata
- Dapat digunakan untuk filter dan categorization

---

#### **GET /api/public/field-locations**

**Purpose:** Menampilkan daftar lokasi lapangan yang tersedia
**Business Logic:**

- Menampilkan unique locations dari active fields
- Menyertakan coordinate information jika tersedia

**Expected Behavior:**

- Response berisi array locations untuk mapping dan filtering
- Coordinate data untuk integration dengan maps

## 🔐 **AUTHENTICATION ENDPOINTS**

### **User Registration & Login**

#### **POST /api/auth/register**

**Purpose:** Registrasi user baru dengan role assignment
**Business Logic:**

- Membuat user account dengan default role 'penyewa'
- Melakukan email uniqueness validation
- Password hashing dengan bcrypt (12 rounds)
- Auto-generate UUID untuk user identification

**Expected Behavior:**

- Response berisi user data tanpa password
- Automatic login setelah successful registration
- JWT token disimpan di HttpOnly cookie

**Validation Rules:**

- Email: RFC compliant format, unique dalam sistem
- Password: Minimum 8 characters
- Phone: Indonesian phone number format
- Name: Required, non-empty string
- Role: Optional, default 'penyewa', validation terhadap allowed roles

---

#### **POST /api/auth/login**

**Purpose:** User authentication dengan credential validation
**Business Logic:**

- Validasi email dan password combination
- Password verification dengan bcrypt comparison
- JWT token generation dengan 7 hari expiration
- Update last_login_at timestamp

**Expected Behavior:**

- Response berisi user profile data
- JWT token stored di HttpOnly cookie
- Redirect information berdasarkan user role

**Validation Rules:**

- Email: Required, valid format
- Password: Required, minimum length
- Account status: is_active harus true
- Rate limiting: Maximum 5 attempts per 15 menit

---

#### **POST /api/auth/logout**

**Purpose:** User logout dengan token invalidation
**Business Logic:**

- Clear JWT token dari cookie
- Optional: Add token to blacklist
- Update logout timestamp untuk audit

**Expected Behavior:**

- Cookie cleared dari browser
- Response confirmation logout success
- Redirect ke login page

### **Profile Management**

#### **GET /api/auth/profile**

**Purpose:** Mengambil profile data user yang sedang login
**Business Logic:**

- Menampilkan complete user profile berdasarkan JWT token
- Menyertakan role information dan permissions
- Menampilkan booking statistics dan activity summary

**Expected Behavior:**

- Response berisi user data tanpa sensitive information
- Role-specific data berdasarkan user level
- Activity metrics untuk dashboard

**Validation Rules:**

- Requires valid JWT token
- User account harus active
- Token tidak boleh expired

---

#### **GET /api/auth/verify**

**Purpose:** Verifikasi validitas JWT token
**Business Logic:**

- Melakukan token validation tanpa refresh
- Menampilkan basic user information
- Dapat digunakan untuk session check

**Expected Behavior:**

- Response 200 jika token valid dengan user data
- Response 401 jika token invalid atau expired
- Lightweight response untuk frequent checks

### **Role Information**

#### **GET /api/auth/roles**

**Purpose:** Menampilkan informasi role hierarchy dan permissions
**Business Logic:**

- Menampilkan complete role system dengan level hierarchy
- Menyertakan role descriptions dan access levels
- Dapat digunakan untuk frontend role-based rendering

**Expected Behavior:**

- Response berisi role metadata dan hierarchy
- Permission matrix untuk access control
- Role labels untuk UI display

**Validation Rules:**

- Public access, tidak memerlukan authentication
- Response konsisten untuk frontend integration

---

#### **GET /api/auth/health**

**Purpose:** Auth routes health check untuk monitoring authentication system
**Business Logic:**

- Menampilkan status auth routes dan available endpoints
- Memberikan informasi endpoint authentication yang tersedia
- Dapat digunakan untuk system health monitoring

**Expected Behavior:**

- Response berisi status auth routes dan endpoint list
- Menampilkan semua available auth endpoints
- Tidak memerlukan authentication untuk health check

**Validation Rules:**

- Public access, tidak memerlukan authentication
- Response konsisten untuk monitoring purposes

## 👤 **CUSTOMER ENDPOINTS (Role: penyewa)**

### **Profile Management**

#### **GET /api/customer/profile**

**Purpose:** Menampilkan detailed customer profile dengan booking statistics
**Business Logic:**

- Menampilkan complete customer information
- Menyertakan booking count, total spent, last booking date
- Menampilkan favorite fields dan review statistics

**Expected Behavior:**

- Response berisi comprehensive customer data
- Statistics calculation real-time dari database
- Profile completion percentage untuk gamification

**Validation Rules:**

- Requires customer role (penyewa) atau higher
- User harus authenticated dan active

---

#### **PUT /api/customer/profile**

**Purpose:** Update customer profile information
**Business Logic:**

- Memungkinkan update nama, phone, dan profile preferences
- Email update memerlukan verification process
- Validation terhadap data format dan uniqueness

**Expected Behavior:**

- Response berisi updated profile data
- Audit log untuk profile changes
- Notification untuk significant changes

**Validation Rules:**

- Phone: Indonesian format validation
- Email: Uniqueness check jika diubah
- Name: Non-empty string validation

### **Booking Management**

#### **GET /api/customer/bookings**

**Purpose:** Menampilkan daftar booking customer dengan filtering dan pagination
**Business Logic:**

- Menampilkan semua booking milik customer
- Support filtering berdasarkan status, date range, field
- Menyertakan payment status dan booking details

**Expected Behavior:**

- Response berisi paginated booking list
- Real-time status information
- Payment status untuk setiap booking

**Validation Rules:**

- Query parameters: page, limit, status, date_from, date_to
- Date range validation
- Status filter validation

---

#### **POST /api/customer/bookings**

**Purpose:** Membuat booking baru dengan conflict detection
**Business Logic:**

- Validasi field availability untuk time slot yang dipilih
- Automatic pricing calculation berdasarkan field rate dan duration
- Conflict detection dengan existing bookings
- Auto-generate booking number dengan format unik

**Expected Behavior:**

- Response berisi booking data dengan calculated pricing
- Automatic payment record creation
- Notification trigger untuk booking confirmation

**Validation Rules:**

- Field ID: Harus valid dan active
- Date: Tidak boleh di masa lalu
- Time slot: Harus dalam operating hours
- Duration: Minimum 1 jam, maximum 8 jam
- Conflict check: Tidak boleh overlap dengan existing bookings

---

#### **GET /api/customer/bookings/:id**

**Purpose:** Menampilkan detail lengkap booking spesifik
**Business Logic:**

- Menampilkan complete booking information
- Menyertakan field details, payment information, status history
- Menampilkan available actions berdasarkan booking status

**Expected Behavior:**

- Response berisi comprehensive booking data
- Action buttons berdasarkan current status
- Payment information dan history

**Validation Rules:**

- Booking ID harus valid
- Customer hanya dapat akses booking milik sendiri
- Response 404 jika booking tidak ditemukan

---

#### **DELETE /api/customer/bookings/:id**

**Purpose:** Membatalkan booking dengan cancellation policy
**Business Logic:**

- Validasi cancellation eligibility berdasarkan booking status dan timing
- Update booking status ke 'cancelled'
- Refund processing jika applicable
- Audit trail untuk cancellation

**Expected Behavior:**

- Response confirmation cancellation
- Refund information jika applicable
- Notification untuk cancellation

**Validation Rules:**

- Booking status: Hanya 'pending' atau 'confirmed' yang dapat dibatalkan
- Timing: Cancellation policy enforcement
- Payment status: Refund calculation berdasarkan policy

### **Enhanced Customer Features**

#### **GET /api/customer/notifications**

**Purpose:** Menampilkan daftar notifikasi customer dengan multi-channel support
**Business Logic:**

- Menampilkan notifications dengan priority dan channel information
- Support filtering berdasarkan type, read status, date range
- Real-time notification count untuk UI badges

**Expected Behavior:**

- Response berisi paginated notifications dengan metadata
- Unread count untuk notification badges
- Channel information (app, email, sms) untuk delivery status

**Validation Rules:**

- Pagination: Default 20 items per page
- Filter validation untuk type dan status
- Date range validation untuk historical data

---

#### **GET /api/customer/favorites**

**Purpose:** Menampilkan daftar field favorit customer dengan availability info
**Business Logic:**

- Menampilkan favorite fields dengan current availability
- Menyertakan quick booking information
- Recommendation system berdasarkan favorites

**Expected Behavior:**

- Response berisi favorite fields dengan real-time availability
- Quick action buttons untuk booking
- Recommendation suggestions

**Validation Rules:**

- Customer authentication required
- Favorite fields harus active
- Availability calculation real-time

---

#### **POST /api/customer/favorites/:fieldId**

**Purpose:** Menambahkan field ke daftar favorit customer
**Business Logic:**

- Menambahkan field ke user favorites
- Duplicate prevention untuk existing favorites
- Notification preferences untuk favorite field updates

**Expected Behavior:**

- Response confirmation favorite addition
- Updated favorites count
- Optional notification subscription

**Validation Rules:**

- Field ID harus valid dan active
- Duplicate check untuk existing favorites
- Maximum favorites limit (optional)

---

#### **GET /api/customer/reviews**

**Purpose:** Menampilkan daftar review yang dibuat customer
**Business Logic:**

- Menampilkan semua reviews customer dengan field information
- Menyertakan review statistics dan ratings
- Edit/delete capabilities untuk own reviews

**Expected Behavior:**

- Response berisi customer reviews dengan field data
- Review statistics dan average ratings
- Action buttons untuk edit/delete

**Validation Rules:**

- Customer authentication required
- Review ownership validation
- Pagination support

---

#### **POST /api/customer/reviews**

**Purpose:** Membuat review baru untuk field yang sudah dibooking
**Business Logic:**

- Validasi eligibility: customer harus pernah booking dan completed
- Rating validation (1-5 stars)
- Review content moderation
- Update field average rating

**Expected Behavior:**

- Response berisi created review data
- Field rating update real-time
- Notification ke field operator

**Validation Rules:**

- Booking history: Harus pernah booking field dan status completed
- Rating: 1-5 integer value
- Content: Non-empty review text
- One review per booking policy

## 👨‍💼 **STAFF ENDPOINTS**

### **Staff Kasir (Role: staff_kasir)**

#### **GET /api/staff/kasir/dashboard**

**Purpose:** Dashboard kasir dengan payment statistics dan pending transactions
**Business Logic:**

- Menampilkan today's payment statistics
- Pending payments yang memerlukan processing
- Revenue summary dan payment method breakdown

**Expected Behavior:**

- Response berisi payment metrics dan pending items
- Real-time calculation dari payment data
- Action items untuk payment processing

**Validation Rules:**

- Requires staff_kasir role atau higher
- Date range validation untuk statistics
- Real-time data calculation

---

#### **GET /api/staff/kasir/payments**

**Purpose:** Menampilkan daftar semua payments dengan filtering capabilities
**Business Logic:**

- Menampilkan all payments dengan comprehensive filtering
- Support filtering berdasarkan status, method, date range
- Payment details dengan booking information

**Expected Behavior:**

- Response berisi paginated payments dengan booking data
- Filter options untuk efficient searching
- Payment status tracking

**Validation Rules:**

- Staff kasir access level required
- Pagination dan filtering validation
- Date range constraints

---

#### **POST /api/staff/kasir/payments/manual**

**Purpose:** Memproses manual payment untuk booking
**Business Logic:**

- Manual payment processing untuk cash/transfer payments
- Validation terhadap booking amount dan status
- Gateway response recording untuk audit trail
- Automatic booking payment status update

**Expected Behavior:**

- Response berisi processed payment data
- Booking status update ke 'paid'
- Audit log untuk manual payment processing

**Validation Rules:**

- Booking ID: Harus valid dan payment_status 'pending'
- Amount: Harus match dengan booking total_amount
- Method: Validation terhadap supported payment methods
- Reference number: Required untuk non-cash payments

---

#### **PUT /api/staff/kasir/payments/:id/confirm**

**Purpose:** Konfirmasi payment yang sudah diproses
**Business Logic:**

- Payment confirmation dengan staff attribution
- Status update dari 'pending' ke 'paid'
- Notification trigger untuk customer
- Complete audit trail dengan staff information

**Expected Behavior:**

- Response berisi confirmed payment data
- Customer notification untuk payment confirmation
- Booking status synchronization

**Validation Rules:**

- Payment ID harus valid
- Payment status harus 'pending'
- Staff kasir authorization required
- Confirmation notes optional

---

#### **GET /api/staff/kasir/health**

**Purpose:** Kasir routes health check untuk monitoring kasir system
**Business Logic:**

- Menampilkan status kasir routes dan available endpoints
- Memberikan informasi endpoint kasir yang tersedia
- Dapat digunakan untuk system health monitoring

**Expected Behavior:**

- Response berisi status kasir routes dan endpoint list
- Menampilkan semua available kasir endpoints
- Memerlukan staff kasir authentication

**Validation Rules:**

- Requires staff_kasir role atau higher
- Response konsisten untuk monitoring purposes

### **Operator Lapangan (Role: operator_lapangan)**

#### **GET /api/staff/operator/dashboard**

**Purpose:** Dashboard operator dengan field schedule dan booking status
**Business Logic:**

- Menampilkan today's field schedule
- Booking status untuk assigned fields
- Field utilization statistics

**Expected Behavior:**

- Response berisi field schedule dan booking status
- Real-time booking updates
- Field management action items

**Validation Rules:**

- Requires operator_lapangan role atau higher
- Field assignment validation
- Date range untuk schedule view

---

#### **GET /api/staff/operator/bookings**

**Purpose:** Menampilkan daftar booking untuk field operations
**Business Logic:**

- Menampilkan bookings dengan field operational perspective
- Support filtering berdasarkan field, status, date
- Booking management capabilities

**Expected Behavior:**

- Response berisi bookings dengan field context
- Status management options
- Field-specific filtering

**Validation Rules:**

- Operator access level required
- Field assignment consideration
- Status filter validation

---

#### **PUT /api/staff/operator/bookings/:id/status**

**Purpose:** Update status booking untuk field operations
**Business Logic:**

- Status update dengan operator attribution
- Workflow validation untuk status transitions
- Notification triggers untuk status changes
- Audit trail untuk operational changes

**Expected Behavior:**

- Response berisi updated booking dengan new status
- Customer notification untuk status changes
- Operational log untuk field management

**Validation Rules:**

- Booking ID harus valid
- Status transition validation (pending → confirmed → in_progress → completed)
- Operator authorization untuk assigned fields
- Status change notes required

---

#### **GET /api/staff/operator/fields**

**Purpose:** Menampilkan field management interface untuk operator
**Business Logic:**

- Menampilkan fields dengan operational status
- Field availability management
- Maintenance scheduling capabilities

**Expected Behavior:**

- Response berisi fields dengan operational data
- Availability management options
- Maintenance status tracking

**Validation Rules:**

- Operator access level required
- Field assignment validation
- Operational status constraints

---

#### **GET /api/staff/operator/health**

**Purpose:** Operator routes health check untuk monitoring operator system
**Business Logic:**

- Menampilkan status operator routes dan available endpoints
- Memberikan informasi endpoint operator yang tersedia
- Dapat digunakan untuk system health monitoring

**Expected Behavior:**

- Response berisi status operator routes dan endpoint list
- Menampilkan semua available operator endpoints
- Memerlukan operator authentication

**Validation Rules:**

- Requires operator_lapangan role atau higher
- Response konsisten untuk monitoring purposes

### **Manager Futsal (Role: manajer_futsal)**

#### **GET /api/staff/manager/dashboard**

**Purpose:** Dashboard manager dengan business analytics dan staff performance
**Business Logic:**

- Comprehensive business metrics dan KPIs
- Staff performance tracking
- Revenue analysis dan trends

**Expected Behavior:**

- Response berisi business intelligence data
- Staff performance metrics
- Revenue trends dan forecasting

**Validation Rules:**

- Manager access level required
- Date range validation untuk analytics
- Performance metrics calculation

---

#### **GET /api/staff/manager/analytics**

**Purpose:** Detailed business analytics untuk management decisions
**Business Logic:**

- Revenue analytics dengan breakdown per field, time, method
- Customer analytics dan retention metrics
- Field utilization dan performance analysis

**Expected Behavior:**

- Response berisi comprehensive analytics data
- Trend analysis dan insights
- Actionable business intelligence

**Validation Rules:**

- Manager authorization required
- Date range constraints
- Analytics parameter validation

---

#### **GET /api/staff/manager/staff**

**Purpose:** Staff management interface untuk manager
**Business Logic:**

- Staff list dengan performance metrics
- Role management capabilities untuk level 2-4
- Staff scheduling dan assignment

**Expected Behavior:**

- Response berisi staff data dengan performance metrics
- Role management options
- Staff assignment capabilities

**Validation Rules:**

- Manager access level required
- Staff level validation (dapat manage level 2-4)
- Performance metrics calculation

---

#### **GET /api/staff/manager/health**

**Purpose:** Manager routes health check untuk monitoring manager system
**Business Logic:**

- Menampilkan status manager routes dan available endpoints
- Memberikan informasi endpoint manager yang tersedia
- Dapat digunakan untuk system health monitoring

**Expected Behavior:**

- Response berisi status manager routes dan endpoint list
- Menampilkan semua available manager endpoints
- Memerlukan manager authentication

**Validation Rules:**

- Requires manajer_futsal role atau higher
- Response konsisten untuk monitoring purposes

### **Supervisor Sistem (Role: supervisor_sistem)**

#### **GET /api/staff/supervisor/dashboard**

**Purpose:** System supervisor dashboard dengan complete system overview
**Business Logic:**

- System health metrics dan performance monitoring
- Security alerts dan audit trail summary
- Complete system administration overview

**Expected Behavior:**

- Response berisi system-wide metrics
- Security monitoring data
- Administrative action items

**Validation Rules:**

- Supervisor access level required
- System metrics real-time calculation
- Security data aggregation

---

#### **GET /api/staff/supervisor/system**

**Purpose:** System administration interface dengan full access
**Business Logic:**

- Complete system configuration access
- User management dengan all role levels
- System settings dan configuration management

**Expected Behavior:**

- Response berisi system configuration data
- Full administrative capabilities
- System health monitoring

**Validation Rules:**

- Supervisor authorization required
- Full system access validation
- Configuration change audit trail

---

#### **GET /api/staff/supervisor/health**

**Purpose:** Supervisor routes health check untuk monitoring supervisor system
**Business Logic:**

- Menampilkan status supervisor routes dan available endpoints
- Memberikan informasi endpoint supervisor yang tersedia
- Dapat digunakan untuk system health monitoring

**Expected Behavior:**

- Response berisi status supervisor routes dan endpoint list
- Menampilkan semua available supervisor endpoints
- Memerlukan supervisor authentication

**Validation Rules:**

- Requires supervisor_sistem role
- Response konsisten untuk monitoring purposes

---

#### **GET /api/staff/supervisor/system-health**

**Purpose:** Comprehensive system health monitoring untuk supervisor
**Business Logic:**

- Melakukan comprehensive system health check
- Database connectivity dan performance monitoring
- Application metrics dan resource usage
- Error detection dan system status

**Expected Behavior:**

- Response berisi detailed system health metrics
- Performance indicators dan resource usage
- Error logs dan system alerts

**Validation Rules:**

- Supervisor authorization required
- Real-time health metrics calculation
- System resource access validation

---

#### **GET /api/staff/supervisor/users**

**Purpose:** User management interface untuk supervisor dengan full access
**Business Logic:**

- Menampilkan all users dengan complete information
- Advanced filtering dan search capabilities
- User activity monitoring dan statistics
- Role management capabilities untuk all levels

**Expected Behavior:**

- Response berisi comprehensive user data
- Advanced filtering options
- User activity metrics dan role information

**Validation Rules:**

- Supervisor authorization required
- Complete user access validation
- Privacy compliance enforcement

---

#### **POST /api/staff/supervisor/users/staff**

**Purpose:** Create new staff user dengan role assignment
**Business Logic:**

- Staff user creation dengan role assignment
- Employee onboarding workflow
- Automatic role validation dan assignment
- Complete audit trail untuk staff creation

**Expected Behavior:**

- Response berisi created staff user data
- Role assignment confirmation
- Employee onboarding information

**Validation Rules:**

- Supervisor authorization required
- Role assignment validation
- Employee data validation
- Onboarding workflow compliance

---

#### **PUT /api/staff/supervisor/users/:id/role**

**Purpose:** Force update user role dengan supervisor override
**Business Logic:**

- Direct role change dengan supervisor privileges
- Bypass normal approval workflow
- Complete audit trail untuk role changes
- Notification system untuk affected users

**Expected Behavior:**

- Response berisi updated user dengan new role
- Audit log untuk role change
- Notification trigger untuk affected user

**Validation Rules:**

- Supervisor authorization required
- User ID validation
- Role change audit trail
- Notification compliance

---

#### **GET /api/staff/supervisor/analytics**

**Purpose:** Comprehensive system analytics untuk supervisor
**Business Logic:**

- System-wide analytics dan performance metrics
- User behavior analysis dan security monitoring
- Business intelligence dan operational insights
- Trend analysis dan forecasting

**Expected Behavior:**

- Response berisi comprehensive analytics data
- System performance insights
- Security monitoring information

**Validation Rules:**

- Supervisor authorization required
- Analytics parameter validation
- Date range constraints

---

#### **GET /api/staff/supervisor/audit-logs**

**Purpose:** Audit logs access untuk supervisor monitoring
**Business Logic:**

- Complete audit trail access dengan advanced filtering
- Security event monitoring dan analysis
- User activity tracking dan investigation
- Compliance reporting capabilities

**Expected Behavior:**

- Response berisi filtered audit logs
- Security event highlighting
- User activity patterns

**Validation Rules:**

- Supervisor authorization required
- Audit log filtering validation
- Privacy compliance enforcement

---

#### **GET /api/staff/supervisor/system-config**

**Purpose:** System configuration access untuk supervisor
**Business Logic:**

- Complete system configuration information
- Environment variables dan feature flags
- Database configuration dan connectivity
- Application settings dan parameters

**Expected Behavior:**

- Response berisi system configuration data
- Feature flags dan environment information
- Security configuration status

**Validation Rules:**

- Supervisor authorization required
- Configuration access validation
- Security information filtering

---

#### **POST /api/staff/supervisor/system-maintenance**

**Purpose:** System maintenance tasks execution
**Business Logic:**

- Execute system maintenance tasks
- Database cleanup dan optimization
- Cache clearing dan performance optimization
- Backup procedures dan system tasks

**Expected Behavior:**

- Response berisi maintenance task results
- Task execution confirmation
- Performance impact information

**Validation Rules:**

- Supervisor authorization required
- Valid maintenance task validation
- Task execution audit trail

---

#### **GET /api/staff/supervisor/error-logs**

**Purpose:** System error logs monitoring untuk supervisor
**Business Logic:**

- System error logs access dengan filtering
- Error categorization dan analysis
- Performance issue identification
- System stability monitoring

**Expected Behavior:**

- Response berisi filtered error logs
- Error categorization dan severity
- System stability indicators

**Validation Rules:**

- Supervisor authorization required
- Error log filtering validation
- System access validation

## 🔧 **ADMIN ENDPOINTS (Management Level)**

### **User Management**

#### **GET /api/admin/users**

**Purpose:** Comprehensive user management dengan advanced filtering dan role management
**Business Logic:**

- Menampilkan all users dengan role hierarchy consideration
- Advanced filtering berdasarkan role, status, activity, registration date
- User statistics dan activity metrics

**Expected Behavior:**

- Response berisi paginated user list dengan comprehensive data
- Role-based filtering dan management options
- User activity metrics dan statistics

**Validation Rules:**

- Requires management level access (manajer_futsal atau supervisor_sistem)
- Pagination dan filtering parameter validation
- Role hierarchy enforcement untuk user management

---

#### **PUT /api/admin/users/:id/role**

**Purpose:** Role management dengan approval workflow dan hierarchy validation
**Business Logic:**

- Role change dengan hierarchy validation
- Approval workflow untuk non-supervisor role changes
- Complete audit trail untuk role changes
- Notification system untuk affected users

**Expected Behavior:**

- Response berisi updated user data dengan new role
- Audit log untuk role change
- Notification trigger untuk user dan admin

**Validation Rules:**

- Target user ID harus valid
- Role hierarchy validation (admin level harus lebih tinggi dari target)
- Role change approval workflow untuk non-supervisor
- Audit trail requirement

---

#### **PUT /api/admin/users/:id/status**

**Purpose:** User status management (activate/deactivate) dengan business impact consideration
**Business Logic:**

- User status toggle dengan impact analysis
- Active booking consideration untuk deactivation
- Notification system untuk status changes
- Audit trail untuk administrative actions

**Expected Behavior:**

- Response berisi updated user status
- Impact analysis untuk active bookings
- Administrative notification dan audit log

**Validation Rules:**

- User ID validation dan existence check
- Active booking impact analysis
- Administrative authorization required
- Status change audit trail

### **Role Management System**

#### **GET /api/admin/role-management/dashboard**

**Purpose:** Role management dashboard dengan comprehensive overview dan pending requests
**Business Logic:**

- Role statistics dan distribution analysis
- Pending role change requests dengan priority
- Role change history dan audit trail
- Administrative action items

**Expected Behavior:**

- Response berisi role management overview
- Pending requests dengan priority indicators
- Role statistics dan trends

**Validation Rules:**

- Management level authorization required
- Role statistics real-time calculation
- Request priority validation

---

#### **GET /api/admin/role-management/requests**

**Purpose:** Role change request management dengan approval workflow
**Business Logic:**

- Menampilkan pending role change requests
- Request details dengan requester dan target information
- Approval workflow management
- Priority-based sorting dan filtering

**Expected Behavior:**

- Response berisi pending requests dengan complete context
- Approval/rejection action options
- Request priority dan urgency indicators

**Validation Rules:**

- Management authorization required
- Request status filtering validation
- Priority level validation

---

#### **PUT /api/admin/role-management/requests/:id/approve**

**Purpose:** Approve role change request dengan complete workflow
**Business Logic:**

- Role change request approval dengan validation
- Automatic role update setelah approval
- Notification system untuk all parties
- Complete audit trail untuk approval process

**Expected Behavior:**

- Response berisi approved request data
- Automatic role update execution
- Notification trigger untuk requester dan target user

**Validation Rules:**

- Request ID harus valid dan status 'pending'
- Approver authorization level validation
- Role hierarchy enforcement
- Approval notes requirement

### **Auto-Completion Management**

#### **GET /api/admin/auto-completion/config**

**Purpose:** Auto-completion system configuration dan monitoring
**Business Logic:**

- Menampilkan current auto-completion configuration
- System status dan next run information
- Configuration options untuk enable/disable
- Performance metrics dan statistics

**Expected Behavior:**

- Response berisi auto-completion configuration
- System status dan scheduling information
- Performance metrics dan completion statistics

**Validation Rules:**

- Admin level authorization required
- Configuration parameter validation
- System status real-time check

---

#### **POST /api/admin/auto-completion/trigger**

**Purpose:** Manual trigger untuk auto-completion process dengan admin override
**Business Logic:**

- Manual execution auto-completion process
- Admin attribution untuk manual triggers
- Complete audit trail untuk manual interventions
- Performance monitoring dan result reporting

**Expected Behavior:**

- Response berisi completion results dan statistics
- Audit log untuk manual trigger
- Performance metrics untuk executed process

**Validation Rules:**

- Admin authorization required (supervisor_sistem only)
- Manual trigger audit trail
- Process execution validation

---

#### **GET /api/admin/auto-completion/eligible**

**Purpose:** Preview booking yang eligible untuk auto-completion
**Business Logic:**

- Menampilkan bookings yang eligible untuk completion
- Grace period calculation dan timing information
- Preview mode tanpa actual execution
- Eligibility criteria explanation

**Expected Behavior:**

- Response berisi eligible bookings dengan timing info
- Grace period calculation display
- Eligibility criteria explanation

**Validation Rules:**

- Admin authorization required
- Grace period calculation validation
- Eligibility criteria enforcement

---

#### **POST /api/admin/auto-completion/manual/:id**

**Purpose:** Manual completion untuk specific booking dengan admin override
**Business Logic:**

- Manual booking completion dengan admin attribution
- Override normal completion workflow
- Complete audit trail untuk manual completion
- Notification system untuk affected parties

**Expected Behavior:**

- Response berisi manually completed booking
- Audit log untuk manual completion
- Notification trigger untuk customer

**Validation Rules:**

- Booking ID harus valid
- Booking status validation untuk completion eligibility
- Admin authorization required
- Manual completion reason requirement

---

#### **GET /api/admin/auto-completion/stats**

**Purpose:** Auto-completion statistics dan performance metrics
**Business Logic:**

- Menampilkan auto-completion statistics untuk period tertentu
- Performance metrics dan completion rates
- Success/failure analysis untuk auto-completion
- Historical data dan trends

**Expected Behavior:**

- Response berisi completion statistics dan metrics
- Performance indicators dan success rates
- Historical trends dan analysis

**Validation Rules:**

- Admin authorization required
- Date range validation (default 7 hari)
- Statistics calculation validation

### **System Analytics & Monitoring**

#### **GET /api/admin/analytics/business**

**Purpose:** Comprehensive business analytics untuk strategic decision making
**Business Logic:**

- Revenue analytics dengan multiple dimensions
- Customer behavior analysis dan retention metrics
- Field performance dan utilization analysis
- Trend analysis dan forecasting

**Expected Behavior:**

- Response berisi comprehensive business intelligence
- Multi-dimensional analytics data
- Trend analysis dan insights

**Validation Rules:**

- Management level authorization required
- Date range validation untuk analytics
- Analytics parameter constraints

---

#### **GET /api/admin/analytics/system**

**Purpose:** System performance analytics dan health monitoring
**Business Logic:**

- System performance metrics dan monitoring
- Database performance dan query analysis
- API endpoint usage statistics
- Error tracking dan performance bottlenecks

**Expected Behavior:**

- Response berisi system performance data
- Performance bottleneck identification
- System health indicators

**Validation Rules:**

- Admin authorization required
- Performance metrics real-time calculation
- System health validation

---

#### **GET /api/admin/system-settings**

**Purpose:** System settings management untuk admin
**Business Logic:**

- Menampilkan all system settings dengan categorization
- Configuration management untuk application parameters
- Setting validation dan constraint checking
- Category-based organization untuk settings

**Expected Behavior:**

- Response berisi system settings dengan categories
- Configuration options dan current values
- Setting validation rules dan constraints

**Validation Rules:**

- Admin authorization required
- Setting category validation
- Configuration access validation

---

#### **PUT /api/admin/system-settings/:key**

**Purpose:** Update specific system setting
**Business Logic:**

- Update individual system setting dengan validation
- Setting value validation dan constraint checking
- Audit trail untuk configuration changes
- Real-time configuration update

**Expected Behavior:**

- Response berisi updated setting data
- Configuration change confirmation
- Audit log untuk setting changes

**Validation Rules:**

- Admin authorization required
- Setting key validation
- Value constraint validation
- Configuration change audit trail

---

#### **GET /api/admin/notifications**

**Purpose:** Notification management untuk admin
**Business Logic:**

- Menampilkan all notifications dengan filtering
- Notification statistics dan delivery status
- Multi-channel notification management
- User notification preferences

**Expected Behavior:**

- Response berisi notifications dengan delivery status
- Filtering options untuk notification management
- Statistics dan performance metrics

**Validation Rules:**

- Management level authorization required
- Notification filtering validation
- Date range constraints

---

#### **POST /api/admin/notifications/broadcast**

**Purpose:** Broadcast notification creation
**Business Logic:**

- Create broadcast notification dengan user targeting
- Multi-channel delivery configuration
- Priority-based delivery scheduling
- Delivery status tracking dan monitoring

**Expected Behavior:**

- Response berisi broadcast notification data
- Delivery configuration confirmation
- Targeting information dan scheduling

**Validation Rules:**

- Admin authorization required
- User targeting validation
- Channel configuration validation
- Message content validation

---

#### **GET /api/admin/promotions**

**Purpose:** Promotion management interface
**Business Logic:**

- Menampilkan all promotions dengan status information
- Promotion usage statistics dan effectiveness
- Active/inactive promotion management
- Usage tracking dan analytics

**Expected Behavior:**

- Response berisi promotions dengan usage data
- Status information dan effectiveness metrics
- Management action options

**Validation Rules:**

- Management authorization required
- Promotion status validation
- Usage statistics calculation

---

#### **POST /api/admin/promotions**

**Purpose:** Create new promotion
**Business Logic:**

- Promotion creation dengan comprehensive configuration
- Validation rules dan usage constraints
- Time-based restrictions dan field applicability
- Automatic activation scheduling

**Expected Behavior:**

- Response berisi created promotion data
- Configuration validation confirmation
- Activation schedule information

**Validation Rules:**

- Admin authorization required
- Promotion configuration validation
- Date range dan usage limit validation
- Discount value constraints

---

#### **PUT /api/admin/promotions/:id**

**Purpose:** Update existing promotion
**Business Logic:**

- Promotion update dengan configuration changes
- Usage limit modification dan time adjustments
- Status change management
- Impact analysis untuk active promotions

**Expected Behavior:**

- Response berisi updated promotion data
- Configuration change confirmation
- Impact analysis untuk existing usage

**Validation Rules:**

- Admin authorization required
- Promotion ID validation
- Configuration change validation
- Active usage impact analysis

---

#### **DELETE /api/admin/promotions/:id**

**Purpose:** Delete promotion dengan impact analysis
**Business Logic:**

- Promotion deletion dengan usage impact analysis
- Active booking consideration
- Refund calculation untuk affected bookings
- Audit trail untuk promotion deletion

**Expected Behavior:**

- Response berisi deletion confirmation
- Impact analysis untuk affected bookings
- Refund information jika applicable

**Validation Rules:**

- Admin authorization required
- Promotion ID validation
- Active usage impact analysis
- Deletion audit trail

## 🎯 **ENHANCED FEATURES ENDPOINTS**

### **Notification System**

#### **POST /api/enhanced/notifications/broadcast**

**Purpose:** Broadcast notification system untuk mass communication
**Business Logic:**

- Mass notification dengan user filtering
- Multi-channel delivery (app, email, sms)
- Priority-based delivery scheduling
- Delivery status tracking

**Expected Behavior:**

- Response berisi broadcast status dan delivery metrics
- Multi-channel delivery confirmation
- Delivery failure handling

**Validation Rules:**

- Admin authorization required untuk broadcast
- User filter validation
- Channel availability validation
- Message content validation

### **Promotion System**

#### **GET /api/enhanced/promotions/management**

**Purpose:** Promotion management interface untuk admin
**Business Logic:**

- Comprehensive promotion management
- Usage statistics dan performance metrics
- Promotion effectiveness analysis
- Active/inactive promotion management

**Expected Behavior:**

- Response berisi promotion management data
- Usage statistics dan effectiveness metrics
- Management action options

**Validation Rules:**

- Management authorization required
- Promotion status validation
- Usage statistics calculation

---

#### **POST /api/enhanced/promotions**

**Purpose:** Create new promotion dengan comprehensive configuration
**Business Logic:**

- Promotion creation dengan flexible configuration
- Validation rules dan constraints setup
- Usage limits dan time restrictions
- Automatic activation scheduling

**Expected Behavior:**

- Response berisi created promotion data
- Validation rules confirmation
- Activation schedule information

**Validation Rules:**

- Admin authorization required
- Promotion configuration validation
- Date range dan usage limit validation
- Discount value constraints

### **Audit Trail System**

#### **GET /api/enhanced/audit-logs**

**Purpose:** Comprehensive audit trail untuk system monitoring dan compliance
**Business Logic:**

- Complete system audit trail dengan advanced filtering
- User activity tracking dan analysis
- Security event monitoring
- Compliance reporting capabilities

**Expected Behavior:**

- Response berisi filtered audit logs dengan context
- User activity patterns dan analysis
- Security event highlighting

**Validation Rules:**

- Admin authorization required
- Audit log filtering validation
- Date range constraints
- User privacy considerations

---

#### **GET /api/enhanced/audit-logs/user/:id**

**Purpose:** User-specific audit trail untuk detailed activity analysis
**Business Logic:**

- Complete user activity history
- Action categorization dan analysis
- Security event detection
- Behavioral pattern analysis

**Expected Behavior:**

- Response berisi user-specific audit trail
- Activity categorization dan patterns
- Security event indicators

**Validation Rules:**

- Admin authorization required
- User ID validation
- Privacy compliance enforcement
- Audit trail completeness verification

## 📊 **ERROR HANDLING & EDGE CASES**

### **Common Error Scenarios**

#### **Authentication Errors**

- **401 Unauthorized:** Invalid atau expired JWT token
- **403 Forbidden:** Insufficient role permissions untuk endpoint access
- **429 Too Many Requests:** Rate limiting enforcement

#### **Validation Errors**

- **400 Bad Request:** Invalid request parameters atau missing required fields
- **409 Conflict:** Business logic conflicts (booking time overlap, duplicate data)
- **422 Unprocessable Entity:** Valid format tapi business rule violation

#### **Resource Errors**

- **404 Not Found:** Resource tidak ditemukan atau user tidak memiliki access
- **410 Gone:** Resource sudah tidak tersedia (cancelled booking, deleted field)

#### **System Errors**

- **500 Internal Server Error:** Unexpected system error dengan error tracking
- **503 Service Unavailable:** System maintenance atau database connectivity issues

### **Business Logic Edge Cases**

#### **Booking Conflicts**

- Time overlap detection dengan existing bookings
- Field maintenance mode handling
- Holiday dan special event restrictions
- Capacity exceeded scenarios

#### **Payment Processing**

- Gateway timeout handling
- Partial payment scenarios
- Refund processing workflows
- Currency conversion edge cases

#### **Role Management**

- Circular role dependency prevention
- Role change impact analysis
- Permission inheritance conflicts
- Administrative override scenarios

---

**Dokumentasi ini memberikan frontend developer pemahaman lengkap tentang semua endpoint API, business logic, validation rules, dan expected behavior tanpa perlu membaca source code backend. Setiap endpoint dijelaskan dengan fokus pada informasi dan spesifikasi sistem yang diperlukan untuk pengembangan frontend yang optimal.**
