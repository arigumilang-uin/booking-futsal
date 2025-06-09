-- DEBUG AUDIT SYSTEM - SQL Commands untuk Testing
-- Jalankan command ini di Railway SQL tools untuk debugging

-- 1. CEK TOTAL AUDIT LOGS
SELECT COUNT(*) as total_audit_logs FROM audit_logs;

-- 2. CEK AUDIT LOGS DENGAN DETAIL
SELECT 
    id,
    action,
    resource_type,
    table_name,
    created_at,
    user_id,
    NOW() as current_time,
    AGE(NOW(), created_at) as age
FROM audit_logs 
ORDER BY created_at DESC;

-- 3. CEK AUDIT LOGS HARI INI
SELECT COUNT(*) as today_logs 
FROM audit_logs 
WHERE DATE(created_at) = CURRENT_DATE;

-- 4. CEK STATISTICS QUERY (yang digunakan frontend)
SELECT
  COUNT(*) as total_logs,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT COALESCE(resource_type, table_name)) as resource_types,
  COUNT(CASE WHEN action = 'CREATE' THEN 1 END) as create_actions,
  COUNT(CASE WHEN action = 'UPDATE' THEN 1 END) as update_actions,
  COUNT(CASE WHEN action = 'DELETE' THEN 1 END) as delete_actions,
  COUNT(CASE WHEN action = 'LOGIN' THEN 1 END) as login_actions,
  COUNT(CASE WHEN action = 'LOGOUT' THEN 1 END) as logout_actions
FROM audit_logs;

-- 5. CEK TODAY LOGS QUERY
SELECT
  COUNT(*) as today_logs,
  COUNT(DISTINCT user_id) as today_unique_users
FROM audit_logs
WHERE DATE(created_at) = CURRENT_DATE;

-- 6. CEK CRITICAL ACTIONS QUERY
SELECT
  COUNT(*) as critical_actions
FROM audit_logs
WHERE action IN ('DELETE', 'LOGIN_FAILED', 'MANUAL_AUTO_COMPLETION_TRIGGER')
AND created_at >= NOW() - INTERVAL '30 days';

-- 7. TEST CLEANUP QUERY (DRY RUN) - 30 DAYS
SELECT 
    id,
    action,
    created_at,
    NOW() - INTERVAL '30 days' as cutoff_date_30,
    (created_at < NOW() - INTERVAL '30 days') as will_be_deleted_30days,
    NOW() - INTERVAL '2 days' as cutoff_date_2,
    (created_at < NOW() - INTERVAL '2 days') as will_be_deleted_2days
FROM audit_logs 
ORDER BY created_at DESC;

-- 8. COUNT RECORDS TO DELETE (30 DAYS)
SELECT COUNT(*) as records_to_delete_30days
FROM audit_logs
WHERE created_at < NOW() - INTERVAL '30 days';

-- 9. COUNT RECORDS TO DELETE (2 DAYS) - untuk test
SELECT COUNT(*) as records_to_delete_2days
FROM audit_logs
WHERE created_at < NOW() - INTERVAL '2 days';

-- 10. CEK TIMEZONE SETTINGS
SELECT 
    NOW() as current_timestamp,
    CURRENT_DATE as current_date,
    CURRENT_TIME as current_time,
    EXTRACT(timezone_hour FROM NOW()) as timezone_offset;

-- 11. CEK AUDIT LOGS DENGAN TIMEZONE INFO
SELECT 
    id,
    action,
    created_at,
    created_at AT TIME ZONE 'UTC' as created_at_utc,
    NOW() as now_local,
    NOW() AT TIME ZONE 'UTC' as now_utc,
    AGE(NOW(), created_at) as age_from_now
FROM audit_logs 
ORDER BY created_at DESC;

-- 12. TEST INTERVAL SYNTAX (yang digunakan di cleanup)
SELECT 
    NOW() - INTERVAL '1 day' * 30 as interval_30_days,
    NOW() - INTERVAL '30 days' as interval_30_days_alt,
    NOW() - INTERVAL '2 days' as interval_2_days;

-- 13. FINAL TEST - SIMULATE CLEANUP 2 DAYS (untuk test record 7 Jun)
-- JANGAN JALANKAN INI KECUALI INGIN BENAR-BENAR MENGHAPUS!
-- DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '2 days';

-- 14. CEK PAGINATION QUERY (yang digunakan frontend)
SELECT al.id, al.uuid, al.user_id, al.action, al.resource_type, al.table_name, al.resource_id,
       al.old_values, al.new_values, al.ip_address, al.user_agent,
       al.additional_info, al.created_at,
       u.name as user_name, u.email as user_email, u.role as user_role
FROM audit_logs al
LEFT JOIN users u ON al.user_id = u.id
WHERE 1=1
ORDER BY al.created_at DESC 
LIMIT 20 OFFSET 0;

-- 15. CEK COUNT QUERY (yang digunakan untuk pagination)
SELECT COUNT(*) as total
FROM audit_logs al
LEFT JOIN users u ON al.user_id = u.id
WHERE 1=1;

-- EXPECTED RESULTS:
-- 1. total_audit_logs: harus > 0 (seharusnya 9 berdasarkan data Anda)
-- 2. today_logs: harus > 0 (login hari ini)
-- 3. critical_actions: harus 1 (MANUAL_AUTO_COMPLETION_TRIGGER)
-- 4. records_to_delete_2days: harus 1 (record 7 Jun 2025)
-- 5. pagination total: harus sama dengan total_audit_logs

-- TROUBLESHOOTING:
-- Jika total_audit_logs = 0: Ada masalah dengan table audit_logs
-- Jika today_logs = 0: Timezone issue atau tidak ada login hari ini
-- Jika critical_actions = 0: Query filter bermasalah
-- Jika records_to_delete_2days = 0: Interval calculation bermasalah
