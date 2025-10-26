import { NextRequest, NextResponse } from 'next/server'
import type { TransferHumanRequest } from '@/lib/types'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as TransferHumanRequest

    const { phone, client_id, assigned_to } = body

    if (!phone || !client_id) {
      return NextResponse.json(
        { error: 'phone e client_id são obrigatórios' },
        { status: 400 }
      )
    }

    const n8nBaseUrl = process.env.N8N_WEBHOOK_BASE_URL
    const n8nWebhookPath = process.env.N8N_TRANSFER_HUMAN_WEBHOOK

    if (!n8nBaseUrl || !n8nWebhookPath) {
      return NextResponse.json(
        { error: 'Webhooks n8n não configurados. Configure N8N_WEBHOOK_BASE_URL e N8N_TRANSFER_HUMAN_WEBHOOK no .env.local' },
        { status: 501 }
      )
    }

    const webhookUrl = `${n8nBaseUrl}${n8nWebhookPath}`

    const n8nResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone,
        client_id,
        assigned_to: assigned_to || 'suporte',
        timestamp: new Date().toISOString(),
      }),
    })

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text()
      console.error('Erro ao transferir para humano via n8n:', errorText)
      return NextResponse.json(
        { error: 'Falha ao transferir conversa via n8n' },
        { status: 502 }
      )
    }

    const result = await n8nResponse.json()

    return NextResponse.json({
      success: true,
      message: 'Conversa transferida com sucesso',
      data: result,
    })
  } catch (error) {
    console.error('Erro inesperado ao transferir conversa:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
