# 🎯 FRONTEND DEVELOPER COMMANDS - Futsal Booking System

## 📋 **OVERVIEW COMMANDS**

Dokumen ini berisi command/instruksi spesifik yang dapat diberikan kepada Augment AI untuk mengerjakan project futsal booking system berdasarkan dokumentasi lengkap yang telah dibuat.

### **📚 DOKUMENTASI REFERENCE:**

- `docs/API_ENDPOINTS_INFORMATION.md` - Complete API endpoints documentation
- `docs/BACKEND_SYSTEM_INFORMATION.md` - Backend system business logic
- `docs/FRONTEND_DEVELOPMENT_TASK_DIVISION.md` - Task division and technical specs
- `docs/FRONTEND_DEVELOPMENT_WORKFLOW_ANALYSIS.md` - Workflow and coordination strategy

---

## 👨‍💻 **DEVELOPER 1 COMMANDS - CORE FEATURES & PUBLIC INTERFACE**

### **🚀 PROJECT SETUP & FOUNDATION**

#### **Command 1.1: Initial Project Setup**

```
Create a new React frontend project for a futsal booking system using Vite + React + Tailwind CSS.

Requirements:
- Use the exact dependencies and configuration specified in docs/FRONTEND_DEVELOPMENT_TASK_DIVISION.md section "PROJECT SETUP & CONFIGURATION"
- Implement the folder structure as defined in the "Recommended Folder Structure" section
- Configure Tailwind with the color palette and theme extensions provided
- Set up environment variables for API integration with backend at https://booking-futsal-production.up.railway.app/api
- Create the base routing structure for public pages, authentication, and customer features

Reference: docs/FRONTEND_DEVELOPMENT_TASK_DIVISION.md lines 595-695
```

#### **Command 1.2: API Client & Authentication Foundation**

```
Implement the API client and authentication foundation for the futsal booking system.

Requirements:
- Create the API client using Axios with interceptors as specified in docs/FRONTEND_DEVELOPMENT_TASK_DIVISION.md lines 724-758
- Implement AuthContext with JWT token handling and HttpOnly cookie support
- Create authentication hooks (useAuth) following the patterns in lines 697-722
- Set up protected routes and role-based access components
- Implement the authentication service layer for login, register, logout, and profile management

API Endpoints to integrate:
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/profile
- GET /api/auth/verify
- GET /api/auth/roles

Reference: docs/API_ENDPOINTS_INFORMATION.md lines 240-310 for authentication endpoints
Reference: docs/FRONTEND_DEVELOPMENT_TASK_DIVISION.md lines 724-792 for implementation patterns
```

#### **Command 1.3: Shared UI Components Library**

```
Create a comprehensive UI components library for the futsal booking system.

Requirements:
- Implement reusable components following the patterns in docs/FRONTEND_DEVELOPMENT_TASK_DIVISION.md lines 762-840
- Create Button component with variants (primary, secondary, danger) and sizes (sm, md, lg)
- Implement Input, Modal, Table, LoadingSpinner, and ErrorBoundary components
- Add form components with validation support
- Ensure all components use Tailwind CSS with the defined color palette
- Include proper TypeScript interfaces or PropTypes for component props
- Add loading states and error handling for all interactive components

Reference: docs/FRONTEND_DEVELOPMENT_TASK_DIVISION.md lines 762-840 for component patterns
```

### **🔓 PUBLIC INTERFACE DEVELOPMENT**

#### **Command 1.4: Public Pages Implementation**

```
Implement all public pages for the futsal booking system that guests can access without authentication.

Requirements:
- Create HomePage.jsx with field showcase and system overview
- Implement FieldListPage.jsx with filtering, search, and pagination
- Build FieldDetailPage.jsx with field information and real-time availability checker
- Add AboutPage.jsx and ContactPage.jsx for company information
- Create NotFoundPage.jsx for 404 error handling
- Ensure all pages are responsive and SEO-optimized
- Implement proper loading states and error handling

API Endpoints to integrate:
- GET /api/public/system-info
- GET /api/public/fields (with pagination and filtering)
- GET /api/public/fields/:id
- GET /api/public/fields/:id/availability
- GET /api/public/field-types
- GET /api/public/field-locations

Reference: docs/API_ENDPOINTS_INFORMATION.md lines 45-150 for public endpoints
Reference: docs/FRONTEND_DEVELOPMENT_TASK_DIVISION.md lines 70-85 for component specifications
```

#### **Command 1.5: Authentication Pages**

```
Implement complete authentication system pages with form validation and error handling.

Requirements:
- Create LoginPage.jsx with email/password form and validation
- Implement RegisterPage.jsx with user registration form including name, email, phone, password
- Build ProfilePage.jsx for user profile management and updates
- Add proper form validation with real-time feedback
- Implement password strength validation for registration
- Add loading states during authentication processes
- Handle authentication errors and display user-friendly messages
- Ensure forms are accessible and mobile-responsive

Business Logic:
- Default role assignment: 'penyewa' for new registrations
- Email uniqueness validation
- Password minimum 8 characters with bcrypt hashing
- Indonesian phone number format validation

Reference: docs/API_ENDPOINTS_INFORMATION.md lines 240-310 for authentication endpoints
Reference: docs/BACKEND_SYSTEM_INFORMATION.md lines 203-209 for validation rules
```

### **👤 CUSTOMER FEATURES DEVELOPMENT**

#### **Command 1.6: Customer Dashboard & Profile**

```
Implement customer dashboard and profile management features.

Requirements:
- Create CustomerDashboard.jsx with booking statistics, recent bookings, and quick actions
- Implement profile management with update capabilities
- Add booking summary cards with status indicators
- Include favorite fields quick access
- Display notification center with unread count
- Add customer analytics (total bookings, total spent, favorite fields)
- Ensure real-time data updates and proper loading states

API Endpoints to integrate:
- GET /api/customer/profile
- PUT /api/customer/profile
- GET /api/customer/bookings (recent bookings for dashboard)
- GET /api/customer/notifications/count

Reference: docs/API_ENDPOINTS_INFORMATION.md lines 315-400 for customer endpoints
Reference: docs/FRONTEND_DEVELOPMENT_TASK_DIVISION.md lines 120-140 for dashboard specifications
```

#### **Command 1.7: Booking Management System**

```
Implement complete booking management system for customers.

Requirements:
- Create BookingForm.jsx with field selection, date/time picker, and conflict detection
- Implement BookingList.jsx with filtering, pagination, and status management
- Build BookingDetail.jsx with booking information and available actions
- Add real-time availability checking during booking creation
- Implement booking cancellation with confirmation dialog
- Add promotion code application during booking
- Include automatic pricing calculation (base amount + admin fee)
- Handle booking conflicts and display appropriate error messages

API Endpoints to integrate:
- POST /api/customer/bookings
- GET /api/customer/bookings (with filtering)
- GET /api/customer/bookings/:id
- DELETE /api/customer/bookings/:id
- GET /api/public/fields/:id/availability

Business Logic:
- Conflict detection with existing bookings
- Weekend/weekday pricing calculation
- Admin fee addition (Rp 5.000 default)
- Grace period for cancellation
- Status progression: pending → confirmed → in_progress → completed

Reference: docs/API_ENDPOINTS_INFORMATION.md lines 400-480 for booking endpoints
Reference: docs/BACKEND_SYSTEM_INFORMATION.md lines 66-100 for booking lifecycle
```

#### **Command 1.8: Enhanced Customer Features**

```
Implement enhanced customer features including notifications, favorites, reviews, and promotions.

Requirements:
- Create NotificationCenter.jsx with real-time notifications and read/unread status
- Implement FavoriteFields.jsx with add/remove functionality and quick booking
- Build ReviewForm.jsx for field reviews with 5-star rating system
- Add PromotionList.jsx with available promotions and application
- Include notification statistics and management
- Implement review system with eligibility checking (must have completed booking)
- Add favorite fields with availability information
- Handle promotion validation and discount calculation

API Endpoints to integrate:
- GET /api/customer/notifications
- PUT /api/customer/notifications/:id/read
- GET /api/customer/favorites
- POST /api/customer/favorites/:fieldId
- GET /api/customer/reviews
- POST /api/customer/reviews
- GET /api/customer/promotions
- POST /api/customer/promotions/validate

Reference: docs/API_ENDPOINTS_INFORMATION.md lines 315-400 for enhanced customer features
Reference: docs/BACKEND_SYSTEM_INFORMATION.md lines 277-298 for promotion system
```

---

## 👨‍💻 **DEVELOPER 2 COMMANDS - ADVANCED FEATURES & MANAGEMENT INTERFACE**

### **👨‍💼 STAFF INTERFACE DEVELOPMENT**

#### **Command 2.1: Staff Dashboard Foundation**

```
Implement role-based staff dashboard system with different interfaces for each staff role.

Requirements:
- Create StaffDashboard.jsx as main container with role-based routing
- Implement KasirDashboard.jsx with payment statistics and pending transactions
- Build OperatorDashboard.jsx with field schedule and booking status
- Create ManagerDashboard.jsx with business analytics and staff performance
- Implement SupervisorDashboard.jsx with system overview and administration
- Add role-based navigation and access control
- Include real-time data updates and proper loading states
- Ensure each dashboard shows relevant KPIs and action items

API Endpoints to integrate:
- GET /api/staff/kasir/dashboard
- GET /api/staff/operator/dashboard
- GET /api/staff/manager/dashboard
- GET /api/staff/supervisor/dashboard

Reference: docs/API_ENDPOINTS_INFORMATION.md lines 600-700 for staff endpoints
Reference: docs/FRONTEND_DEVELOPMENT_TASK_DIVISION.md lines 200-220 for staff interface specs
```

#### **Command 2.2: Payment Processing Interface**

```
Implement payment processing interface for kasir (cashier) staff.

Requirements:
- Create PaymentProcessor.jsx for manual payment processing
- Implement payment list with filtering and status management
- Add payment confirmation workflow with staff attribution
- Include daily cash report generation
- Add payment statistics and analytics
- Implement payment method selection (cash, transfer, card, digital_wallet)
- Handle payment validation and amount verification
- Add audit trail for all payment actions

API Endpoints to integrate:
- GET /api/staff/kasir/payments
- POST /api/staff/kasir/payments/manual
- PUT /api/staff/kasir/payments/:id/confirm
- GET /api/staff/kasir/statistics
- GET /api/staff/kasir/daily-report

Business Logic:
- Payment amount must match booking total_amount
- Manual payment processing with reference numbers
- Payment status progression: pending → paid → verified
- Complete audit trail with staff attribution

Reference: docs/API_ENDPOINTS_INFORMATION.md lines 620-670 for kasir endpoints
Reference: docs/BACKEND_SYSTEM_INFORMATION.md lines 101-130 for payment workflow
```

#### **Command 2.3: Field Operations Management**

```
Implement field operations management interface for operator staff.

Requirements:
- Create FieldManager.jsx for field status and availability management
- Implement BookingManager.jsx for staff booking operations
- Add booking status update functionality (confirm, complete, cancel)
- Include field maintenance mode management
- Add today's schedule view with booking timeline
- Implement booking actions (confirm, complete, no-show)
- Include field utilization statistics
- Add operator performance tracking

API Endpoints to integrate:
- GET /api/staff/operator/bookings
- PUT /api/staff/operator/bookings/:id/status
- GET /api/staff/operator/fields
- GET /api/staff/operator/schedule

Business Logic:
- Status progression: pending → confirmed → in_progress → completed
- Field availability management
- Booking completion with notes and timestamps
- Operator attribution for all actions

Reference: docs/API_ENDPOINTS_INFORMATION.md lines 700-750 for operator endpoints
Reference: docs/BACKEND_SYSTEM_INFORMATION.md lines 89-94 for execution phase
```

### **🔧 ADMIN FEATURES DEVELOPMENT**

#### **Command 2.4: User Management Interface**

```
Implement comprehensive user management interface for admin users.

Requirements:
- Create UserManagement.jsx with user list, filtering, and search
- Implement role management with hierarchy validation
- Add user status management (activate/deactivate)
- Include user creation for staff members
- Add role change workflow with approval system
- Implement user activity monitoring
- Include bulk operations for user management
- Add user statistics and analytics

API Endpoints to integrate:
- GET /api/admin/users
- PUT /api/admin/users/:id/role
- PUT /api/admin/users/:id/status
- GET /api/admin/role-management/dashboard
- GET /api/admin/role-management/requests

Business Logic:
- Role hierarchy: pengunjung → penyewa → staff_kasir → operator_lapangan → manajer_futsal → supervisor_sistem
- Role change approval workflow for non-supervisor requests
- User activity impact analysis for status changes

Reference: docs/API_ENDPOINTS_INFORMATION.md lines 950-1050 for admin endpoints
Reference: docs/BACKEND_SYSTEM_INFORMATION.md lines 131-153 for role management
```

#### **Command 2.5: System Settings & Configuration**

```
Implement system settings and configuration management interface.

Requirements:
- Create SystemSettings.jsx with categorized settings management
- Implement setting value validation and constraint checking
- Add system configuration overview
- Include environment and feature flag management
- Add backup and maintenance task triggers
- Implement audit trail for configuration changes
- Include system health monitoring
- Add configuration export/import functionality

API Endpoints to integrate:
- GET /api/admin/system-settings
- PUT /api/admin/system-settings/:key
- GET /api/staff/supervisor/system-config
- POST /api/staff/supervisor/system-maintenance

Reference: docs/API_ENDPOINTS_INFORMATION.md lines 1200-1300 for system settings
Reference: docs/BACKEND_SYSTEM_INFORMATION.md lines 329-353 for configuration management
```

#### **Command 2.6: Audit Logs & Monitoring**

```
Implement audit logs and system monitoring interface.

Requirements:
- Create AuditLogs.jsx with advanced filtering and search
- Implement user activity tracking and analysis
- Add security event monitoring and alerts
- Include system performance metrics display
- Add audit log export functionality
- Implement real-time log streaming
- Include compliance reporting features
- Add audit statistics and trends analysis

API Endpoints to integrate:
- GET /api/admin/audit-logs
- GET /api/admin/audit-logs/user/:userId
- GET /api/admin/audit-logs/statistics
- GET /api/admin/audit-logs/export

Business Logic:
- Complete audit trail for all system activities
- User attribution for all actions
- Action types: CREATE, UPDATE, DELETE, LOGIN, LOGOUT, ROLE_CHANGE, PAYMENT_PROCESS
- Advanced filtering and search capabilities

Reference: docs/API_ENDPOINTS_INFORMATION.md lines 1400-1500 for audit endpoints
Reference: docs/BACKEND_SYSTEM_INFORMATION.md lines 176-183 for audit trail system
```

### **🎯 ENHANCED FEATURES DEVELOPMENT**

#### **Command 2.7: Analytics Dashboard**

```
Implement comprehensive analytics dashboard with business intelligence features.

Requirements:
- Create AnalyticsDashboard.jsx with interactive charts and metrics
- Implement business analytics with revenue tracking and trends
- Add system analytics with performance monitoring
- Include user behavior analysis and retention metrics
- Add field utilization and performance analysis
- Implement real-time data visualization
- Include export functionality for reports
- Add customizable date ranges and filtering

API Endpoints to integrate:
- GET /api/admin/analytics/business
- GET /api/admin/analytics/system
- GET /api/admin/analytics/performance

Business Intelligence Features:
- Revenue analytics with multiple dimensions
- Customer behavior analysis and retention metrics
- Field performance and utilization analysis
- Staff performance tracking

Reference: docs/API_ENDPOINTS_INFORMATION.md lines 1500-1600 for analytics endpoints
Reference: docs/BACKEND_SYSTEM_INFORMATION.md lines 243-258 for analytics features
```

#### **Command 2.8: Notification & Promotion Management**

```
Implement notification and promotion management systems.

Requirements:
- Create NotificationManager.jsx with broadcast capabilities
- Implement PromotionManager.jsx with promotion lifecycle management
- Add notification delivery status tracking
- Include promotion usage analytics and effectiveness metrics
- Add user targeting and filtering for notifications
- Implement promotion validation and constraint management
- Include notification templates and scheduling
- Add promotion performance analysis

API Endpoints to integrate:
- GET /api/admin/notifications
- POST /api/admin/notifications/broadcast
- GET /api/admin/promotions
- POST /api/admin/promotions
- PUT /api/admin/promotions/:id

Business Logic:
- Multi-channel notification delivery (app, email, sms)
- Promotion types: percentage and fixed amount discounts
- Usage tracking and limits enforcement
- Time-based and field-specific restrictions

Reference: docs/API_ENDPOINTS_INFORMATION.md lines 1300-1400 for notification/promotion endpoints
Reference: docs/BACKEND_SYSTEM_INFORMATION.md lines 277-298 for promotion system
```

---

## 🤝 **SHARED COMMANDS FOR COORDINATION**

### **🔄 INTEGRATION & TESTING**

#### **Shared Command 1: Component Integration Testing**

```
Implement integration testing for shared components and cross-feature functionality.

Requirements:
- Create integration tests for authentication flow across both developer domains
- Test role-based access control for all user types
- Implement API integration testing with mock responses
- Add cross-component communication testing
- Include notification system integration testing
- Test shared state management and context providers
- Add performance testing for critical user flows
- Implement accessibility testing for all components

Testing Framework:
- Use Vitest + React Testing Library as specified in docs/FRONTEND_DEVELOPMENT_TASK_DIVISION.md
- Follow testing patterns in lines 940-1007
- Implement E2E testing for complete user journeys

Reference: docs/FRONTEND_DEVELOPMENT_WORKFLOW_ANALYSIS.md lines 940-1020 for testing coordination
```

#### **Shared Command 2: Performance Optimization**

```
Implement performance optimization strategies across the entire application.

Requirements:
- Implement code splitting and lazy loading as specified in docs/FRONTEND_DEVELOPMENT_TASK_DIVISION.md lines 1011-1049
- Add performance monitoring and tracking utilities
- Optimize bundle size with proper chunk splitting
- Implement memoization for expensive components and calculations
- Add image optimization and lazy loading
- Implement proper caching strategies for API calls
- Add performance budgets and monitoring
- Optimize Tailwind CSS for production builds

Performance Targets:
- Lighthouse Performance Score: >90
- First Contentful Paint: <2s
- Largest Contentful Paint: <3s
- Bundle size: <1MB total

Reference: docs/FRONTEND_DEVELOPMENT_TASK_DIVISION.md lines 1009-1049 for optimization patterns
```

### **🚀 DEPLOYMENT & PRODUCTION**

#### **Shared Command 3: Production Deployment Setup**

```
Set up production deployment pipeline and monitoring for Vercel deployment.

Requirements:
- Configure Vercel deployment with the settings specified in docs/FRONTEND_DEVELOPMENT_TASK_DIVISION.md lines 1088-1132
- Set up environment variables for production
- Implement error tracking and monitoring
- Configure performance monitoring and analytics
- Set up automated testing in CI/CD pipeline
- Add security headers and CSP configuration
- Implement proper caching strategies
- Add health check endpoints for monitoring

Deployment Configuration:
- Use Vercel for frontend hosting
- Configure API proxy to Railway backend
- Set up proper security headers
- Implement automated deployment from main branch

Reference: docs/FRONTEND_DEVELOPMENT_TASK_DIVISION.md lines 1051-1183 for deployment configuration
Reference: docs/FRONTEND_DEVELOPMENT_WORKFLOW_ANALYSIS.md lines 1015-1020 for production readiness
```

---

## 📚 **DOCUMENTATION REFERENCE GUIDE**

### **Quick Reference for Commands:**

- **API Integration:** `docs/API_ENDPOINTS_INFORMATION.md`
- **Business Logic:** `docs/BACKEND_SYSTEM_INFORMATION.md`
- **Technical Specs:** `docs/FRONTEND_DEVELOPMENT_TASK_DIVISION.md`
- **Workflow Strategy:** `docs/FRONTEND_DEVELOPMENT_WORKFLOW_ANALYSIS.md`

### **Command Usage Instructions:**

1. Copy the specific command for your assigned task
2. Provide the command to Augment AI exactly as written
3. Reference the specified documentation sections for additional context
4. Follow the coordination strategy outlined in the workflow analysis
5. Implement integration checkpoints as specified in the workflow documentation

## 🔧 **COORDINATION COMMANDS**

### **📋 DAILY COORDINATION**

#### **Daily Command 1: Progress Sync & Integration Check**

```
Perform daily progress sync and integration check for the futsal booking system frontend development.

Requirements:
- Review completed components and identify any integration points with the other developer
- Check shared component updates and ensure compatibility
- Validate API integration status and identify any blocking issues
- Update progress tracking dashboard with completed tasks
- Identify any merge conflicts or potential conflicts in shared files
- Review and update documentation for completed features
- Plan coordination needs for the next development session

Coordination Points:
- Authentication context sharing (Developer 1 → Developer 2)
- Shared UI components updates
- API client modifications
- State management changes
- Route configuration updates

Reference: docs/FRONTEND_DEVELOPMENT_WORKFLOW_ANALYSIS.md lines 200-250 for daily coordination strategy
```

#### **Daily Command 2: Code Review & Quality Check**

```
Perform code review and quality check for completed features.

Requirements:
- Review code following the patterns established in docs/FRONTEND_DEVELOPMENT_TASK_DIVISION.md
- Check component reusability and consistency with design system
- Validate API integration follows the established patterns
- Ensure proper error handling and loading states
- Verify accessibility compliance (WCAG 2.1)
- Check performance implications of new code
- Validate test coverage for new components
- Ensure documentation is updated for new features

Quality Checklist:
- [ ] Code follows established patterns
- [ ] Proper error handling implemented
- [ ] Loading states included
- [ ] Responsive design verified
- [ ] API integration tested
- [ ] Tests written and passing
- [ ] Documentation updated

Reference: docs/FRONTEND_DEVELOPMENT_WORKFLOW_ANALYSIS.md lines 400-450 for code review process
```

### **🔄 WEEKLY COORDINATION**

#### **Weekly Command 1: Integration Testing & Milestone Review**

```
Perform weekly integration testing and milestone review for the futsal booking system.

Requirements:
- Execute integration tests between Developer 1 and Developer 2 components
- Validate authentication flow works across all user roles
- Test role-based access control for all implemented features
- Verify API integration consistency and error handling
- Check notification system integration (if implemented)
- Review milestone completion against the timeline in docs/FRONTEND_DEVELOPMENT_WORKFLOW_ANALYSIS.md
- Identify any blockers or dependencies for the next week
- Update project documentation with completed features

Integration Test Areas:
- Authentication flow (login → role-based routing)
- Shared component functionality
- API client consistency
- State management integration
- Cross-feature navigation

Reference: docs/FRONTEND_DEVELOPMENT_WORKFLOW_ANALYSIS.md lines 300-400 for milestone checkpoints
```

#### **Weekly Command 2: Performance & Security Review**

```
Perform weekly performance and security review for the implemented features.

Requirements:
- Run Lighthouse performance audit on completed pages
- Check bundle size and identify optimization opportunities
- Validate security implementation (authentication, authorization, data handling)
- Review API integration security (token handling, error responses)
- Check for potential XSS or security vulnerabilities
- Validate proper input sanitization and validation
- Review error handling and user data protection
- Ensure compliance with security best practices

Performance Targets:
- Lighthouse Performance Score: >90
- Accessibility Score: >95
- Bundle size optimization
- API response time monitoring

Security Checklist:
- [ ] JWT token handling secure
- [ ] Input validation implemented
- [ ] Error messages don't expose sensitive data
- [ ] Role-based access properly enforced
- [ ] API calls use proper authentication

Reference: docs/FRONTEND_DEVELOPMENT_TASK_DIVISION.md lines 1009-1183 for performance and security guidelines
```

## 🚨 **TROUBLESHOOTING COMMANDS**

### **🔍 DEBUGGING & ISSUE RESOLUTION**

#### **Debug Command 1: Authentication Issues**

```
Debug and resolve authentication-related issues in the futsal booking system.

Common Issues to Check:
- JWT token not being stored or retrieved correctly
- HttpOnly cookie configuration issues
- Role-based access not working properly
- Authentication context not updating across components
- API authentication headers not being sent
- Token expiration handling not working
- Login/logout flow not functioning correctly

Debugging Steps:
1. Check browser developer tools for cookie storage
2. Verify API client interceptors are working
3. Test authentication context state updates
4. Validate role-based route protection
5. Check API response handling for auth endpoints
6. Verify token refresh mechanism (if implemented)

API Endpoints to Test:
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/verify
- GET /api/auth/profile

Reference: docs/API_ENDPOINTS_INFORMATION.md lines 240-310 for authentication endpoints
Reference: docs/BACKEND_SYSTEM_INFORMATION.md lines 222-235 for authentication security
```

#### **Debug Command 2: API Integration Issues**

```
Debug and resolve API integration issues across the application.

Common Issues to Check:
- CORS configuration problems
- API endpoint URL mismatches
- Request/response format inconsistencies
- Error handling not working properly
- Loading states not displaying correctly
- Data transformation issues
- Network connectivity problems
- Rate limiting or timeout issues

Debugging Steps:
1. Check browser network tab for API calls
2. Verify API base URL configuration
3. Test API endpoints individually
4. Check request headers and authentication
5. Validate response data structure
6. Test error scenarios and handling
7. Verify loading state management

API Configuration:
- Base URL: https://booking-futsal-production.up.railway.app/api
- Authentication: JWT token with HttpOnly cookies
- Error handling: Consistent error response format

Reference: docs/API_ENDPOINTS_INFORMATION.md for complete endpoint documentation
Reference: docs/FRONTEND_DEVELOPMENT_TASK_DIVISION.md lines 724-758 for API client setup
```

#### **Debug Command 3: Component Integration Issues**

```
Debug and resolve component integration issues between developers.

Common Issues to Check:
- Shared component API changes breaking other components
- State management conflicts between features
- Routing conflicts or navigation issues
- CSS/styling conflicts between components
- Props interface mismatches
- Event handling conflicts
- Performance issues from component interactions

Debugging Steps:
1. Check component prop interfaces and usage
2. Verify shared state management is working
3. Test component isolation and integration
4. Check for CSS class conflicts
5. Validate event propagation and handling
6. Test component performance impact
7. Verify accessibility across integrated components

Integration Points to Check:
- Authentication context usage
- Shared UI component consistency
- Route protection and navigation
- Notification system integration
- API client usage consistency

Reference: docs/FRONTEND_DEVELOPMENT_WORKFLOW_ANALYSIS.md lines 843-893 for conflict resolution protocols
```

## 📊 **MONITORING & ANALYTICS COMMANDS**

### **📈 PERFORMANCE MONITORING**

#### **Monitor Command 1: Performance Metrics Collection**

```
Implement performance monitoring and metrics collection for the futsal booking system.

Requirements:
- Set up performance monitoring using the utilities in docs/FRONTEND_DEVELOPMENT_TASK_DIVISION.md lines 1165-1183
- Implement component render time tracking
- Add API call performance monitoring
- Set up bundle size monitoring
- Track user interaction performance
- Monitor memory usage and potential leaks
- Implement Core Web Vitals tracking
- Add performance budgets and alerts

Metrics to Track:
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Cumulative Layout Shift (CLS)
- First Input Delay (FID)
- Time to Interactive (TTI)
- Bundle size and chunk analysis
- API response times
- Component render performance

Implementation:
- Use Performance API for timing measurements
- Implement custom performance hooks
- Add performance monitoring dashboard
- Set up automated performance testing

Reference: docs/FRONTEND_DEVELOPMENT_TASK_DIVISION.md lines 1165-1183 for performance monitoring setup
```

#### **Monitor Command 2: Error Tracking & Logging**

```
Implement comprehensive error tracking and logging system.

Requirements:
- Set up error tracking using the patterns in docs/FRONTEND_DEVELOPMENT_TASK_DIVISION.md lines 1136-1163
- Implement global error boundary for React errors
- Add API error tracking and categorization
- Set up user action logging for debugging
- Implement error reporting to monitoring service
- Add error recovery mechanisms
- Track error patterns and frequency
- Implement user-friendly error messages

Error Categories to Track:
- JavaScript runtime errors
- React component errors
- API integration errors
- Authentication errors
- Network connectivity errors
- User input validation errors
- Performance-related errors

Implementation:
- Global error handlers for unhandled errors
- Error boundary components for React errors
- API error interceptors for network errors
- User action tracking for debugging context
- Error reporting service integration

Reference: docs/FRONTEND_DEVELOPMENT_TASK_DIVISION.md lines 1136-1163 for error tracking setup
```

## 🎯 **FINAL DEPLOYMENT COMMANDS**

### **🚀 PRODUCTION READINESS**

#### **Deploy Command 1: Pre-deployment Checklist**

```
Execute pre-deployment checklist and validation for the futsal booking system.

Requirements:
- Verify all features are implemented according to docs/FRONTEND_DEVELOPMENT_TASK_DIVISION.md
- Run complete test suite and ensure all tests pass
- Perform security audit and vulnerability check
- Validate performance metrics meet targets (>90 Lighthouse score)
- Check accessibility compliance (>95 WCAG 2.1 score)
- Verify API integration with production backend
- Test all user flows end-to-end
- Validate responsive design across devices
- Check browser compatibility (Chrome, Firefox, Safari, Edge)
- Ensure proper error handling and user feedback

Pre-deployment Checklist:
- [ ] All planned features implemented
- [ ] Test coverage >85%
- [ ] Performance score >90
- [ ] Accessibility score >95
- [ ] Security audit passed
- [ ] API integration tested
- [ ] Cross-browser compatibility verified
- [ ] Mobile responsiveness confirmed
- [ ] Error handling comprehensive
- [ ] Documentation complete

Reference: docs/FRONTEND_DEVELOPMENT_WORKFLOW_ANALYSIS.md lines 995-1020 for final success criteria
```

#### **Deploy Command 2: Production Deployment & Monitoring Setup**

```
Execute production deployment and set up monitoring for the futsal booking system.

Requirements:
- Deploy to Vercel using configuration in docs/FRONTEND_DEVELOPMENT_TASK_DIVISION.md lines 1088-1132
- Configure environment variables for production
- Set up error tracking and monitoring services
- Implement performance monitoring and alerts
- Configure automated deployment pipeline
- Set up health check monitoring
- Implement user analytics tracking
- Configure backup and rollback procedures

Deployment Configuration:
- Platform: Vercel
- Build command: npm run build
- Output directory: dist
- Environment variables: Production API URL, monitoring keys
- Custom domain configuration (if applicable)
- CDN and caching configuration

Post-deployment Monitoring:
- Error rate monitoring
- Performance metrics tracking
- User engagement analytics
- API integration health checks
- Security monitoring and alerts

Reference: docs/FRONTEND_DEVELOPMENT_TASK_DIVISION.md lines 1051-1183 for deployment and monitoring setup
```

---

## 📋 **COMMAND USAGE BEST PRACTICES**

### **🎯 How to Use These Commands Effectively:**

1. **Sequential Execution:** Follow the command order within each developer's section
2. **Documentation Reference:** Always check the referenced documentation sections for context
3. **Coordination Points:** Pay attention to shared commands and integration requirements
4. **Quality Checks:** Use debugging and monitoring commands regularly during development
5. **Progress Tracking:** Use coordination commands for daily and weekly sync

### **🔄 Command Adaptation:**

- Modify commands based on specific project requirements
- Add additional context from documentation as needed
- Combine related commands for efficiency
- Use troubleshooting commands when issues arise

### **📚 Documentation Integration:**

- Each command references specific documentation sections
- Use documentation for detailed business logic and technical specifications
- Follow the workflow strategy outlined in the analysis documents
- Maintain consistency with the established patterns and conventions

**Each command is designed to be self-contained with clear requirements, API endpoints, business logic, and documentation references for successful implementation with Augment AI.** 🚀
