-- =====================================================
-- Fix: Weekly Evolution Chart Not Showing Recent Days
-- =====================================================
-- This migration fixes the get_weekly_evolution function
-- to include data from the current incomplete week.
--
-- Problem: The function was using DATE_TRUNC('week', NOW())
-- which starts from the beginning of the current week (Monday),
-- excluding any data from the current week.
--
-- Solution: Use NOW() directly instead of DATE_TRUNC('week', NOW())
-- to include all data up to the current moment.
--
-- Run in Supabase SQL Editor
-- =====================================================

-- Drop the existing function
DROP FUNCTION IF EXISTS get_weekly_evolution(UUID, INTEGER);

-- Recreate with fixed logic
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
      -- FIX: Changed from DATE_TRUNC('week', NOW()) to NOW()
      -- This includes data from the current incomplete week
      AND ul.created_at >= NOW() - (p_weeks || ' weeks')::INTERVAL
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

-- =====================================================
-- NOTES
-- =====================================================
-- 1. This fix ensures the weekly chart shows all data up to NOW()
-- 2. Matches the behavior of the daily chart (get_daily_usage)
-- 3. The current week will show partial data until the week completes
-- 4. No data loss - only the query logic was changed
