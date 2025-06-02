# 🏟️ Futsal Booking System

Sistem pemesanan lapangan futsal lengkap dengan role-based access control, payment processing, dan analytics dashboard. Dibangun dengan arsitektur modern untuk mendukung operasional futsal center yang efisien.

Sistem ini menyediakan platform terintegrasi untuk customer booking, staff operations, dan business management dengan 6 level role hierarchy yang komprehensif. Backend API production-ready dengan enhanced features seperti auto-completion booking, audit trail, dan notification system.

## 🛠️ Tech Stack

**Backend:**

- Node.js + Express.js
- PostgreSQL (Railway)
- JWT Authentication
- Role-based Authorization

**Frontend:**

- Vite + React + Tailwind CSS
- Vercel Deployment
- Responsive Design
- Real-time Updates

## ⚡ Quick Start

### Prerequisites

- Node.js (v16+)
- PostgreSQL (v12+)

### Development Setup

```bash
# Clone repository
git clone https://github.com/arigumilang-uin/booking-futsal.git
cd booking_futsal

# Install dependencies
npm install

# Setup environment
cp .env.example .env.development
# Configure DATABASE_URL and JWT_SECRET

# Start development server
npm run dev
```

## 🌐 Deployment

**Backend (Production):**

- Platform: Railway
- URL: https://booking-futsal-production.up.railway.app
- Database: PostgreSQL on Railway

**Frontend (Planned):**

- Platform: Vercel
- Framework: Vite + React + Tailwind CSS

## 👥 Role Hierarchy

1. **pengunjung** - Guest access, browse fields
2. **penyewa** - Customer booking, profile management
3. **staff_kasir** - Payment processing, cash management
4. **operator_lapangan** - Field operations, booking confirmation
5. **manajer_futsal** - Business analytics, staff management
6. **supervisor_sistem** - Full system administration

## 🎯 Key Features

**Customer Features:**

- Field browsing dan real-time availability
- Online booking dengan conflict detection
- Payment processing dan history
- Notification system dan favorites
- Review dan rating system

**Staff Operations:**

- Role-based dashboards (Kasir, Operator, Manager, Supervisor)
- Payment processing dan confirmation
- Field operations management
- Business analytics dan reporting
- User management dan audit trail

**System Features:**

- Auto-completion booking system
- Comprehensive audit trail
- Multi-channel notifications
- Promotion management
- Performance analytics

## 🗄️ Database Schema

**Core Tables:**

- `users` - User management dengan role hierarchy
- `fields` - Field information dengan facilities dan pricing
- `bookings` - Booking lifecycle dengan auto-completion
- `payments` - Payment processing dengan multiple methods
- `notifications` - Multi-channel notification system
- `audit_logs` - Complete system audit trail

**Enhanced Features:**

- `promotions` - Discount dan promotion management
- `user_favorites` - Customer favorite fields
- `field_reviews` - Rating dan review system
- `role_change_requests` - Role management workflow

## 📚 API Documentation

**Base URL:** `https://booking-futsal-production.up.railway.app/api`

**Authentication:** JWT token dengan HttpOnly cookies

**Endpoint Categories:**

- 🔓 **Public** - Guest access (field browsing, system info)
- 🔐 **Auth** - Login, register, profile management
- 👤 **Customer** - Booking management, favorites, reviews
- �‍💼 **Staff** - Role-based operations (kasir, operator, manager, supervisor)
- � **Admin** - User management, system settings, audit logs

## 📖 Developer Documentation

**Complete Documentation:**

- 📋 **[API Endpoints Information](docs/API_ENDPOINTS_INFORMATION.md)** - Complete API reference
- 🏗️ **[Backend System Information](docs/BACKEND_SYSTEM_INFORMATION.md)** - Business logic dan architecture
- 👥 **[Frontend Task Division](docs/FRONTEND_DEVELOPMENT_TASK_DIVISION.md)** - Frontend development guide
- 💬 **[Frontend Developer Commands](docs/FRONTEND_DEVELOPER_COMMANDS.md)** - Ready-to-use prompts

**Frontend Development:**

- Framework: Vite + React + Tailwind CSS
- Deployment: Vercel
- Task division untuk 2 developers (Core Features & Management Interface)
- 28 ready-to-use commands untuk Augment AI integration

## 🔒 Security & Performance

**Security Features:**

- JWT authentication dengan HttpOnly cookies
- Role-based authorization (6-level hierarchy)
- Input validation dan XSS protection
- Rate limiting dan CORS configuration

**Performance Features:**

- Auto-completion booking system (cron job)
- Database indexing untuk optimal queries
- Efficient pagination dan filtering
- Real-time availability calculation

## 🧪 Testing

**API Testing:**

- Postman collection tersedia di `/postman` folder
- Environment files untuk development dan production
- Complete testing guide untuk semua endpoints

**Frontend Testing:**

- Vitest + React Testing Library
- Integration testing untuk cross-component functionality
- E2E testing untuk complete user journeys

## 🚀 Getting Started

**For Backend Development:**

```bash
git clone https://github.com/arigumilang-uin/booking-futsal.git
cd booking_futsal
npm install
cp .env.example .env.development
npm run dev
```

**For Frontend Development:**

1. Review dokumentasi di folder `docs/`
2. Pilih task assignment (Developer 1 atau Developer 2)
3. Gunakan commands di `FRONTEND_DEVELOPER_COMMANDS.md`
4. Follow workflow strategy di `FRONTEND_DEVELOPMENT_WORKFLOW_ANALYSIS.md`

## � License

MIT License - see [LICENSE](LICENSE) file for details.

---

**🏟️ Built for efficient futsal center operations**
