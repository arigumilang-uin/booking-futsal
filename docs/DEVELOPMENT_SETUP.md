# 🔧 Development Environment Setup Guide

Panduan lengkap untuk mengkonfigurasi development environment yang terintegrasi antara frontend dan backend.

---

## 📋 **Prerequisites**

### **System Requirements:**
- Node.js >= 18.20.4
- npm >= 9.0.0
- PostgreSQL >= 12
- Git

### **Development Tools (Recommended):**
- VS Code dengan extensions:
  - ES7+ React/Redux/React-Native snippets
  - Tailwind CSS IntelliSense
  - Auto Rename Tag
  - Prettier - Code formatter

---

## 🏗️ **Project Structure**

```
booking-futsal-system/
├── booking_futsal/                 # Backend (Node.js + Express)
│   ├── .env.development
│   ├── .env.production
│   ├── server.js
│   ├── app.js
│   └── package.json
│
└── booking-futsal-frontend/        # Frontend (Vite + React)
    ├── .env.development
    ├── .env.production
    ├── vite.config.js
    ├── package.json
    └── src/
```

---

## 🚀 **Backend Development Setup**

### **1. Clone & Install Backend**
```bash
# Clone backend repository
git clone https://github.com/arigumilang-uin/booking-futsal.git
cd booking_futsal

# Install dependencies
npm install
```

### **2. Environment Configuration**
```bash
# Copy environment template
cp .env.example .env.development

# Edit .env.development
nano .env.development
```

### **3. Backend .env.development Configuration**
```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/booking_futsal_dev

# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-for-development

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Development Features
ENABLE_LOGGING=true
ENABLE_DEBUG=true
RETURN_JWT_IN_RESPONSE=true

# Auto-completion Settings
ENABLE_AUTO_COMPLETION=true
AUTO_COMPLETION_SCHEDULE=*/30 * * * *

# Timezone
TZ=Asia/Jakarta
```

### **4. Database Setup**
```bash
# Create development database
createdb booking_futsal_dev

# Run migrations (if available)
npm run migrate:dev

# Seed development data (if available)
npm run seed:dev
```

### **5. Start Backend Development Server**
```bash
# Start with hot reload
npm run dev

# Expected output:
# 🚀 Server running on port 3000
# 🌍 Environment: development
# 📊 Available endpoints:
#    - Health Check: http://localhost:3000/api/test/health
#    - Routes List: http://localhost:3000/api/test/routes
#    - Database Test: http://localhost:3000/api/test/database
```

---

## 🎨 **Frontend Development Setup**

### **1. Clone & Install Frontend**
```bash
# Clone frontend repository
git clone <frontend-repository-url>
cd booking-futsal-frontend

# Install dependencies
npm install
```

### **2. Environment Configuration**
Frontend sudah dikonfigurasi dengan file `.env.development`:

```env
# API Configuration - Using localhost backend for development
VITE_API_URL=http://localhost:3000/api

# Application Configuration
VITE_APP_NAME=Booking Futsal System (Development)
VITE_APP_VERSION=1.0.0-dev

# Development Configuration
VITE_NODE_ENV=development
VITE_DEBUG_MODE=true
VITE_ENABLE_LOGGING=true

# Authentication Configuration
VITE_AUTH_TOKEN_KEY=auth_token
VITE_AUTH_STORAGE_TYPE=localStorage

# Development Server Configuration
VITE_DEV_SERVER_PORT=5173
VITE_DEV_SERVER_HOST=localhost

# CORS Configuration for Development
VITE_CORS_ENABLED=true
VITE_CREDENTIALS_INCLUDE=true
```

### **3. Start Frontend Development Server**
```bash
# Start with hot reload
npm run dev

# Expected output:
# VITE v6.3.5  ready in 357 ms
# ➜  Local:   http://localhost:5173/
# ➜  Network: use --host to expose
# 🔧 Development Mode Detected
# 📡 API Base URL: http://localhost:3000/api
# 🌍 Environment: development
```

---

## 🔗 **Integration Configuration**

### **1. CORS Setup (Backend)**
Backend sudah dikonfigurasi untuk menerima request dari frontend development:

```javascript
// app.js - CORS Configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',  // Frontend development
  'https://booking-futsal-frontend.vercel.app'
];
```

### **2. Proxy Setup (Frontend)**
Frontend menggunakan Vite proxy untuk development:

```javascript
// vite.config.js - Proxy Configuration
proxy: {
  '/api': {
    target: 'http://localhost:3000',
    changeOrigin: true,
    secure: false
  }
}
```

### **3. Authentication Flow**
Development environment menggunakan dual authentication:
- **Primary**: HttpOnly cookies (same-domain)
- **Fallback**: Authorization header dengan localStorage token

---

## 🧪 **Development Testing**

### **1. Backend Health Check**
```bash
# Test backend health
curl http://localhost:3000/api/test/health

# Expected response:
{
  "status": "healthy",
  "environment": "development",
  "database": "connected"
}
```

### **2. Frontend API Integration Test**
```bash
# Open browser console at http://localhost:5173
# Run integration test
runCustomerBookingTests()
```

### **3. End-to-End Development Flow**
1. **Start Backend**: `npm run dev` (port 3000)
2. **Start Frontend**: `npm run dev` (port 5173)
3. **Test Authentication**: Login at http://localhost:5173/login
4. **Test Booking Creation**: Create booking via UI
5. **Test Booking Retrieval**: View booking list
6. **Check Logs**: Monitor console for API calls

---

## 📊 **Development Monitoring**

### **Backend Logs**
```bash
# Backend console shows:
📤 Sending Request to the Target: POST /api/auth/login
📥 Received Response from the Target: 200 /api/auth/login
🔑 JWT token generated for user: ari@gmail.com
```

### **Frontend Logs**
```bash
# Browser console shows:
🔧 Development Mode Detected
📡 API Base URL: http://localhost:3000/api
🚀 API Request: POST /api/auth/login
🔑 Token stored from response body
✅ Profile loaded successfully
```

---

## 🔧 **Development Commands**

### **Backend Commands**
```bash
npm run dev          # Start development server with hot reload
npm run prod         # Start production server
npm run health       # Health check
```

### **Frontend Commands**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

---

## 🚨 **Troubleshooting**

### **Common Issues & Solutions**

#### **1. CORS Error**
```
Error: Access to XMLHttpRequest blocked by CORS policy
```
**Solution**: Pastikan backend berjalan di port 3000 dan frontend di port 5173

#### **2. Authentication Failed**
```
Error: Access denied. No token provided.
```
**Solution**: 
- Cek localStorage untuk token
- Pastikan backend mengembalikan token dalam development mode
- Clear localStorage dan login ulang

#### **3. Database Connection Error**
```
Error: Database connection failed
```
**Solution**:
- Pastikan PostgreSQL berjalan
- Cek DATABASE_URL di .env.development
- Test koneksi: `npm run health`

#### **4. Port Already in Use**
```
Error: Port 3000 is already in use
```
**Solution**:
```bash
# Kill process on port 3000
npx kill-port 3000

# Or use different port
PORT=3001 npm run dev
```

---

## 📈 **Performance Optimization**

### **Development Mode Features**
- Hot Module Replacement (HMR)
- Source maps enabled
- Detailed error logging
- API request/response logging
- Auto-browser refresh

### **Production Mode Differences**
- Minified code
- No source maps
- Limited logging
- HttpOnly cookies only
- HTTPS enforcement

---

## 🎯 **Next Steps**

1. **Complete Backend Setup**: Pastikan backend berjalan di localhost:3000
2. **Test Authentication**: Login dan verifikasi token storage
3. **Test Booking Flow**: Create → View → Cancel booking
4. **Monitor Logs**: Pastikan tidak ada error di console
5. **Integration Testing**: Test semua fitur end-to-end

---

**🏟️ Happy Development! Sistem booking futsal siap untuk development.**
