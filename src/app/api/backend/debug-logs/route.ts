/**
 * 🔍 DEBUG ENDPOINT: Verify execution_logs data
 * 
 * This endpoint bypasses RLS to help diagnose why logs aren't appearing
 * TEMPORARY - Remove after debugging
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      )
    }

    // Use service role to bypass RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Get authenticated user info (for comparison)
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    let authenticatedUserId: string | null = null
    let userClientId: string | null = null

    if (token) {
      const anonClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        },
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })

      const { data: { user } } = await anonClient.auth.getUser()
      if (user) {
        authenticatedUserId = user.id
        
        // Get user's client_id
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('client_id')
          .eq('id', user.id)
          .single()
        
        userClientId = profile?.client_id || null
      }
    }

    // Get total count of execution_logs
    const { count: totalCount } = await supabase
      .from('execution_logs')
      .select('*', { count: 'exact', head: true })

    // Get logs without client_id
    const { count: logsWithoutClientId } = await supabase
      .from('execution_logs')
      .select('*', { count: 'exact', head: true })
      .is('client_id', null)

    // Get recent logs (last 10)
    const { data: recentLogs, error: logsError } = await supabase
      .from('execution_logs')
      .select('id, execution_id, node_name, client_id, timestamp, status')
      .order('timestamp', { ascending: false })
      .limit(10)

    if (logsError) {
      console.error('[DEBUG LOGS] Error fetching logs:', logsError)
    }

    // Get unique client_ids in execution_logs
    const { data: uniqueClientIds } = await supabase
      .from('execution_logs')
      .select('client_id')
      .not('client_id', 'is', null)
      .limit(1000)

    const clientIdSet = new Set(uniqueClientIds?.map((log: any) => log.client_id))

    // Get all users and their client_ids
    const { data: userProfiles } = await supabase
      .from('user_profiles')
      .select('id, email, client_id')
      .limit(20)

    return NextResponse.json({
      success: true,
      debug: {
        authenticatedUser: {
          id: authenticatedUserId,
          clientId: userClientId
        },
        database: {
          totalExecutionLogs: totalCount || 0,
          logsWithoutClientId: logsWithoutClientId || 0,
          logsWithClientId: (totalCount || 0) - (logsWithoutClientId || 0),
          uniqueClientIdsInLogs: Array.from(clientIdSet)
        },
        recentLogs: recentLogs?.map(log => ({
          id: log.id,
          execution_id: log.execution_id.substring(0, 8) + '...',
          node_name: log.node_name,
          client_id: log.client_id,
          timestamp: log.timestamp,
          status: log.status
        })) || [],
        users: userProfiles?.map(user => ({
          id: user.id.substring(0, 8) + '...',
          email: user.email,
          clientId: user.client_id
        })) || [],
        clientIdMatch: userClientId && clientIdSet.has(userClientId)
          ? '✅ User client_id EXISTS in execution_logs'
          : '❌ User client_id NOT FOUND in execution_logs',
        diagnosis: getDiagnosis(totalCount || 0, logsWithoutClientId || 0, userClientId, clientIdSet)
      },
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('[DEBUG LOGS] Exception:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message
      },
      { status: 500 }
    )
  }
}

function getDiagnosis(
  totalLogs: number,
  logsWithoutClientId: number,
  userClientId: string | null,
  clientIdsInLogs: Set<string>
): string[] {
  const diagnosis: string[] = []

  if (totalLogs === 0) {
    diagnosis.push('🔴 NO LOGS IN DATABASE - No execution_logs records exist at all')
    diagnosis.push('   → Solution: Send a test message to create logs')
    return diagnosis
  }

  if (logsWithoutClientId === totalLogs) {
    diagnosis.push('🔴 ALL LOGS MISSING client_id - RLS will hide all logs from users')
    diagnosis.push('   → Solution: Logger is not passing client_id correctly')
    diagnosis.push('   → Check chatbotFlow.ts line 54: logger.startExecution(..., config.id)')
    return diagnosis
  }

  if (!userClientId) {
    diagnosis.push('🔴 USER HAS NO client_id - User profile is not linked to a client')
    diagnosis.push('   → Solution: Add client_id to user_profiles table for this user')
    return diagnosis
  }

  if (!clientIdsInLogs.has(userClientId)) {
    diagnosis.push('🟡 CLIENT_ID MISMATCH - User client_id exists but no logs match it')
    diagnosis.push(`   → User client_id: ${userClientId}`)
    diagnosis.push(`   → Client IDs in logs: ${Array.from(clientIdsInLogs).join(', ')}`)
    diagnosis.push('   → Solution: Either fix user profile client_id OR generate logs with correct client_id')
    return diagnosis
  }

  diagnosis.push('🟢 CONFIGURATION LOOKS CORRECT')
  diagnosis.push('   → Logs exist with matching client_id')
  diagnosis.push('   → User has correct client_id')
  diagnosis.push('   → Problem may be in frontend or RLS policy')
  return diagnosis
}
