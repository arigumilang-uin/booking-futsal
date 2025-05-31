# 📋 **COMPREHENSIVE TESTING GUIDE**
## Enhanced Futsal Booking System - Postman Collection

### **🎯 OVERVIEW**

Panduan lengkap untuk testing enhanced futsal booking system menggunakan Postman collection yang telah dibuat. Collection ini mencakup testing untuk semua 6 roles dalam enhanced role-based architecture dengan backward compatibility.

---

## **📦 SETUP INSTRUCTIONS**

### **1. Import Collection & Environment**

1. **Import Collection:**
   - Buka Postman
   - Click "Import" → "Upload Files"
   - Pilih file `Enhanced_Futsal_Booking_System.postman_collection.json`

2. **Import Environments:**
   - Import `Development.postman_environment.json` untuk testing development
   - Import `Production.postman_environment.json` untuk testing production

3. **Select Environment:**
   - Pilih environment yang sesuai (Development/Production) di dropdown kanan atas

### **2. Environment Configuration**

#### **Development Environment:**
```
base_url: http://localhost:5000
database: localhost PostgreSQL
test credentials: customer@test.com / password123
```

#### **Production Environment:**
```
base_url: https://your-production-url.com
database: Railway PostgreSQL
test credentials: customer@production.com / secure_production_password
```

### **3. Pre-Testing Setup**

1. **Pastikan Backend Running:**
   ```bash
   cd booking_futsal
   npm run dev    # untuk development
   npm run prod   # untuk production
   ```

2. **Pastikan Database Ready:**
   - Development: PostgreSQL localhost running
   - Production: Railway PostgreSQL accessible

3. **Check API Status:**
   - Run "Check API Status" request di folder "Environment Setup"
   - Pastikan response menunjukkan API v2.0.0 dengan enhanced_role_system: true

---

## **🔄 TESTING SEQUENCE**

### **PHASE 1: Environment & System Check**

1. **🔧 Environment Setup**
   - ✅ Check API Status
   - ✅ Get Available Routes
   - ✅ Get Role Permissions

**Expected Results:**
- API version 2.0.0 running
- Enhanced role system active
- All 6 roles documented (pengunjung → supervisor_sistem)

### **PHASE 2: Authentication Flow**

2. **🔐 Authentication**
   - ✅ Register New User (Default: Penyewa)
   - ✅ Login User
   - ✅ Get User Profile
   - ✅ Refresh Token
   - ✅ Logout User

**Expected Results:**
- Registration creates user with 'penyewa' role by default
- Login returns JWT token (auto-saved to environment)
- Profile shows correct user data and role
- Token refresh works properly
- Logout clears token

### **PHASE 3: Public Access Testing**

3. **🌐 Public Endpoints (Guest Access)**
   - ✅ Get System Info
   - ✅ Get Public Fields
   - ✅ Get Field Detail
   - ✅ Get Field Availability
   - ✅ Get Field Types
   - ✅ Get Field Locations
   - ✅ Health Check

**Expected Results:**
- All endpoints accessible without authentication
- Field data returned with public information only
- Availability checking works for guest users

### **PHASE 4: Customer/Penyewa Testing**

4. **👤 Customer/Penyewa Endpoints**
   - ✅ Get Customer Profile
   - ✅ Update Customer Profile
   - ✅ Get Available Fields for Customer
   - ✅ Create Booking
   - ✅ Get Customer Bookings
   - ✅ Get Booking Detail
   - ✅ Cancel Booking
   - ✅ Get Customer Dashboard

**Expected Results:**
- Customer can manage own profile
- Booking creation with conflict detection
- Customer can only see own bookings
- Cancellation works with proper validation

### **PHASE 5: Staff Role Testing**

5. **💰 Staff Kasir Endpoints**
   - ✅ Get Kasir Dashboard
   - ✅ Get All Payments
   - ✅ Get Pending Payments
   - ✅ Get Payment Detail
   - ✅ Process Manual Payment
   - ✅ Confirm Payment
   - ✅ Get Payment Statistics
   - ✅ Get Daily Cash Report

**Expected Results:**
- Kasir can access payment-related endpoints
- Manual payment processing works
- Payment confirmation updates status
- Statistics and reports generated correctly

---

## **📊 SAMPLE TEST DATA**

### **User Registration Data:**
```json
{
  "name": "Test Customer",
  "email": "customer@test.com",
  "password": "password123",
  "phone": "081234567890"
}
```

### **Booking Creation Data:**
```json
{
  "field_id": "{{field_id}}",
  "booking_date": "2024-12-20",
  "start_time": "10:00",
  "end_time": "12:00",
  "notes": "Test booking from Postman"
}
```

### **Manual Payment Data:**
```json
{
  "booking_id": "{{booking_id}}",
  "amount": 100000,
  "payment_method": "cash",
  "notes": "Manual cash payment processed by kasir"
}
```

---

## **✅ EXPECTED RESULTS**

### **Success Responses:**
- **200 OK:** Data retrieval successful
- **201 Created:** Resource created successfully
- **Authentication:** JWT token in response
- **Role-based Access:** Proper permission checking

### **Error Responses:**
- **400 Bad Request:** Invalid input data
- **401 Unauthorized:** Missing or invalid token
- **403 Forbidden:** Insufficient role permissions
- **404 Not Found:** Resource not found
- **409 Conflict:** Booking conflicts, duplicate data

### **Response Format:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "pagination": { ... }  // for paginated responses
}
```

---

## **🔍 VALIDATION CHECKLIST**

### **Authentication & Authorization:**
- [ ] Registration creates penyewa role by default
- [ ] JWT token properly generated and validated
- [ ] Role-based access control working
- [ ] Token refresh mechanism functional
- [ ] Logout clears authentication

### **Role Hierarchy Testing:**
- [ ] Pengunjung (Level 1) - Public access only
- [ ] Penyewa (Level 2) - Customer operations
- [ ] Staff Kasir (Level 3) - Payment processing
- [ ] Operator Lapangan (Level 4) - Field operations
- [ ] Manajer Futsal (Level 5) - Business management
- [ ] Supervisor Sistem (Level 6) - Full system access

### **Business Logic Validation:**
- [ ] Booking conflict detection works
- [ ] Payment processing accurate
- [ ] Field availability checking correct
- [ ] Auto-completion system functional
- [ ] Audit trail maintained

### **Data Integrity:**
- [ ] Auto-generated fields populated
- [ ] JSONB data properly handled
- [ ] Pagination working correctly
- [ ] Search and filtering functional
- [ ] Data validation enforced

---

## **🚨 TROUBLESHOOTING**

### **Common Issues:**

1. **Token Expired:**
   - Run "Refresh Token" request
   - Or re-login to get new token

2. **403 Forbidden:**
   - Check user role in environment
   - Ensure proper role for endpoint access

3. **404 Not Found:**
   - Verify field_id, booking_id, payment_id in environment
   - Run prerequisite requests to populate IDs

4. **Database Connection:**
   - Check .env.development/.env.production configuration
   - Verify database is running and accessible

5. **CORS Issues:**
   - Ensure Postman origin is allowed in CORS configuration
   - Check allowedOrigins in app.js

### **Debug Steps:**
1. Check environment variables are set correctly
2. Verify API is running on correct port
3. Check database connection
4. Review console logs for detailed errors
5. Validate request body format and required fields

---

## **📈 PERFORMANCE TESTING**

### **Load Testing Scenarios:**
- Multiple concurrent user registrations
- Simultaneous booking creation
- Payment processing under load
- Dashboard data retrieval performance

### **Monitoring Points:**
- Response times < 2 seconds for most endpoints
- Database query performance
- Memory usage during peak load
- Error rates under stress

---

## **🔄 CONTINUOUS TESTING**

### **Automated Testing:**
- Set up collection runner for regression testing
- Schedule periodic API health checks
- Monitor production endpoints
- Validate backward compatibility

### **Integration Testing:**
- Test with frontend applications
- Validate mobile app integration
- Check third-party payment gateway integration
- Verify notification system functionality

---

**📝 Note:** Pastikan untuk menjalankan testing secara sequential sesuai dengan phase yang telah ditentukan untuk memastikan data dependencies terpenuhi dengan baik.
