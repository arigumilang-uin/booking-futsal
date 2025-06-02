# 🚀 DEPLOYMENT GUIDE - Vercel Production Setup

## 🎯 **OVERVIEW**

Panduan lengkap untuk deploy frontend Vite+React ke Vercel dengan konfigurasi production yang optimal untuk integrasi dengan backend Railway.

## 📋 **PRE-DEPLOYMENT CHECKLIST**

### **1. Environment Variables**
```bash
# Pastikan file .env.production sudah benar
VITE_APP_NAME=Futsal Booking System
VITE_API_URL=https://booking-futsal-production.up.railway.app/api
VITE_APP_URL=https://futsal-booking-frontend.vercel.app
VITE_NODE_ENV=production
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG=false
```

### **2. Build Configuration**
```javascript
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false, // Disable untuk production
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          utils: ['axios', 'date-fns']
        }
      }
    }
  },
  server: {
    port: 5173,
    host: true
  },
  preview: {
    port: 4173,
    host: true
  }
})
```

### **3. Package.json Scripts**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext js,jsx --fix",
    "type-check": "tsc --noEmit"
  }
}
```

## 🌐 **VERCEL DEPLOYMENT**

### **Method 1: Vercel CLI (Recommended)**

#### **1. Install Vercel CLI**
```bash
npm install -g vercel
```

#### **2. Login to Vercel**
```bash
vercel login
```

#### **3. Deploy Project**
```bash
# Dari root directory project
vercel

# Follow prompts:
# ? Set up and deploy "~/futsal-booking-frontend"? [Y/n] y
# ? Which scope do you want to deploy to? [Your Account]
# ? Link to existing project? [y/N] n
# ? What's your project's name? futsal-booking-frontend
# ? In which directory is your code located? ./
```

#### **4. Configure Environment Variables**
```bash
# Set production environment variables
vercel env add VITE_API_URL production
# Enter: https://booking-futsal-production.up.railway.app/api

vercel env add VITE_APP_URL production  
# Enter: https://futsal-booking-frontend.vercel.app

vercel env add VITE_NODE_ENV production
# Enter: production

vercel env add VITE_ENABLE_ANALYTICS production
# Enter: true

vercel env add VITE_ENABLE_DEBUG production
# Enter: false
```

#### **5. Deploy to Production**
```bash
vercel --prod
```

### **Method 2: GitHub Integration**

#### **1. Push to GitHub**
```bash
git add .
git commit -m "🚀 Ready for Vercel deployment"
git push origin main
```

#### **2. Connect to Vercel**
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import from GitHub repository
4. Select your frontend repository

#### **3. Configure Build Settings**
```
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

#### **4. Add Environment Variables**
Di Vercel dashboard → Settings → Environment Variables:
```
VITE_API_URL = https://booking-futsal-production.up.railway.app/api
VITE_APP_URL = https://futsal-booking-frontend.vercel.app
VITE_NODE_ENV = production
VITE_ENABLE_ANALYTICS = true
VITE_ENABLE_DEBUG = false
```

## ⚙️ **VERCEL CONFIGURATION**

### **vercel.json**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Credentials",
          "value": "true"
        },
        {
          "key": "Access-Control-Allow-Origin",
          "value": "https://booking-futsal-production.up.railway.app"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET,OPTIONS,PATCH,DELETE,POST,PUT"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
        }
      ]
    }
  ],
  "functions": {
    "app/api/**/*.js": {
      "runtime": "@vercel/node"
    }
  }
}
```

### **_redirects (Alternative)**
```
# Fallback for SPA
/*    /index.html   200

# API proxy (jika diperlukan)
/api/*  https://booking-futsal-production.up.railway.app/api/:splat  200
```

## 🔧 **PRODUCTION OPTIMIZATIONS**

### **1. Code Splitting**
```javascript
// src/utils/lazyImport.js
import { lazy } from 'react';

export const lazyImport = (factory) => {
  return lazy(() => 
    factory().then(module => ({
      default: module.default || module
    }))
  );
};

// Usage in App.jsx
const CustomerDashboard = lazyImport(() => import('./pages/customer/Dashboard'));
const AdminDashboard = lazyImport(() => import('./pages/admin/Dashboard'));
```

### **2. Error Boundary**
```javascript
// src/components/ErrorBoundary.jsx
import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Send to error reporting service in production
    if (import.meta.env.VITE_NODE_ENV === 'production') {
      // Example: Sentry.captureException(error);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Oops! Terjadi kesalahan
            </h1>
            <p className="text-gray-600 mb-6">
              Silakan refresh halaman atau hubungi administrator.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-primary"
            >
              Refresh Halaman
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

### **3. Performance Monitoring**
```javascript
// src/utils/performance.js
export const measurePerformance = (name, fn) => {
  return async (...args) => {
    const start = performance.now();
    const result = await fn(...args);
    const end = performance.now();
    
    if (import.meta.env.VITE_ENABLE_DEBUG === 'true') {
      console.log(`${name} took ${end - start} milliseconds`);
    }
    
    return result;
  };
};

// Usage
const optimizedApiCall = measurePerformance('API Call', apiFunction);
```

## 🔒 **SECURITY CONFIGURATIONS**

### **1. Content Security Policy**
```javascript
// src/utils/security.js
export const setupCSP = () => {
  if (import.meta.env.VITE_NODE_ENV === 'production') {
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = `
      default-src 'self';
      script-src 'self' 'unsafe-inline';
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      font-src 'self' https://fonts.gstatic.com;
      img-src 'self' data: https:;
      connect-src 'self' https://booking-futsal-production.up.railway.app;
    `.replace(/\s+/g, ' ').trim();
    
    document.head.appendChild(meta);
  }
};
```

### **2. Environment Validation**
```javascript
// src/config/validation.js
const requiredEnvVars = [
  'VITE_API_URL',
  'VITE_APP_URL',
  'VITE_NODE_ENV'
];

export const validateEnvironment = () => {
  const missing = requiredEnvVars.filter(
    varName => !import.meta.env[varName]
  );
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
  
  // Validate API URL format
  try {
    new URL(import.meta.env.VITE_API_URL);
  } catch {
    throw new Error('VITE_API_URL must be a valid URL');
  }
};
```

## 📊 **MONITORING & ANALYTICS**

### **1. Basic Analytics Setup**
```javascript
// src/utils/analytics.js
class Analytics {
  constructor() {
    this.enabled = import.meta.env.VITE_ENABLE_ANALYTICS === 'true';
  }
  
  track(event, properties = {}) {
    if (!this.enabled) return;
    
    // Example: Google Analytics 4
    if (typeof gtag !== 'undefined') {
      gtag('event', event, properties);
    }
    
    // Example: Custom analytics
    console.log('Analytics:', event, properties);
  }
  
  page(path) {
    if (!this.enabled) return;
    
    if (typeof gtag !== 'undefined') {
      gtag('config', 'GA_MEASUREMENT_ID', {
        page_path: path
      });
    }
  }
}

export const analytics = new Analytics();
```

### **2. Error Reporting**
```javascript
// src/utils/errorReporting.js
export const reportError = (error, context = {}) => {
  if (import.meta.env.VITE_NODE_ENV !== 'production') {
    console.error('Error:', error, context);
    return;
  }
  
  // Send to error reporting service
  // Example: Sentry, LogRocket, etc.
  fetch('/api/errors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      error: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    })
  }).catch(console.error);
};
```

## ✅ **POST-DEPLOYMENT VERIFICATION**

### **1. Health Check Script**
```javascript
// scripts/healthCheck.js
const checkHealth = async () => {
  const checks = [
    {
      name: 'Frontend',
      url: process.env.VITE_APP_URL,
      expected: 200
    },
    {
      name: 'Backend API',
      url: `${process.env.VITE_API_URL}/health`,
      expected: 200
    }
  ];
  
  for (const check of checks) {
    try {
      const response = await fetch(check.url);
      const status = response.status === check.expected ? '✅' : '❌';
      console.log(`${status} ${check.name}: ${response.status}`);
    } catch (error) {
      console.log(`❌ ${check.name}: ${error.message}`);
    }
  }
};

checkHealth();
```

### **2. Deployment Checklist**
```
✅ Environment variables configured
✅ Build successful
✅ Frontend accessible
✅ API connection working
✅ Authentication flow working
✅ CORS configured properly
✅ Error boundaries in place
✅ Performance optimized
✅ Security headers configured
✅ Analytics tracking (if enabled)
```

---

**Next: 00_COMPLETE_INTEGRATION_GUIDE.md untuk panduan master lengkap**
