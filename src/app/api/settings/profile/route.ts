/**
 * API Route: Update user profile
 * 
 * POST /api/settings/profile - Update name and/or password
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

    // 2. Get request body
    const body = await request.json()
    const { fullName, password } = body

    // 3. Update user metadata (name)
    const updates: any = {}
    
    if (fullName !== undefined) {
      updates.data = {
        full_name: fullName,
      }
      
      // Also update in user_profiles table
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({ full_name: fullName })
        .eq('id', user.id)

      if (profileError) {
        console.error('[profile] Failed to update user_profiles:', profileError)
      }
    }

    // 4. Update password if provided
    if (password) {
      updates.password = password
    }

    // 5. Update user
    if (Object.keys(updates).length > 0) {
      const { error: updateError } = await supabase.auth.updateUser(updates)

      if (updateError) {
        return NextResponse.json(
          { error: 'Update failed', message: updateError.message },
          { status: 500 }
        )
      }
    }

    // 6. Return success
    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('[profile] Error:', errorMessage)
    
    return NextResponse.json(
      { error: 'Internal error', message: errorMessage },
      { status: 500 }
    )
  }
}
