# 🔐 AUTHENTICATION & RBAC GUIDE

## 🎯 **OVERVIEW**

Sistem booking futsal menggunakan **JWT (JSON Web Token)** dengan **HttpOnly Cookie** storage untuk keamanan optimal. Role-Based Access Control (RBAC) mengatur akses berdasarkan hierarki role user.

## 🔑 **AUTHENTICATION FLOW**

### **1. Registration Process**
```javascript
// Frontend Request
const registerUser = async (userData) => {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include', // Important untuk cookie
    body: JSON.stringify({
      name: userData.name,
      email: userData.email,
      password: userData.password,
      phone: userData.phone,
      role: 'penyewa' // default role
    })
  });
  
  return await response.json();
};
```

### **2. Login Process**
```javascript
// Frontend Login Function
const loginUser = async (credentials) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include', // Penting untuk menerima cookie
    body: JSON.stringify({
      email: credentials.email,
      password: credentials.password
    })
  });
  
  const data = await response.json();
  
  if (data.success) {
    // JWT token otomatis disimpan di HttpOnly cookie
    // User data tersedia di response
    return {
      success: true,
      user: data.user
    };
  }
  
  throw new Error(data.error);
};
```

### **3. Logout Process**
```javascript
// Frontend Logout Function
const logoutUser = async () => {
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include'
  });
  
  return await response.json();
};
```

## 🍪 **COOKIE-BASED AUTHENTICATION**

### **Cookie Configuration**
```javascript
// Backend Cookie Settings
const cookieOptions = {
  httpOnly: true,                    // Tidak bisa diakses JavaScript
  secure: process.env.NODE_ENV === 'production', // HTTPS only di production
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000   // 7 hari
};
```

### **Frontend Cookie Handling**
```javascript
// Axios Configuration untuk Cookie
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.VITE_API_URL,
  withCredentials: true, // Penting untuk mengirim cookie
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor untuk handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect ke login page
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

## 👥 **ROLE-BASED ACCESS CONTROL (RBAC)**

### **Role Hierarchy**
```javascript
const ROLE_LEVELS = {
  'pengunjung': 1,        // Guest (tidak aktif digunakan)
  'penyewa': 2,          // Customer
  'staff_kasir': 3,      // Cashier Staff  
  'operator_lapangan': 4, // Field Operator
  'manajer_futsal': 5,   // Manager
  'supervisor_sistem': 6  // System Supervisor
};

const ROLE_PERMISSIONS = {
  'penyewa': [
    'view_own_bookings',
    'create_booking',
    'update_own_booking',
    'cancel_own_booking',
    'view_fields',
    'view_own_profile'
  ],
  'staff_kasir': [
    'view_all_bookings',
    'process_payments',
    'view_payment_reports',
    'update_payment_status'
  ],
  'operator_lapangan': [
    'view_field_schedule',
    'update_booking_status',
    'manage_field_availability',
    'view_field_reports'
  ],
  'manajer_futsal': [
    'view_business_analytics',
    'manage_staff_roles',
    'view_all_reports',
    'manage_fields',
    'approve_role_requests'
  ],
  'supervisor_sistem': [
    'full_system_access',
    'manage_all_roles',
    'system_administration',
    'view_audit_logs',
    'bypass_approval_workflow'
  ]
};
```

### **Frontend Role Check Utilities**
```javascript
// utils/auth.js
export const hasPermission = (userRole, requiredPermission) => {
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.includes(requiredPermission) || 
         permissions.includes('full_system_access');
};

export const hasMinimumRole = (userRole, minimumRole) => {
  return ROLE_LEVELS[userRole] >= ROLE_LEVELS[minimumRole];
};

export const canAccessRoute = (userRole, routeRequirements) => {
  if (routeRequirements.roles) {
    return routeRequirements.roles.includes(userRole);
  }
  
  if (routeRequirements.minimumLevel) {
    return ROLE_LEVELS[userRole] >= routeRequirements.minimumLevel;
  }
  
  if (routeRequirements.permissions) {
    return routeRequirements.permissions.every(
      permission => hasPermission(userRole, permission)
    );
  }
  
  return true;
};
```

## 🛡️ **PROTECTED ROUTES**

### **React Router Protection**
```javascript
// components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { canAccessRoute } from '../utils/auth';

const ProtectedRoute = ({ children, requirements = {} }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (!canAccessRoute(user.role, requirements)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return children;
};

export default ProtectedRoute;
```

### **Route Configuration**
```javascript
// App.jsx
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* Customer Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute requirements={{ minimumLevel: 2 }}>
          <CustomerDashboard />
        </ProtectedRoute>
      } />
      
      {/* Staff Routes */}
      <Route path="/staff/kasir" element={
        <ProtectedRoute requirements={{ roles: ['staff_kasir'] }}>
          <KasirDashboard />
        </ProtectedRoute>
      } />
      
      {/* Management Routes */}
      <Route path="/admin/*" element={
        <ProtectedRoute requirements={{ minimumLevel: 5 }}>
          <AdminRoutes />
        </ProtectedRoute>
      } />
      
      {/* System Admin Routes */}
      <Route path="/system/*" element={
        <ProtectedRoute requirements={{ roles: ['supervisor_sistem'] }}>
          <SystemRoutes />
        </ProtectedRoute>
      } />
    </Routes>
  );
}
```

## 🔄 **AUTH CONTEXT**

### **Authentication Context Provider**
```javascript
// contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status on app load
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
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const register = async (userData) => {
    try {
      const response = await apiClient.post('/auth/register', userData);
      if (response.data.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        return { success: true };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Registration failed' 
      };
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
```

---

**Next: 04_FRONTEND_SETUP.md untuk setup Vite+React+Tailwind**
