-- DEBUG CLEANUP OPERATIONS - Test why 7 Jun record isn't being deleted

-- 1. Current time and timezone info
SELECT 
    NOW() as current_timestamp,
    CURRENT_DATE as current_date,
    CURRENT_TIME as current_time,
    EXTRACT(timezone_hour FROM NOW()) as timezone_offset;

-- 2. Check the specific 7 Jun record
SELECT 
    id,
    action,
    created_at,
    created_at AT TIME ZONE 'UTC' as created_at_utc,
    NOW() as now_local,
    NOW() AT TIME ZONE 'UTC' as now_utc,
    AGE(NOW(), created_at) as age_from_now,
    EXTRACT(EPOCH FROM (NOW() - created_at))/86400 as days_old
FROM audit_logs 
WHERE action = 'MANUAL_AUTO_COMPLETION_TRIGGER'
ORDER BY created_at DESC;

-- 3. Test different cleanup intervals for the 7 Jun record
SELECT 
    id,
    action,
    created_at,
    -- Test 1 day cleanup
    NOW() - INTERVAL '1 day' as cutoff_1day,
    (created_at < NOW() - INTERVAL '1 day') as will_delete_1day,
    -- Test 2 day cleanup  
    NOW() - INTERVAL '2 days' as cutoff_2days,
    (created_at < NOW() - INTERVAL '2 days') as will_delete_2days,
    -- Test 3 day cleanup
    NOW() - INTERVAL '3 days' as cutoff_3days,
    (created_at < NOW() - INTERVAL '3 days') as will_delete_3days,
    -- Test 30 day cleanup
    NOW() - INTERVAL '30 days' as cutoff_30days,
    (created_at < NOW() - INTERVAL '30 days') as will_delete_30days
FROM audit_logs 
WHERE action = 'MANUAL_AUTO_COMPLETION_TRIGGER';

-- 4. Test the exact query used in cleanup function
SELECT COUNT(*) as count_to_delete_30days
FROM audit_logs
WHERE created_at < NOW() - INTERVAL '1 day' * 30;

SELECT COUNT(*) as count_to_delete_2days
FROM audit_logs
WHERE created_at < NOW() - INTERVAL '1 day' * 2;

-- 5. Check if there's a timezone issue
SELECT 
    id,
    action,
    created_at,
    created_at::timestamp as created_at_no_tz,
    NOW()::timestamp as now_no_tz,
    (created_at::timestamp < (NOW() - INTERVAL '2 days')::timestamp) as will_delete_no_tz
FROM audit_logs 
WHERE action = 'MANUAL_AUTO_COMPLETION_TRIGGER';

-- 6. Manual test - what would be deleted with 2 day retention
SELECT 
    id,
    action,
    created_at,
    'Would be deleted with 2 day retention' as note
FROM audit_logs
WHERE created_at < NOW() - INTERVAL '2 days'
ORDER BY created_at DESC;

-- 7. Manual test - what would be deleted with 1 day retention  
SELECT 
    id,
    action,
    created_at,
    'Would be deleted with 1 day retention' as note
FROM audit_logs
WHERE created_at < NOW() - INTERVAL '1 day'
ORDER BY created_at DESC;

-- EXPECTED RESULTS:
-- The 7 Jun record should show will_delete_2days = true
-- If it shows false, there might be a timezone issue
-- The record is from 2025-06-07 13:17:53.859951, which is about 2 days old

-- TROUBLESHOOTING:
-- If will_delete_2days = false: Check timezone settings
-- If count_to_delete_2days = 0: The query logic might be wrong
-- If manual test shows no results: The interval calculation is incorrect
