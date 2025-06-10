# 🚀 Cara Kerja Project Panam Soccer Field

## 📋 Overview
Project ini adalah sistem booking lapangan futsal dengan arsitektur **Backend (Node.js + Express) + Frontend (React + Vite)**. Mari kita pelajari bagaimana setiap fitur bekerja dari backend hingga frontend.

## 🔐 1. SISTEM LOGIN & REGISTER

### 🎯 Alur Kerja Login/Register
```
User Input → Frontend Validation → API Call → Backend Validation → Database → JWT Token → Frontend Storage → Redirect
```

### 📂 Backend Implementation

#### A. Route Definition
**File:** `routes/authRoutes.js` (Baris 15-20)
```javascript
// Definisi route untuk authentication
router.post('/register', authController.register);  // Baris 15
router.post('/login', authController.login);        // Baris 16
router.post('/logout', authController.logout);      // Baris 17
router.post('/forgot-password', authController.forgotPassword); // Baris 18
```

#### B. Controller Logic
**File:** `controllers/auth/authController.js`

**Register Function (Baris 25-85):**
```javascript
const register = async (req, res) => {
  try {
    // 1. Validasi input (Baris 30-35)
    const { name, email, phone, password } = req.body;
    
    // 2. Cek email sudah ada atau belum (Baris 40-45)
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Email already registered'
      });
    }
    
    // 3. Hash password dengan bcrypt (Baris 50-52)
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // 4. Simpan ke database (Baris 55-65)
    const newUser = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: 'penyewa', // Default role
      is_active: true
    });
    
    // 5. Generate JWT token (Baris 70-75)
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // 6. Set cookie dan response (Baris 80-85)
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 jam
    });
    
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      user: { id: newUser.id, name, email, role: 'penyewa' }
    });
  } catch (error) {
    // Error handling...
  }
};
```

**Login Function (Baris 90-150):**
```javascript
const login = async (req, res) => {
  try {
    // 1. Ambil email dan password (Baris 95)
    const { email, password } = req.body;
    
    // 2. Cari user di database (Baris 100-105)
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
    
    // 3. Verifikasi password (Baris 110-115)
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
    
    // 4. Cek apakah user aktif (Baris 120-125)
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        error: 'Account is deactivated'
      });
    }
    
    // 5. Generate JWT token dengan role (Baris 130-135)
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role,
        name: user.name
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // 6. Set cookie dan response (Baris 140-150)
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000
    });
    
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    // Error handling...
  }
};
```

#### C. Database Model
**File:** `models/auth/User.js` (Baris 15-80)
```javascript
class User {
  // Mencari user berdasarkan email (Baris 25-35)
  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await db.query(query, [email]);
    return result.rows[0];
  }
  
  // Membuat user baru (Baris 40-55)
  static async create(userData) {
    const { name, email, phone, password, role } = userData;
    const query = `
      INSERT INTO users (name, email, phone, password, role, is_active, created_at)
      VALUES ($1, $2, $3, $4, $5, true, NOW())
      RETURNING id, name, email, role, created_at
    `;
    const result = await db.query(query, [name, email, phone, password, role]);
    return result.rows[0];
  }
}
```

### 🎨 Frontend Implementation

#### A. Login Component
**File:** `booking-futsal-frontend/src/pages/auth/Login.jsx`

**Form Handling (Baris 45-85):**
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  
  try {
    // 1. Panggil API login (Baris 50-55)
    const response = await authAPI.login({
      email: formData.email,
      password: formData.password
    });
    
    // 2. Cek response sukses (Baris 60-65)
    if (response.data.success) {
      console.log('✅ Login successful:', response.data.user.role);
      
      // 3. Redirect berdasarkan role (Baris 70-85)
      const userRole = response.data.user.role;
      
      if (userRole === 'penyewa') {
        navigate('/customer');
      } else if (['staff_kasir', 'operator_lapangan', 'manajer_futsal', 'supervisor_sistem'].includes(userRole)) {
        navigate('/staff');
      } else {
        navigate('/');
      }
    }
  } catch (error) {
    console.error('❌ Login error:', error);
    setError('Email atau password salah');
  } finally {
    setLoading(false);
  }
};
```

#### B. API Service
**File:** `booking-futsal-frontend/src/api/authAPI.js` (Baris 15-45)
```javascript
// Login API call
export const login = async (credentials) => {
  try {
    console.log('🔐 Attempting login for:', credentials.email);
    
    // Panggil endpoint login (Baris 20-25)
    const response = await axiosInstance.post('/auth/login', credentials);
    
    console.log('✅ Login response:', response.data);
    return response;
  } catch (error) {
    console.error('❌ Login error:', error);
    throw error;
  }
};

// Register API call
export const register = async (userData) => {
  try {
    console.log('📝 Attempting registration for:', userData.email);
    
    // Panggil endpoint register (Baris 35-40)
    const response = await axiosInstance.post('/auth/register', userData);
    
    console.log('✅ Registration response:', response.data);
    return response;
  } catch (error) {
    console.error('❌ Registration error:', error);
    throw error;
  }
};
```

## 👥 2. ROLE HIERARCHY SYSTEM

### 🎯 Konsep Role Hierarchy
```
Level 1: pengunjung (Guest) - Akses publik
Level 2: penyewa (Customer) - Booking & payment
Level 3: staff_kasir (Cashier) - Payment processing
Level 4: operator_lapangan (Field Operator) - Field management
Level 5: manajer_futsal (Manager) - Business analytics
Level 6: supervisor_sistem (System Supervisor) - Full access
```

### 📂 Backend Role Validation

#### A. Authentication Middleware
**File:** `middlewares/auth/authMiddleware.js` (Baris 15-60)
```javascript
const authenticateToken = async (req, res, next) => {
  try {
    // 1. Ambil token dari cookie atau header (Baris 20-30)
    let token = req.cookies.auth_token;
    
    if (!token && req.headers.authorization) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }
    
    // 2. Verifikasi JWT token (Baris 35-45)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Ambil data user dari database (Baris 50-60)
    const user = await User.findById(decoded.userId);
    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or inactive user'
      });
    }
    
    // 4. Simpan data user ke request (Baris 55-60)
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    };
    
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
};
```

#### B. Authorization Middleware
**File:** `middlewares/authorization/roleMiddleware.js` (Baris 10-80)
```javascript
// Role hierarchy levels
const ROLE_LEVELS = {
  'pengunjung': 1,
  'penyewa': 2,
  'staff_kasir': 3,
  'operator_lapangan': 4,
  'manajer_futsal': 5,
  'supervisor_sistem': 6
};

// Middleware untuk cek role minimum (Baris 20-50)
const requireRole = (minimumRole) => {
  return (req, res, next) => {
    try {
      const userRole = req.user.role;
      const userLevel = ROLE_LEVELS[userRole];
      const requiredLevel = ROLE_LEVELS[minimumRole];
      
      // Cek apakah level user >= level yang dibutuhkan (Baris 30-40)
      if (userLevel >= requiredLevel) {
        console.log(`✅ Access granted: ${userRole} (level ${userLevel}) >= ${minimumRole} (level ${requiredLevel})`);
        next();
      } else {
        console.log(`❌ Access denied: ${userRole} (level ${userLevel}) < ${minimumRole} (level ${requiredLevel})`);
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions'
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Authorization error'
      });
    }
  };
};

// Middleware untuk cek role spesifik (Baris 55-80)
const requireSpecificRoles = (allowedRoles) => {
  return (req, res, next) => {
    try {
      const userRole = req.user.role;
      
      if (allowedRoles.includes(userRole)) {
        console.log(`✅ Access granted: ${userRole} is in allowed roles`);
        next();
      } else {
        console.log(`❌ Access denied: ${userRole} not in allowed roles: ${allowedRoles.join(', ')}`);
        return res.status(403).json({
          success: false,
          error: 'Role not authorized for this operation'
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Authorization error'
      });
    }
  };
};
```

#### C. Route Protection Implementation
**File:** `routes/customerRoutes.js` (Baris 10-25)
```javascript
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth/authMiddleware');
const { requireRole } = require('../middlewares/authorization/roleMiddleware');

// Semua route customer butuh minimal role 'penyewa' (Baris 15-25)
router.use(authenticateToken);  // Cek login dulu
router.use(requireRole('penyewa'));  // Minimal level 2

// Route-route customer
router.get('/profile', customerController.getProfile);
router.get('/bookings', customerController.getBookings);
router.post('/bookings', customerController.createBooking);
```

**File:** `routes/adminRoutes.js` (Baris 10-25)
```javascript
// Route admin butuh minimal role 'supervisor_sistem' (Baris 15-25)
router.use(authenticateToken);
router.use(requireRole('supervisor_sistem'));  // Minimal level 6

// Route-route admin
router.get('/users', adminController.getAllUsers);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);
```

### 🎨 Frontend Role Management

#### A. Auth Context Provider
**File:** `booking-futsal-frontend/src/contexts/AuthProvider.jsx` (Baris 25-70)
```javascript
// Role hierarchy definition (Baris 25-35)
const ROLE_LEVELS = {
  'pengunjung': 1,
  'penyewa': 2,
  'staff_kasir': 3,
  'operator_lapangan': 4,
  'manajer_futsal': 5,
  'supervisor_sistem': 6
};

// Helper functions untuk cek role (Baris 40-70)
const hasMinimumRole = (userRole, minimumRole) => {
  const userLevel = ROLE_LEVELS[userRole] || 0;
  const requiredLevel = ROLE_LEVELS[minimumRole] || 0;
  return userLevel >= requiredLevel;
};

const isStaffRole = (role) => {
  const staffRoles = ['staff_kasir', 'operator_lapangan', 'manajer_futsal', 'supervisor_sistem'];
  return staffRoles.includes(role);
};

const isManagementRole = (role) => {
  const managementRoles = ['manajer_futsal', 'supervisor_sistem'];
  return managementRoles.includes(role);
};

// Context value yang disediakan (Baris 65-70)
const contextValue = {
  user,
  login,
  logout,
  hasMinimumRole,
  isStaffRole,
  isManagementRole,
  loading
};
```

#### B. Protected Route Component
**File:** `booking-futsal-frontend/src/components/ProtectedRoute.jsx` (Baris 15-45)
```javascript
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  
  // Loading state (Baris 20-25)
  if (loading) {
    return <div>Loading...</div>;
  }
  
  // Cek apakah user sudah login (Baris 30-35)
  if (!user) {
    console.log('🚫 No user found, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  // Cek role permission (Baris 40-45)
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    console.log('🚫 Access denied: Insufficient role permissions', {
      allowedRoles,
      userRole: user.role
    });
    return <Navigate to="/unauthorized" replace />;
  }
  
  return children;
};
```

#### C. Route Configuration
**File:** `booking-futsal-frontend/src/App.jsx` (Baris 70-90)
```javascript
// Route dengan role protection (Baris 70-90)
<Routes>
  {/* Public routes */}
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
  
  {/* Customer routes - minimal role 'penyewa' */}
  <Route path="/customer/*" element={
    <ProtectedRoute allowedRoles={["penyewa", "staff_kasir", "operator_lapangan", "manajer_futsal", "supervisor_sistem"]}>
      <CustomerLayout />
    </ProtectedRoute>
  } />
  
  {/* Staff routes - minimal role 'staff_kasir' */}
  <Route path="/staff/*" element={
    <ProtectedRoute allowedRoles={["staff_kasir", "operator_lapangan", "manajer_futsal", "supervisor_sistem"]}>
      <StaffDashboard />
    </ProtectedRoute>
  } />
  
  {/* Admin routes - hanya 'supervisor_sistem' */}
  <Route path="/admin/*" element={
    <ProtectedRoute allowedRoles={["supervisor_sistem"]}>
      <AdminDashboard />
    </ProtectedRoute>
  } />
</Routes>
```

## 📧 3. FITUR LUPA PASSWORD & EMAIL RESET

### 🎯 Alur Kerja Lupa Password
```
User Input Email → Frontend Validation → API Call → Backend Generate Token →
Save to Database → Send Email → User Click Link → Reset Form → Update Password
```

### 📂 Backend Implementation

#### A. Forgot Password Controller
**File:** `controllers/auth/authController.js` (Baris 200-280)
```javascript
const forgotPassword = async (req, res) => {
  try {
    // 1. Ambil email dari request (Baris 205)
    const { email } = req.body;

    // 2. Validasi email format (Baris 210-215)
    if (!email || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        error: 'Valid email is required'
      });
    }

    // 3. Cek apakah user ada di database (Baris 220-230)
    const user = await User.findByEmail(email);
    if (!user) {
      // Untuk keamanan, tetap return success meski user tidak ada
      return res.json({
        success: true,
        message: 'If email exists, reset link has been sent'
      });
    }

    // 4. Generate random token (Baris 235-240)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 3600000); // 1 jam dari sekarang

    // 5. Simpan token ke database (Baris 245-255)
    await PasswordReset.create({
      email: user.email,
      token: resetToken,
      expires_at: tokenExpiry,
      used_at: null
    });

    // 6. Buat reset URL (Baris 260-265)
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    // 7. Kirim email (Baris 270-280)
    await emailService.sendPasswordResetEmail({
      to: user.email,
      name: user.name,
      resetUrl: resetUrl,
      expiryTime: '1 jam'
    });

    res.json({
      success: true,
      message: 'Password reset link has been sent to your email'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process password reset request'
    });
  }
};
```

#### B. Reset Password Controller
**File:** `controllers/auth/authController.js` (Baris 285-360)
```javascript
const resetPassword = async (req, res) => {
  try {
    // 1. Ambil data dari request (Baris 290-295)
    const { token, email, newPassword } = req.body;

    // 2. Validasi input (Baris 300-310)
    if (!token || !email || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Token, email, and new password are required'
      });
    }

    // 3. Cari token di database (Baris 315-325)
    const resetRecord = await PasswordReset.findValidToken(token, email);
    if (!resetRecord) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired reset token'
      });
    }

    // 4. Cek apakah token sudah digunakan (Baris 330-335)
    if (resetRecord.used_at) {
      return res.status(400).json({
        success: false,
        error: 'Reset token has already been used'
      });
    }

    // 5. Hash password baru (Baris 340-345)
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // 6. Update password user (Baris 350-355)
    await User.updatePassword(email, hashedPassword);

    // 7. Mark token sebagai used (Baris 360)
    await PasswordReset.markAsUsed(token);

    res.json({
      success: true,
      message: 'Password has been reset successfully'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset password'
    });
  }
};
```

#### C. Password Reset Model
**File:** `models/auth/PasswordReset.js` (Baris 10-80)
```javascript
class PasswordReset {
  // Buat record reset password baru (Baris 15-30)
  static async create(resetData) {
    const { email, token, expires_at } = resetData;
    const query = `
      INSERT INTO password_resets (email, token, expires_at, created_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING id, email, token, expires_at
    `;
    const result = await db.query(query, [email, token, expires_at]);
    return result.rows[0];
  }

  // Cari token yang valid (Baris 35-50)
  static async findValidToken(token, email) {
    const query = `
      SELECT * FROM password_resets
      WHERE token = $1
        AND email = $2
        AND expires_at > NOW()
        AND used_at IS NULL
      ORDER BY created_at DESC
      LIMIT 1
    `;
    const result = await db.query(query, [token, email]);
    return result.rows[0];
  }

  // Mark token sebagai sudah digunakan (Baris 55-65)
  static async markAsUsed(token) {
    const query = `
      UPDATE password_resets
      SET used_at = NOW()
      WHERE token = $1
    `;
    await db.query(query, [token]);
  }

  // Hapus token yang expired (Baris 70-80)
  static async cleanupExpiredTokens() {
    const query = `
      DELETE FROM password_resets
      WHERE expires_at < NOW() OR used_at IS NOT NULL
    `;
    await db.query(query);
  }
}
```

#### D. Email Service
**File:** `services/emailService.js` (Baris 15-120)
```javascript
const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    // 1. Konfigurasi SMTP Gmail (Baris 20-35)
    this.transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,     // Gmail address
        pass: process.env.EMAIL_PASSWORD  // App password (bukan password biasa)
      },
      secure: true,
      port: 465
    });
  }

  // 2. Template email reset password (Baris 40-80)
  generateResetEmailTemplate(name, resetUrl, expiryTime) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Reset Password - Panam Soccer Field</title>
        <style>
          .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
          .header { background: #1F2937; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background: #f9f9f9; }
          .button {
            display: inline-block;
            background: #3B82F6;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
          }
          .footer { padding: 20px; text-align: center; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏟️ Panam Soccer Field</h1>
            <p>Reset Password Request</p>
          </div>
          <div class="content">
            <h2>Halo ${name}!</h2>
            <p>Kami menerima permintaan untuk reset password akun Anda.</p>
            <p>Klik tombol di bawah ini untuk reset password:</p>

            <a href="${resetUrl}" class="button">Reset Password</a>

            <p><strong>Link ini akan expired dalam ${expiryTime}.</strong></p>

            <p>Jika Anda tidak meminta reset password, abaikan email ini.</p>

            <hr>
            <p><small>Atau copy link berikut ke browser Anda:</small></p>
            <p><small>${resetUrl}</small></p>
          </div>
          <div class="footer">
            <p>© 2024 Panam Soccer Field. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // 3. Fungsi kirim email reset password (Baris 85-120)
  async sendPasswordResetEmail({ to, name, resetUrl, expiryTime }) {
    try {
      const htmlContent = this.generateResetEmailTemplate(name, resetUrl, expiryTime);

      const mailOptions = {
        from: {
          name: 'Panam Soccer Field',
          address: process.env.EMAIL_USER
        },
        to: to,
        subject: '� Reset Password - Panam Soccer Field',
        html: htmlContent,
        text: `
          Halo ${name}!

          Kami menerima permintaan untuk reset password akun Anda.

          Klik link berikut untuk reset password:
          ${resetUrl}

          Link ini akan expired dalam ${expiryTime}.

          Jika Anda tidak meminta reset password, abaikan email ini.

          Terima kasih,
          Tim Panam Soccer Field
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully:', result.messageId);
      return result;

    } catch (error) {
      console.error('❌ Email sending failed:', error);
      throw error;
    }
  }
}

module.exports = new EmailService();
```

#### E. Environment Configuration
**File:** `.env` (Baris yang diperlukan)
```env
# Email configuration untuk Gmail
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-app-password  # Bukan password biasa, tapi App Password

# Frontend URL untuk reset link
FRONTEND_URL=https://booking-futsal-frontend.vercel.app

# JWT Secret
JWT_SECRET=your-super-secret-key
```

### 🎨 Frontend Implementation

#### A. Forgot Password Component
**File:** `booking-futsal-frontend/src/pages/auth/ForgotPassword.jsx` (Baris 20-80)
```javascript
const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Handle submit form (Baris 30-60)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      // 1. Validasi email di frontend (Baris 40-45)
      if (!email || !email.includes('@')) {
        setError('Please enter a valid email address');
        return;
      }

      // 2. Panggil API forgot password (Baris 50-55)
      const response = await authAPI.forgotPassword({ email });

      if (response.data.success) {
        setMessage('Reset link has been sent to your email. Please check your inbox.');
      }

    } catch (error) {
      console.error('Forgot password error:', error);
      setError('Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-center text-gray-900">
            Lupa Password
          </h2>
          <p className="mt-2 text-center text-gray-600">
            Masukkan email Anda untuk menerima link reset password
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter your email"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          {message && (
            <div className="text-green-600 text-sm">{message}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
      </div>
    </div>
  );
};
```

#### B. Reset Password Component
**File:** `booking-futsal-frontend/src/pages/auth/ResetPassword.jsx` (Baris 20-120)
```javascript
const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Ambil token dan email dari URL (Baris 25-30)
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Validasi token saat component mount (Baris 40-50)
  useEffect(() => {
    if (!token || !email) {
      setError('Invalid reset link. Please request a new password reset.');
    }
  }, [token, email]);

  // Handle form submit (Baris 55-100)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Validasi password di frontend (Baris 65-75)
      if (formData.newPassword.length < 6) {
        setError('Password must be at least 6 characters long');
        return;
      }

      if (formData.newPassword !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      // 2. Panggil API reset password (Baris 80-90)
      const response = await authAPI.resetPassword({
        token,
        email,
        newPassword: formData.newPassword
      });

      if (response.data.success) {
        alert('Password reset successful! Please login with your new password.');
        navigate('/login');
      }

    } catch (error) {
      console.error('Reset password error:', error);
      if (error.response?.status === 400) {
        setError('Invalid or expired reset token. Please request a new password reset.');
      } else {
        setError('Failed to reset password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Render form (Baris 105-120)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-center text-gray-900">
            Reset Password
          </h2>
          <p className="mt-2 text-center text-gray-600">
            Enter your new password
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <input
              type="password"
              required
              value={formData.newPassword}
              onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter new password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              type="password"
              required
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Confirm new password"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !token || !email}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};
```

#### C. Auth API Service
**File:** `booking-futsal-frontend/src/api/authAPI.js` (Baris 50-80)
```javascript
// Forgot password API call (Baris 50-60)
export const forgotPassword = async (data) => {
  try {
    console.log('📧 Sending forgot password request for:', data.email);
    const response = await axiosInstance.post('/auth/forgot-password', data);
    console.log('✅ Forgot password response:', response.data);
    return response;
  } catch (error) {
    console.error('❌ Forgot password error:', error);
    throw error;
  }
};

// Reset password API call (Baris 65-80)
export const resetPassword = async (data) => {
  try {
    console.log('🔐 Sending reset password request');
    const response = await axiosInstance.post('/auth/reset-password', data);
    console.log('✅ Reset password response:', response.data);
    return response;
  } catch (error) {
    console.error('❌ Reset password error:', error);
    throw error;
  }
};
```

### 📧 Setup Gmail App Password

#### Langkah-langkah Setup Gmail:
1. **Buka Google Account Settings** → Security
2. **Enable 2-Factor Authentication** (wajib untuk App Password)
3. **Generate App Password:**
   - Go to Security → 2-Step Verification → App passwords
   - Select "Mail" dan "Other (custom name)"
   - Masukkan "Panam Soccer Field"
   - Copy password yang di-generate (16 karakter)
4. **Masukkan ke .env:**
   ```env
   EMAIL_USER=your-gmail@gmail.com
   EMAIL_PASSWORD=abcd-efgh-ijkl-mnop  # App password dari step 3
   ```

### 🔄 Alur Lengkap Reset Password:

1. **User klik "Lupa Password"** di halaman login
2. **User masukkan email** di form forgot password
3. **Frontend kirim request** ke `/api/auth/forgot-password`
4. **Backend generate token** dan simpan ke database
5. **Backend kirim email** dengan link reset ke Gmail user
6. **User buka email** dan klik link reset
7. **User diarahkan** ke halaman reset password dengan token di URL
8. **User masukkan password baru** dan konfirmasi
9. **Frontend kirim request** ke `/api/auth/reset-password`
10. **Backend validasi token** dan update password
11. **User diarahkan** ke halaman login dengan password baru

---

## 🎯 RINGKASAN LOKASI FILE PENTING

### Backend Files:
- **Auth Controller:** `controllers/auth/authController.js` (Login: 90-150, Register: 25-85, Forgot: 200-280, Reset: 285-360)
- **Auth Routes:** `routes/authRoutes.js` (Route definitions: 15-20)
- **Auth Middleware:** `middlewares/auth/authMiddleware.js` (Token validation: 15-60)
- **Role Middleware:** `middlewares/authorization/roleMiddleware.js` (Role checking: 20-80)
- **User Model:** `models/auth/User.js` (Database operations: 25-80)
- **Password Reset Model:** `models/auth/PasswordReset.js` (Token management: 15-80)
- **Email Service:** `services/emailService.js` (Email sending: 15-120)

### Frontend Files:
- **Login Component:** `src/pages/auth/Login.jsx` (Form handling: 45-85)
- **Register Component:** `src/pages/auth/Register.jsx`
- **Forgot Password:** `src/pages/auth/ForgotPassword.jsx` (Form: 20-80)
- **Reset Password:** `src/pages/auth/ResetPassword.jsx` (Form: 20-120)
- **Auth Context:** `src/contexts/AuthProvider.jsx` (Role management: 25-70)
- **Protected Route:** `src/components/ProtectedRoute.jsx` (Access control: 15-45)
- **Auth API:** `src/api/authAPI.js` (API calls: 15-80)
- **App Routes:** `src/App.jsx` (Route protection: 70-90)

### Database Tables:
- **users:** User data dan authentication
- **password_resets:** Token reset password dengan expiry

## ⏰ 4. SISTEM AUTO-COMPLETE BOOKING

### 🎯 Konsep Auto-Complete Booking
```
Booking Confirmed → Waktu Mulai → Waktu Selesai → Auto Check → Status Update → Notification
```

Sistem ini secara otomatis mengubah status booking dari `confirmed` menjadi `completed` ketika waktu booking sudah berakhir, tanpa perlu intervensi manual dari operator.

### 📂 Backend Implementation

#### A. Cron Job Scheduler
**File:** `services/cronJobs.js` (Baris 15-80)
```javascript
const cron = require('node-cron');
const BookingService = require('./bookingService');
const NotificationService = require('./notificationService');

class CronJobService {
  constructor() {
    this.initializeJobs();
  }

  // Inisialisasi semua cron jobs (Baris 25-35)
  initializeJobs() {
    console.log('🕐 Initializing cron jobs...');

    // Job untuk auto-complete booking setiap 5 menit
    this.startBookingCompletionJob();

    // Job untuk cleanup expired tokens setiap hari
    this.startTokenCleanupJob();

    console.log('✅ All cron jobs initialized');
  }

  // Cron job untuk auto-complete booking (Baris 40-80)
  startBookingCompletionJob() {
    // Jalankan setiap 5 menit: */5 * * * *
    cron.schedule('*/5 * * * *', async () => {
      try {
        console.log('🔄 Running booking completion check...');

        // 1. Cari booking yang sudah selesai waktunya (Baris 50-55)
        const expiredBookings = await BookingService.findExpiredBookings();

        if (expiredBookings.length === 0) {
          console.log('✅ No expired bookings found');
          return;
        }

        console.log(`📋 Found ${expiredBookings.length} expired bookings to complete`);

        // 2. Process setiap booking yang expired (Baris 60-80)
        for (const booking of expiredBookings) {
          try {
            // Update status ke completed
            await BookingService.autoCompleteBooking(booking.id);

            // Kirim notifikasi ke customer
            await NotificationService.sendBookingCompletedNotification(booking);

            // Log activity
            console.log(`✅ Auto-completed booking ID: ${booking.id} for user: ${booking.user_id}`);

          } catch (error) {
            console.error(`❌ Failed to auto-complete booking ${booking.id}:`, error);
          }
        }

        console.log('🎉 Booking completion check finished');

      } catch (error) {
        console.error('❌ Cron job error:', error);
      }
    }, {
      scheduled: true,
      timezone: "Asia/Jakarta"  // Timezone Indonesia
    });

    console.log('✅ Booking completion cron job started (every 5 minutes)');
  }

  // Cron job untuk cleanup token expired (Baris 85-100)
  startTokenCleanupJob() {
    // Jalankan setiap hari jam 2 pagi: 0 2 * * *
    cron.schedule('0 2 * * *', async () => {
      try {
        console.log('🧹 Running token cleanup...');
        await PasswordReset.cleanupExpiredTokens();
        console.log('✅ Token cleanup completed');
      } catch (error) {
        console.error('❌ Token cleanup error:', error);
      }
    }, {
      scheduled: true,
      timezone: "Asia/Jakarta"
    });

    console.log('✅ Token cleanup cron job started (daily at 2 AM)');
  }
}

module.exports = new CronJobService();
```

#### B. Booking Service untuk Auto-Complete
**File:** `services/bookingService.js` (Baris 200-300)
```javascript
class BookingService {

  // Cari booking yang sudah expired (Baris 205-230)
  static async findExpiredBookings() {
    try {
      const query = `
        SELECT
          b.id,
          b.user_id,
          b.field_id,
          b.date,
          b.start_time,
          b.end_time,
          b.status,
          b.name as customer_name,
          u.name as user_name,
          u.email as user_email,
          f.name as field_name
        FROM bookings b
        JOIN users u ON b.user_id = u.id
        JOIN fields f ON b.field_id = f.id
        WHERE b.status = 'confirmed'
          AND CONCAT(b.date, ' ', b.end_time) < NOW()
          AND b.date >= CURRENT_DATE - INTERVAL 7 DAY
        ORDER BY b.date DESC, b.end_time DESC
      `;

      const result = await db.query(query);
      return result.rows;

    } catch (error) {
      console.error('Error finding expired bookings:', error);
      throw error;
    }
  }

  // Auto-complete booking yang sudah expired (Baris 235-280)
  static async autoCompleteBooking(bookingId) {
    const client = await db.getClient();

    try {
      await client.query('BEGIN');

      // 1. Update status booking ke completed (Baris 245-255)
      const updateQuery = `
        UPDATE bookings
        SET status = 'completed',
            updated_at = NOW()
        WHERE id = $1
          AND status = 'confirmed'
        RETURNING *
      `;

      const updateResult = await client.query(updateQuery, [bookingId]);

      if (updateResult.rows.length === 0) {
        throw new Error(`Booking ${bookingId} not found or already completed`);
      }

      const booking = updateResult.rows[0];

      // 2. Catat perubahan di booking history (Baris 260-270)
      const historyQuery = `
        INSERT INTO booking_history (
          booking_id,
          old_status,
          new_status,
          changed_by,
          reason,
          created_at
        ) VALUES ($1, $2, $3, $4, $5, NOW())
      `;

      await client.query(historyQuery, [
        bookingId,
        'confirmed',
        'completed',
        null, // System auto-complete, bukan user
        'Auto-completed by system after booking time ended'
      ]);

      // 3. Log audit trail (Baris 275-280)
      await this.logAuditTrail({
        action: 'AUTO_COMPLETE',
        table_name: 'bookings',
        record_id: bookingId,
        old_values: { status: 'confirmed' },
        new_values: { status: 'completed' },
        user_id: null, // System action
        ip_address: 'SYSTEM',
        user_agent: 'CRON_JOB'
      });

      await client.query('COMMIT');

      console.log(`✅ Booking ${bookingId} auto-completed successfully`);
      return booking;

    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`❌ Failed to auto-complete booking ${bookingId}:`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Log audit trail untuk system actions (Baris 285-300)
  static async logAuditTrail(auditData) {
    try {
      const query = `
        INSERT INTO audit_logs (
          user_id, action, table_name, record_id,
          old_values, new_values, ip_address, user_agent, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      `;

      await db.query(query, [
        auditData.user_id,
        auditData.action,
        auditData.table_name,
        auditData.record_id,
        JSON.stringify(auditData.old_values),
        JSON.stringify(auditData.new_values),
        auditData.ip_address,
        auditData.user_agent
      ]);

    } catch (error) {
      console.error('Error logging audit trail:', error);
      // Jangan throw error, karena ini hanya logging
    }
  }
}
```

#### C. Notification Service untuk Auto-Complete
**File:** `services/notificationService.js` (Baris 150-220)
```javascript
class NotificationService {

  // Kirim notifikasi booking completed (Baris 155-190)
  static async sendBookingCompletedNotification(booking) {
    try {
      // 1. Buat notifikasi di database (Baris 160-175)
      const notificationData = {
        user_id: booking.user_id,
        title: 'Booking Selesai',
        message: `Booking Anda di ${booking.field_name} pada ${booking.date} ${booking.start_time}-${booking.end_time} telah selesai. Terima kasih telah menggunakan Panam Soccer Field!`,
        type: 'booking',
        data: {
          booking_id: booking.id,
          field_name: booking.field_name,
          date: booking.date,
          start_time: booking.start_time,
          end_time: booking.end_time,
          status: 'completed',
          auto_completed: true
        }
      };

      await this.createNotification(notificationData);

      // 2. Kirim email notification (opsional) (Baris 180-190)
      if (booking.user_email) {
        await this.sendBookingCompletedEmail({
          to: booking.user_email,
          name: booking.user_name,
          booking: booking
        });
      }

      console.log(`✅ Notification sent for completed booking ${booking.id}`);

    } catch (error) {
      console.error(`❌ Failed to send notification for booking ${booking.id}:`, error);
      // Jangan throw error, karena ini tidak critical
    }
  }

  // Kirim email booking completed (Baris 195-220)
  static async sendBookingCompletedEmail({ to, name, booking }) {
    try {
      const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1F2937; color: white; padding: 20px; text-align: center;">
            <h1>🏟️ Panam Soccer Field</h1>
            <p>Booking Completed</p>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2>Halo ${name}!</h2>
            <p>Booking Anda telah selesai dengan detail berikut:</p>

            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>📋 Detail Booking</h3>
              <p><strong>Lapangan:</strong> ${booking.field_name}</p>
              <p><strong>Tanggal:</strong> ${booking.date}</p>
              <p><strong>Waktu:</strong> ${booking.start_time} - ${booking.end_time}</p>
              <p><strong>Status:</strong> Selesai</p>
            </div>

            <p>Terima kasih telah menggunakan layanan kami!</p>
            <p>Kami berharap Anda puas dengan pengalaman bermain di Panam Soccer Field.</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/customer/bookings"
                 style="background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                Lihat Riwayat Booking
              </a>
            </div>
          </div>
        </div>
      `;

      await emailService.sendEmail({
        to: to,
        subject: '✅ Booking Selesai - Panam Soccer Field',
        html: emailContent
      });

    } catch (error) {
      console.error('Error sending booking completed email:', error);
    }
  }
}
```

#### D. Server Initialization
**File:** `server.js` atau `app.js` (Baris 50-60)
```javascript
// Import dan start cron jobs (Baris 50-60)
const cronJobs = require('./services/cronJobs');

// Inisialisasi server
const app = express();

// ... middleware dan routes setup ...

// Start cron jobs setelah server ready
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);

  // Start cron jobs
  console.log('🕐 Starting cron jobs...');
  // cronJobs sudah auto-initialize saat di-require

  console.log('✅ Server and cron jobs are ready');
});
```

### 🎨 Frontend Implementation

#### A. Real-time Status Update
**File:** `booking-futsal-frontend/src/hooks/useBookingStatus.js` (Baris 15-80)
```javascript
import { useState, useEffect } from 'react';
import { bookingAPI } from '../api/bookingAPI';

// Hook untuk monitor status booking real-time (Baris 20-80)
export const useBookingStatus = (bookingId, refreshInterval = 30000) => {
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch booking status (Baris 30-50)
  const fetchBookingStatus = async () => {
    try {
      const response = await bookingAPI.getBookingById(bookingId);
      if (response.data.success) {
        const bookingData = response.data.data;

        // Cek apakah status berubah
        if (booking && booking.status !== bookingData.status) {
          console.log(`📊 Booking ${bookingId} status changed: ${booking.status} → ${bookingData.status}`);

          // Tampilkan notifikasi jika auto-completed
          if (bookingData.status === 'completed' && booking.status === 'confirmed') {
            showAutoCompleteNotification(bookingData);
          }
        }

        setBooking(bookingData);
      }
    } catch (error) {
      console.error('Error fetching booking status:', error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  // Tampilkan notifikasi auto-complete (Baris 55-65)
  const showAutoCompleteNotification = (bookingData) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Booking Selesai', {
        body: `Booking Anda di ${bookingData.field_name} telah selesai`,
        icon: '/favicon.ico'
      });
    }
  };

  // Setup polling untuk real-time update (Baris 70-80)
  useEffect(() => {
    fetchBookingStatus();

    const interval = setInterval(fetchBookingStatus, refreshInterval);

    return () => clearInterval(interval);
  }, [bookingId, refreshInterval]);

  return { booking, loading, error, refetch: fetchBookingStatus };
};
```

#### B. Booking Status Component
**File:** `booking-futsal-frontend/src/components/BookingStatusBadge.jsx` (Baris 10-60)
```javascript
import React from 'react';

// Component untuk menampilkan status booking dengan auto-update (Baris 15-60)
const BookingStatusBadge = ({ booking, showAutoCompleteInfo = false }) => {

  // Tentukan style berdasarkan status (Baris 20-35)
  const getStatusStyle = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Tentukan label status (Baris 40-50)
  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Menunggu Konfirmasi';
      case 'confirmed': return 'Dikonfirmasi';
      case 'completed': return 'Selesai';
      case 'cancelled': return 'Dibatalkan';
      default: return status;
    }
  };

  // Cek apakah booking akan auto-complete (Baris 55-60)
  const isNearCompletion = () => {
    if (booking.status !== 'confirmed') return false;

    const endTime = new Date(`${booking.date} ${booking.end_time}`);
    const now = new Date();
    const timeDiff = endTime - now;

    // Jika kurang dari 30 menit lagi
    return timeDiff > 0 && timeDiff < 30 * 60 * 1000;
  };

  return (
    <div className="flex flex-col space-y-2">
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusStyle(booking.status)}`}>
        {getStatusLabel(booking.status)}
      </span>

      {/* Info auto-complete */}
      {showAutoCompleteInfo && isNearCompletion() && (
        <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
          ⏰ Booking akan otomatis selesai setelah waktu berakhir
        </div>
      )}

      {/* Info jika sudah auto-completed */}
      {booking.status === 'completed' && booking.auto_completed && (
        <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
          ✅ Otomatis diselesaikan oleh sistem
        </div>
      )}
    </div>
  );
};

export default BookingStatusBadge;
```

#### C. Customer Booking List dengan Auto-Update
**File:** `booking-futsal-frontend/src/pages/customer/BookingList.jsx` (Baris 100-150)
```javascript
// Dalam component BookingList (Baris 100-150)
const BookingList = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch bookings dengan auto-refresh (Baris 110-130)
  const fetchBookings = async () => {
    try {
      const response = await bookingAPI.getCustomerBookings();
      if (response.data.success) {
        setBookings(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Setup auto-refresh setiap 1 menit (Baris 135-145)
  useEffect(() => {
    fetchBookings();

    // Auto-refresh untuk update status real-time
    const interval = setInterval(fetchBookings, 60000); // 1 menit

    return () => clearInterval(interval);
  }, []);

  // Render booking list (Baris 150+)
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Riwayat Booking</h2>
        <button
          onClick={fetchBookings}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          🔄 Refresh
        </button>
      </div>

      {bookings.map(booking => (
        <div key={booking.id} className="bg-white p-6 rounded-lg shadow border">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">{booking.field_name}</h3>
              <p className="text-gray-600">{booking.date} • {booking.start_time} - {booking.end_time}</p>
            </div>

            <BookingStatusBadge
              booking={booking}
              showAutoCompleteInfo={true}
            />
          </div>

          {/* Countdown untuk booking yang sedang berlangsung */}
          {booking.status === 'confirmed' && (
            <BookingCountdown booking={booking} />
          )}
        </div>
      ))}
    </div>
  );
};
```

### ⚙️ Configuration & Environment

#### A. Package Dependencies
**File:** `package.json` (Dependencies yang diperlukan)
```json
{
  "dependencies": {
    "node-cron": "^3.0.2",
    "moment-timezone": "^0.5.43"
  }
}
```

#### B. Environment Variables
**File:** `.env` (Konfigurasi timezone dan interval)
```env
# Cron job configuration
CRON_TIMEZONE=Asia/Jakarta
BOOKING_CHECK_INTERVAL=*/5 * * * *  # Setiap 5 menit
TOKEN_CLEANUP_INTERVAL=0 2 * * *    # Setiap hari jam 2 pagi

# Notification settings
ENABLE_AUTO_COMPLETE_NOTIFICATIONS=true
ENABLE_EMAIL_NOTIFICATIONS=true
```

### 🔄 Alur Lengkap Auto-Complete:

1. **Booking Confirmed** → Status: `confirmed`
2. **Cron Job Running** → Setiap 5 menit cek database
3. **Query Expired Bookings** → `CONCAT(date, ' ', end_time) < NOW()`
4. **Auto-Complete Process:**
   - Update status: `confirmed` → `completed`
   - Insert booking_history record
   - Log audit trail
   - Send notification to customer
5. **Frontend Update** → Real-time polling mendeteksi perubahan status
6. **User Notification** → In-app notification + email (opsional)

### 🎯 Keunggulan Sistem:

- ✅ **Otomatis** - Tidak perlu intervensi manual
- ✅ **Real-time** - Update status langsung terdeteksi frontend
- ✅ **Audit Trail** - Semua perubahan tercatat
- ✅ **Notification** - User mendapat pemberitahuan
- ✅ **Timezone Aware** - Menggunakan timezone Indonesia
- ✅ **Error Handling** - Robust error handling dan logging
- ✅ **Performance** - Efficient query dengan index pada date/time

## 🔗 5. INTEGRASI FRONTEND & BACKEND

### 🎯 Arsitektur Integrasi
```
Frontend (React + Vite) ←→ HTTP/HTTPS ←→ Backend (Node.js + Express) ←→ Database (PostgreSQL)
     ↓                                           ↓                           ↓
- Axios HTTP Client                    - REST API Endpoints              - SQL Queries
- State Management                     - Middleware Auth                 - Data Models
- Component Rendering                  - CORS Configuration              - Relationships
- User Interface                       - JSON Responses                  - Transactions
```

### 📂 Backend API Configuration

#### A. CORS Setup untuk Frontend
**File:** `app.js` atau `server.js` (Baris 25-50)
```javascript
const cors = require('cors');

// CORS configuration untuk integrasi frontend (Baris 30-50)
const corsOptions = {
  origin: [
    'http://localhost:3000',                                    // Development frontend
    'https://booking-futsal-frontend.vercel.app',              // Production frontend
    'https://booking-futsal-production.up.railway.app'         // Backend URL (untuk testing)
  ],
  credentials: true,                    // Allow cookies untuk authentication
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Cookie',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  exposedHeaders: ['Set-Cookie'],       // Expose cookie headers
  optionsSuccessStatus: 200             // Support legacy browsers
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

console.log('✅ CORS configured for frontend integration');
```

#### B. JSON Response Format Standardization
**File:** `middlewares/responseFormatter.js` (Baris 10-60)
```javascript
// Middleware untuk format response yang konsisten (Baris 15-60)
const responseFormatter = (req, res, next) => {

  // Success response helper (Baris 20-30)
  res.success = (data, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
      success: true,
      message: message,
      data: data,
      timestamp: new Date().toISOString(),
      path: req.originalUrl
    });
  };

  // Error response helper (Baris 35-45)
  res.error = (error, message = 'Error', statusCode = 500) => {
    return res.status(statusCode).json({
      success: false,
      error: error,
      message: message,
      timestamp: new Date().toISOString(),
      path: req.originalUrl
    });
  };

  // Paginated response helper (Baris 50-60)
  res.paginated = (data, pagination, message = 'Success') => {
    return res.status(200).json({
      success: true,
      message: message,
      data: data,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages: Math.ceil(pagination.total / pagination.limit),
        hasNext: pagination.page < Math.ceil(pagination.total / pagination.limit),
        hasPrev: pagination.page > 1
      },
      timestamp: new Date().toISOString(),
      path: req.originalUrl
    });
  };

  next();
};

module.exports = responseFormatter;
```

#### C. API Endpoints dengan Consistent Response
**File:** `controllers/customer/customerController.js` (Baris 50-100)
```javascript
// Contoh controller dengan format response konsisten (Baris 55-100)
const getCustomerBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Query dengan pagination (Baris 65-75)
    const bookingsQuery = `
      SELECT
        b.id, b.date, b.start_time, b.end_time, b.status, b.total_price,
        b.name as customer_name, b.phone, b.notes, b.created_at,
        f.name as field_name, f.type as field_type, f.location
      FROM bookings b
      JOIN fields f ON b.field_id = f.id
      WHERE b.user_id = $1
      ORDER BY b.date DESC, b.start_time DESC
      LIMIT $2 OFFSET $3
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM bookings
      WHERE user_id = $1
    `;

    // Execute queries (Baris 80-90)
    const [bookingsResult, countResult] = await Promise.all([
      db.query(bookingsQuery, [userId, limit, offset]),
      db.query(countQuery, [userId])
    ]);

    const bookings = bookingsResult.rows;
    const total = parseInt(countResult.rows[0].total);

    // Return paginated response (Baris 95-100)
    return res.paginated(bookings, {
      page,
      limit,
      total
    }, 'Customer bookings retrieved successfully');

  } catch (error) {
    console.error('Get customer bookings error:', error);
    return res.error(
      'Failed to retrieve bookings',
      'Internal server error',
      500
    );
  }
};
```

### 🎨 Frontend API Integration

#### A. Axios Instance Configuration
**File:** `booking-futsal-frontend/src/api/axiosConfig.js` (Baris 10-80)
```javascript
import axios from 'axios';

// Base URL configuration (Baris 15-25)
const getBaseURL = () => {
  if (import.meta.env.MODE === 'production') {
    return 'https://booking-futsal-production.up.railway.app/api';
  } else {
    return 'http://localhost:5000/api';
  }
};

// Create axios instance dengan konfigurasi (Baris 30-50)
const axiosInstance = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000,                    // 30 detik timeout
  withCredentials: true,             // Include cookies untuk authentication
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  }
});

// Request interceptor untuk logging dan auth (Baris 55-70)
axiosInstance.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);

    // Add timestamp untuk debugging
    config.metadata = { startTime: new Date() };

    // Add auth token jika ada
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

// Response interceptor untuk error handling (Baris 75-120)
axiosInstance.interceptors.response.use(
  (response) => {
    // Log response time
    const endTime = new Date();
    const duration = endTime - response.config.metadata.startTime;
    console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} (${duration}ms)`);

    return response;
  },
  (error) => {
    const endTime = new Date();
    const duration = error.config?.metadata ? endTime - error.config.metadata.startTime : 0;

    console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url} (${duration}ms)`, {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });

    // Handle specific error cases (Baris 95-120)
    if (error.response?.status === 401) {
      console.log('🔐 Unauthorized - redirecting to login');
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      console.log('🚫 Forbidden - insufficient permissions');
    } else if (error.response?.status === 404) {
      console.log('🔍 Not Found - resource does not exist');
    } else if (error.response?.status >= 500) {
      console.log('🔥 Server Error - backend issue');
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
```

#### B. API Service Layer
**File:** `booking-futsal-frontend/src/api/bookingAPI.js` (Baris 10-120)
```javascript
import axiosInstance from './axiosConfig';

// Booking API service dengan error handling (Baris 15-120)
export const bookingAPI = {

  // Get customer bookings dengan pagination (Baris 20-35)
  getCustomerBookings: async (params = {}) => {
    try {
      const { page = 1, limit = 10, status, date_from, date_to } = params;

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(status && { status }),
        ...(date_from && { date_from }),
        ...(date_to && { date_to })
      });

      const response = await axiosInstance.get(`/customer/bookings?${queryParams}`);
      return response;
    } catch (error) {
      console.error('❌ Get customer bookings error:', error);
      throw error;
    }
  },

  // Create new booking (Baris 40-60)
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

      // Handle validation errors
      if (error.response?.status === 400) {
        const errorMessage = error.response.data.error || 'Validation error';
        throw new Error(errorMessage);
      }

      throw error;
    }
  },

  // Get booking by ID (Baris 65-80)
  getBookingById: async (bookingId) => {
    try {
      const response = await axiosInstance.get(`/customer/bookings/${bookingId}`);
      return response;
    } catch (error) {
      console.error(`❌ Get booking ${bookingId} error:`, error);
      throw error;
    }
  },

  // Cancel booking (Baris 85-105)
  cancelBooking: async (bookingId, reason = '') => {
    try {
      console.log(`🚫 Cancelling booking ${bookingId}:`, reason);

      const response = await axiosInstance.put(`/customer/bookings/${bookingId}/cancel`, {
        reason
      });

      if (response.data.success) {
        console.log('✅ Booking cancelled successfully');
      }

      return response;
    } catch (error) {
      console.error(`❌ Cancel booking ${bookingId} error:`, error);
      throw error;
    }
  },

  // Get customer dashboard data (Baris 110-120)
  getDashboardData: async () => {
    try {
      const response = await axiosInstance.get('/customer/dashboard');
      return response;
    } catch (error) {
      console.error('❌ Get dashboard data error:', error);
      throw error;
    }
  }
};
```

#### C. React Hook untuk API Integration
**File:** `booking-futsal-frontend/src/hooks/useAPI.js` (Baris 10-100)
```javascript
import { useState, useEffect, useCallback } from 'react';

// Custom hook untuk API calls dengan loading dan error state (Baris 15-100)
export const useAPI = (apiFunction, dependencies = [], options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const {
    immediate = true,           // Langsung fetch saat mount
    onSuccess,                  // Callback saat success
    onError                     // Callback saat error
  } = options;

  // Execute API call (Baris 25-50)
  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Executing API call...');
      const response = await apiFunction(...args);

      if (response.data.success) {
        setData(response.data.data);
        console.log('✅ API call successful');

        if (onSuccess) {
          onSuccess(response.data.data);
        }
      } else {
        throw new Error(response.data.error || 'API call failed');
      }

    } catch (err) {
      console.error('❌ API call error:', err);
      setError(err.message || 'An error occurred');

      if (onError) {
        onError(err);
      }
    } finally {
      setLoading(false);
    }
  }, [apiFunction, onSuccess, onError]);

  // Auto-execute on mount atau dependency change (Baris 55-65)
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, dependencies);

  // Retry function (Baris 70-75)
  const retry = useCallback(() => {
    execute();
  }, [execute]);

  // Reset function (Baris 80-85)
  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    retry,
    reset
  };
};

// Hook khusus untuk paginated data (Baris 90-100)
export const usePaginatedAPI = (apiFunction, initialParams = {}) => {
  const [params, setParams] = useState({ page: 1, limit: 10, ...initialParams });
  const [allData, setAllData] = useState([]);
  const [pagination, setPagination] = useState(null);

  const { data, loading, error, execute } = useAPI(
    () => apiFunction(params),
    [params],
    {
      onSuccess: (response) => {
        if (params.page === 1) {
          setAllData(response.data || []);
        } else {
          setAllData(prev => [...prev, ...(response.data || [])]);
        }
        setPagination(response.pagination);
      }
    }
  );

  const loadMore = useCallback(() => {
    if (pagination && pagination.hasNext) {
      setParams(prev => ({ ...prev, page: prev.page + 1 }));
    }
  }, [pagination]);

  const refresh = useCallback(() => {
    setParams(prev => ({ ...prev, page: 1 }));
    setAllData([]);
  }, []);

  return {
    data: allData,
    pagination,
    loading,
    error,
    loadMore,
    refresh,
    setParams
  };
};
```

### 🔄 Data Flow Integration

#### A. Component dengan API Integration
**File:** `booking-futsal-frontend/src/pages/customer/BookingList.jsx` (Baris 20-120)
```javascript
import React, { useState, useEffect } from 'react';
import { bookingAPI } from '../../api/bookingAPI';
import { useAPI } from '../../hooks/useAPI';
import BookingCard from '../../components/BookingCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';

// Component dengan full API integration (Baris 30-120)
const BookingList = () => {
  const [filters, setFilters] = useState({
    status: '',
    date_from: '',
    date_to: ''
  });

  // Use custom hook untuk API call (Baris 40-50)
  const {
    data: bookings,
    loading,
    error,
    execute: fetchBookings,
    retry
  } = useAPI(
    () => bookingAPI.getCustomerBookings(filters),
    [filters],
    {
      onSuccess: (data) => {
        console.log(`📋 Loaded ${data.length} bookings`);
      },
      onError: (error) => {
        console.error('Failed to load bookings:', error);
      }
    }
  );

  // Handle filter change (Baris 55-65)
  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Handle booking action (Baris 70-90)
  const handleCancelBooking = async (bookingId, reason) => {
    try {
      await bookingAPI.cancelBooking(bookingId, reason);

      // Refresh data setelah cancel
      fetchBookings();

      // Show success message
      alert('Booking berhasil dibatalkan');

    } catch (error) {
      console.error('Cancel booking error:', error);
      alert('Gagal membatalkan booking: ' + error.message);
    }
  };

  // Render loading state (Baris 95-100)
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <LoadingSpinner />
        <span className="ml-2">Memuat data booking...</span>
      </div>
    );
  }

  // Render error state (Baris 105-115)
  if (error) {
    return (
      <ErrorMessage
        message={error}
        onRetry={retry}
        retryText="Coba Lagi"
      />
    );
  }

  // Render booking list (Baris 120+)
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Riwayat Booking</h1>
        <button
          onClick={fetchBookings}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Filter Section */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange({ status: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="">Semua Status</option>
            <option value="pending">Menunggu</option>
            <option value="confirmed">Dikonfirmasi</option>
            <option value="completed">Selesai</option>
            <option value="cancelled">Dibatalkan</option>
          </select>

          <input
            type="date"
            value={filters.date_from}
            onChange={(e) => handleFilterChange({ date_from: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2"
            placeholder="Dari Tanggal"
          />

          <input
            type="date"
            value={filters.date_to}
            onChange={(e) => handleFilterChange({ date_to: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2"
            placeholder="Sampai Tanggal"
          />
        </div>
      </div>

      {/* Booking Cards */}
      <div className="space-y-4">
        {bookings && bookings.length > 0 ? (
          bookings.map(booking => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onCancel={handleCancelBooking}
            />
          ))
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p>Tidak ada booking ditemukan</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingList;
```

### 🔐 Authentication Integration

#### A. Auth Context dengan API Integration
**File:** `booking-futsal-frontend/src/contexts/AuthContext.jsx` (Baris 50-150)
```javascript
// Auth context dengan full backend integration (Baris 55-150)
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status saat app load (Baris 65-85)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Cek apakah ada token di cookie (via API call)
        const response = await axiosInstance.get('/auth/profile');

        if (response.data.success) {
          setUser(response.data.data);
          console.log('✅ User authenticated:', response.data.data.role);
        }
      } catch (error) {
        console.log('❌ Not authenticated');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function dengan backend integration (Baris 90-115)
  const login = async (credentials) => {
    try {
      setLoading(true);

      const response = await axiosInstance.post('/auth/login', credentials);

      if (response.data.success) {
        setUser(response.data.user);
        console.log('✅ Login successful:', response.data.user.role);
        return { success: true, user: response.data.user };
      }

    } catch (error) {
      console.error('❌ Login error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed'
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout function (Baris 120-135)
  const logout = async () => {
    try {
      await axiosInstance.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      window.location.href = '/login';
    }
  };

  // Context value (Baris 140-150)
  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    hasRole: (role) => user?.role === role,
    hasMinimumRole: (minRole) => {
      const roles = ['pengunjung', 'penyewa', 'staff_kasir', 'operator_lapangan', 'manajer_futsal', 'supervisor_sistem'];
      const userLevel = roles.indexOf(user?.role);
      const minLevel = roles.indexOf(minRole);
      return userLevel >= minLevel;
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
```

### 🌐 Environment Configuration

#### A. Frontend Environment Variables
**File:** `booking-futsal-frontend/.env.production`
```env
# Production API URL
VITE_API_BASE_URL=https://booking-futsal-production.up.railway.app/api

# App configuration
VITE_APP_NAME=Panam Soccer Field
VITE_APP_VERSION=2.0.0

# Feature flags
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_REAL_TIME_UPDATES=true
```

**File:** `booking-futsal-frontend/.env.development`
```env
# Development API URL
VITE_API_BASE_URL=http://localhost:5000/api

# Debug settings
VITE_DEBUG_API=true
VITE_DEBUG_AUTH=true
```

#### B. Backend Environment Variables
**File:** `booking_futsal/.env`
```env
# Database
DATABASE_URL=postgresql://username:password@host:port/database

# CORS Origins
FRONTEND_URL=https://booking-futsal-frontend.vercel.app
CORS_ORIGINS=http://localhost:3000,https://booking-futsal-frontend.vercel.app

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=24h

# Server
PORT=5000
NODE_ENV=production
```

### 🔄 Real-time Integration

#### A. Polling untuk Real-time Updates
**File:** `booking-futsal-frontend/src/hooks/useRealTimeData.js` (Baris 10-80)
```javascript
import { useState, useEffect, useRef } from 'react';

// Hook untuk real-time data updates (Baris 15-80)
export const useRealTimeData = (apiFunction, interval = 30000, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  // Fetch data function (Baris 25-45)
  const fetchData = async () => {
    try {
      const response = await apiFunction();

      if (response.data.success) {
        setData(response.data.data);
        setError(null);
      }
    } catch (err) {
      console.error('Real-time data fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Setup polling (Baris 50-70)
  useEffect(() => {
    // Initial fetch
    fetchData();

    // Setup interval
    intervalRef.current = setInterval(fetchData, interval);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, dependencies);

  // Manual refresh (Baris 75-80)
  const refresh = () => {
    fetchData();
  };

  return { data, loading, error, refresh };
};
```

### 🎯 Integration Best Practices

#### 1. **Error Handling Strategy**
- ✅ Consistent error format dari backend
- ✅ Global error interceptor di frontend
- ✅ User-friendly error messages
- ✅ Retry mechanisms untuk network errors

#### 2. **Performance Optimization**
- ✅ Request/Response compression
- ✅ Caching strategies
- ✅ Pagination untuk large datasets
- ✅ Debouncing untuk search/filter

#### 3. **Security Integration**
- ✅ CORS properly configured
- ✅ JWT tokens dengan HttpOnly cookies
- ✅ Request validation di backend
- ✅ XSS protection di frontend

#### 4. **Development Workflow**
- ✅ Environment-specific configurations
- ✅ API documentation dengan Swagger
- ✅ Consistent logging
- ✅ Error monitoring

**🎉 Semua aspek integrasi frontend-backend sudah dijelaskan lengkap dengan implementasi detail dan best practices!**
