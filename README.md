# Enhanced Futsal Booking System - Backend

Backend API untuk sistem pemesanan lapangan futsal dengan enhanced role-based architecture, dibangun menggunakan Node.js, Express.js, dan PostgreSQL.

## 📋 Documentation

- **📚 [API Documentation](docs/API_DOCUMENTATION.md)** - Complete API endpoints and examples
- **🚀 [Deployment Guide](docs/DEPLOYMENT.md)** - Development and production deployment
- **🤝 [Contributing Guidelines](CONTRIBUTING.md)** - How to contribute to the project

## 🏗️ Architecture Overview

Sistem ini menggunakan **Enhanced Role-Based Architecture** dengan 6 level roles dan clean code structure yang telah direfactor untuk production-ready deployment.

### Enhanced Role System (6 Roles)

1. **pengunjung** (Level 1) - Guest access, view public fields
2. **penyewa** (Level 2) - Customer access, create bookings, manage profile
3. **staff_kasir** (Level 3) - Payment processing, cash management
4. **operator_lapangan** (Level 4) - Field operations, booking confirmation
5. **manajer_futsal** (Level 5) - Business management, analytics, user management
6. **supervisor_sistem** (Level 6) - Full system access, system administration

### Project Structure

```
booking_futsal/
├── models/              # Database models (clean, refactored)
├── controllers/         # Role-based controllers
│   ├── customer/       # Penyewa access
│   ├── staff/          # Staff access (kasir, operator, manager, supervisor)
│   ├── public/         # Guest access
│   └── admin/          # Role management
├── middlewares/        # Authentication & authorization
├── routes/             # API routes structure
├── utils/              # Helper functions
├── config/             # Database configuration
├── database/           # SQL scripts & documentation
└── postman/            # API testing collection
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation

1. **Clone repository:**

   ```bash
   git clone https://github.com/arigumilang-uin/booking-futsal.git
   cd booking_futsal
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Setup environment variables:**

   Create `.env.development` for local development:

   ```env
   NODE_ENV=development
   PORT=5000
   DATABASE_URL=postgresql://username:password@localhost:5432/futsal_booking_dev
   JWT_SECRET=your-super-secret-jwt-key-for-development
   ```

   Create `.env.production` for production deployment:

   ```env
   NODE_ENV=production
   PORT=5000
   DATABASE_URL=your-production-database-url
   JWT_SECRET=your-super-secret-jwt-key-for-production
   ```

4. **Setup database:**

   ```bash
   # Run database migrations (check database/ folder for SQL scripts)
   # Import schema and initial data as needed
   ```

5. **Start the server:**

   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm run prod

   # Default start
   npm start
   ```

## 🌍 Environment Configuration

### Development Environment

- **Database:** Local PostgreSQL
- **Port:** 5000 (configurable)
- **Environment:** `.env.development`
- **Features:** Hot reload, detailed logging

### Production Environment

- **Database:** Railway PostgreSQL (or your production DB)
- **Port:** Process.env.PORT or 5000
- **Environment:** `.env.production`
- **Features:** Optimized for performance, security headers

## 📚 API Documentation

Complete API documentation with all endpoints, authentication, and examples.

**� [View Full API Documentation](docs/API_DOCUMENTATION.md)**

### Quick Reference

- **Base URL:** `http://localhost:5000/api` (development)
- **Authentication:** JWT Bearer token required for protected endpoints
- **Role-based Access:** 6-level hierarchical role system
- **Response Format:** JSON with consistent error handling

### Key Endpoint Categories

- **🔓 Public Access** - Guest users, no authentication required
- **🔐 Authentication** - Login, registration, profile management
- **👤 Customer (penyewa)** - Booking management, field browsing
- **💰 Staff Kasir** - Payment processing, cash management
- **⚽ Staff Operator** - Field operations, booking confirmation
- **📊 Staff Manager** - Business management, analytics
- **🔧 Staff Supervisor** - System administration, audit logs
- **👥 Admin** - Role management, user administration

## 🗄️ Database

### Database Schema

- **Users:** Enhanced with role system and employee data
- **Fields:** Field management with operator assignment
- **Bookings:** Auto-completion system, conflict detection
- **Payments:** Payment gateway integration, manual processing
- **Role Management:** Role change requests and audit trails

### Key Features

- **Auto-completion:** Bookings automatically completed after end time
- **Conflict Detection:** Prevents double booking
- **Role-based Access:** Granular permissions per role
- **Audit Trail:** Track all role changes and important actions
- **Payment Integration:** Ready for payment gateway integration

## 🔒 Security Features

- **JWT Authentication:** Secure token-based authentication
- **Role-based Authorization:** Granular access control
- **Rate Limiting:** API rate limiting per endpoint type
- **Input Validation:** XSS and SQL injection protection
- **Security Headers:** Helmet.js security headers
- **CORS Configuration:** Configurable CORS policies

## 🧪 Testing

### Postman Collection

Complete Postman collection available in `/postman` folder:

- **Collection:** Enhanced_Futsal_Booking_System.postman_collection.json
- **Development Environment:** Development.postman_environment.json
- **Production Environment:** Production.postman_environment.json
- **Testing Guide:** TESTING_GUIDE.md

### Running Tests

```bash
# Import Postman collection and environments
# Follow testing guide in postman/TESTING_GUIDE.md
```

## 📦 Deployment

Comprehensive deployment guide for both development and production environments.

**🚀 [View Full Deployment Guide](docs/DEPLOYMENT.md)**

### Quick Start

**Development:**

```bash
# Setup environment
cp .env.example .env.development
# Configure database and start
npm run dev
```

**Production:**

```bash
# Deploy to Railway (recommended)
railway up
# Or deploy to your preferred platform
```

### Supported Platforms

- **Railway** (Recommended) - Easy PostgreSQL integration
- **Heroku** - Classic PaaS with PostgreSQL addon
- **VPS/Cloud** - Full control with PM2 process management

## 🤝 Contributing

1. Follow the established clean code style (minimal comments, professional structure)
2. Maintain 100% functionality - no breaking changes
3. Use role-based architecture patterns
4. Test thoroughly before submitting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 Enhanced Futsal Booking System

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 📞 Support

For technical support, bug reports, or feature requests, please use one of the following channels:

### 🐛 Issue Reporting

- **GitHub Issues:** [Create an issue](https://github.com/arigumilang-uin/booking-futsal/issues)
- **Bug Reports:** Please include system information, error logs, and steps to reproduce

### 💬 Community Support

- **Discussions:** [GitHub Discussions](https://github.com/arigumilang-uin/booking-futsal/discussions)
- **Documentation:** Check our comprehensive documentation above

### 📧 Direct Contact

For enterprise support or private inquiries:

- **Technical Support:** technical@futsalbooking.com

  - System issues, API problems, deployment assistance
  - Response time: 24-48 hours

- **Business Inquiries:** admin@futsalbooking.com

  - Enterprise licensing, custom development, partnerships
  - Response time: 48-72 hours

- **General Support:** support@futsalbooking.com
  - General questions, feature requests, documentation feedback
  - Response time: 24-48 hours

### 🚀 Contributing

We welcome contributions! Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting pull requests.

---

**Made with ❤️ for the futsal community**
