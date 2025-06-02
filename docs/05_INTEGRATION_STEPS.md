# 🔗 INTEGRATION STEPS - Frontend-Backend Connection

## 🎯 **OVERVIEW**

Panduan langkah demi langkah untuk mengintegrasikan frontend Vite+React dengan backend Railway yang sudah production-ready.

## 🚀 **STEP 1: API SERVICES SETUP**

### **src/services/authService.js**
```javascript
import { apiClient } from '../utils/api';

export const authService = {
  // Register new user
  register: async (userData) => {
    try {
      const response = await apiClient.post('/auth/register', userData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Registration failed'
      };
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed'
      };
    }
  },

  // Logout user
  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Logout failed'
      };
    }
  },

  // Get user profile
  getProfile: async () => {
    try {
      const response = await apiClient.get('/auth/profile');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get profile'
      };
    }
  }
};
```

### **src/services/bookingService.js**
```javascript
import { apiClient } from '../utils/api';

export const bookingService = {
  // Get user bookings
  getBookings: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await apiClient.get(`/customer/bookings?${queryString}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get bookings'
      };
    }
  },

  // Create new booking
  createBooking: async (bookingData) => {
    try {
      const response = await apiClient.post('/customer/bookings', bookingData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to create booking'
      };
    }
  },

  // Update booking
  updateBooking: async (bookingId, updateData) => {
    try {
      const response = await apiClient.put(`/customer/bookings/${bookingId}`, updateData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to update booking'
      };
    }
  },

  // Cancel booking
  cancelBooking: async (bookingId) => {
    try {
      const response = await apiClient.delete(`/customer/bookings/${bookingId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to cancel booking'
      };
    }
  }
};
```

### **src/services/fieldService.js**
```javascript
import { apiClient } from '../utils/api';

export const fieldService = {
  // Get all fields
  getFields: async () => {
    try {
      const response = await apiClient.get('/public/fields');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get fields'
      };
    }
  },

  // Get field availability
  getFieldAvailability: async (fieldId, date) => {
    try {
      const response = await apiClient.get(`/public/fields/${fieldId}/availability?date=${date}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get availability'
      };
    }
  }
};
```

## 🎣 **STEP 2: CUSTOM HOOKS**

### **src/hooks/useApi.js**
```javascript
import { useState, useEffect } from 'react';

export const useApi = (apiFunction, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await apiFunction();
        
        if (result.success) {
          setData(result.data);
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, dependencies);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunction();
      
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch };
};
```

### **src/hooks/useBookings.js**
```javascript
import { useState, useEffect } from 'react';
import { bookingService } from '../services/bookingService';

export const useBookings = (params = {}) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await bookingService.getBookings(params);
      
      if (result.success) {
        setBookings(result.data.data || []);
        setPagination(result.data.pagination);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [JSON.stringify(params)]);

  const createBooking = async (bookingData) => {
    const result = await bookingService.createBooking(bookingData);
    if (result.success) {
      await fetchBookings(); // Refresh list
    }
    return result;
  };

  const updateBooking = async (bookingId, updateData) => {
    const result = await bookingService.updateBooking(bookingId, updateData);
    if (result.success) {
      await fetchBookings(); // Refresh list
    }
    return result;
  };

  const cancelBooking = async (bookingId) => {
    const result = await bookingService.cancelBooking(bookingId);
    if (result.success) {
      await fetchBookings(); // Refresh list
    }
    return result;
  };

  return {
    bookings,
    loading,
    error,
    pagination,
    refetch: fetchBookings,
    createBooking,
    updateBooking,
    cancelBooking
  };
};
```

## 📱 **STEP 3: PAGE COMPONENTS**

### **src/pages/auth/LoginPage.jsx**
```javascript
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Login ke Akun Anda
          </h2>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="input mt-1"
                placeholder="Masukkan email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="input mt-1"
                placeholder="Masukkan password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <Button
              type="submit"
              className="w-full"
              loading={loading}
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </div>
          
          <div className="text-center">
            <span className="text-sm text-gray-600">
              Belum punya akun?{' '}
              <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
                Daftar di sini
              </Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
```

### **src/pages/customer/BookingForm.jsx**
```javascript
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fieldService } from '../../services/fieldService';
import { useBookings } from '../../hooks/useBookings';
import Button from '../../components/ui/Button';
import { formatCurrency } from '../../utils/format';

const BookingForm = () => {
  const [fields, setFields] = useState([]);
  const [selectedField, setSelectedField] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [formData, setFormData] = useState({
    field_id: '',
    date: '',
    start_time: '',
    end_time: '',
    name: '',
    phone: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { createBooking } = useBookings();
  const navigate = useNavigate();

  // Load fields on component mount
  useEffect(() => {
    const loadFields = async () => {
      const result = await fieldService.getFields();
      if (result.success) {
        setFields(result.data.data || []);
      }
    };
    loadFields();
  }, []);

  // Load availability when field and date selected
  useEffect(() => {
    if (formData.field_id && formData.date) {
      loadAvailability();
    }
  }, [formData.field_id, formData.date]);

  const loadAvailability = async () => {
    const result = await fieldService.getFieldAvailability(formData.field_id, formData.date);
    if (result.success) {
      setAvailability(result.data.data.available_slots || []);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await createBooking(formData);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const handleFieldChange = (fieldId) => {
    const field = fields.find(f => f.id === parseInt(fieldId));
    setSelectedField(field);
    setFormData({
      ...formData,
      field_id: fieldId
    });
  };

  const calculateTotal = () => {
    if (!selectedField || !formData.start_time || !formData.end_time) return 0;
    
    const start = new Date(`2000-01-01T${formData.start_time}`);
    const end = new Date(`2000-01-01T${formData.end_time}`);
    const hours = (end - start) / (1000 * 60 * 60);
    
    return hours * parseFloat(selectedField.price_per_hour);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Booking Lapangan</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        
        {/* Field Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pilih Lapangan
          </label>
          <select
            className="input"
            value={formData.field_id}
            onChange={(e) => handleFieldChange(e.target.value)}
            required
          >
            <option value="">Pilih lapangan...</option>
            {fields.map(field => (
              <option key={field.id} value={field.id}>
                {field.name} - {formatCurrency(field.price_per_hour)}/jam
              </option>
            ))}
          </select>
        </div>

        {/* Date Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tanggal
          </label>
          <input
            type="date"
            className="input"
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
            min={new Date().toISOString().split('T')[0]}
            required
          />
        </div>

        {/* Time Selection */}
        {availability.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jam Mulai
              </label>
              <select
                className="input"
                value={formData.start_time}
                onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                required
              >
                <option value="">Pilih jam mulai...</option>
                {availability.filter(slot => slot.available).map(slot => (
                  <option key={slot.start_time} value={slot.start_time}>
                    {slot.start_time}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jam Selesai
              </label>
              <select
                className="input"
                value={formData.end_time}
                onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                required
              >
                <option value="">Pilih jam selesai...</option>
                {availability.filter(slot => slot.available).map(slot => (
                  <option key={slot.end_time} value={slot.end_time}>
                    {slot.end_time}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Contact Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama Pemesan
            </label>
            <input
              type="text"
              className="input"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              No. Telepon
            </label>
            <input
              type="tel"
              className="input"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              required
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Catatan (Opsional)
          </label>
          <textarea
            className="input"
            rows={3}
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            placeholder="Catatan tambahan..."
          />
        </div>

        {/* Total */}
        {calculateTotal() > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total Biaya:</span>
              <span className="text-xl font-bold text-primary-600">
                {formatCurrency(calculateTotal())}
              </span>
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/dashboard')}
            className="flex-1"
          >
            Batal
          </Button>
          <Button
            type="submit"
            loading={loading}
            disabled={loading}
            className="flex-1"
          >
            {loading ? 'Memproses...' : 'Buat Booking'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default BookingForm;
```

---

**Next: 06_DEPLOYMENT_GUIDE.md untuk deployment ke Vercel**
