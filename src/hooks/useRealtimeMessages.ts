import { useEffect, useState } from 'react'
import { createClientBrowser } from '@/lib/supabase'
import type { Message } from '@/lib/types'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface UseRealtimeMessagesOptions {
  clientId: string
  phone: string
  onNewMessage?: (message: Message) => void
}

export const useRealtimeMessages = ({
  clientId,
  phone,
  onNewMessage,
}: UseRealtimeMessagesOptions) => {
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!clientId || !phone) {
      return
    }

    const supabase = createClientBrowser()
    let channel: RealtimeChannel

    const setupRealtimeSubscription = async () => {
      channel = supabase
        .channel(`chat-histories:${clientId}:${phone}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'n8n_chat_histories',
            filter: `session_id=eq.${phone}`,
          },
          (payload) => {
            // Transformar dados do n8n para formato Message
            const item = payload.new as any
            const messageData = item.message || {}
            const messageType = messageData.type || 'ai'
            const messageContent = messageData.content || ''

            const newMessage: Message = {
              id: item.id?.toString() || `msg-${Date.now()}`,
              client_id: clientId,
              phone: phone,
              name: messageType === 'human' ? 'Cliente' : 'Bot',
              content: messageContent,
              type: 'text',
              direction: messageType === 'human' ? 'incoming' : 'outgoing',
              status: 'sent',
              timestamp: new Date().toISOString(),
            }
            if (onNewMessage) {
              onNewMessage(newMessage)
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            setIsConnected(true)
            console.log('Conectado ao Realtime para', phone)
          } else if (status === 'CLOSED') {
            setIsConnected(false)
            console.log('Desconectado do Realtime')
          }
        })
    }

    setupRealtimeSubscription()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
        setIsConnected(false)
      }
    }
  }, [clientId, phone, onNewMessage])

  return { isConnected }
}
