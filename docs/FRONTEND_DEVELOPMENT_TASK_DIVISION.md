# 👥 PEMBAGIAN TUGAS FRONTEND DEVELOPMENT - Futsal Booking System

## 🎯 **OVERVIEW PEMBAGIAN TUGAS**

Pembagian tugas dirancang berdasarkan kompleksitas fitur, dependencies, dan role-based access untuk memaksimalkan efisiensi pengembangan dengan minimal conflict dan optimal collaboration.

### **🔄 STRATEGY PEMBAGIAN:**

- **Developer 1 (Frontend Lead):** Core Features & Public Interface
- **Developer 2 (Frontend Specialist):** Advanced Features & Management Interface
- **Parallel Development:** Minimal dependencies dengan clear integration points
- **Progressive Integration:** Phase-based development dengan milestone checkpoints

---

## 👨‍💻 **DEVELOPER 1 - CORE FEATURES & PUBLIC INTERFACE**

### **🎯 FOCUS AREA: Foundation & Customer Experience**

**Responsibility:** Membangun foundation aplikasi, public interface, authentication system, dan customer features yang menjadi core user experience.

### **📋 TUGAS & DELIVERABLES:**

#### **🔓 PUBLIC INTERFACE (Week 1)**

**Components & Pages:**

- `HomePage.jsx` - Landing page dengan field showcase
- `FieldListPage.jsx` - Public field listing dengan filtering
- `FieldDetailPage.jsx` - Field detail dengan availability checker
- `AboutPage.jsx` - Company information
- `ContactPage.jsx` - Contact information
- `NotFoundPage.jsx` - 404 error page

**API Integration:**

- `GET /api/public/system-info` - System information display
- `GET /api/public/fields` - Field listing dengan pagination
- `GET /api/public/fields/:id` - Field detail information
- `GET /api/public/fields/:id/availability` - Real-time availability
- `GET /api/public/field-types` - Field type filtering
- `GET /api/public/field-locations` - Location filtering
- `GET /api/public/health` - System health monitoring

**Success Criteria:**

- ✅ Responsive design untuk semua device sizes
- ✅ Field filtering dan search functionality
- ✅ Real-time availability display
- ✅ SEO-optimized pages dengan proper meta tags
- ✅ Loading states dan error handling

#### **🔐 AUTHENTICATION SYSTEM (Week 2)**

**Components & Pages:**

- `LoginPage.jsx` - User login interface
- `RegisterPage.jsx` - User registration form
- `ForgotPasswordPage.jsx` - Password recovery
- `ProfilePage.jsx` - User profile management
- `AuthGuard.jsx` - Route protection component
- `RoleBasedAccess.jsx` - Role-based component rendering

**API Integration:**

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User authentication
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Profile data retrieval
- `PUT /api/auth/profile` - Profile updates
- `GET /api/auth/verify` - Token verification
- `GET /api/auth/roles` - Role information

**Success Criteria:**

- ✅ Secure authentication flow dengan JWT handling
- ✅ Form validation dengan real-time feedback
- ✅ Role-based navigation dan access control
- ✅ Persistent login state management
- ✅ Password strength validation

#### **👤 CUSTOMER FEATURES (Week 3-4)**

**Components & Pages:**

- `CustomerDashboard.jsx` - Customer dashboard dengan statistics
- `BookingForm.jsx` - New booking creation form
- `BookingList.jsx` - Customer booking history
- `BookingDetail.jsx` - Booking detail dengan actions
- `NotificationCenter.jsx` - Notification management
- `FavoriteFields.jsx` - Favorite fields management
- `ReviewForm.jsx` - Field review creation
- `PromotionList.jsx` - Available promotions

**API Integration:**

- `GET /api/customer/profile` - Customer profile dengan statistics
- `POST /api/customer/bookings` - Create new booking
- `GET /api/customer/bookings` - Booking list dengan filtering
- `GET /api/customer/bookings/:id` - Booking detail
- `DELETE /api/customer/bookings/:id` - Cancel booking
- `GET /api/customer/notifications` - Notification list
- `PUT /api/customer/notifications/:id/read` - Mark notification read
- `GET /api/customer/favorites` - Favorite fields
- `POST /api/customer/favorites/:fieldId` - Add to favorites
- `GET /api/customer/reviews` - Customer reviews
- `POST /api/customer/reviews` - Create review
- `GET /api/customer/promotions` - Available promotions

**Success Criteria:**

- ✅ Intuitive booking flow dengan conflict detection
- ✅ Real-time booking status updates
- ✅ Notification system dengan read/unread states
- ✅ Favorite fields dengan quick booking
- ✅ Review system dengan rating display
- ✅ Promotion application dalam booking

### **🔧 TECHNICAL SPECIFICATIONS:**

#### **📁 FOLDER STRUCTURE:**

```
src/
├── components/
│   ├── common/           # Shared components
│   ├── public/           # Public interface components
│   ├── auth/             # Authentication components
│   └── customer/         # Customer feature components
├── pages/
│   ├── public/           # Public pages
│   ├── auth/             # Auth pages
│   └── customer/         # Customer pages
├── hooks/
│   ├── useAuth.js        # Authentication hook
│   ├── useApi.js         # API integration hook
│   └── useBooking.js     # Booking management hook
├── services/
│   ├── api.js            # API client configuration
│   ├── auth.js           # Authentication service
│   └── booking.js        # Booking service
├── utils/
│   ├── validation.js     # Form validation utilities
│   ├── formatting.js     # Data formatting utilities
│   └── constants.js      # Application constants
└── styles/
    ├── globals.css       # Global styles
    └── components.css    # Component-specific styles
```

#### **🎨 DESIGN SYSTEM:**

- **Color Palette:** Primary (Green), Secondary (Blue), Accent (Orange)
- **Typography:** Inter font family dengan responsive sizing
- **Components:** Consistent button styles, form inputs, cards
- **Responsive:** Mobile-first approach dengan Tailwind breakpoints
- **Icons:** Heroicons atau Lucide React untuk consistency

#### **📚 DOCUMENTATION REFERENCE:**

- **API Endpoints:** `docs/API_ENDPOINTS_INFORMATION.md` (Public, Auth, Customer sections)
- **Business Logic:** `docs/BACKEND_SYSTEM_INFORMATION.md` (Role hierarchy, booking workflow)
- **Integration Guide:** Focus pada customer experience dan public interface

---

## 👨‍💻 **DEVELOPER 2 - ADVANCED FEATURES & MANAGEMENT INTERFACE**

### **🎯 FOCUS AREA: Staff Management & Enhanced Features**

**Responsibility:** Membangun staff management interface, admin features, dan enhanced features yang memerlukan advanced role-based access control.

### **📋 TUGAS & DELIVERABLES:**

#### **👨‍💼 STAFF INTERFACE (Week 1-2)**

**Components & Pages:**

- `StaffDashboard.jsx` - Role-based staff dashboard
- `KasirDashboard.jsx` - Cashier payment management
- `OperatorDashboard.jsx` - Field operator interface
- `ManagerDashboard.jsx` - Manager analytics interface
- `SupervisorDashboard.jsx` - System supervisor control panel
- `PaymentProcessor.jsx` - Manual payment processing
- `BookingManager.jsx` - Staff booking management
- `FieldManager.jsx` - Field status management

**API Integration:**

- `GET /api/staff/kasir/dashboard` - Kasir dashboard data
- `GET /api/staff/kasir/payments` - Payment list untuk kasir
- `POST /api/staff/kasir/payments/manual` - Manual payment processing
- `PUT /api/staff/kasir/payments/:id/confirm` - Payment confirmation
- `GET /api/staff/operator/dashboard` - Operator dashboard
- `PUT /api/staff/operator/bookings/:id/status` - Update booking status
- `GET /api/staff/manager/dashboard` - Manager dashboard
- `GET /api/staff/manager/analytics` - Business analytics
- `GET /api/staff/supervisor/dashboard` - Supervisor dashboard
- `GET /api/staff/supervisor/system-health` - System health monitoring

**Success Criteria:**

- ✅ Role-based dashboard dengan appropriate data
- ✅ Payment processing workflow untuk kasir
- ✅ Booking status management untuk operator
- ✅ Business analytics untuk manager
- ✅ System administration untuk supervisor

#### **🔧 ADMIN FEATURES (Week 3)**

**Components & Pages:**

- `AdminDashboard.jsx` - Admin control panel
- `UserManagement.jsx` - User management interface
- `RoleManagement.jsx` - Role change management
- `SystemSettings.jsx` - System configuration
- `AuditLogs.jsx` - Audit trail viewer
- `NotificationManager.jsx` - Notification management
- `PromotionManager.jsx` - Promotion management
- `AutoCompletionControl.jsx` - Auto-completion management

**API Integration:**

- `GET /api/admin/users` - User management
- `PUT /api/admin/users/:id/role` - Role management
- `GET /api/admin/role-management/dashboard` - Role management dashboard
- `GET /api/admin/system-settings` - System settings
- `PUT /api/admin/system-settings/:key` - Update settings
- `GET /api/admin/audit-logs` - Audit logs
- `GET /api/admin/notifications` - Notification management
- `POST /api/admin/notifications/broadcast` - Broadcast notifications
- `GET /api/admin/promotions` - Promotion management
- `POST /api/admin/promotions` - Create promotions
- `GET /api/admin/auto-completion/config` - Auto-completion config

**Success Criteria:**

- ✅ Comprehensive user management dengan role controls
- ✅ System settings dengan real-time updates
- ✅ Audit trail dengan advanced filtering
- ✅ Notification broadcasting system
- ✅ Promotion management dengan usage tracking

#### **🎯 ENHANCED FEATURES (Week 4)**

**Components & Pages:**

- `AnalyticsDashboard.jsx` - Comprehensive analytics
- `ReportGenerator.jsx` - Report generation interface
- `NotificationSystem.jsx` - Real-time notification system
- `PromotionEngine.jsx` - Promotion application engine
- `ReviewModeration.jsx` - Review moderation interface
- `SystemMonitoring.jsx` - System health monitoring
- `DataExport.jsx` - Data export functionality

**API Integration:**

- `GET /api/admin/analytics/business` - Business analytics
- `GET /api/admin/analytics/system` - System analytics
- `GET /api/enhanced/audit-logs` - Enhanced audit logs
- `GET /api/public/fields/:fieldId/reviews` - Review management
- `GET /api/admin/auto-completion/stats` - Auto-completion statistics
- `POST /api/admin/auto-completion/trigger` - Manual trigger
- `GET /api/admin/audit-logs/export` - Data export

**Success Criteria:**

- ✅ Real-time analytics dengan interactive charts
- ✅ Comprehensive reporting system
- ✅ Advanced notification management
- ✅ Review moderation workflow
- ✅ System monitoring dengan alerts

### **🔧 TECHNICAL SPECIFICATIONS:**

#### **📁 FOLDER STRUCTURE:**

```
src/
├── components/
│   ├── staff/            # Staff interface components
│   ├── admin/            # Admin feature components
│   └── enhanced/         # Enhanced feature components
├── pages/
│   ├── staff/            # Staff pages
│   ├── admin/            # Admin pages
│   └── enhanced/         # Enhanced feature pages
├── hooks/
│   ├── useStaff.js       # Staff management hook
│   ├── useAdmin.js       # Admin feature hook
│   └── useAnalytics.js   # Analytics hook
├── services/
│   ├── staff.js          # Staff service
│   ├── admin.js          # Admin service
│   └── analytics.js      # Analytics service
└── utils/
    ├── roleUtils.js      # Role-based utilities
    ├── chartUtils.js     # Chart configuration utilities
    └── exportUtils.js    # Data export utilities
```

#### **📊 ADVANCED COMPONENTS:**

- **Charts:** Chart.js atau Recharts untuk analytics
- **Tables:** React Table untuk data management
- **Forms:** React Hook Form untuk complex forms
- **Modals:** Headless UI untuk modal management
- **Notifications:** React Hot Toast untuk real-time notifications

#### **📚 DOCUMENTATION REFERENCE:**

- **API Endpoints:** `docs/API_ENDPOINTS_INFORMATION.md` (Staff, Admin, Enhanced sections)
- **Business Logic:** `docs/BACKEND_SYSTEM_INFORMATION.md` (Role management, analytics, audit trail)
- **Integration Guide:** Focus pada management interface dan advanced features

---

## 🔄 **KOORDINASI & INTEGRATION POINTS**

### **🤝 DEPENDENCIES & COORDINATION:**

#### **Week 1 Coordination:**

- **Developer 1:** Setup project structure, routing, dan authentication foundation
- **Developer 2:** Setup role-based access components dan staff routing structure
- **Integration Point:** Shared authentication state dan role-based routing

#### **Week 2 Coordination:**

- **Developer 1:** Complete authentication flow dan customer dashboard
- **Developer 2:** Implement staff dashboards dengan role-based data
- **Integration Point:** Shared API client dan authentication hooks

#### **Week 3 Coordination:**

- **Developer 1:** Customer booking flow dan notification integration
- **Developer 2:** Admin features dan system management
- **Integration Point:** Shared notification system dan booking status updates

#### **Week 4 Coordination:**

- **Developer 1:** Enhanced customer features dan review system
- **Developer 2:** Analytics dashboard dan reporting features
- **Integration Point:** Shared data visualization components dan export functionality

### **🔧 SHARED COMPONENTS & UTILITIES:**

#### **Common Components (Both Developers):**

- `LoadingSpinner.jsx` - Loading state component
- `ErrorBoundary.jsx` - Error handling component
- `Modal.jsx` - Reusable modal component
- `Table.jsx` - Data table component
- `Chart.jsx` - Chart wrapper component
- `FormField.jsx` - Form input component
- `Button.jsx` - Button component dengan variants
- `Badge.jsx` - Status badge component

#### **Shared Hooks:**

- `useAuth.js` - Authentication state management
- `useApi.js` - API client dengan error handling
- `useNotification.js` - Notification system
- `usePermission.js` - Role-based permission checking

#### **Shared Services:**

- `api.js` - Axios configuration dengan interceptors
- `auth.js` - Authentication service
- `notification.js` - Notification service
- `storage.js` - Local storage utilities

---

## 📅 **TIMELINE & MILESTONES**

### **🗓️ DEVELOPMENT SCHEDULE:**

#### **Week 1: Foundation & Setup**

**Developer 1:**

- ✅ Project setup (Vite + React + Tailwind)
- ✅ Routing configuration dengan React Router
- ✅ Public pages (Home, Field List, Field Detail)
- ✅ Basic authentication pages

**Developer 2:**

- ✅ Role-based access setup
- ✅ Staff routing structure
- ✅ Kasir dashboard foundation
- ✅ Operator dashboard foundation

**Milestone 1:** Public interface accessible, authentication flow working, role-based routing implemented

#### **Week 2: Core Features**

**Developer 1:**

- ✅ Complete authentication system
- ✅ Customer dashboard
- ✅ Basic booking functionality
- ✅ Profile management

**Developer 2:**

- ✅ Complete staff dashboards
- ✅ Payment processing interface
- ✅ Booking management untuk staff
- ✅ Manager analytics foundation

**Milestone 2:** Authentication complete, customer booking working, staff interfaces functional

#### **Week 3: Advanced Features**

**Developer 1:**

- ✅ Enhanced customer features
- ✅ Notification system integration
- ✅ Favorite fields functionality
- ✅ Review system

**Developer 2:**

- ✅ Admin user management
- ✅ System settings interface
- ✅ Audit logs viewer
- ✅ Promotion management

**Milestone 3:** Customer experience complete, admin features functional, notification system working

#### **Week 4: Polish & Integration**

**Developer 1:**

- ✅ Promotion integration dalam booking
- ✅ Advanced customer analytics
- ✅ Mobile responsiveness optimization
- ✅ Performance optimization

**Developer 2:**

- ✅ Comprehensive analytics dashboard
- ✅ Report generation
- ✅ System monitoring interface
- ✅ Data export functionality

**Milestone 4:** Complete feature set, analytics working, system ready for production

### **🎯 SUCCESS CRITERIA PER MILESTONE:**

#### **Milestone 1 (Week 1):**

- [ ] Public pages responsive dan SEO-optimized
- [ ] Authentication flow dengan proper error handling
- [ ] Role-based routing working correctly
- [ ] Basic staff interface accessible

#### **Milestone 2 (Week 2):**

- [ ] Complete user registration dan login
- [ ] Customer dapat create booking
- [ ] Staff dapat view dan manage bookings
- [ ] Payment processing interface working

#### **Milestone 3 (Week 3):**

- [ ] Notification system real-time
- [ ] Admin dapat manage users dan roles
- [ ] Review system functional
- [ ] Audit logs accessible

#### **Milestone 4 (Week 4):**

- [ ] Analytics dashboard dengan real-time data
- [ ] Complete promotion system
- [ ] System monitoring working
- [ ] Production-ready deployment

---

## 🧪 **TESTING STRATEGY & QUALITY ASSURANCE**

### **🔍 TESTING RESPONSIBILITIES:**

#### **Developer 1 Testing Focus:**

- **Unit Tests:** Authentication hooks, booking logic, form validation
- **Integration Tests:** API integration untuk customer features
- **E2E Tests:** Complete booking flow, authentication flow
- **Responsive Tests:** Mobile dan desktop compatibility

#### **Developer 2 Testing Focus:**

- **Unit Tests:** Role-based access, admin functions, analytics calculations
- **Integration Tests:** Staff workflow, admin operations
- **E2E Tests:** Staff booking management, admin user management
- **Performance Tests:** Analytics dashboard, large data handling

### **🔧 TESTING TOOLS & SETUP:**

- **Unit Testing:** Vitest + React Testing Library
- **E2E Testing:** Playwright atau Cypress
- **API Testing:** MSW (Mock Service Worker) untuk development
- **Performance:** Lighthouse CI untuk performance monitoring

### **📋 CODE REVIEW PROCESS:**

#### **Daily Standups:**

- Progress update dari masing-masing developer
- Blocker identification dan resolution
- Integration point coordination
- Code review scheduling

#### **Code Review Checklist:**

- [ ] Code follows established patterns
- [ ] Proper error handling implemented
- [ ] Responsive design verified
- [ ] API integration tested
- [ ] Role-based access working
- [ ] Performance considerations addressed

### **🚀 DEPLOYMENT STRATEGY:**

#### **Development Environment:**

- **Local Development:** Vite dev server dengan hot reload
- **API Integration:** Development backend di Railway
- **Testing:** Automated testing dalam CI/CD pipeline

#### **Staging Environment:**

- **Preview Deployment:** Vercel preview untuk setiap PR
- **Integration Testing:** Complete system testing
- **Performance Testing:** Lighthouse scoring
- **User Acceptance Testing:** Stakeholder review

#### **Production Deployment:**

- **Vercel Production:** Automatic deployment dari main branch
- **Domain Configuration:** Custom domain setup
- **Performance Monitoring:** Real-time performance tracking
- **Error Tracking:** Sentry integration untuk error monitoring

---

## 📚 **DOCUMENTATION & HANDOVER**

### **📖 DOCUMENTATION REQUIREMENTS:**

#### **Developer 1 Documentation:**

- Component documentation untuk public dan customer features
- API integration guide untuk customer endpoints
- Authentication flow documentation
- Responsive design guidelines

#### **Developer 2 Documentation:**

- Staff interface user guide
- Admin feature documentation
- Role-based access implementation guide
- Analytics dashboard user manual

### **🎯 FINAL DELIVERABLES:**

#### **Code Deliverables:**

- [ ] Complete React application dengan all features
- [ ] Comprehensive test suite dengan good coverage
- [ ] Production-ready build configuration
- [ ] Deployment scripts dan configuration

#### **Documentation Deliverables:**

- [ ] User manual untuk setiap role
- [ ] Technical documentation untuk maintenance
- [ ] API integration guide
- [ ] Deployment dan configuration guide

#### **Quality Assurance:**

- [ ] Performance score > 90 di Lighthouse
- [ ] Accessibility compliance (WCAG 2.1)
- [ ] Cross-browser compatibility verified
- [ ] Mobile responsiveness tested

---

## 🛠️ **TECHNICAL IMPLEMENTATION GUIDE**

### **⚙️ PROJECT SETUP & CONFIGURATION:**

#### **🚀 Initial Setup (Both Developers):**

```bash
# Project initialization
npm create vite@latest futsal-booking-frontend -- --template react
cd futsal-booking-frontend
npm install

# Core dependencies
npm install react-router-dom axios react-hook-form
npm install @headlessui/react @heroicons/react
npm install react-hot-toast react-query
npm install chart.js react-chartjs-2
npm install date-fns clsx

# Development dependencies
npm install -D tailwindcss postcss autoprefixer
npm install -D vitest @testing-library/react @testing-library/jest-dom
npm install -D eslint-plugin-react-hooks prettier
```

#### **🎨 Tailwind Configuration:**

```javascript
// tailwind.config.js
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0fdf4",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
        },
        secondary: {
          50: "#eff6ff",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
```

#### **🔧 Environment Configuration:**

```javascript
// .env.development
VITE_API_BASE_URL=https://booking-futsal-production.up.railway.app/api
VITE_APP_NAME=Futsal Booking System
VITE_APP_VERSION=1.0.0

// .env.production
VITE_API_BASE_URL=https://booking-futsal-production.up.railway.app/api
VITE_APP_NAME=Futsal Booking System
VITE_APP_VERSION=1.0.0
```

### **🏗️ ARCHITECTURE PATTERNS:**

#### **📁 Recommended Folder Structure:**

```
src/
├── components/
│   ├── ui/                 # Reusable UI components
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Modal.jsx
│   │   └── Table.jsx
│   ├── layout/             # Layout components
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx
│   │   └── Footer.jsx
│   ├── forms/              # Form components
│   │   ├── BookingForm.jsx
│   │   ├── LoginForm.jsx
│   │   └── ProfileForm.jsx
│   └── features/           # Feature-specific components
│       ├── auth/
│       ├── booking/
│       ├── staff/
│       └── admin/
├── pages/                  # Page components
├── hooks/                  # Custom hooks
├── services/               # API services
├── utils/                  # Utility functions
├── contexts/               # React contexts
├── constants/              # Application constants
└── types/                  # TypeScript types (if using TS)
```

#### **🔄 State Management Strategy:**

```javascript
// contexts/AuthContext.jsx
import { createContext, useContext, useReducer } from "react";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  return (
    <AuthContext.Provider value={{ ...state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};
```

#### **🌐 API Integration Pattern:**

```javascript
// services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // For HttpOnly cookies
});

// Request interceptor
api.interceptors.request.use((config) => {
  // Add auth token if available
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
```

### **🎯 COMPONENT DEVELOPMENT PATTERNS:**

#### **🧩 Reusable Component Example:**

```javascript
// components/ui/Button.jsx
import { clsx } from "clsx";

const Button = ({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  className,
  ...props
}) => {
  const baseClasses =
    "font-medium rounded-lg transition-colors focus:outline-none focus:ring-2";

  const variants = {
    primary:
      "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500",
    secondary:
      "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      className={clsx(
        baseClasses,
        variants[variant],
        sizes[size],
        (loading || disabled) && "opacity-50 cursor-not-allowed",
        className
      )}
      disabled={loading || disabled}
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

#### **🔐 Role-Based Access Component:**

```javascript
// components/auth/RoleGuard.jsx
import { useAuth } from "../../contexts/AuthContext";

const RoleGuard = ({ allowedRoles, children, fallback = null }) => {
  const { user } = useAuth();

  if (!user) {
    return fallback;
  }

  const hasPermission = allowedRoles.includes(user.role);

  return hasPermission ? children : fallback;
};

export default RoleGuard;
```

### **📊 DATA FETCHING PATTERNS:**

#### **🔄 Custom Hook for API Calls:**

```javascript
// hooks/useApi.js
import { useState, useEffect } from "react";
import api from "../services/api";

export const useApi = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.get(url, options);
        setData(response.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, loading, error, refetch: () => fetchData() };
};
```

#### **📝 Form Handling Pattern:**

```javascript
// hooks/useForm.js
import { useState } from "react";

export const useForm = (initialValues, validationRules = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    Object.keys(validationRules).forEach((field) => {
      const rule = validationRules[field];
      const value = values[field];

      if (rule.required && !value) {
        newErrors[field] = `${field} is required`;
      } else if (rule.pattern && !rule.pattern.test(value)) {
        newErrors[field] = rule.message;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (onSubmit) => {
    if (!validate()) return;

    setLoading(true);
    try {
      await onSubmit(values);
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    values,
    errors,
    loading,
    handleChange,
    handleSubmit,
    setValues,
    setErrors,
  };
};
```

## 🔍 **TESTING & QUALITY ASSURANCE DETAILS**

### **🧪 Testing Setup & Configuration:**

#### **⚙️ Vitest Configuration:**

```javascript
// vitest.config.js
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.js"],
    globals: true,
  },
});
```

#### **🔧 Test Setup File:**

```javascript
// src/test/setup.js
import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock API calls
global.fetch = vi.fn();

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;
```

#### **📝 Component Testing Example:**

```javascript
// components/__tests__/Button.test.jsx
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Button from "../ui/Button";

describe("Button Component", () => {
  it("renders with correct text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("calls onClick handler when clicked", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByText("Click me"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("shows loading state correctly", () => {
    render(<Button loading>Submit</Button>);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });
});
```

### **🎯 Performance Optimization Guidelines:**

#### **⚡ Code Splitting Strategy:**

```javascript
// Lazy loading for route components
import { lazy, Suspense } from "react";

const CustomerDashboard = lazy(() => import("../pages/customer/Dashboard"));
const StaffDashboard = lazy(() => import("../pages/staff/Dashboard"));

// In your router
<Route
  path="/customer/dashboard"
  element={
    <Suspense fallback={<LoadingSpinner />}>
      <CustomerDashboard />
    </Suspense>
  }
/>;
```

#### **🔄 Memoization Patterns:**

```javascript
// Use React.memo for expensive components
import { memo } from "react";

const ExpensiveComponent = memo(({ data, onUpdate }) => {
  // Expensive rendering logic
  return <div>{/* Component content */}</div>;
});

// Use useMemo for expensive calculations
const processedData = useMemo(() => {
  return data.map((item) => ({
    ...item,
    calculated: expensiveCalculation(item),
  }));
}, [data]);
```

## 🚀 **DEPLOYMENT & PRODUCTION READINESS**

### **📦 Build Configuration:**

#### **⚙️ Vite Build Optimization:**

```javascript
// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          router: ["react-router-dom"],
          ui: ["@headlessui/react", "@heroicons/react"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  server: {
    proxy: {
      "/api": {
        target: "https://booking-futsal-production.up.railway.app",
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
```

#### **🔧 Vercel Configuration:**

```json
// vercel.json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "https://booking-futsal-production.up.railway.app/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### **📊 Monitoring & Analytics:**

#### **🔍 Error Tracking Setup:**

```javascript
// utils/errorTracking.js
class ErrorTracker {
  static init() {
    window.addEventListener("error", this.handleError);
    window.addEventListener("unhandledrejection", this.handlePromiseRejection);
  }

  static handleError(event) {
    console.error("Global error:", event.error);
    // Send to monitoring service
  }

  static handlePromiseRejection(event) {
    console.error("Unhandled promise rejection:", event.reason);
    // Send to monitoring service
  }

  static logError(error, context = {}) {
    console.error("Application error:", error, context);
    // Send to monitoring service
  }
}

export default ErrorTracker;
```

#### **📈 Performance Monitoring:**

```javascript
// utils/performance.js
export const measurePerformance = (name, fn) => {
  return async (...args) => {
    const start = performance.now();
    const result = await fn(...args);
    const end = performance.now();

    console.log(`${name} took ${end - start} milliseconds`);
    return result;
  };
};

// Usage
const fetchDataWithMetrics = measurePerformance("fetchData", fetchData);
```

---

**Pembagian tugas ini dirancang untuk memaksimalkan efisiensi pengembangan dengan minimal conflict dan optimal collaboration. Setiap developer memiliki focus area yang jelas dengan integration points yang well-defined untuk memastikan pengembangan frontend yang terintegrasi sempurna dengan backend system.** 🚀
