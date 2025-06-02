# ⚛️ FRONTEND SETUP - Vite + React + Tailwind CSS

## 🚀 **PROJECT INITIALIZATION**

### **1. Create Vite React Project**
```bash
# Create new Vite project
npm create vite@latest futsal-booking-frontend -- --template react

# Navigate to project directory
cd futsal-booking-frontend

# Install dependencies
npm install
```

### **2. Install Required Dependencies**
```bash
# Core dependencies
npm install axios react-router-dom

# UI & Styling
npm install @tailwindcss/forms @tailwindcss/typography
npm install @headlessui/react @heroicons/react
npm install clsx tailwind-merge

# Date & Time handling
npm install date-fns

# Form handling
npm install react-hook-form @hookform/resolvers yup

# State management (optional)
npm install zustand

# Development dependencies
npm install -D tailwindcss postcss autoprefixer
npm install -D @types/node
```

### **3. Initialize Tailwind CSS**
```bash
# Initialize Tailwind
npx tailwindcss init -p
```

## ⚙️ **CONFIGURATION FILES**

### **tailwind.config.js**
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a8a',
        },
        success: {
          50: '#f0fdf4',
          500: '#22c55e',
          600: '#16a34a',
        },
        warning: {
          50: '#fffbeb',
          500: '#f59e0b',
          600: '#d97706',
        },
        danger: {
          50: '#fef2f2',
          500: '#ef4444',
          600: '#dc2626',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
```

### **src/index.css**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

@layer base {
  html {
    font-family: 'Inter', system-ui, sans-serif;
  }
  
  body {
    @apply bg-gray-50 text-gray-900;
  }
}

@layer components {
  .btn {
    @apply px-4 py-2 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2;
  }
  
  .btn-primary {
    @apply btn bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500;
  }
  
  .btn-secondary {
    @apply btn bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500;
  }
  
  .btn-success {
    @apply btn bg-success-600 text-white hover:bg-success-700 focus:ring-success-500;
  }
  
  .btn-danger {
    @apply btn bg-danger-600 text-white hover:bg-danger-700 focus:ring-danger-500;
  }
  
  .input {
    @apply block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500;
  }
  
  .card {
    @apply bg-white rounded-lg shadow-sm border border-gray-200 p-6;
  }
  
  .badge {
    @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium;
  }
  
  .badge-success {
    @apply badge bg-success-100 text-success-800;
  }
  
  .badge-warning {
    @apply badge bg-warning-100 text-warning-800;
  }
  
  .badge-danger {
    @apply badge bg-danger-100 text-danger-800;
  }
  
  .badge-primary {
    @apply badge bg-primary-100 text-primary-800;
  }
}
```

## 🌍 **ENVIRONMENT CONFIGURATION**

### **.env.development**
```env
# Development Environment
VITE_APP_NAME=Futsal Booking System
VITE_API_URL=http://localhost:5000/api
VITE_APP_URL=http://localhost:5173
VITE_NODE_ENV=development

# Features
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=true
```

### **.env.production**
```env
# Production Environment
VITE_APP_NAME=Futsal Booking System
VITE_API_URL=https://booking-futsal-production.up.railway.app/api
VITE_APP_URL=https://futsal-booking-frontend.vercel.app
VITE_NODE_ENV=production

# Features
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG=false
```

### **src/config/env.js**
```javascript
// Environment configuration
export const config = {
  app: {
    name: import.meta.env.VITE_APP_NAME || 'Futsal Booking',
    url: import.meta.env.VITE_APP_URL || 'http://localhost:5173',
    env: import.meta.env.VITE_NODE_ENV || 'development'
  },
  api: {
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    timeout: 10000
  },
  features: {
    analytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    debug: import.meta.env.VITE_ENABLE_DEBUG === 'true'
  }
};

export const isDevelopment = config.app.env === 'development';
export const isProduction = config.app.env === 'production';
```

## 📁 **PROJECT STRUCTURE**

```
src/
├── components/           # Reusable components
│   ├── ui/              # Basic UI components
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Modal.jsx
│   │   └── LoadingSpinner.jsx
│   ├── layout/          # Layout components
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx
│   │   └── Layout.jsx
│   └── common/          # Common components
│       ├── ProtectedRoute.jsx
│       └── ErrorBoundary.jsx
├── pages/               # Page components
│   ├── auth/           # Authentication pages
│   │   ├── LoginPage.jsx
│   │   └── RegisterPage.jsx
│   ├── customer/       # Customer pages
│   │   ├── Dashboard.jsx
│   │   ├── BookingForm.jsx
│   │   └── BookingHistory.jsx
│   ├── staff/          # Staff pages
│   │   ├── KasirDashboard.jsx
│   │   ├── OperatorDashboard.jsx
│   │   └── ManagerDashboard.jsx
│   └── admin/          # Admin pages
│       ├── UserManagement.jsx
│       ├── FieldManagement.jsx
│       └── Analytics.jsx
├── contexts/           # React contexts
│   ├── AuthContext.jsx
│   └── ThemeContext.jsx
├── hooks/              # Custom hooks
│   ├── useApi.js
│   ├── useAuth.js
│   └── useLocalStorage.js
├── utils/              # Utility functions
│   ├── api.js          # API client
│   ├── auth.js         # Auth utilities
│   ├── format.js       # Formatting utilities
│   └── validation.js   # Validation schemas
├── services/           # API services
│   ├── authService.js
│   ├── bookingService.js
│   ├── fieldService.js
│   └── userService.js
├── constants/          # Constants
│   ├── roles.js
│   ├── status.js
│   └── routes.js
└── styles/             # Additional styles
    └── components.css
```

## 🔧 **UTILITY SETUP**

### **src/utils/api.js**
```javascript
import axios from 'axios';
import { config } from '../config/env';

// Create axios instance
export const apiClient = axios.create({
  baseURL: config.api.baseUrl,
  timeout: config.api.timeout,
  withCredentials: true, // Important untuk cookie-based auth
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    if (config.app.env === 'development') {
      console.log('API Request:', config.method?.toUpperCase(), config.url);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    if (config.app.env === 'development') {
      console.log('API Response:', response.status, response.config.url);
    }
    return response;
  },
  (error) => {
    if (config.app.env === 'development') {
      console.error('API Error:', error.response?.status, error.config?.url);
    }
    
    // Handle common errors
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
```

### **src/utils/format.js**
```javascript
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

// Currency formatting
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

// Date formatting
export const formatDate = (date, pattern = 'dd MMMM yyyy') => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, pattern, { locale: id });
};

// Time formatting
export const formatTime = (time) => {
  return time.substring(0, 5); // HH:MM
};

// Status formatting
export const formatStatus = (status) => {
  const statusMap = {
    'pending': 'Menunggu',
    'confirmed': 'Dikonfirmasi',
    'in_progress': 'Berlangsung',
    'completed': 'Selesai',
    'cancelled': 'Dibatalkan',
    'paid': 'Lunas',
    'unpaid': 'Belum Bayar'
  };
  
  return statusMap[status] || status;
};

// Role formatting
export const formatRole = (role) => {
  const roleMap = {
    'penyewa': 'Customer',
    'staff_kasir': 'Staff Kasir',
    'operator_lapangan': 'Operator Lapangan',
    'manajer_futsal': 'Manager Futsal',
    'supervisor_sistem': 'Supervisor Sistem'
  };
  
  return roleMap[role] || role;
};
```

### **src/constants/roles.js**
```javascript
export const ROLES = {
  PENYEWA: 'penyewa',
  STAFF_KASIR: 'staff_kasir',
  OPERATOR_LAPANGAN: 'operator_lapangan',
  MANAJER_FUTSAL: 'manajer_futsal',
  SUPERVISOR_SISTEM: 'supervisor_sistem'
};

export const ROLE_LEVELS = {
  [ROLES.PENYEWA]: 2,
  [ROLES.STAFF_KASIR]: 3,
  [ROLES.OPERATOR_LAPANGAN]: 4,
  [ROLES.MANAJER_FUTSAL]: 5,
  [ROLES.SUPERVISOR_SISTEM]: 6
};

export const ROLE_LABELS = {
  [ROLES.PENYEWA]: 'Customer',
  [ROLES.STAFF_KASIR]: 'Staff Kasir',
  [ROLES.OPERATOR_LAPANGAN]: 'Operator Lapangan',
  [ROLES.MANAJER_FUTSAL]: 'Manager Futsal',
  [ROLES.SUPERVISOR_SISTEM]: 'Supervisor Sistem'
};
```

## 🎨 **COMPONENT EXAMPLES**

### **src/components/ui/Button.jsx**
```javascript
import { clsx } from 'clsx';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false,
  loading = false,
  className,
  ...props 
}) => {
  const baseClasses = 'btn';
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    success: 'btn-success',
    danger: 'btn-danger'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      className={clsx(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Loading...
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
```

---

**Next: 05_INTEGRATION_STEPS.md untuk langkah integrasi API**
