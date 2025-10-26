import { useState, useEffect } from 'react'
import type { ConversationWithCount, ConversationStatus } from '@/lib/types'

interface UseConversationsOptions {
  clientId: string
  status?: ConversationStatus
  limit?: number
  offset?: number
  refreshInterval?: number
}

interface UseConversationsResult {
  conversations: ConversationWithCount[]
  loading: boolean
  error: string | null
  total: number
  refetch: () => Promise<void>
}

export const useConversations = ({
  clientId,
  status,
  limit = 50,
  offset = 0,
  refreshInterval = 0,
}: UseConversationsOptions): UseConversationsResult => {
  const [conversations, setConversations] = useState<ConversationWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)

  const fetchConversations = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        client_id: clientId,
        limit: limit.toString(),
        offset: offset.toString(),
      })

      if (status) {
        params.append('status', status)
      }

      const response = await fetch(`/api/conversations?${params.toString()}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao buscar conversas')
      }

      const data = await response.json()
      setConversations(data.conversations || [])
      setTotal(data.total || 0)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      console.error('Erro ao buscar conversas:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (clientId) {
      fetchConversations()
    }
  }, [clientId, status, limit, offset])

  useEffect(() => {
    if (refreshInterval > 0 && clientId) {
      const interval = setInterval(() => {
        fetchConversations()
      }, refreshInterval)

      return () => clearInterval(interval)
    }
  }, [refreshInterval, clientId])

  return {
    conversations,
    loading,
    error,
    total,
    refetch: fetchConversations,
  }
}
