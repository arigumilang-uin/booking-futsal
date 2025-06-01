# Contributing to Enhanced Futsal Booking System

Thank you for your interest in contributing to the Enhanced Futsal Booking System! This document provides guidelines and information for contributors.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [Architecture Guidelines](#architecture-guidelines)
- [Testing Requirements](#testing-requirements)

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of background, experience level, or identity.

### Expected Behavior

- Use welcoming and inclusive language
- Respect differing viewpoints and experiences
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards other community members

### Unacceptable Behavior

- Harassment, discrimination, or offensive comments
- Personal attacks or trolling
- Publishing private information without permission
- Any conduct that would be inappropriate in a professional setting

## Getting Started

### Prerequisites

Before contributing, ensure you have:

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- Git knowledge and GitHub account
- Understanding of JavaScript/Node.js, Express.js, and PostgreSQL

### First-Time Contributors

1. **Fork the repository** on GitHub
2. **Clone your fork** locally
3. **Set up the development environment** (see Development Setup)
4. **Create a feature branch** for your contribution
5. **Make your changes** following our coding standards
6. **Test thoroughly** before submitting
7. **Submit a pull request** with clear description

## Development Setup

### 1. Clone and Install

```bash
git clone https://github.com/your-username/booking-futsal.git
cd booking-futsal
npm install
```

### 2. Environment Configuration

Create `.env.development`:

```env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/futsal_booking_dev
JWT_SECRET=your-development-jwt-secret
```

### 3. Database Setup

```bash
# Setup local PostgreSQL database
# Run migrations from database/ folder
# Import sample data if needed
```

### 4. Start Development Server

```bash
npm run dev
```

## Coding Standards

### Code Style

We follow **clean, minimal, professional Indonesian developer style**:

#### ✅ DO:

```javascript
const getUserBookings = async (userId) => {
  try {
    const bookings = await getBookingsByUserId(userId);
    return bookings;
  } catch (error) {
    console.error("Get user bookings error:", error);
    throw new Error("Failed to get user bookings");
  }
};
```

#### ❌ DON'T:

```javascript
/**
 * Enhanced user booking retrieval function dengan comprehensive error handling
 * Supports advanced filtering dan pagination capabilities
 */
const getUserBookings = async (userId) => {
  try {
    // Get all bookings untuk specific user dengan advanced filtering
    const bookings = await getBookingsByUserId(userId);
    return bookings;
  } catch (error) {
    console.error("Get user bookings error:", error);
    throw new Error(
      "Failed to get user bookings",
      "USER_BOOKINGS_FETCH_FAILED"
    );
  }
};
```

### Key Principles

1. **Minimal Comments:** Use natural Indonesian comments only when necessary
2. **No Error Codes:** Avoid redundant error codes like 'USER_NOT_FOUND'
3. **Clean Structure:** Remove excessive JSDoc and verbose descriptions
4. **Professional Naming:** Use clear, descriptive variable and function names
5. **Consistent Formatting:** Follow established patterns in the codebase

### File Organization

- **Models:** Handle all database operations and business logic
- **Controllers:** Handle HTTP requests/responses and orchestration only
- **Middleware:** Authentication, authorization, and security
- **Routes:** API endpoint definitions
- **Utils:** Helper functions and utilities

## Pull Request Process

### Before Submitting

1. **Ensure your code follows** our coding standards
2. **Test thoroughly** in development environment
3. **Update documentation** if needed
4. **Check for breaking changes** and avoid them
5. **Rebase your branch** on latest main branch

### PR Requirements

1. **Clear Title:** Descriptive title summarizing the change
2. **Detailed Description:** Explain what, why, and how
3. **Testing Evidence:** Screenshots, test results, or logs
4. **Breaking Changes:** Clearly mark any breaking changes
5. **Related Issues:** Reference any related GitHub issues

### PR Template

```markdown
## Description

Brief description of changes made.

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Tested locally
- [ ] All existing tests pass
- [ ] New tests added (if applicable)

## Checklist

- [ ] Code follows project coding standards
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or clearly documented)
```

### Review Process

1. **Automated Checks:** Code must pass all automated checks
2. **Peer Review:** At least one maintainer review required
3. **Testing:** Changes must be tested in development environment
4. **Documentation:** Updates to documentation reviewed
5. **Approval:** Final approval from project maintainer

## Issue Reporting

### Bug Reports

When reporting bugs, include:

1. **Clear Title:** Descriptive summary of the issue
2. **Environment:** OS, Node.js version, database version
3. **Steps to Reproduce:** Detailed steps to recreate the issue
4. **Expected Behavior:** What should happen
5. **Actual Behavior:** What actually happens
6. **Error Logs:** Relevant error messages or logs
7. **Screenshots:** If applicable

### Feature Requests

For new features, provide:

1. **Use Case:** Why is this feature needed?
2. **Proposed Solution:** How should it work?
3. **Alternatives:** Other solutions considered
4. **Impact:** How does this affect existing functionality?

## Architecture Guidelines

### Enhanced Role-Based System

Our system uses 6 hierarchical roles:

1. **pengunjung** (Level 1) - Guest access
2. **penyewa** (Level 2) - Customer access
3. **staff_kasir** (Level 3) - Payment processing
4. **operator_lapangan** (Level 4) - Field operations
5. **manajer_futsal** (Level 5) - Business management
6. **supervisor_sistem** (Level 6) - System administration

### MVC Separation

- **Models:** All database operations, business logic, data validation
- **Controllers:** HTTP handling, request/response orchestration
- **Views:** API responses (JSON)

### Security Principles

- **Authentication:** JWT-based with proper token management
- **Authorization:** Role-based access control (RBAC)
- **Input Validation:** Sanitize and validate all inputs
- **Error Handling:** Secure error messages without sensitive data

## Testing Requirements

### Manual Testing

1. **API Testing:** Use Postman collection in `/postman` folder
2. **Role Testing:** Test all role-based access controls
3. **Error Scenarios:** Test error handling and edge cases
4. **Integration:** Test with both development and production configs

### Test Coverage

- **Happy Path:** All main functionality works as expected
- **Error Handling:** Proper error responses for invalid inputs
- **Security:** Authorization and authentication work correctly
- **Performance:** No significant performance degradation

## 🔧 Development Workflow

### Branch Naming Convention

Use descriptive branch names with prefixes:

- `feature/` - New features (e.g., `feature/payment-integration`)
- `bugfix/` - Bug fixes (e.g., `bugfix/booking-validation`)
- `hotfix/` - Critical fixes (e.g., `hotfix/security-patch`)
- `docs/` - Documentation updates (e.g., `docs/api-endpoints`)
- `refactor/` - Code refactoring (e.g., `refactor/user-model`)

### Commit Message Format

Use clear, descriptive commit messages:

```
type(scope): description

Examples:
feat(auth): add JWT token refresh functionality
fix(booking): resolve double booking validation issue
docs(readme): update installation instructions
refactor(models): simplify user role management
```

### Development Best Practices

1. **Keep Changes Small:** Focus on one feature/fix per PR
2. **Write Clear Code:** Self-documenting code is preferred
3. **Test Thoroughly:** Test both happy path and edge cases
4. **Update Documentation:** Keep docs in sync with code changes
5. **Follow Patterns:** Maintain consistency with existing codebase

## 🚨 Common Pitfalls to Avoid

### Code Quality Issues

- ❌ Adding excessive comments or JSDoc
- ❌ Using error codes like 'USER_NOT_FOUND'
- ❌ Breaking existing API endpoints
- ❌ Ignoring role-based access control
- ❌ Hardcoding configuration values

### Security Concerns

- ❌ Exposing sensitive data in error messages
- ❌ Bypassing authentication/authorization
- ❌ SQL injection vulnerabilities
- ❌ Storing secrets in code
- ❌ Inadequate input validation

## 📚 Additional Resources

- **Project Documentation:** See README.md for comprehensive setup guide
- **API Documentation:** Available in README.md API section
- **Database Schema:** Check `/database` folder for schema and migrations
- **Postman Collection:** Complete API testing suite in `/postman` folder
- **GitHub Repository:** [https://github.com/arigumilang-uin/booking-futsal](https://github.com/arigumilang-uin/booking-futsal)

## 🙋‍♂️ Getting Help

If you need help:

1. **Check Documentation:** README.md and this contributing guide
2. **Search Issues:** Look for similar issues or questions
3. **GitHub Discussions:** Ask questions in project discussions
4. **Contact Maintainers:** Use email contacts in README.md

### Contact Information

- **Technical Support:** technical@futsalbooking.com
- **General Questions:** support@futsalbooking.com
- **GitHub Issues:** [Create an issue](https://github.com/arigumilang-uin/booking-futsal/issues)

## 📄 License

By contributing, you agree that your contributions will be licensed under the same MIT License that covers the project.

---

**Thank you for contributing to Enhanced Futsal Booking System!** 🚀⚽

_Made with ❤️ for the futsal community_
