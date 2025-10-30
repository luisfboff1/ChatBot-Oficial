'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Settings } from 'lucide-react'
import { MetricsDashboard } from '@/components/MetricsDashboard'
import { ConversationList } from '@/components/ConversationList'
import { useConversations } from '@/hooks/useConversations'
import { useGlobalRealtimeNotifications } from '@/hooks/useGlobalRealtimeNotifications'
import type { DashboardMetrics } from '@/lib/types'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { createClientBrowser } from '@/lib/supabase'

interface DashboardClientProps {
  clientId: string
}

/**
 * DashboardClient - Client Component
 *
 * Componente de interface do dashboard que usa hooks para:
 * - Buscar conversas
 * - Receber notificações em tempo real
 * - Calcular métricas
 *
 * @param clientId - ID do cliente autenticado (vem do servidor)
 */
export function DashboardClient({ clientId }: DashboardClientProps) {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    total_conversations: 0,
    active_conversations: 0,
    waiting_human: 0,
    messages_today: 0,
    total_cost_month: 0,
  })
  const [metricsLoading, setMetricsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [checkingAdmin, setCheckingAdmin] = useState(true)

  // Verificar se usuário é admin
  useEffect(() => {
    const checkAdminRole = async () => {
      try {
        const supabase = createClientBrowser()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('role, is_active')
            .eq('id', user.id)
            .single()
          
          const hasAdminAccess = profile && 
            ['admin', 'client_admin'].includes(profile.role) && 
            profile.is_active
          
          setIsAdmin(!!hasAdminAccess)
        }
      } catch (error) {
        console.error('[Dashboard] Error checking admin role:', error)
      } finally {
        setCheckingAdmin(false)
      }
    }

    checkAdminRole()
  }, [])

  const { conversations, loading, lastUpdatePhone: pollingLastUpdate } = useConversations({
    clientId,
    limit: 50,
    refreshInterval: 10000,
    enableRealtime: true,
  })

  // Hook global para notificações em tempo real
  const { lastUpdatePhone: realtimeLastUpdate } = useGlobalRealtimeNotifications()

  // Estado combinado - prioriza realtime, mas aceita polling como fallback
  const [lastUpdatePhone, setLastUpdatePhone] = useState<string | null>(null)

  useEffect(() => {
    if (realtimeLastUpdate) {
      console.log('[Dashboard] Atualização via Realtime Global:', realtimeLastUpdate)
      setLastUpdatePhone(realtimeLastUpdate)
    } else if (pollingLastUpdate) {
      console.log('[Dashboard] Atualização via Polling:', pollingLastUpdate)
      setLastUpdatePhone(pollingLastUpdate)
    }
  }, [realtimeLastUpdate, pollingLastUpdate])

  useEffect(() => {
    const calculateMetrics = () => {
      const totalConversations = conversations.length
      const activeConversations = conversations.filter(
        (c) => c.status === 'bot'
      ).length
      const waitingHuman = conversations.filter(
        (c) => c.status === 'waiting' || c.status === 'human'
      ).length

      const totalMessages = conversations.reduce(
        (sum, c) => sum + c.message_count,
        0
      )

      const estimatedCost = totalMessages * 0.001

      setMetrics({
        total_conversations: totalConversations,
        active_conversations: activeConversations,
        waiting_human: waitingHuman,
        messages_today: totalMessages,
        total_cost_month: estimatedCost,
      })

      setMetricsLoading(false)
    }

    if (!loading) {
      calculateMetrics()
    }
  }, [conversations, loading])

  return (
    <div className="space-y-6 md:space-y-8 p-4 md:p-6 lg:p-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Visão geral das conversas WhatsApp
          </p>
        </div>
        
        {!checkingAdmin && isAdmin && (
          <Link href="/admin">
            <Button variant="outline" size="sm" className="gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Painel Admin</span>
            </Button>
          </Link>
        )}
      </div>

      <Separator />

      <MetricsDashboard metrics={metrics} loading={metricsLoading} />

      <div className="pb-4">
        <ConversationList
          conversations={conversations}
          loading={loading}
          clientId={clientId}
          lastUpdatePhone={lastUpdatePhone}
        />
      </div>
    </div>
  )
}
