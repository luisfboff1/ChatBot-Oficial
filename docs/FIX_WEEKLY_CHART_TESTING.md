# Testing Guide: Weekly Analytics Chart Fix

## Overview
This document describes how to verify the fix for the weekly analytics chart not showing recent days.

## Problem Description
**Before the fix**: The weekly chart (`get_weekly_evolution` function) was not showing data from the current incomplete week. For example, if today is Wednesday, November 23, the chart would only show data up to the previous Sunday (November 20), excluding Monday-Tuesday of the current week.

**After the fix**: The weekly chart now shows all data up to the current moment, including the current incomplete week.

## Migration to Apply
Run this migration in Supabase SQL Editor:
```
migrations/20251123_fix_weekly_evolution_include_current_week.sql
```

## How to Test

### Method 1: Manual SQL Test (Recommended)

1. **Open Supabase SQL Editor**
   - Go to your Supabase project
   - Navigate to SQL Editor

2. **Insert test data for the current week** (if needed)
   ```sql
   -- Insert a test record for today
   INSERT INTO usage_logs (
     client_id, 
     phone, 
     source, 
     model, 
     total_tokens, 
     cost_usd,
     created_at
   )
   SELECT 
     id,
     '5511999999999',
     'openai',
     'gpt-4',
     1000,
     0.01,
     NOW() -- Today's data
   FROM clients
   LIMIT 1;
   
   -- Insert a test record for 2 days ago
   INSERT INTO usage_logs (
     client_id, 
     phone, 
     source, 
     model, 
     total_tokens, 
     cost_usd,
     created_at
   )
   SELECT 
     id,
     '5511999999999',
     'groq',
     'llama-3.1-70b',
     2000,
     0.001,
     NOW() - INTERVAL '2 days' -- 2 days ago
   FROM clients
   LIMIT 1;
   ```

3. **Apply the fix migration**
   - Copy and paste the entire content of `migrations/20251123_fix_weekly_evolution_include_current_week.sql`
   - Execute in SQL Editor

4. **Test the function**
   ```sql
   -- Get your client_id
   SELECT id FROM clients LIMIT 1;
   
   -- Test the function (replace with your client_id)
   SELECT * FROM get_weekly_evolution(
     'YOUR_CLIENT_ID_HERE'::UUID,
     12
   )
   ORDER BY week_start DESC;
   ```

5. **Verify the results**
   - The results should include a row for the current week
   - The `week_start` of the most recent row should be Monday of the current week
   - The `total_tokens` should include data from today and other days this week

### Method 2: Test via Dashboard UI

1. **Apply the migration** in Supabase SQL Editor

2. **Open the Analytics Dashboard**
   - Navigate to `http://localhost:3000/dashboard/analytics` (or your deployed URL)
   - Login if required

3. **Check the "Evolução Semanal de Uso" chart**
   - The chart should now show data for the current week
   - Compare with the "Uso Diário" chart - both should show recent days
   - The most recent week in the weekly chart should include today's data

4. **Open Browser DevTools Console**
   - Look for console logs from `WeeklyUsageChart`
   - Check the output: `[WeeklyUsageChart] Week range:`
   - The `newest` date should be Monday of the current week

### Method 3: Compare Before/After SQL

**Before Fix** (wrong behavior):
```sql
-- This query EXCLUDES current week data
SELECT 
  DATE_TRUNC('week', created_at)::DATE as week_start,
  COUNT(*) as records
FROM usage_logs
WHERE client_id = 'YOUR_CLIENT_ID'
  AND created_at >= DATE_TRUNC('week', NOW()) - ((12 - 1) || ' weeks')::INTERVAL
GROUP BY week_start
ORDER BY week_start DESC
LIMIT 1;
-- Result: Shows last COMPLETE week, not current week
```

**After Fix** (correct behavior):
```sql
-- This query INCLUDES current week data
SELECT 
  DATE_TRUNC('week', created_at)::DATE as week_start,
  COUNT(*) as records
FROM usage_logs
WHERE client_id = 'YOUR_CLIENT_ID'
  AND created_at >= NOW() - (12 || ' weeks')::INTERVAL
GROUP BY week_start
ORDER BY week_start DESC
LIMIT 1;
-- Result: Shows current week with partial data
```

## Expected Behavior After Fix

### Weekly Chart (`get_weekly_evolution`)
- ✅ Shows data from the last 12 weeks INCLUDING the current incomplete week
- ✅ Current week shows partial data (e.g., Monday-Wednesday if today is Wednesday)
- ✅ Matches the date range of the daily chart
- ✅ Updates in real-time as new data arrives during the week

### Daily Chart (`get_daily_usage`)
- ✅ Already working correctly (unchanged)
- ✅ Shows data from the last N days up to today

## Verification Checklist

- [ ] Migration applied successfully in Supabase
- [ ] No SQL errors when running the migration
- [ ] Function `get_weekly_evolution` exists and is callable
- [ ] SQL test query returns data for the current week
- [ ] Dashboard weekly chart displays current week
- [ ] Weekly chart date range matches daily chart
- [ ] Console logs show correct date ranges
- [ ] No errors in browser console

## Rollback (if needed)

If you need to rollback to the old behavior:

```sql
-- Restore original function (with the bug)
CREATE OR REPLACE FUNCTION get_weekly_evolution(
  p_client_id UUID,
  p_weeks INTEGER DEFAULT 12
)
RETURNS TABLE (
  week_start DATE,
  week_number INTEGER,
  total_tokens BIGINT,
  openai_tokens BIGINT,
  groq_tokens BIGINT,
  total_cost NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH weeks AS (
    SELECT 
      DATE_TRUNC('week', ul.created_at)::DATE as week_start,
      EXTRACT(WEEK FROM ul.created_at)::INTEGER as week_number,
      ul.source,
      SUM(ul.total_tokens) as tokens,
      SUM(ul.cost_usd) as cost
    FROM usage_logs ul
    WHERE ul.client_id = p_client_id
      AND ul.created_at >= DATE_TRUNC('week', NOW()) - ((p_weeks - 1) || ' weeks')::INTERVAL
    GROUP BY DATE_TRUNC('week', ul.created_at), EXTRACT(WEEK FROM ul.created_at), ul.source
  )
  SELECT
    w.week_start,
    w.week_number,
    SUM(w.tokens)::BIGINT as total_tokens,
    SUM(CASE WHEN w.source = 'openai' THEN w.tokens ELSE 0 END)::BIGINT as openai_tokens,
    SUM(CASE WHEN w.source = 'groq' THEN w.tokens ELSE 0 END)::BIGINT as groq_tokens,
    SUM(w.cost)::NUMERIC as total_cost
  FROM weeks w
  GROUP BY w.week_start, w.week_number
  ORDER BY w.week_start ASC;
END;
$$ LANGUAGE plpgsql;
```

## Technical Notes

### Why the Fix Works

**Root Cause**: `DATE_TRUNC('week', NOW())` returns the start of the current week (Monday at 00:00:00). Subtracting `(p_weeks - 1)` weeks from this excludes any data from the current week.

**Example**:
- Today: Wednesday, November 23, 2025 at 14:00
- `DATE_TRUNC('week', NOW())` = Monday, November 21, 2025 at 00:00
- `DATE_TRUNC('week', NOW()) - INTERVAL '11 weeks'` = Monday, September 8, 2025
- **Data Range**: September 8 to November 20 (excludes Nov 21-23)

**The Fix**: Using `NOW()` directly:
- Today: Wednesday, November 23, 2025 at 14:00
- `NOW() - INTERVAL '12 weeks'` = Wednesday, September 2, 2025 at 14:00
- **Data Range**: September 2 to November 23 (includes all current week data)

### Consistency with Daily Chart

The daily chart function (`get_daily_usage`) already uses this correct approach:
```sql
WHERE ul.created_at >= NOW() - (p_days || ' days')::INTERVAL
```

The fix aligns the weekly chart with the same logic.

## Related Files

- **Migration File**: `migrations/20251123_fix_weekly_evolution_include_current_week.sql`
- **Original Migration**: `migrations/011_analytics_usage_tracking.sql` (documented)
- **API Route**: `src/app/api/analytics/route.ts` (line 47-51)
- **React Component**: `src/components/WeeklyUsageChart.tsx`
- **Database Function**: `get_weekly_evolution` in Supabase

## Contact

If you encounter any issues applying this fix, check:
1. Supabase SQL Editor error messages
2. Browser console for API errors
3. Network tab for `/api/analytics` response
4. Backend logs in Vercel/deployment platform
