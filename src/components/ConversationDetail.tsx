'use client'

import { useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageBubble } from '@/components/MessageBubble'
import { formatPhone, getStatusColor, getStatusLabel } from '@/lib/utils'
import { useMessages } from '@/hooks/useMessages'
import { useRealtimeMessages } from '@/hooks/useRealtimeMessages'
import { UserCircle, UserCog } from 'lucide-react'
import type { Message } from '@/lib/types'
import { toast } from '@/hooks/use-toast'

interface ConversationDetailProps {
  phone: string
  clientId: string
  conversationName?: string
  conversationStatus?: string
}

export const ConversationDetail = ({
  phone,
  clientId,
  conversationName,
  conversationStatus = 'bot',
}: ConversationDetailProps) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const { messages, loading, error, refetch } = useMessages({
    clientId,
    phone,
    limit: 100,
  })

  useRealtimeMessages({
    clientId,
    phone,
    onNewMessage: (newMessage: Message) => {
      refetch()
      toast({
        title: 'Nova mensagem',
        description: 'Uma nova mensagem foi recebida',
      })
    },
  })

  const handleTransferToHuman = async () => {
    try {
      const response = await fetch('/api/commands/transfer-human', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone,
          client_id: clientId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao transferir conversa')
      }

      toast({
        title: 'Sucesso',
        description: 'Conversa transferida para atendimento humano',
      })

      refetch()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      })
    }
  }

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight
      }
    }
  }, [messages])

  if (error) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center text-red-500">
            Erro ao carregar mensagens: {error}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="flex flex-col h-[calc(100vh-12rem)]">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UserCircle className="h-8 w-8 text-muted-foreground" />
            <div>
              <CardTitle className="text-lg">
                {conversationName || formatPhone(phone)}
              </CardTitle>
              {conversationName && (
                <p className="text-sm text-muted-foreground">
                  {formatPhone(phone)}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              className={getStatusColor(conversationStatus)}
              variant="secondary"
            >
              {getStatusLabel(conversationStatus)}
            </Badge>

            {conversationStatus !== 'human' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleTransferToHuman}
              >
                <UserCog className="h-4 w-4 mr-2" />
                Transferir para Humano
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <span className="text-muted-foreground">Carregando mensagens...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <span className="text-muted-foreground">Nenhuma mensagem ainda</span>
          </div>
        ) : (
          <ScrollArea ref={scrollAreaRef} className="h-full px-4">
            <div className="py-4">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
