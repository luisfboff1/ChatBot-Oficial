/**
 * API Route: Verify user password
 * 
 * POST /api/settings/verify-password
 * 
 * Used before allowing access to sensitive settings (like environment variables)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient()
    
    // 1. Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'User not authenticated' },
        { status: 401 }
      )
    }

    // 2. Get password from request
    const { password } = await request.json()
    
    if (!password) {
      return NextResponse.json(
        { error: 'Missing password', message: 'Password is required' },
        { status: 400 }
      )
    }

    // 3. Verify password by attempting to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password,
    })

    if (signInError) {
      return NextResponse.json(
        { error: 'Invalid password', message: 'Password verification failed' },
        { status: 401 }
      )
    }

    // 4. Password is valid
    return NextResponse.json({
      success: true,
      message: 'Password verified successfully',
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('[verify-password] Error:', errorMessage)
    
    return NextResponse.json(
      { error: 'Internal error', message: errorMessage },
      { status: 500 }
    )
  }
}
