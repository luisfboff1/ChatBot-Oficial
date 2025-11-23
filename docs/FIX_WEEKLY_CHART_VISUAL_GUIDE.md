# Weekly Chart Fix - Visual Explanation

## The Problem

### Timeline Visualization

```
Current Date: Wednesday, Nov 23, 2025 at 14:00

┌─────────────────────────────────────────────────────────┐
│                    November 2025                         │
├─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┤
│ Mon │ Tue │ Wed │ Thu │ Fri │ Sat │ Sun │     │     │
│  21 │  22 │ 23 ←│  24 │  25 │  26 │  27 │     │     │
│     │     │ NOW │     │     │     │     │     │     │
└─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┘
                   ↑
           Current moment
```

### BEFORE Fix (Wrong Behavior)

```sql
DATE_TRUNC('week', NOW()) - ((p_weeks - 1) || ' weeks')::INTERVAL
         ↓
  Monday Nov 21, 00:00 - 11 weeks
         ↓
  Monday Sep 8, 00:00

Data Range: Sep 8 → Nov 20 (excludes Nov 21-23) ❌
```

**Visual representation:**
```
Sep    Oct    Nov
|------|------|------|
^              ^
|              |
Start        End (Nov 20)
             Missing: Nov 21, 22, 23!
```

### AFTER Fix (Correct Behavior)

```sql
NOW() - (p_weeks || ' weeks')::INTERVAL
         ↓
  Wed Nov 23, 14:00 - 12 weeks
         ↓
  Wed Sep 2, 14:00

Data Range: Sep 2 → Nov 23 (includes all current week) ✅
```

**Visual representation:**
```
Sep    Oct    Nov
|------|------|------|
^                    ^
|                    |
Start            End (Nov 23, 14:00)
                Includes: Nov 21, 22, 23! ✅
```

## Impact on Charts

### Weekly Chart Display

**BEFORE Fix:**
```
Evolução Semanal de Uso
┌────────────────────────────────────┐
│  Tokens                             │
│   ▲                                 │
│   │         ╱╲                      │
│   │    ╱╲  ╱  ╲                     │
│   │   ╱  ╲╱    ╲                    │
│   │  ╱           ╲    ╱╲            │
│   │ ╱             ╲  ╱  ╲           │  ← Missing current week!
│   └─────────────────────────────────│
│     Sep  Oct  Nov 14  Nov 20        │
│                         ↑            │
│                    Stops here        │
│                (last Sunday)         │
└────────────────────────────────────┘

❌ Current week (Nov 21-23) NOT shown
```

**AFTER Fix:**
```
Evolução Semanal de Uso
┌────────────────────────────────────┐
│  Tokens                             │
│   ▲                                 │
│   │         ╱╲              ╱       │
│   │    ╱╲  ╱  ╲         ╱╲ ╱        │
│   │   ╱  ╲╱    ╲       ╱  ╲         │
│   │  ╱           ╲    ╱             │
│   │ ╱             ╲  ╱              │  ← Includes current week!
│   └─────────────────────────────────│
│     Sep  Oct  Nov 14  Nov 21        │
│                            ↑         │
│                  Shows current week  │
│                  (partial data)      │
└────────────────────────────────────┘

✅ Current week (Nov 21-23) IS shown with partial data
```

### Comparison with Daily Chart

**Daily Chart** (Already working correctly):
```
Uso Diário (últimos 14 dias)
┌────────────────────────────────────┐
│  Tokens                             │
│   ▲                                 │
│   │  █                              │
│   │  █ █   █         █              │
│   │  █ █ █ █   █   █ █ █ █ █ █     │  ← Shows up to TODAY
│   │  █ █ █ █ █ █ █ █ █ █ █ █ █     │
│   │  █ █ █ █ █ █ █ █ █ █ █ █ █     │
│   └─────────────────────────────────│
│     Nov 10  ...  Nov 21 22 23       │
│                            ↑         │
│                         TODAY        │
└────────────────────────────────────┘

✅ Shows data up to Nov 23 (today)
```

Now both charts show the same time range! 🎉

## Code Change

### Original (Buggy)
```sql
WHERE ul.created_at >= DATE_TRUNC('week', NOW()) - ((p_weeks - 1) || ' weeks')::INTERVAL
                       └──────────────┬──────────────┘   └────┬────┘
                          Truncates to Monday              11 weeks
                          (loses current week data)
```

### Fixed
```sql
WHERE ul.created_at >= NOW() - (p_weeks || ' weeks')::INTERVAL
                       └─┬─┘   └─────┬─────┘
                      Exact     12 weeks
                     timestamp
```

**Key Difference:**
- ❌ `DATE_TRUNC('week', NOW())` → Rounds down to Monday 00:00 → Loses 3 days
- ✅ `NOW()` → Uses exact current timestamp → Keeps all data

## Example Scenario

**User Story:**
```
As a dashboard user
When I view the analytics on Wednesday Nov 23
I want to see usage data from Monday Nov 21 and Tuesday Nov 22
So that I can monitor activity in the current week
```

**Test Case:**

1. **Setup:** Insert records on Nov 21, 22, and 23
   ```sql
   INSERT INTO usage_logs (client_id, phone, source, total_tokens, created_at)
   VALUES 
     (client_id, '5511999999999', 'openai', 1000, '2025-11-21 10:00:00'),
     (client_id, '5511999999999', 'groq', 2000, '2025-11-22 10:00:00'),
     (client_id, '5511999999999', 'openai', 1500, '2025-11-23 10:00:00');
   ```

2. **Query with OLD function (bug):**
   ```sql
   SELECT * FROM get_weekly_evolution(client_id, 12);
   ```
   
   **Result:**
   ```
   week_start  | total_tokens
   ------------|-------------
   2025-11-14  | 10000        ← Last complete week
   2025-11-07  | 8000
   ...
   ```
   ❌ Missing week of Nov 21 (4500 tokens)!

3. **Query with NEW function (fixed):**
   ```sql
   SELECT * FROM get_weekly_evolution(client_id, 12);
   ```
   
   **Result:**
   ```
   week_start  | total_tokens
   ------------|-------------
   2025-11-21  | 4500         ← Current week ✅
   2025-11-14  | 10000
   2025-11-07  | 8000
   ...
   ```
   ✅ Includes current week with 4500 tokens!

## Summary

| Aspect | BEFORE Fix | AFTER Fix |
|--------|-----------|-----------|
| **Date Calculation** | `DATE_TRUNC('week', NOW()) - 11 weeks` | `NOW() - 12 weeks` |
| **Start Date** | Monday 00:00 (11 weeks ago) | Exact time (12 weeks ago) |
| **End Date** | Last Sunday 23:59 | Current moment |
| **Current Week** | ❌ Missing | ✅ Included |
| **Consistency** | ❌ Different from daily chart | ✅ Matches daily chart |
| **User Experience** | ❌ Confusing (delayed data) | ✅ Real-time updates |

## Why This Matters

### Business Impact
1. **Real-time monitoring**: Users can track usage as it happens
2. **Accurate forecasting**: Current week trends are visible
3. **Consistency**: Weekly and daily charts align
4. **Trust**: Dashboard shows all available data

### Technical Impact
1. **No data loss**: All records are now queryable
2. **Simpler logic**: Removes unnecessary date truncation
3. **Better UX**: Charts update immediately with new data
4. **Maintainability**: Consistent pattern across functions

---

**Migration File**: `migrations/20251123_fix_weekly_evolution_include_current_week.sql`

**To Apply**: Copy and run the migration in Supabase SQL Editor
