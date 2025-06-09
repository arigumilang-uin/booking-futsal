-- TEST CLEANUP OPERATIONS - Verify cleanup functionality

-- 1. Check current audit logs with age calculation
SELECT 
    id,
    action,
    created_at,
    NOW() as current_time,
    AGE(NOW(), created_at) as age,
    EXTRACT(EPOCH FROM (NOW() - created_at))/86400 as days_old,
    -- Test different retention periods
    (created_at < NOW() - INTERVAL '1 hour') as older_than_1hour,
    (created_at < NOW() - INTERVAL '1 day') as older_than_1day,
    (created_at < NOW() - INTERVAL '2 days') as older_than_2days,
    (created_at < NOW() - INTERVAL '3 days') as older_than_3days
FROM audit_logs 
ORDER BY created_at DESC;

-- 2. Count records that would be deleted with different retention periods
SELECT 
    'Records older than 1 hour' as retention_period,
    COUNT(*) as count_to_delete
FROM audit_logs
WHERE created_at < NOW() - INTERVAL '1 hour'

UNION ALL

SELECT 
    'Records older than 1 day' as retention_period,
    COUNT(*) as count_to_delete
FROM audit_logs
WHERE created_at < NOW() - INTERVAL '1 day'

UNION ALL

SELECT 
    'Records older than 2 days' as retention_period,
    COUNT(*) as count_to_delete
FROM audit_logs
WHERE created_at < NOW() - INTERVAL '2 days'

UNION ALL

SELECT 
    'Records older than 3 days' as retention_period,
    COUNT(*) as count_to_delete
FROM audit_logs
WHERE created_at < NOW() - INTERVAL '3 days'

UNION ALL

SELECT 
    'Records older than 30 days' as retention_period,
    COUNT(*) as count_to_delete
FROM audit_logs
WHERE created_at < NOW() - INTERVAL '30 days';

-- 3. Test the exact query used in cleanup function (with 1 day retention for testing)
SELECT 
    'Using cleanup function syntax (1 day)' as test_type,
    COUNT(*) as count_to_delete
FROM audit_logs
WHERE created_at < NOW() - INTERVAL '1 day' * 1;

-- 4. Show which specific records would be deleted with 2 day retention
SELECT 
    id,
    action,
    created_at,
    user_id,
    'WOULD BE DELETED with 2 day retention' as note
FROM audit_logs
WHERE created_at < NOW() - INTERVAL '2 days'
ORDER BY created_at DESC;

-- 5. Show which specific records would be deleted with 1 day retention  
SELECT 
    id,
    action,
    created_at,
    user_id,
    'WOULD BE DELETED with 1 day retention' as note
FROM audit_logs
WHERE created_at < NOW() - INTERVAL '1 day'
ORDER BY created_at DESC;

-- 6. ACTUAL TEST CLEANUP (1 day retention) - UNCOMMENT TO RUN
-- WARNING: This will actually delete records!
-- DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '1 day';

-- 7. Check timezone settings that might affect cleanup
SELECT 
    NOW() as server_time,
    NOW() AT TIME ZONE 'UTC' as utc_time,
    CURRENT_SETTING('timezone') as timezone_setting,
    EXTRACT(timezone_hour FROM NOW()) as timezone_offset_hours;

-- 8. Manual verification of the 7 Jun record specifically
SELECT 
    id,
    action,
    created_at,
    created_at AT TIME ZONE 'UTC' as created_at_utc,
    NOW() as now_local,
    NOW() AT TIME ZONE 'UTC' as now_utc,
    AGE(NOW(), created_at) as age_from_now,
    EXTRACT(EPOCH FROM (NOW() - created_at))/86400 as days_old_exact,
    -- Test if it should be deleted with different periods
    (created_at < NOW() - INTERVAL '1 day') as delete_1day,
    (created_at < NOW() - INTERVAL '2 days') as delete_2days,
    (created_at < NOW() - INTERVAL '3 days') as delete_3days
FROM audit_logs 
WHERE action = 'MANUAL_AUTO_COMPLETION_TRIGGER'
ORDER BY created_at DESC;

-- EXPECTED RESULTS:
-- The 7 Jun record (MANUAL_AUTO_COMPLETION_TRIGGER) should show:
-- - days_old_exact: approximately 2+ days
-- - delete_1day: true (should be deleted with 1 day retention)
-- - delete_2days: true (should be deleted with 2 day retention)
-- - delete_3days: false (should NOT be deleted with 3 day retention)

-- If the record shows delete_1day = false, there might be a timezone issue
-- If the record shows delete_2days = false, the cleanup logic might be wrong

-- TO TEST CLEANUP MANUALLY:
-- 1. Run this script to see which records would be deleted
-- 2. If results look correct, uncomment the DELETE statement above
-- 3. Run the DELETE to test actual cleanup
-- 4. Verify the record was deleted by running the first query again
