import { NextRequest, NextResponse } from 'next/server'
import { cleanMessageContent } from '@/lib/utils'
import { query } from '@/lib/postgres'
import type { Message } from '@/lib/types'
import { getClientIdFromSession } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

// Default limit for messages - optimizes initial load
const DEFAULT_MESSAGE_LIMIT = 100

interface RouteParams {
  params: {
    phone: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { phone } = params

    // 🔐 SECURITY: Get client_id from authenticated session, not query params
    const clientId = await getClientIdFromSession(request as any)

    if (!clientId) {
      return NextResponse.json(
        { error: 'Unauthorized - authentication required' },
        { status: 401 }
      )
    }

    if (!phone) {
      return NextResponse.json(
        { error: 'phone é obrigatório' },
        { status: 400 }
      )
    }

    // Parse pagination parameters
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || String(DEFAULT_MESSAGE_LIMIT))
    const before = searchParams.get('before') // Cursor for pagination (message ID)

    // 🔐 SECURITY: Filter messages by authenticated user's client_id
    // OTIMIZAÇÃO: Buscar mensagens com limite, usando índice (session_id, created_at DESC)
    // Para paginação com cursor, buscar mensagens antes de um ID específico

    let pgMessages
    if (before) {
      // Pagination: get messages before a specific ID
      pgMessages = await query<any>(
        `SELECT id, session_id, message, created_at
         FROM n8n_chat_histories
         WHERE session_id = $1
         AND (client_id = $2 OR client_id IS NULL)
         AND id < $3
         ORDER BY created_at DESC
         LIMIT $4`,
        [phone, clientId, before, limit]
      )
    } else {
      // Initial load: get most recent messages
      pgMessages = await query<any>(
        `SELECT id, session_id, message, created_at
         FROM n8n_chat_histories
         WHERE session_id = $1
         AND (client_id = $2 OR client_id IS NULL)
         ORDER BY created_at DESC
         LIMIT $3`,
        [phone, clientId, limit]
      )
    }

    const data = pgMessages.rows

    // Reverter ordem para exibir antigas primeiro (como esperado pela UI)
    const dataReversed = (data || []).reverse()

    // Transformar dados do n8n_chat_histories para formato Message
    const messages: Message[] = dataReversed.map((item: any, index: number) => {
      // O n8n_chat_histories salva message como JSON:
      // { "type": "human" | "ai", "content": "...", "additional_kwargs": {}, "response_metadata": {} }

      let messageData: any

      // Parse o JSON da coluna message
      if (typeof item.message === 'string') {
        try {
          messageData = JSON.parse(item.message)
        } catch {
          // Fallback se não for JSON válido (mensagens antigas)
          messageData = { type: 'ai', content: item.message }
        }
      } else {
        messageData = item.message || {}
      }

      // Extrair type e content do JSON
      const messageType = messageData.type || 'ai'  // 'human' ou 'ai'
      const messageContent = messageData.content || ''

      // Limpar tags de function calls
      const cleanedContent = cleanMessageContent(messageContent)

      return {
        id: item.id?.toString() || `msg-${index}`,
        client_id: clientId,
        conversation_id: String(phone),
        phone: String(phone),
        name: messageType === 'human' ? 'Cliente' : 'Bot',
        content: cleanedContent,
        type: 'text' as const,
        direction: messageType === 'human' ? ('incoming' as const) : ('outgoing' as const),
        status: 'sent' as const,
        timestamp: item.created_at || new Date().toISOString(),
        metadata: null,
      }
    })

    // Get total count for pagination info (cached via index)
    const countResult = await query<any>(
      `SELECT COUNT(*) as total FROM n8n_chat_histories 
       WHERE session_id = $1 
       AND (client_id = $2 OR client_id IS NULL)`,
      [phone, clientId]
    )
    const total = parseInt(countResult.rows[0]?.total || '0')

    // Check if there are more messages (for infinite scroll)
    const hasMore = messages.length > 0 && messages.length === limit && total > limit

    return NextResponse.json({
      messages,
      total,
      phone,
      hasMore,
      limit,
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    })
  } catch (error) {
    console.error('Erro inesperado:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
