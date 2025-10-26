'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageCircle, Users, Clock, DollarSign } from 'lucide-react'
import type { DashboardMetrics } from '@/lib/types'
import { formatCurrencyUSD } from '@/lib/utils'

interface MetricsDashboardProps {
  metrics: DashboardMetrics
  loading: boolean
}

export const MetricsDashboard = ({ metrics, loading }: MetricsDashboardProps) => {
  const metricCards = [
    {
      title: 'Total de Conversas',
      value: metrics.total_conversations,
      icon: MessageCircle,
      description: 'Todas as conversas',
      color: 'text-blue-500',
    },
    {
      title: 'Conversas Ativas',
      value: metrics.active_conversations,
      icon: Users,
      description: 'Com o bot',
      color: 'text-green-500',
    },
    {
      title: 'Aguardando Humano',
      value: metrics.waiting_human,
      icon: Clock,
      description: 'Na fila',
      color: 'text-yellow-500',
    },
    {
      title: 'Custo Mensal',
      value: formatCurrencyUSD(metrics.total_cost_month),
      icon: DollarSign,
      description: 'Estimado',
      color: 'text-purple-500',
    },
  ]

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Carregando...
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metricCards.map((metric) => {
        const Icon = metric.icon
        return (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {typeof metric.value === 'number' ? metric.value : metric.value}
              </div>
              <p className="text-xs text-muted-foreground">
                {metric.description}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
