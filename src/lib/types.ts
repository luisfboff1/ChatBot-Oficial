export type ConversationStatus = 'bot' | 'waiting' | 'human'

export type MessageType = 'text' | 'audio' | 'image' | 'document' | 'video'

export type MessageDirection = 'incoming' | 'outgoing'

export type MessageStatus = 'sent' | 'delivered' | 'read' | 'failed' | 'queued'

export type UsageSource = 'openai' | 'meta' | 'groq' | 'whisper'

export interface Client {
  id: string
  name: string
  verify_token: string
  meta_access_token: string
  phone_number_id: string
  openai_api_key: string | null
  created_at: string
  updated_at: string
}

export interface Conversation {
  id: string
  client_id: string
  phone: string
  name: string | null
  status: ConversationStatus
  assigned_to: string | null
  last_message: string | null
  last_update: string
  created_at: string
}

export interface Message {
  id: string
  client_id: string
  conversation_id: string
  phone: string
  name: string | null
  content: string
  type: MessageType
  direction: MessageDirection
  status: MessageStatus
  timestamp: string
  metadata: Record<string, unknown> | null
}

export interface UsageLog {
  id: string
  client_id: string
  source: UsageSource
  tokens_used: number
  messages_sent: number
  cost_usd: number
  metadata: Record<string, unknown> | null
  created_at: string
}

export interface ConversationWithCount extends Conversation {
  message_count: number
}

export interface UsageSummary {
  source: UsageSource
  total_tokens: number
  total_messages: number
  total_cost: number
}

export interface DashboardMetrics {
  total_conversations: number
  active_conversations: number
  waiting_human: number
  messages_today: number
  total_cost_month: number
}

export interface SendMessageRequest {
  phone: string
  content: string
  client_id: string
}

export interface TransferHumanRequest {
  phone: string
  client_id: string
  assigned_to?: string
}
