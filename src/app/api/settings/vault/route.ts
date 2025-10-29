/**
 * API Route: Manage Vault secrets
 * 
 * GET /api/settings/vault - Get client's vault secrets
 * POST /api/settings/vault - Update client's vault secrets
 */

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient, getClientIdFromSession } from '@/lib/supabase-server'
import { getWebhookBaseUrl } from '@/lib/config'
import { createSecret, updateSecret, getSecret } from '@/lib/vault'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
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

    // 2. Get client_id from session
    const clientId = await getClientIdFromSession()
    
    if (!clientId) {
      return NextResponse.json(
        { error: 'No client found', message: 'User profile not configured' },
        { status: 404 }
      )
    }

    // 3. Get client record with secret IDs
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id, slug, meta_access_token_secret_id, meta_verify_token_secret_id, meta_phone_number_id, openai_api_key_secret_id, groq_api_key_secret_id')
      .eq('id', clientId)
      .single()

    if (clientError || !client) {
      return NextResponse.json(
        { error: 'Client not found', message: 'Failed to fetch client data' },
        { status: 404 }
      )
    }

    // 4. Get secrets from Vault (descriptografar)
    const metaAccessToken = client.meta_access_token_secret_id 
      ? await getSecret(client.meta_access_token_secret_id)
      : null

    const metaVerifyToken = client.meta_verify_token_secret_id
      ? await getSecret(client.meta_verify_token_secret_id)
      : null

    const openaiApiKey = client.openai_api_key_secret_id
      ? await getSecret(client.openai_api_key_secret_id)
      : null

    const groqApiKey = client.groq_api_key_secret_id
      ? await getSecret(client.groq_api_key_secret_id)
      : null

    // 5. Build webhook URL
    const webhookUrl = `${getWebhookBaseUrl()}/api/webhook/${clientId}`

    // 6. Return vault data
    return NextResponse.json({
      success: true,
      data: {
        metaAccessToken: metaAccessToken || '',
        metaVerifyToken: metaVerifyToken || '',
        metaPhoneNumberId: client.meta_phone_number_id || '',
        webhookUrl,
        openaiApiKey: openaiApiKey || '',
        groqApiKey: groqApiKey || '',
      },
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('[vault GET] Error:', errorMessage)
    
    return NextResponse.json(
      { error: 'Internal error', message: errorMessage },
      { status: 500 }
    )
  }
}

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

    // 2. Get client_id from session
    const clientId = await getClientIdFromSession()
    
    if (!clientId) {
      return NextResponse.json(
        { error: 'No client found', message: 'User profile not configured' },
        { status: 404 }
      )
    }

    // 3. Get request body
    const body = await request.json()
    const { metaAccessToken, metaVerifyToken, metaPhoneNumberId, openaiApiKey, groqApiKey } = body

    // 4. Get client record
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id, slug, meta_access_token_secret_id, meta_verify_token_secret_id, meta_phone_number_id, openai_api_key_secret_id, groq_api_key_secret_id')
      .eq('id', clientId)
      .single()

    if (clientError || !client) {
      return NextResponse.json(
        { error: 'Client not found', message: 'Failed to fetch client data' },
        { status: 404 }
      )
    }

    // 5. Update secrets in Vault
    const updates: Record<string, any> = {}

    // Meta Access Token
    if (metaAccessToken != null) {
      if (client.meta_access_token_secret_id) {
        // Update existing secret
        await updateSecret(client.meta_access_token_secret_id, metaAccessToken)
      } else {
        // Create new secret
        const secretId = await createSecret(metaAccessToken, `${client.slug}_meta_access_token`)
        updates.meta_access_token_secret_id = secretId
      }
    }

    // Meta Verify Token
    if (metaVerifyToken != null) {
      if (client.meta_verify_token_secret_id) {
        await updateSecret(client.meta_verify_token_secret_id, metaVerifyToken)
      } else {
        const secretId = await createSecret(metaVerifyToken, `${client.slug}_meta_verify_token`)
        updates.meta_verify_token_secret_id = secretId
      }
    }

    // Meta Phone Number ID (não é secret, atualiza diretamente)
    if (metaPhoneNumberId != null) {
      updates.meta_phone_number_id = metaPhoneNumberId
    }

    // OpenAI API Key
    if (openaiApiKey != null) {
      if (client.openai_api_key_secret_id) {
        await updateSecret(client.openai_api_key_secret_id, openaiApiKey)
      } else {
        const secretId = await createSecret(openaiApiKey, `${client.slug}_openai_api_key`)
        updates.openai_api_key_secret_id = secretId
      }
    }

    // Groq API Key
    if (groqApiKey != null) {
      if (client.groq_api_key_secret_id) {
        await updateSecret(client.groq_api_key_secret_id, groqApiKey)
      } else {
        const secretId = await createSecret(groqApiKey, `${client.slug}_groq_api_key`)
        updates.groq_api_key_secret_id = secretId
      }
    }

    // 6. Update client record if there are updates
    if (Object.keys(updates).length > 0) {
      const { error: updateError } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', clientId)

      if (updateError) {
        console.error('[vault POST] Failed to update client:', updateError)
        return NextResponse.json(
          { error: 'Update failed', message: updateError.message },
          { status: 500 }
        )
      }
    }

    // 7. Return success
    return NextResponse.json({
      success: true,
      message: 'Vault secrets updated successfully',
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('[vault POST] Error:', errorMessage)
    
    return NextResponse.json(
      { error: 'Internal error', message: errorMessage },
      { status: 500 }
    )
  }
}
