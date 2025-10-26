'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface SendMessageFormProps {
  phone: string
  clientId: string
  onMessageSent?: () => void
}

export const SendMessageForm = ({
  phone,
  clientId,
  onMessageSent,
}: SendMessageFormProps) => {
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)

  const handleSendMessage = async () => {
    if (!content.trim()) {
      toast({
        title: 'Atenção',
        description: 'Digite uma mensagem antes de enviar',
        variant: 'destructive',
      })
      return
    }

    try {
      setSending(true)

      const response = await fetch('/api/commands/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone,
          content: content.trim(),
          client_id: clientId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao enviar mensagem')
      }

      toast({
        title: 'Sucesso',
        description: 'Mensagem enviada com sucesso',
      })

      setContent('')

      if (onMessageSent) {
        onMessageSent()
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enviar Mensagem Manual</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          <Textarea
            placeholder="Digite sua mensagem aqui... (Enter para enviar, Shift+Enter para nova linha)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={4}
            disabled={sending}
          />

          <Button
            onClick={handleSendMessage}
            disabled={sending || !content.trim()}
            className="w-full"
          >
            <Send className="h-4 w-4 mr-2" />
            {sending ? 'Enviando...' : 'Enviar Mensagem'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
