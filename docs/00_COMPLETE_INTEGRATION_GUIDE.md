# 📚 COMPLETE INTEGRATION GUIDE - Futsal Booking System

## 🎯 **OVERVIEW**

Panduan master lengkap untuk mengintegrasikan frontend Vite+React+Tailwind dengan backend Railway yang sudah production-ready. Sistem booking futsal dengan fitur authentication, RBAC, booking management, payment tracking, dan role management.

## 📋 **QUICK START CHECKLIST**

### **✅ Prerequisites**
- [x] Backend deployed di Railway: `https://booking-futsal-production.up.railway.app`
- [x] Database PostgreSQL ready dengan 15 tables
- [x] 14 test users dengan role hierarchy (supervisor → customer)
- [x] Authentication system working (JWT + Cookie)
- [x] Role-based access control (RBAC) implemented
- [x] All API endpoints tested dan functional

### **✅ Frontend Setup Requirements**
- [ ] Node.js 18+ installed
- [ ] Git repository ready
- [ ] Vercel account untuk deployment
- [ ] Domain/subdomain (optional)

## 🚀 **STEP-BY-STEP IMPLEMENTATION**

### **PHASE 1: PROJECT SETUP (30 menit)**

#### **1. Create Vite React Project**
```bash
npm create vite@latest futsal-booking-frontend -- --template react
cd futsal-booking-frontend
npm install
```

#### **2. Install Dependencies**
```bash
# Core dependencies
npm install axios react-router-dom

# UI & Styling  
npm install @tailwindcss/forms @tailwindcss/typography
npm install @headlessui/react @heroicons/react clsx tailwind-merge

# Utilities
npm install date-fns react-hook-form @hookform/resolvers yup

# Development
npm install -D tailwindcss postcss autoprefixer @types/node
npx tailwindcss init -p
```

#### **3. Environment Configuration**
```bash
# .env.development
VITE_API_URL=http://localhost:5000/api
VITE_APP_URL=http://localhost:5173
VITE_NODE_ENV=development

# .env.production  
VITE_API_URL=https://booking-futsal-production.up.railway.app/api
VITE_APP_URL=https://futsal-booking-frontend.vercel.app
VITE_NODE_ENV=production
```

### **PHASE 2: CORE INTEGRATION (2-3 jam)**

#### **1. API Client Setup**
```javascript
// src/utils/api.js
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // PENTING untuk cookie auth
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
});

// Response interceptor untuk handle auth errors
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

#### **2. Authentication Context**
```javascript
// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check auth status on load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await apiClient.get('/auth/profile');
      if (response.data.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      if (response.data.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        return { success: true };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      };
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user, isAuthenticated, isLoading, login, logout, checkAuthStatus
    }}>
      {children}
    </AuthContext.Provider>
  );
};
```

#### **3. Protected Routes**
```javascript
// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return children;
};
```

### **PHASE 3: UI COMPONENTS (3-4 jam)**

#### **1. Login Page**
```javascript
// src/pages/auth/LoginPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await login(formData);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="max-w-md w-full space-y-6">
        {error && <div className="text-red-600">{error}</div>}
        
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          className="w-full p-3 border rounded-lg"
          required
        />
        
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          className="w-full p-3 border rounded-lg"
          required
        />
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700"
        >
          {loading ? 'Loading...' : 'Login'}
        </button>
      </form>
    </div>
  );
};
```

#### **2. Dashboard Components**
```javascript
// src/pages/customer/Dashboard.jsx
import { useEffect, useState } from 'react';
import { apiClient } from '../../utils/api';

const CustomerDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await apiClient.get('/customer/bookings');
      setBookings(response.data.data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard Customer</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bookings.map(booking => (
          <div key={booking.id} className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold">{booking.field?.name}</h3>
            <p className="text-gray-600">{booking.date}</p>
            <p className="text-gray-600">{booking.start_time} - {booking.end_time}</p>
            <span className={`inline-block px-2 py-1 rounded text-sm ${
              booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
              booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {booking.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
```

### **PHASE 4: DEPLOYMENT (1 jam)**

#### **1. Build Configuration**
```javascript
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser'
  }
})
```

#### **2. Vercel Deployment**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables
vercel env add VITE_API_URL production
# Enter: https://booking-futsal-production.up.railway.app/api

# Deploy to production
vercel --prod
```

#### **3. Vercel Configuration**
```json
// vercel.json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        }
      ]
    }
  ]
}
```

## 🔐 **ROLE-BASED FEATURES**

### **User Roles & Access Levels**
```javascript
const ROLE_ACCESS = {
  'penyewa': {
    routes: ['/dashboard', '/booking', '/profile'],
    permissions: ['view_own_bookings', 'create_booking']
  },
  'staff_kasir': {
    routes: ['/staff/kasir', '/payments'],
    permissions: ['process_payments', 'view_all_bookings']
  },
  'operator_lapangan': {
    routes: ['/staff/operator', '/fields'],
    permissions: ['manage_fields', 'update_booking_status']
  },
  'manajer_futsal': {
    routes: ['/admin/dashboard', '/admin/analytics'],
    permissions: ['view_analytics', 'manage_staff']
  },
  'supervisor_sistem': {
    routes: ['/admin/*', '/system/*'],
    permissions: ['full_access', 'manage_roles']
  }
};
```

## 🧪 **TESTING CREDENTIALS**

### **Test Users untuk Development**
```javascript
const TEST_USERS = {
  supervisor: {
    email: 'pweb@futsalapp.com',
    password: 'password123',
    role: 'supervisor_sistem'
  },
  manager: {
    email: 'manajer1@futsalapp.com', 
    password: 'password123',
    role: 'manajer_futsal'
  },
  operator: {
    email: 'operator1@futsalapp.com',
    password: 'password123', 
    role: 'operator_lapangan'
  },
  kasir: {
    email: 'kasir1@futsalapp.com',
    password: 'password123',
    role: 'staff_kasir'
  },
  customer: {
    email: 'ari@gmail.com',
    password: 'password123',
    role: 'penyewa'
  }
};
```

## 🔧 **TROUBLESHOOTING**

### **Common Issues & Solutions**

#### **1. CORS Errors**
```javascript
// Pastikan withCredentials: true di axios config
const apiClient = axios.create({
  withCredentials: true, // WAJIB untuk cookie auth
  baseURL: process.env.VITE_API_URL
});
```

#### **2. Authentication Issues**
```javascript
// Check cookie di browser DevTools → Application → Cookies
// Pastikan cookie 'token' ada dan valid

// Debug auth status
const debugAuth = async () => {
  try {
    const response = await apiClient.get('/auth/profile');
    console.log('Auth status:', response.data);
  } catch (error) {
    console.log('Auth error:', error.response?.data);
  }
};
```

#### **3. Environment Variables**
```bash
# Pastikan prefix VITE_ untuk semua env vars
VITE_API_URL=https://booking-futsal-production.up.railway.app/api

# Restart dev server setelah ubah env vars
npm run dev
```

## 📊 **PRODUCTION CHECKLIST**

### **✅ Pre-Launch Verification**
- [ ] All API endpoints working
- [ ] Authentication flow complete
- [ ] Role-based access working
- [ ] Error handling implemented
- [ ] Loading states added
- [ ] Responsive design tested
- [ ] Performance optimized
- [ ] Security headers configured
- [ ] Environment variables set
- [ ] Build successful
- [ ] Deployment working

### **✅ Post-Launch Monitoring**
- [ ] Frontend accessible
- [ ] API connectivity working
- [ ] User registration/login working
- [ ] Booking flow functional
- [ ] Payment processing working
- [ ] Role management working
- [ ] Error reporting setup
- [ ] Analytics tracking (optional)

---

## 📚 **DETAILED DOCUMENTATION**

Untuk informasi lebih detail, lihat file dokumentasi terpisah:

1. **[01_BACKEND_OVERVIEW.md](./01_BACKEND_OVERVIEW.md)** - Arsitektur sistem dan database
2. **[02_API_ENDPOINTS.md](./02_API_ENDPOINTS.md)** - Dokumentasi lengkap API
3. **[03_AUTHENTICATION_GUIDE.md](./03_AUTHENTICATION_GUIDE.md)** - Sistem auth dan RBAC
4. **[04_FRONTEND_SETUP.md](./04_FRONTEND_SETUP.md)** - Setup Vite+React+Tailwind
5. **[05_INTEGRATION_STEPS.md](./05_INTEGRATION_STEPS.md)** - Langkah integrasi API
6. **[06_DEPLOYMENT_GUIDE.md](./06_DEPLOYMENT_GUIDE.md)** - Deployment ke Vercel

---

## 🎯 **NEXT STEPS**

Setelah frontend selesai, pertimbangkan pengembangan:

1. **Mobile App** - React Native untuk customer
2. **Real-time Features** - WebSocket untuk live updates
3. **Payment Gateway** - Integrasi Midtrans/Xendit
4. **Analytics Dashboard** - Business intelligence
5. **Notification System** - Email/WhatsApp integration

**🚀 Happy Coding! Sistem booking futsal siap untuk production!**
