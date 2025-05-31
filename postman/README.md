# 📋 **ENHANCED FUTSAL BOOKING SYSTEM - POSTMAN COLLECTION**

## **🎯 OVERVIEW**

Comprehensive Postman collection untuk testing enhanced futsal booking system dengan 6-role architecture, backward compatibility, dan complete API coverage.

### **📦 DELIVERABLES**

1. **Enhanced_Futsal_Booking_System.postman_collection.json** - Main collection file
2. **Development.postman_environment.json** - Development environment
3. **Production.postman_environment.json** - Production environment  
4. **TESTING_GUIDE.md** - Comprehensive testing guide
5. **README.md** - Documentation dan setup instructions

---

## **🏗️ COLLECTION STRUCTURE**

```
📁 Enhanced Futsal Booking System - Comprehensive API Testing
├── 📁 🔧 Environment Setup
│   ├── Check API Status
│   ├── Get Available Routes
│   └── Get Role Permissions
├── 📁 🔐 Authentication
│   ├── Register New User (Default: Penyewa)
│   ├── Login User
│   ├── Get User Profile
│   ├── Refresh Token
│   └── Logout User
├── 📁 🌐 Public Endpoints (Guest Access)
│   ├── Get System Info
│   ├── Get Public Fields
│   ├── Get Field Detail
│   ├── Get Field Availability
│   ├── Get Field Types
│   ├── Get Field Locations
│   └── Health Check
├── 📁 👤 Customer/Penyewa Endpoints
│   ├── Get Customer Profile
│   ├── Update Customer Profile
│   ├── Get Available Fields for Customer
│   ├── Create Booking
│   ├── Get Customer Bookings
│   ├── Get Booking Detail
│   ├── Cancel Booking
│   └── Get Customer Dashboard
├── 📁 💰 Staff Kasir Endpoints
│   ├── Get Kasir Dashboard
│   ├── Get All Payments
│   ├── Get Pending Payments
│   ├── Get Payment Detail
│   ├── Process Manual Payment
│   ├── Confirm Payment
│   ├── Get Payment Statistics
│   └── Get Daily Cash Report
├── 📁 ⚽ Staff Operator Endpoints
│   ├── Get Operator Dashboard
│   ├── Get Assigned Fields
│   ├── Update Field Status
│   ├── Get Field Bookings
│   ├── Get Today Schedule
│   ├── Confirm Booking
│   ├── Complete Booking
│   └── Get Operator Statistics
├── 📁 🏢 Staff Manager Endpoints (Coming Soon)
├── 📁 👑 Staff Supervisor Endpoints (Coming Soon)
├── 📁 🔄 Legacy Routes (Backward Compatibility)
└── 📁 🧪 Error Scenarios & Edge Cases
```

---

## **🚀 QUICK START**

### **1. Import Collection**
```bash
# Download files
git clone <repository>
cd postman/

# Import ke Postman
1. Open Postman
2. Click "Import"
3. Select "Enhanced_Futsal_Booking_System.postman_collection.json"
4. Import environment files
```

### **2. Setup Environment**
```bash
# Development
- Select "Development Environment"
- base_url: http://localhost:5000
- Ensure backend is running: npm run dev

# Production  
- Select "Production Environment"
- base_url: https://your-production-url.com
- Update production credentials
```

### **3. Run Basic Tests**
```bash
1. Run "Environment Setup" folder
2. Run "Authentication" → "Register New User"
3. Run "Authentication" → "Login User"
4. Run "Public Endpoints" folder
5. Run "Customer/Penyewa Endpoints" folder
```

---

## **🔧 ENVIRONMENT VARIABLES**

### **Automatic Variables (Set by Tests):**
- `auth_token` - JWT authentication token
- `user_id` - Current user ID
- `user_role` - Current user role
- `field_id` - Field ID for testing
- `booking_id` - Booking ID for testing
- `payment_id` - Payment ID for testing

### **Manual Configuration:**
- `base_url` - API base URL
- `test_*_email` - Test user emails for each role
- `test_*_password` - Test user passwords

---

## **🎭 ROLE-BASED TESTING**

### **Enhanced 6-Role System:**

1. **🌐 Pengunjung (Level 1)**
   - Public field viewing
   - Availability checking
   - No authentication required

2. **👤 Penyewa (Level 2)**
   - Customer operations
   - Booking management
   - Profile management

3. **💰 Staff Kasir (Level 3)**
   - Payment processing
   - Cash management
   - Payment reports

4. **⚽ Operator Lapangan (Level 4)**
   - Field operations
   - Booking confirmation
   - Field status management

5. **🏢 Manajer Futsal (Level 5)**
   - Business management
   - User management
   - Analytics

6. **👑 Supervisor Sistem (Level 6)**
   - Full system access
   - System administration
   - Audit logs

---

## **🧪 TESTING FEATURES**

### **Automated Testing:**
- ✅ Pre-request scripts for token management
- ✅ Test scripts for response validation
- ✅ Environment variable auto-population
- ✅ Role-based access verification
- ✅ Error scenario testing

### **Test Coverage:**
- ✅ Authentication & Authorization
- ✅ Role-based access control
- ✅ CRUD operations
- ✅ Business logic validation
- ✅ Error handling
- ✅ Backward compatibility

### **Validation Points:**
- ✅ HTTP status codes
- ✅ Response structure
- ✅ Data integrity
- ✅ Role permissions
- ✅ Token management
- ✅ Error messages

---

## **📊 SAMPLE RESPONSES**

### **Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "id": "uuid",
    "field_name": "Lapangan A",
    "status": "available"
  },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25
  }
}
```

### **Error Response:**
```json
{
  "success": false,
  "error": "Insufficient permissions",
  "details": "User role 'penyewa' cannot access this endpoint"
}
```

---

## **🔍 TROUBLESHOOTING**

### **Common Issues:**

1. **401 Unauthorized**
   ```bash
   Solution: Run "Login User" to get fresh token
   Check: auth_token variable is set
   ```

2. **403 Forbidden**
   ```bash
   Solution: Check user role matches endpoint requirements
   Check: Role hierarchy permissions
   ```

3. **404 Not Found**
   ```bash
   Solution: Run prerequisite requests to populate IDs
   Check: field_id, booking_id variables are set
   ```

4. **Connection Refused**
   ```bash
   Solution: Ensure backend server is running
   Check: base_url matches server port
   ```

---

## **📈 PERFORMANCE BENCHMARKS**

### **Expected Response Times:**
- Authentication: < 500ms
- Public endpoints: < 300ms
- CRUD operations: < 1000ms
- Dashboard/Analytics: < 2000ms
- File uploads: < 5000ms

### **Load Testing:**
- Concurrent users: 100+
- Requests per second: 1000+
- Error rate: < 1%
- Uptime: 99.9%

---

## **🔄 CONTINUOUS INTEGRATION**

### **Automated Testing:**
```bash
# Newman CLI for CI/CD
npm install -g newman

# Run collection
newman run Enhanced_Futsal_Booking_System.postman_collection.json \
  -e Development.postman_environment.json \
  --reporters cli,json \
  --reporter-json-export results.json
```

### **Monitoring:**
- Daily health checks
- Performance monitoring
- Error rate tracking
- Uptime monitoring

---

## **📝 CHANGELOG**

### **v2.0.0 (Current)**
- ✅ Enhanced 6-role architecture
- ✅ Comprehensive endpoint coverage
- ✅ Automated testing scripts
- ✅ Environment management
- ✅ Backward compatibility testing

### **Future Enhancements:**
- 🔄 Manager & Supervisor endpoints
- 🔄 Legacy route testing
- 🔄 Error scenario collection
- 🔄 Performance testing suite
- 🔄 Integration testing

---

## **🤝 CONTRIBUTION**

### **Adding New Tests:**
1. Follow existing naming conventions
2. Add proper test scripts
3. Update environment variables
4. Document in TESTING_GUIDE.md

### **Reporting Issues:**
1. Include request/response details
2. Specify environment (dev/prod)
3. Provide error logs
4. Include steps to reproduce

---

## **📞 SUPPORT**

- **Documentation:** TESTING_GUIDE.md
- **Issues:** Create GitHub issue
- **Questions:** Contact development team
- **Updates:** Check changelog regularly

---

**🎯 Ready to test? Import the collection dan ikuti TESTING_GUIDE.md untuk comprehensive testing experience!**
