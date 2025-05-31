-- database/role_management_migration.sql
-- Professional Role Management System Database Migration
-- Enhanced dengan Audit Trail, Approval Workflow, dan Employee Onboarding

-- =====================================================
-- ROLE CHANGE REQUESTS TABLE
-- =====================================================

-- Table untuk role change requests (approval workflow)
CREATE TABLE IF NOT EXISTS role_change_requests (
    id SERIAL PRIMARY KEY,
    requester_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    current_role user_role NOT NULL,
    requested_role user_role NOT NULL,
    reason TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    
    -- Approval tracking
    approved_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMP NULL,
    approval_notes TEXT,
    
    -- Rejection tracking
    rejected_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    rejected_at TIMESTAMP NULL,
    rejection_reason TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT different_roles CHECK (current_role != requested_role),
    CONSTRAINT valid_approval CHECK (
        (status = 'approved' AND approved_by IS NOT NULL AND approved_at IS NOT NULL) OR
        (status != 'approved')
    ),
    CONSTRAINT valid_rejection CHECK (
        (status = 'rejected' AND rejected_by IS NOT NULL AND rejected_at IS NOT NULL AND rejection_reason IS NOT NULL) OR
        (status != 'rejected')
    )
);

-- Indexes untuk performance
CREATE INDEX IF NOT EXISTS idx_role_change_requests_status ON role_change_requests(status);
CREATE INDEX IF NOT EXISTS idx_role_change_requests_requester ON role_change_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_role_change_requests_target ON role_change_requests(target_user_id);
CREATE INDEX IF NOT EXISTS idx_role_change_requests_created ON role_change_requests(created_at);

-- =====================================================
-- ROLE CHANGE AUDIT LOGS TABLE
-- =====================================================

-- Table untuk audit trail semua perubahan role
CREATE TABLE IF NOT EXISTS role_change_logs (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    target_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    old_role user_role NOT NULL,
    new_role user_role NOT NULL,
    reason TEXT NOT NULL,
    change_type VARCHAR(30) DEFAULT 'direct' CHECK (change_type IN (
        'direct', 'direct_authorized', 'direct_bypass', 'approved_request', 'onboarding', 'system'
    )),
    request_id INTEGER REFERENCES role_change_requests(id) ON DELETE SET NULL,
    
    -- Metadata
    ip_address INET,
    user_agent TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT different_roles_log CHECK (old_role != new_role)
);

-- Indexes untuk audit queries
CREATE INDEX IF NOT EXISTS idx_role_change_logs_admin ON role_change_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_role_change_logs_target ON role_change_logs(target_user_id);
CREATE INDEX IF NOT EXISTS idx_role_change_logs_created ON role_change_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_role_change_logs_type ON role_change_logs(change_type);

-- =====================================================
-- EMPLOYEE ONBOARDING TABLE
-- =====================================================

-- Table untuk employee onboarding workflow
CREATE TABLE IF NOT EXISTS employee_onboarding (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_role user_role NOT NULL,
    department VARCHAR(100),
    supervisor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    hire_date DATE,
    onboarding_notes TEXT,
    
    -- Status tracking
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    
    -- Completion tracking
    completed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    completed_at TIMESTAMP NULL,
    
    -- Creation tracking
    created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_completion CHECK (
        (status = 'completed' AND completed_by IS NOT NULL AND completed_at IS NOT NULL) OR
        (status != 'completed')
    ),
    CONSTRAINT future_hire_date CHECK (hire_date >= CURRENT_DATE - INTERVAL '1 year'),
    CONSTRAINT staff_target_role CHECK (target_role IN ('staff_kasir', 'operator_lapangan', 'manajer_futsal', 'supervisor_sistem'))
);

-- Indexes untuk onboarding queries
CREATE INDEX IF NOT EXISTS idx_employee_onboarding_user ON employee_onboarding(user_id);
CREATE INDEX IF NOT EXISTS idx_employee_onboarding_status ON employee_onboarding(status);
CREATE INDEX IF NOT EXISTS idx_employee_onboarding_supervisor ON employee_onboarding(supervisor_id);
CREATE INDEX IF NOT EXISTS idx_employee_onboarding_created ON employee_onboarding(created_at);

-- =====================================================
-- SYSTEM LOGS TABLE (for general system logging)
-- =====================================================

-- Table untuk system logs (auto-completion, security events, etc.)
CREATE TABLE IF NOT EXISTS system_logs (
    id SERIAL PRIMARY KEY,
    level VARCHAR(20) NOT NULL CHECK (level IN ('debug', 'info', 'warning', 'error', 'critical')),
    category VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    metadata JSONB,
    
    -- Optional user context
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    
    -- Request context
    ip_address INET,
    user_agent TEXT,
    request_id VARCHAR(100),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes untuk system logs
CREATE INDEX IF NOT EXISTS idx_system_logs_level ON system_logs(level);
CREATE INDEX IF NOT EXISTS idx_system_logs_category ON system_logs(category);
CREATE INDEX IF NOT EXISTS idx_system_logs_created ON system_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_system_logs_user ON system_logs(user_id);

-- GIN index untuk JSONB metadata queries
CREATE INDEX IF NOT EXISTS idx_system_logs_metadata ON system_logs USING GIN (metadata);

-- =====================================================
-- ENHANCED USER TABLE UPDATES
-- =====================================================

-- Add additional fields to users table for professional staff management
ALTER TABLE users ADD COLUMN IF NOT EXISTS employee_id VARCHAR(20) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS department VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS supervisor_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS hire_date DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS termination_date DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(20);

-- Add constraints for professional staff management
ALTER TABLE users ADD CONSTRAINT IF NOT EXISTS chk_termination_after_hire 
    CHECK (termination_date IS NULL OR termination_date >= hire_date);

-- Add indexes for new fields
CREATE INDEX IF NOT EXISTS idx_users_employee_id ON users(employee_id);
CREATE INDEX IF NOT EXISTS idx_users_department ON users(department);
CREATE INDEX IF NOT EXISTS idx_users_supervisor ON users(supervisor_id);
CREATE INDEX IF NOT EXISTS idx_users_hire_date ON users(hire_date);

-- =====================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Trigger untuk auto-update updated_at pada role_change_requests
CREATE OR REPLACE FUNCTION update_role_change_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_role_change_requests_updated_at
    BEFORE UPDATE ON role_change_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_role_change_requests_updated_at();

-- Trigger untuk auto-update updated_at pada employee_onboarding
CREATE OR REPLACE FUNCTION update_employee_onboarding_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_employee_onboarding_updated_at
    BEFORE UPDATE ON employee_onboarding
    FOR EACH ROW
    EXECUTE FUNCTION update_employee_onboarding_updated_at();

-- =====================================================
-- SECURITY FUNCTIONS
-- =====================================================

-- Function untuk generate employee ID
CREATE OR REPLACE FUNCTION generate_employee_id(dept VARCHAR(10) DEFAULT 'GEN')
RETURNS VARCHAR(20) AS $$
DECLARE
    new_id VARCHAR(20);
    counter INTEGER;
BEGIN
    -- Get current year
    SELECT EXTRACT(YEAR FROM NOW()) INTO counter;
    
    -- Generate ID format: DEPT-YYYY-NNNN
    SELECT dept || '-' || counter || '-' || LPAD(COALESCE(MAX(CAST(SUBSTRING(employee_id FROM '\d{4}$') AS INTEGER)), 0) + 1, 4, '0')
    INTO new_id
    FROM users 
    WHERE employee_id LIKE dept || '-' || counter || '-%';
    
    RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Function untuk validate role hierarchy
CREATE OR REPLACE FUNCTION validate_role_hierarchy(current_role user_role, new_role user_role, admin_role user_role)
RETURNS BOOLEAN AS $$
DECLARE
    role_levels JSONB := '{
        "pengunjung": 1,
        "penyewa": 2,
        "staff_kasir": 3,
        "operator_lapangan": 4,
        "manajer_futsal": 5,
        "supervisor_sistem": 6
    }';
    current_level INTEGER;
    new_level INTEGER;
    admin_level INTEGER;
BEGIN
    -- Get role levels
    current_level := (role_levels ->> current_role::text)::INTEGER;
    new_level := (role_levels ->> new_role::text)::INTEGER;
    admin_level := (role_levels ->> admin_role::text)::INTEGER;
    
    -- Admin must have higher level than both current and new role
    RETURN admin_level > GREATEST(current_level, new_level);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- INITIAL DATA SETUP
-- =====================================================

-- Insert sample role change request priorities
INSERT INTO system_logs (level, category, message, metadata) VALUES
('info', 'role_management', 'Role management system initialized', '{"version": "1.0", "features": ["approval_workflow", "audit_trail", "employee_onboarding"]}')
ON CONFLICT DO NOTHING;

-- =====================================================
-- PERMISSIONS & SECURITY
-- =====================================================

-- Grant permissions untuk role management tables
-- (Adjust based on your database user setup)

-- GRANT SELECT, INSERT, UPDATE ON role_change_requests TO booking_futsal_app;
-- GRANT SELECT, INSERT ON role_change_logs TO booking_futsal_app;
-- GRANT SELECT, INSERT, UPDATE ON employee_onboarding TO booking_futsal_app;
-- GRANT SELECT, INSERT ON system_logs TO booking_futsal_app;

-- GRANT USAGE ON SEQUENCE role_change_requests_id_seq TO booking_futsal_app;
-- GRANT USAGE ON SEQUENCE role_change_logs_id_seq TO booking_futsal_app;
-- GRANT USAGE ON SEQUENCE employee_onboarding_id_seq TO booking_futsal_app;
-- GRANT USAGE ON SEQUENCE system_logs_id_seq TO booking_futsal_app;

-- =====================================================
-- MIGRATION COMPLETION
-- =====================================================

-- Log migration completion
INSERT INTO system_logs (level, category, message, metadata) VALUES
('info', 'database_migration', 'Role management migration completed successfully', 
 '{"migration": "role_management_migration.sql", "timestamp": "' || NOW() || '", "tables_created": ["role_change_requests", "role_change_logs", "employee_onboarding", "system_logs"]}');

-- Display completion message
DO $$
BEGIN
    RAISE NOTICE 'Role Management Migration Completed Successfully!';
    RAISE NOTICE 'Tables created: role_change_requests, role_change_logs, employee_onboarding, system_logs';
    RAISE NOTICE 'Enhanced users table with employee management fields';
    RAISE NOTICE 'Triggers and functions created for automation';
    RAISE NOTICE 'Ready for professional role management system!';
END $$;
