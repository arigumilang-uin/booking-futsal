# 🔗 Endpoint Integration Guide - Backend ke Frontend

## 🎯 Overview

Panduan lengkap bagaimana endpoint API dibuat di backend (Node.js + Express) dan dipanggil di frontend (React + Vite). Menggunakan contoh real dari sistem Panam Soccer Field.

## 🏗️ BACKEND: Membuat Endpoint

### 📂 Struktur Backend
```
booking_futsal/
├── routes/           # Route definitions
├── controllers/      # Business logic
├── models/          # Database models
├── middlewares/     # Authentication, validation
└── server.js        # Main server file
```

### 🔧 Step 1: Membuat Route Definition

**File:** `routes/customerRoutes.js`
```javascript
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth/authMiddleware');
const { requireRole } = require('../middlewares/authorization/roleMiddleware');
const customerController = require('../controllers/customer/customerController');

// Middleware untuk semua route customer
router.use(authenticateToken);        // Cek login
router.use(requireRole('penyewa'));   // Minimal role penyewa

// Route definitions
router.get('/bookings', customerController.getCustomerBookings);
router.post('/bookings', customerController.createCustomerBooking);
router.get('/bookings/:id', customerController.getBookingById);
router.put('/bookings/:id/cancel', customerController.cancelBooking);

module.exports = router;
```

### 🎮 Step 2: Membuat Controller Logic

**File:** `controllers/customer/customerController.js`
```javascript
const { getCustomerBookings, createBooking, getBookingById } = require('../../models/business/bookingModel');

// GET /api/customer/bookings
const getCustomerBookings = async (req, res) => {
  try {
    const userId = req.user.id;  // Dari middleware auth
    const { page = 1, limit = 10, status, date_from, date_to } = req.query;
    
    // Validation
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    
    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        success: false,
        error: 'Invalid pagination parameters'
      });
    }
    
    // Database query
    const bookings = await getCustomerBookings({
      userId,
      page: pageNum,
      limit: limitNum,
      status,
      date_from,
      date_to
    });
    
    // Success response
    res.json({
      success: true,
      message: 'Customer bookings retrieved successfully',
      data: bookings.data,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: bookings.total,
        totalPages: Math.ceil(bookings.total / limitNum)
      }
    });
    
  } catch (error) {
    console.error('Get customer bookings error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to retrieve bookings'
    });
  }
};

// POST /api/customer/bookings
const createCustomerBooking = async (req, res) => {
  try {
    const userId = req.user.id;
    const { field_id, date, start_time, end_time, name, phone, email, notes } = req.body;
    
    // Validation
    if (!field_id || !date || !start_time || !end_time || !name || !phone) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        required: ['field_id', 'date', 'start_time', 'end_time', 'name', 'phone']
      });
    }
    
    // Business logic validation
    const conflict = await checkBookingConflict({
      field_id, date, start_time, end_time
    });
    
    if (conflict.hasConflict) {
      return res.status(400).json({
        success: false,
        error: 'Time slot conflict detected',
        conflicts: conflict.conflicts
      });
    }
    
    // Create booking
    const newBooking = await createBooking({
      user_id: userId,
      field_id,
      date,
      start_time,
      end_time,
      name,
      phone,
      email,
      notes
    });
    
    // Success response
    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: newBooking
    });
    
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to create booking'
    });
  }
};

module.exports = {
  getCustomerBookings,
  createCustomerBooking
};
```

### 🗄️ Step 3: Database Model

**File:** `models/business/bookingModel.js`
```javascript
const pool = require('../../config/database');

const getCustomerBookings = async ({ userId, page, limit, status, date_from, date_to }) => {
  try {
    const offset = (page - 1) * limit;
    
    // Build dynamic query
    let whereConditions = ['b.user_id = $1'];
    let queryParams = [userId];
    let paramIndex = 2;
    
    if (status) {
      whereConditions.push(`b.status = $${paramIndex}`);
      queryParams.push(status);
      paramIndex++;
    }
    
    if (date_from) {
      whereConditions.push(`b.date >= $${paramIndex}`);
      queryParams.push(date_from);
      paramIndex++;
    }
    
    if (date_to) {
      whereConditions.push(`b.date <= $${paramIndex}`);
      queryParams.push(date_to);
      paramIndex++;
    }
    
    const whereClause = whereConditions.join(' AND ');
    
    // Main query
    const query = `
      SELECT 
        b.id, b.booking_number, b.date, b.start_time, b.end_time, 
        b.status, b.total_price, b.name, b.phone, b.notes, b.created_at,
        f.name as field_name, f.type as field_type, f.location
      FROM bookings b
      JOIN fields f ON b.field_id = f.id
      WHERE ${whereClause}
      ORDER BY b.date DESC, b.start_time DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    // Count query
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM bookings b 
      WHERE ${whereClause}
    `;
    
    // Execute queries
    queryParams.push(limit, offset);
    const [bookingsResult, countResult] = await Promise.all([
      pool.query(query, queryParams),
      pool.query(countQuery, queryParams.slice(0, -2)) // Remove limit and offset for count
    ]);
    
    return {
      data: bookingsResult.rows,
      total: parseInt(countResult.rows[0].total)
    };
    
  } catch (error) {
    console.error('Database error in getCustomerBookings:', error);
    throw error;
  }
};

module.exports = {
  getCustomerBookings
};
```

### 🔧 Step 4: Register Routes di Server

**File:** `server.js`
```javascript
const express = require('express');
const cors = require('cors');
const customerRoutes = require('./routes/customerRoutes');

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'https://booking-futsal-frontend.vercel.app'],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/customer', customerRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## 🎨 FRONTEND: Memanggil Endpoint

### 📂 Struktur Frontend
```
booking-futsal-frontend/src/
├── api/              # API service layer
├── components/       # React components
├── pages/           # Page components
├── hooks/           # Custom hooks
└── contexts/        # Context providers
```

### 🔧 Step 1: Konfigurasi Axios

**File:** `src/api/axiosConfig.js`
```javascript
import axios from 'axios';

// Base URL configuration
const getBaseURL = () => {
  if (import.meta.env.MODE === 'production') {
    return 'https://booking-futsal-production.up.railway.app/api';
  } else {
    return 'http://localhost:5000/api';
  }
};

// Create axios instance
const axiosInstance = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000,
  withCredentials: true,  // Include cookies
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    
    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
      status: error.response?.status,
      data: error.response?.data
    });
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
```

### 🎮 Step 2: API Service Layer

**File:** `src/api/bookingAPI.js`
```javascript
import axiosInstance from './axiosConfig';

export const bookingAPI = {
  
  // GET /api/customer/bookings
  getCustomerBookings: async (params = {}) => {
    try {
      const { page = 1, limit = 10, status, date_from, date_to } = params;
      
      // Build query parameters
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(status && { status }),
        ...(date_from && { date_from }),
        ...(date_to && { date_to })
      });
      
      console.log('📋 Fetching customer bookings with params:', params);
      
      const response = await axiosInstance.get(`/customer/bookings?${queryParams}`);
      
      if (response.data.success) {
        console.log(`✅ Retrieved ${response.data.data.length} bookings`);
      }
      
      return response;
    } catch (error) {
      console.error('❌ Get customer bookings error:', error);
      throw error;
    }
  },
  
  // POST /api/customer/bookings
  createBooking: async (bookingData) => {
    try {
      console.log('📝 Creating booking:', bookingData);
      
      const response = await axiosInstance.post('/customer/bookings', bookingData);
      
      if (response.data.success) {
        console.log('✅ Booking created successfully:', response.data.data);
      }
      
      return response;
    } catch (error) {
      console.error('❌ Create booking error:', error);
      
      // Handle specific error cases
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        if (errorData.conflicts) {
          throw new Error(`Konflik waktu terdeteksi: ${errorData.conflicts.length} booking bentrok`);
        } else {
          throw new Error(errorData.error || 'Data booking tidak valid');
        }
      }
      
      throw error;
    }
  },
  
  // GET /api/customer/bookings/:id
  getBookingById: async (bookingId) => {
    try {
      console.log(`📋 Fetching booking ${bookingId}`);
      
      const response = await axiosInstance.get(`/customer/bookings/${bookingId}`);
      
      return response;
    } catch (error) {
      console.error(`❌ Get booking ${bookingId} error:`, error);
      throw error;
    }
  }
};
```

### 🪝 Step 3: Custom Hook untuk API

**File:** `src/hooks/useBookings.js`
```javascript
import { useState, useEffect, useCallback } from 'react';
import { bookingAPI } from '../api/bookingAPI';

export const useBookings = (initialParams = {}) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  
  // Fetch bookings function
  const fetchBookings = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const mergedParams = { ...initialParams, ...params };
      const response = await bookingAPI.getCustomerBookings(mergedParams);
      
      if (response.data.success) {
        setBookings(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      console.error('Fetch bookings error:', err);
      setError(err.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  }, [initialParams]);
  
  // Create booking function
  const createBooking = useCallback(async (bookingData) => {
    try {
      const response = await bookingAPI.createBooking(bookingData);
      
      if (response.data.success) {
        // Refresh bookings after create
        await fetchBookings();
        return response.data.data;
      }
    } catch (err) {
      console.error('Create booking error:', err);
      throw err;
    }
  }, [fetchBookings]);
  
  // Initial fetch
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);
  
  return {
    bookings,
    loading,
    error,
    pagination,
    fetchBookings,
    createBooking,
    refetch: fetchBookings
  };
};
```

### 🎨 Step 4: React Component

**File:** `src/pages/customer/BookingList.jsx`
```javascript
import React, { useState } from 'react';
import { useBookings } from '../../hooks/useBookings';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';

const BookingList = () => {
  const [filters, setFilters] = useState({
    status: '',
    date_from: '',
    date_to: ''
  });
  
  // Use custom hook
  const {
    bookings,
    loading,
    error,
    pagination,
    fetchBookings,
    createBooking
  } = useBookings(filters);
  
  // Handle filter change
  const handleFilterChange = (newFilters) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    fetchBookings(updatedFilters);
  };
  
  // Handle create booking
  const handleCreateBooking = async (bookingData) => {
    try {
      await createBooking(bookingData);
      alert('Booking berhasil dibuat!');
    } catch (error) {
      alert('Gagal membuat booking: ' + error.message);
    }
  };
  
  // Render loading
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <LoadingSpinner />
        <span className="ml-2">Memuat data booking...</span>
      </div>
    );
  }
  
  // Render error
  if (error) {
    return (
      <ErrorMessage 
        message={error}
        onRetry={() => fetchBookings()}
      />
    );
  }
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Riwayat Booking</h1>
      
      {/* Filter Section */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select 
            value={filters.status}
            onChange={(e) => handleFilterChange({ status: e.target.value })}
            className="border rounded-lg px-3 py-2"
          >
            <option value="">Semua Status</option>
            <option value="pending">Menunggu</option>
            <option value="confirmed">Dikonfirmasi</option>
            <option value="completed">Selesai</option>
          </select>
          
          <input
            type="date"
            value={filters.date_from}
            onChange={(e) => handleFilterChange({ date_from: e.target.value })}
            className="border rounded-lg px-3 py-2"
          />
          
          <input
            type="date"
            value={filters.date_to}
            onChange={(e) => handleFilterChange({ date_to: e.target.value })}
            className="border rounded-lg px-3 py-2"
          />
        </div>
      </div>
      
      {/* Booking List */}
      <div className="space-y-4">
        {bookings.length > 0 ? (
          bookings.map(booking => (
            <div key={booking.id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{booking.field_name}</h3>
                  <p className="text-gray-600">
                    {booking.date} • {booking.start_time} - {booking.end_time}
                  </p>
                  <p className="text-sm text-gray-500">
                    Booking: {booking.booking_number}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                  booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {booking.status}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p>Tidak ada booking ditemukan</p>
          </div>
        )}
      </div>
      
      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => fetchBookings({ ...filters, page })}
              className={`px-3 py-1 rounded ${
                page === pagination.page 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingList;
```

## 🔄 Flow Lengkap: Backend → Frontend

### 📊 Request Flow
```
1. User Action (Click button, Submit form)
   ↓
2. React Component calls API function
   ↓
3. API Service (bookingAPI.js) calls axiosInstance
   ↓
4. Axios sends HTTP request to backend
   ↓
5. Backend Route receives request
   ↓
6. Middleware (auth, validation) processes request
   ↓
7. Controller executes business logic
   ↓
8. Model queries database
   ↓
9. Database returns data
   ↓
10. Controller formats response
    ↓
11. Backend sends JSON response
    ↓
12. Axios receives response
    ↓
13. API Service processes response
    ↓
14. React Component updates state
    ↓
15. UI re-renders with new data
```

### 🎯 Key Integration Points

#### **1. Authentication**
- **Backend:** JWT token validation di middleware
- **Frontend:** Token disimpan dan dikirim di header

#### **2. Error Handling**
- **Backend:** Consistent error format dengan status codes
- **Frontend:** Axios interceptor handle errors globally

#### **3. Data Format**
- **Backend:** Consistent JSON response format
- **Frontend:** Type-safe data handling

#### **4. Real-time Updates**
- **Backend:** WebSocket atau polling endpoints
- **Frontend:** Custom hooks untuk real-time data

## 🎉 Kesimpulan

**Integration Pattern yang Digunakan:**

1. **🏗️ Backend:** Route → Middleware → Controller → Model → Database
2. **🎨 Frontend:** Component → Hook → API Service → Axios → Backend
3. **🔄 Communication:** RESTful API dengan JSON format
4. **🔐 Security:** JWT authentication dengan role-based access
5. **⚡ Performance:** Pagination, caching, dan optimized queries

**Best Practices:**
- ✅ **Separation of Concerns** - Clear separation antara layers
- ✅ **Error Handling** - Comprehensive error handling di semua levels
- ✅ **Type Safety** - Consistent data types dan validation
- ✅ **Security** - Authentication dan authorization di setiap endpoint
- ✅ **Performance** - Optimized queries dan efficient data transfer

**🔗 Integration yang robust dan scalable untuk production use!**
