# 🔧 DOKUMENTASI TEKNIS SISTEM BOOKING FUTSAL

## 📋 DAFTAR ISI
1. [Arsitektur Sistem](#arsitektur-sistem)
2. [Setup Development](#setup-development)
3. [Struktur Project](#struktur-project)
4. [API Integration](#api-integration)
5. [Authentication & Authorization](#authentication--authorization)
6. [State Management](#state-management)
7. [Testing](#testing)
8. [Deployment](#deployment)

---

## 🏗️ ARSITEKTUR SISTEM

### Tech Stack:
- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Routing**: React Router v6
- **State Management**: React Context API + Hooks
- **Icons**: Heroicons (SVG)
- **Build Tool**: Vite
- **Package Manager**: npm

### Backend Integration:
- **API Base URL**: `https://booking-futsal-production.up.railway.app/api`
- **Authentication**: Cookie-based (HttpOnly)
- **Response Format**: JSON dengan struktur `{ success, data, message }`

---

## ⚙️ SETUP DEVELOPMENT

### Prerequisites:
```bash
Node.js >= 18.0.0
npm >= 8.0.0
```

### Installation:
```bash
# Clone repository
git clone <repository-url>
cd booking-futsal-frontend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

### Environment Variables:
```env
VITE_API_URL=https://booking-futsal-production.up.railway.app/api
VITE_APP_NAME=Booking Futsal System
```

### Development Commands:
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

---

## 📁 STRUKTUR PROJECT

```
src/
├── api/                    # API integration layer
│   ├── authAPI.js         # Authentication endpoints
│   ├── bookingAPI.js      # Booking management
│   ├── fieldAPI.js        # Field management
│   ├── paymentAPI.js      # Payment processing
│   ├── userAPI.js         # User management
│   └── index.js           # API exports
├── components/            # Reusable components
│   ├── LoadingSpinner.jsx
│   ├── Notification.jsx
│   └── ...
├── contexts/              # React Context providers
│   └── AuthProvider.jsx  # Authentication context
├── hooks/                 # Custom React hooks
│   └── useAuth.js        # Authentication hook
├── pages/                 # Page components
│   ├── auth/             # Authentication pages
│   ├── customer/         # Customer pages
│   └── staff/            # Staff pages
├── utils/                 # Utility functions
│   └── testHelpers.js    # Helper functions
├── App.jsx               # Main app component
├── main.jsx              # App entry point
└── index.css             # Global styles
```

---

## 🔌 API INTEGRATION

### HTTP Client Setup:
```javascript
// src/api/index.js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### API Endpoints Structure:

#### Authentication (`/auth/*`):
```javascript
// Login
POST /auth/login
Body: { email, password }

// Register  
POST /auth/register
Body: { name, email, password, phone }

// Get Profile
GET /auth/profile

// Logout
POST /auth/logout
```

#### Public Endpoints (`/public/*`):
```javascript
// Get public fields
GET /public/fields
Query: { limit, offset, type, location }
```

#### Customer Endpoints (`/customer/*`):
```javascript
// Customer bookings
GET /customer/bookings
POST /customer/bookings
DELETE /customer/bookings/:id

// Customer payments
GET /customer/payments
POST /customer/payments
```

#### Staff Endpoints (`/staff/*`):
```javascript
// Staff booking management
GET /staff/bookings
PUT /staff/bookings/:id/confirm
PUT /staff/bookings/:id/reject

// Staff field management
GET /staff/fields
POST /staff/fields
PUT /staff/fields/:id

// Staff payment verification
GET /staff/payments
PUT /staff/payments/:id/verify
PUT /staff/payments/:id/reject
```

### Error Handling:
```javascript
try {
  const response = await apiFunction();
  if (response.success) {
    // Handle success
    return response.data;
  } else {
    // Handle API error
    throw new Error(response.error || 'API Error');
  }
} catch (error) {
  // Handle network/other errors
  console.error('Error:', error);
  throw error;
}
```

---

## 🔐 AUTHENTICATION & AUTHORIZATION

### Authentication Flow:
1. User submits login credentials
2. Backend validates and sets HttpOnly cookie
3. Frontend stores user data in Context
4. Subsequent requests include cookie automatically
5. 401 responses trigger automatic logout

### Role-Based Access:
```javascript
const roleHierarchy = {
  penyewa: ['customer'],
  staff_kasir: ['customer', 'kasir'],
  operator_lapangan: ['customer', 'kasir', 'operator'],
  manajer_futsal: ['customer', 'kasir', 'operator', 'manager'],
  supervisor_sistem: ['customer', 'kasir', 'operator', 'manager', 'supervisor']
};
```

### Protected Routes:
```javascript
// Route protection based on role
<Route path="/customer/*" element={
  <ProtectedRoute allowedRoles={['customer']}>
    <CustomerRoutes />
  </ProtectedRoute>
} />

<Route path="/staff/*" element={
  <ProtectedRoute allowedRoles={['kasir', 'operator', 'manager', 'supervisor']}>
    <StaffRoutes />
  </ProtectedRoute>
} />
```

---

## 🗂️ STATE MANAGEMENT

### Context Structure:
```javascript
// AuthContext
const AuthContext = createContext({
  user: null,
  loading: false,
  login: (credentials) => {},
  logout: () => {},
  updateProfile: (data) => {}
});
```

### Custom Hooks:
```javascript
// useAuth hook
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### Local State Patterns:
```javascript
// Component state pattern
const [data, setData] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');
const [filters, setFilters] = useState({
  status: 'all',
  search: '',
  dateFrom: '',
  dateTo: ''
});
```

---

## 🧪 TESTING

### Test Users:
```javascript
const testUsers = {
  customer: { email: 'ari@gmail.com', password: 'password123' },
  kasir: { email: 'kasir1@futsalapp.com', password: 'password123' },
  operator: { email: 'operator1@futsalapp.com', password: 'password123' },
  manager: { email: 'manajer1@futsalapp.com', password: 'password123' },
  supervisor: { email: 'pweb@futsalapp.com', password: 'password123' }
};
```

### Testing Checklist:
- [ ] Login dengan semua role
- [ ] Customer booking flow end-to-end
- [ ] Staff booking confirmation
- [ ] Payment verification
- [ ] Role-based access control
- [ ] Responsive design di mobile
- [ ] Error handling scenarios

### Manual Testing Steps:
1. **Authentication Testing**:
   - Test login/logout untuk setiap role
   - Verify redirect setelah login
   - Test session persistence

2. **Customer Flow Testing**:
   - Browse dan filter lapangan
   - Create booking baru
   - Upload bukti pembayaran
   - Cancel booking

3. **Staff Flow Testing**:
   - Confirm/reject booking
   - Verify/reject payment
   - Manage fields (operator+)
   - View analytics (manager+)

---

## 🚀 DEPLOYMENT

### Build Process:
```bash
# Production build
npm run build

# Preview build locally
npm run preview
```

### Environment Setup:
```env
# Production
VITE_API_URL=https://booking-futsal-production.up.railway.app/api
VITE_APP_NAME=Booking Futsal System

# Staging
VITE_API_URL=https://booking-futsal-staging.up.railway.app/api
VITE_APP_NAME=Booking Futsal (Staging)
```

### Deployment Platforms:
- **Vercel**: Automatic deployment dari Git
- **Netlify**: Static site hosting
- **Railway**: Full-stack deployment
- **AWS S3 + CloudFront**: Enterprise deployment

### Performance Optimization:
- Code splitting dengan React.lazy()
- Image optimization
- Bundle size analysis
- CDN untuk static assets

---

## 🔍 DEBUGGING

### Development Tools:
```javascript
// Debug mode
if (import.meta.env.DEV) {
  console.log('Debug info:', data);
}

// Test helpers
import { logTestInfo } from '../utils/testHelpers';
logTestInfo(); // Logs available test users
```

### Common Issues:
1. **CORS Errors**: Pastikan withCredentials: true
2. **401 Unauthorized**: Check cookie settings
3. **Route Not Found**: Verify route configuration
4. **API Errors**: Check network tab dan backend logs

### Monitoring:
- Browser DevTools Network tab
- React DevTools untuk component state
- Console logs untuk debugging
- Backend API logs untuk server issues

---

## 📚 RESOURCES

### Documentation:
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Router](https://reactrouter.com/)

### Code Style:
- ESLint configuration
- Prettier formatting
- Consistent naming conventions
- Component composition patterns

---

*Dokumentasi ini akan diperbarui seiring dengan perkembangan sistem.*
