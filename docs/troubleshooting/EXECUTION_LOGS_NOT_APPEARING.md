# Execution Logs Not Appearing in Backend Monitor - Troubleshooting Guide

## 🔴 Problem Description

After implementing multi-tenant RLS (Row Level Security) for the `execution_logs` table, new logs are not appearing in the Backend Monitor page (`/dashboard/backend`), even though they are being written to the database.

The page shows: **"Nenhuma execução encontrada. Aguardando mensagens..."**

## 🔍 Root Cause

The issue is caused by the **strict RLS policy** on the `execution_logs` table. The policy requires that:

1. Each log must have a `client_id` field
2. Users can only see logs where `client_id` matches their own `client_id` in `user_profiles`
3. Logs without `client_id` are invisible to regular users

**Potential Issues:**

### Issue 1: User has no `client_id` in `user_profiles`
If the authenticated user doesn't have a `client_id` in their profile, they won't see ANY logs, even if logs exist with correct `client_id`.

### Issue 2: Client ID mismatch
The `client_id` being written to logs doesn't match the user's `client_id`. This can happen if:
- Logs are being created with a different client's ID
- User profile has wrong `client_id`
- `config.id` passed to logger is incorrect

### Issue 3: Logs without `client_id`
If logs are being written without `client_id` (NULL), they will be invisible due to the strict RLS policy implemented in migration `20251121_strict_execution_logs_tenant_isolation.sql`.

## 🛠️ Diagnostic Tools

### 1. Debug Button in Backend Monitor

A **"Debug"** button has been added to the Backend Monitor page. Clicking it will:
- Show your authenticated user ID and client_id
- Display total logs in database
- Show how many logs have/don't have client_id
- Compare your client_id with logs' client_ids
- Provide automated diagnosis

**How to use:**
1. Go to `/dashboard/backend`
2. Click the **"Debug"** button (bug icon)
3. Review the diagnostic information displayed

### 2. Debug API Endpoint

A new endpoint has been created: **`GET /api/backend/debug-logs`**

This endpoint:
- Uses service role to bypass RLS
- Shows all logs in the database
- Compares your client_id with logs
- Provides detailed diagnosis

**How to test manually:**

```bash
# Get your auth token from browser (check Network tab in DevTools)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://your-domain.com/api/backend/debug-logs
```

### 3. Enhanced API Logging

The `/api/backend/stream` endpoint now logs detailed information:
- Authenticated user ID and email
- User's client_id from user_profiles
- Query results (total logs, execution IDs)
- Sample client_ids from logs

**Check server logs/console to see this output.**

## 🔧 Solutions

### Solution 1: Add `client_id` to User Profile

If the diagnosis shows **"USER HAS NO client_id"**, you need to add it:

```sql
-- Find your user ID first
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- Get available client IDs
SELECT id, name, slug FROM public.clients WHERE status = 'active';

-- Add client_id to user profile
UPDATE public.user_profiles
SET client_id = 'CLIENT-UUID-HERE'
WHERE id = 'USER-UUID-HERE';
```

### Solution 2: Fix Client ID Mismatch

If diagnosis shows **"CLIENT_ID MISMATCH"**, you have two options:

**Option A: Update user's client_id**
```sql
UPDATE public.user_profiles
SET client_id = 'CORRECT-CLIENT-UUID'
WHERE id = 'USER-UUID';
```

**Option B: Migrate logs to user's client_id** (if logs are correct but user profile is wrong)
```sql
-- This function was created by the migration
SELECT migrate_execution_logs_to_client('USER-CLIENT-UUID', 'PHONE-NUMBER');
```

### Solution 3: Fix Logger to Include `client_id`

If logs are being created WITHOUT `client_id`, check the code:

**File: `src/flows/chatbotFlow.ts`**
```typescript
// Line 54: Ensure config.id is being passed
const executionId = logger.startExecution({
  source: 'chatbotFlow',
  payload_from: payload.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.from,
}, config.id) // ⚡ This MUST be present
```

**File: `src/lib/logger.ts`**
```typescript
// Verify all insert operations include client_id:
// Line 50, 72, 170 - all should have client_id: this.clientId
```

### Solution 4: Temporarily Relax RLS (NOT RECOMMENDED)

**⚠️ SECURITY WARNING**: Only use this for debugging, not in production!

```sql
-- This allows users to see logs without client_id
-- REVERT THIS AFTER DEBUGGING
DROP POLICY IF EXISTS "Users can view own client execution logs" ON public.execution_logs;

CREATE POLICY "Users can view own client execution logs"
  ON public.execution_logs
  FOR SELECT
  TO authenticated
  USING (
    client_id IN (
      SELECT client_id FROM public.user_profiles
      WHERE id = auth.uid()
    )
    OR client_id IS NULL  -- ⚠️ BYPASS - Remove in production
  );
```

## 📊 Verification Steps

After applying a fix:

1. **Check console logs** in browser DevTools and server logs
2. **Click Debug button** again to verify diagnosis shows green
3. **Send a test WhatsApp message** to generate new logs
4. **Refresh the Backend Monitor page** to see if logs appear
5. **Check the database directly**:

```sql
-- Verify logs have client_id
SELECT 
  id,
  execution_id,
  node_name,
  client_id,
  timestamp
FROM public.execution_logs
ORDER BY timestamp DESC
LIMIT 10;

-- Verify your user profile has client_id
SELECT 
  up.id,
  au.email,
  up.client_id,
  c.name as client_name
FROM public.user_profiles up
JOIN auth.users au ON au.id = up.id
LEFT JOIN public.clients c ON c.id = up.client_id
WHERE au.email = 'your-email@example.com';
```

## 🧹 Cleanup After Fix

Once the issue is resolved, remove the debug tools:

1. **Remove the Debug button** from `/src/app/dashboard/backend/page.tsx`:
   - Remove the `debugInfo` state
   - Remove the `fetchDebugInfo` function
   - Remove the Debug button
   - Remove the debug info card

2. **Delete the debug endpoint**: `/src/app/api/backend/debug-logs/route.ts`

3. **Remove enhanced logging** from `/src/app/api/backend/stream/route.ts`:
   - Keep minimal error logging
   - Remove diagnostic console.logs

4. **Commit the cleanup**:
```bash
git add .
git commit -m "chore: remove debug tools after fixing execution_logs issue"
```

## 📚 Related Files

- **Frontend**: `src/app/dashboard/backend/page.tsx`
- **API**: `src/app/api/backend/stream/route.ts`
- **Debug API**: `src/app/api/backend/debug-logs/route.ts`
- **Logger**: `src/lib/logger.ts`
- **Flow**: `src/flows/chatbotFlow.ts`
- **Migration**: `migrations/20251121_fix_execution_logs_multi_tenant.sql`
- **Strict Policy**: `migrations/20251121_strict_execution_logs_tenant_isolation.sql`

## 🎯 Prevention

To prevent this issue in the future:

1. **Always set `client_id` when creating users**:
   ```sql
   INSERT INTO public.user_profiles (id, email, client_id)
   VALUES ('user-uuid', 'email@example.com', 'client-uuid');
   ```

2. **Validate logger always receives `client_id`**:
   - Add TypeScript strict checks
   - Add validation in logger constructor

3. **Add monitoring**:
   - Alert when logs are created without `client_id`
   - Monitor RLS policy blocking queries

4. **Document the requirement**:
   - Update onboarding docs
   - Add to user creation scripts

## 💡 Quick Commands Reference

```sql
-- Check if logs exist
SELECT count(*) FROM public.execution_logs;

-- Check logs without client_id
SELECT count(*) FROM public.execution_logs WHERE client_id IS NULL;

-- Check your client_id
SELECT client_id FROM public.user_profiles WHERE id = auth.uid();

-- Migrate orphan logs
SELECT migrate_execution_logs_to_client('your-client-uuid');

-- Delete orphan logs (use with caution!)
DELETE FROM public.execution_logs WHERE client_id IS NULL;
```

---

**Status**: Debug tools are now active. Use them to identify the specific issue in your environment.
