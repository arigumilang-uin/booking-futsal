# 📦 Deployment Guide

Comprehensive deployment guide for Enhanced Futsal Booking System backend.

## 🌍 Environment Overview

The system supports dual environment configuration:

- **Development Environment** - Local development with hot reload
- **Production Environment** - Optimized for performance and security

## 🛠️ Development Deployment

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Step-by-Step Setup

1. **Setup local PostgreSQL database**
   ```bash
   # Install PostgreSQL (Ubuntu/Debian)
   sudo apt update
   sudo apt install postgresql postgresql-contrib
   
   # Create database
   sudo -u postgres createdb futsal_booking_dev
   
   # Create user (optional)
   sudo -u postgres createuser --interactive
   ```

2. **Configure environment variables**
   
   Create `.env.development`:
   ```env
   NODE_ENV=development
   PORT=5000
   DATABASE_URL=postgresql://username:password@localhost:5432/futsal_booking_dev
   JWT_SECRET=your-super-secret-jwt-key-for-development
   ```

3. **Run database migrations**
   ```bash
   # Navigate to database folder
   cd database/
   
   # Run schema creation
   psql -d futsal_booking_dev -f schema.sql
   
   # Run migrations in order
   psql -d futsal_booking_dev -f migrations/001_enhance_existing_tables.sql
   psql -d futsal_booking_dev -f migrations/002_create_new_tables.sql
   psql -d futsal_booking_dev -f migrations/003_create_indexes.sql
   
   # Import sample data (optional)
   psql -d futsal_booking_dev -f seeds/sample_data.sql
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

### Development Features

- **Hot Reload** - Automatic server restart on code changes
- **Detailed Logging** - Comprehensive error and debug logs
- **Development Middleware** - Additional debugging tools
- **Local Database** - Full control over database state

## 🚀 Production Deployment

### Platform Options

#### Option 1: Railway (Recommended)

1. **Setup Railway PostgreSQL**
   - Create Railway account
   - Create new project
   - Add PostgreSQL service
   - Note the DATABASE_URL from Railway dashboard

2. **Deploy to Railway**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login to Railway
   railway login
   
   # Initialize project
   railway init
   
   # Deploy
   railway up
   ```

#### Option 2: Heroku

1. **Setup Heroku PostgreSQL**
   ```bash
   # Install Heroku CLI
   # Create Heroku app
   heroku create your-app-name
   
   # Add PostgreSQL addon
   heroku addons:create heroku-postgresql:hobby-dev
   ```

2. **Deploy to Heroku**
   ```bash
   # Set environment variables
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your-production-jwt-secret
   
   # Deploy
   git push heroku main
   ```

#### Option 3: VPS/Cloud Server

1. **Server Setup**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PostgreSQL
   sudo apt install postgresql postgresql-contrib
   
   # Install PM2 for process management
   sudo npm install -g pm2
   ```

2. **Application Deployment**
   ```bash
   # Clone repository
   git clone https://github.com/arigumilang-uin/booking-futsal.git
   cd booking-futsal
   
   # Install dependencies
   npm install --production
   
   # Setup database
   sudo -u postgres createdb futsal_booking_prod
   
   # Run migrations
   psql -d futsal_booking_prod -f database/schema.sql
   # ... run other migration files
   
   # Start with PM2
   pm2 start server.js --name "futsal-booking"
   pm2 startup
   pm2 save
   ```

### Production Configuration

Create `.env.production`:
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://username:password@host:port/database_name
JWT_SECRET=your-super-secure-production-jwt-secret

# Optional production settings
CORS_ORIGIN=https://your-frontend-domain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Production Features

- **Performance Optimization** - Minified responses, compression
- **Security Headers** - Helmet.js security middleware
- **Rate Limiting** - API rate limiting per endpoint type
- **Error Handling** - Secure error messages without sensitive data
- **Logging** - Production-level logging with rotation

## 🔧 Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` or `production` |
| `PORT` | Server port | `5000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:port/db` |
| `JWT_SECRET` | JWT signing secret | `your-super-secret-key` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `CORS_ORIGIN` | Allowed CORS origins | `*` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |

## 🗄️ Database Migration

### Migration Files Order

1. `schema.sql` - Base database schema
2. `migrations/001_enhance_existing_tables.sql` - Table enhancements
3. `migrations/002_create_new_tables.sql` - Additional tables
4. `migrations/003_create_indexes.sql` - Performance indexes

### Migration Commands

```bash
# Development
npm run migrate:dev

# Production
npm run migrate:prod

# Rollback (if needed)
npm run migrate:rollback
```

## 🔍 Health Checks

### Application Health

```bash
# Check application status
curl http://localhost:5000/api/health

# Expected response
{
  "status": "healthy",
  "timestamp": "2024-01-10T10:30:00Z",
  "uptime": "2h 30m 15s"
}
```

### Database Health

```bash
# Check database connection
curl http://localhost:5000/api/health/database

# Expected response
{
  "database": "connected",
  "latency": "5ms"
}
```

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```bash
   # Check PostgreSQL service
   sudo systemctl status postgresql
   
   # Restart if needed
   sudo systemctl restart postgresql
   ```

2. **Port Already in Use**
   ```bash
   # Find process using port
   lsof -i :5000
   
   # Kill process
   kill -9 <PID>
   ```

3. **Environment Variables Not Loaded**
   ```bash
   # Check if .env file exists
   ls -la .env*
   
   # Verify environment variables
   printenv | grep NODE_ENV
   ```

### Logs and Monitoring

```bash
# View application logs (PM2)
pm2 logs futsal-booking

# View system logs
sudo journalctl -u postgresql

# Monitor resource usage
htop
```

## 🔄 Continuous Deployment

### GitHub Actions Example

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run tests
      run: npm test
      
    - name: Deploy to Railway
      run: railway up
      env:
        RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

---

**For more information, see the main [README.md](../README.md) or [API Documentation](API_DOCUMENTATION.md)**
