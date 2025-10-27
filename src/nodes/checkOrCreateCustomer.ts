import { CustomerRecord, ConversationStatus } from '@/lib/types'
import { createServerClient } from '@/lib/supabase'

const DEFAULT_CLIENT_ID = 'demo-client-id'

export interface CheckOrCreateCustomerInput {
  phone: string
  name: string
}

/**
 * Interface para dados do cliente
 */
interface ClienteWhatsAppData {
  telefone: string
  nome: string
  status: string
  created_at?: string
}

/**
 * Helper function para fazer upsert na tabela de clientes
 *
 * NOTA: Usa tabela clientes_whatsapp (sem espaço) após migration 004
 * Se a migration ainda não foi rodada, a VIEW "Clientes WhatsApp" vai redirecionar
 */
const upsertClienteWhatsApp = async (
  supabase: ReturnType<typeof createServerClient>,
  phone: string,
  name: string
): Promise<{ data: ClienteWhatsAppData | null; error: any }> => {
  // Usa tabela SEM espaço (após migration 004)
  // Precisa do cast explícito porque TypeScript não conhece a tabela ainda
  const supabaseAny = supabase as any

  const result = await supabaseAny
    .from('clientes_whatsapp')
    .upsert(
      {
        telefone: phone,
        nome: name,
        status: 'bot',
      },
      {
        onConflict: 'telefone',
        ignoreDuplicates: false,
      }
    )
    .select()
    .single()

  return result
}

/**
 * VERSÃO OTIMIZADA: Usa Supabase client em vez de pg direto
 *
 * Vantagens:
 * - Connection pooling automático do Supabase (mais rápido)
 * - Funciona perfeitamente em serverless (sem problemas de cold start)
 * - Sem necessidade de gerenciar pool manualmente
 * - Retry automático em caso de falha temporária
 */
export const checkOrCreateCustomer = async (
  input: CheckOrCreateCustomerInput
): Promise<CustomerRecord> => {
  const startTime = Date.now()

  try {
    console.log('[checkOrCreateCustomer] 🔍 INICIANDO UPSERT (via Supabase)')
    console.log('[checkOrCreateCustomer] 📱 Phone:', input.phone)
    console.log('[checkOrCreateCustomer] 👤 Name:', input.name)
    console.log('[checkOrCreateCustomer] ⏱️  Timestamp:', new Date().toISOString())

    const { phone, name } = input

    // Cria cliente Supabase (usa service_role para bypass de RLS)
    const supabase = createServerClient()

    // UPSERT usando helper function (bypass de tipos do TypeScript)
    console.log('[checkOrCreateCustomer] 🚀 Executando UPSERT via Supabase...')

    const { data, error } = await upsertClienteWhatsApp(supabase, phone, name)

    const duration = Date.now() - startTime

    if (error) {
      console.error(`[checkOrCreateCustomer] 💥 Erro do Supabase after ${duration}ms:`, error)
      throw new Error(`Supabase error: ${error.message} (code: ${error.code})`)
    }

    if (!data) {
      throw new Error('No data returned from upsert')
    }

    console.log(`[checkOrCreateCustomer] ✅ UPSERT SUCESSO em ${duration}ms`)
    console.log(`[checkOrCreateCustomer] ✅ Customer data:`, {
      telefone: data.telefone,
      nome: data.nome,
      status: data.status
    })

    return {
      id: String(data.telefone),
      client_id: DEFAULT_CLIENT_ID,
      phone: String(data.telefone),
      name: data.nome,
      status: data.status as ConversationStatus,
      created_at: data.created_at,
      updated_at: data.created_at,
    }
  } catch (error) {
    const duration = Date.now() - startTime
    console.error(`[checkOrCreateCustomer] 💥💥💥 ERRO CRÍTICO after ${duration}ms 💥💥💥`)
    console.error(`[checkOrCreateCustomer] Error type:`, error instanceof Error ? error.constructor.name : typeof error)
    console.error(`[checkOrCreateCustomer] Error message:`, error instanceof Error ? error.message : String(error))
    console.error(`[checkOrCreateCustomer] Error stack:`, error instanceof Error ? error.stack : 'No stack trace')
    console.error(`[checkOrCreateCustomer] Input data:`, { phone: input.phone, name: input.name })

    const errorMessage = error instanceof Error ? error.message : String(error)
    throw new Error(`Failed to check or create customer: ${errorMessage}`)
  }
}
