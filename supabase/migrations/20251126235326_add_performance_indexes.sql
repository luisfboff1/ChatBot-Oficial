-- Performance indexes for chat latency optimization
-- These indexes optimize the most frequently used queries in the dashboard

-- =====================================================
-- INDEXES FOR n8n_chat_histories TABLE
-- =====================================================

-- Index for fetching messages by session_id (phone) with ordering
-- Used by: /api/messages/[phone] and realtime subscriptions
CREATE INDEX IF NOT EXISTS idx_n8n_chat_histories_session_created
ON n8n_chat_histories(session_id, created_at DESC);

-- Index for client_id filtering (multi-tenant queries)
CREATE INDEX IF NOT EXISTS idx_n8n_chat_histories_client_session
ON n8n_chat_histories(client_id, session_id);

-- Composite index for the main conversations query
-- Used by: /api/conversations
CREATE INDEX IF NOT EXISTS idx_n8n_chat_histories_client_session_created
ON n8n_chat_histories(client_id, session_id, created_at DESC);

-- =====================================================
-- INDEXES FOR clientes_whatsapp TABLE  
-- =====================================================

-- Index for client_id filtering
CREATE INDEX IF NOT EXISTS idx_clientes_whatsapp_client_id
ON clientes_whatsapp(client_id);

-- Index for status filtering with client_id
CREATE INDEX IF NOT EXISTS idx_clientes_whatsapp_client_status
ON clientes_whatsapp(client_id, status);

-- Index for telefone lookups (used in JOINs)
CREATE INDEX IF NOT EXISTS idx_clientes_whatsapp_telefone
ON clientes_whatsapp(telefone);

-- =====================================================
-- ANALYZE TABLES TO UPDATE STATISTICS
-- =====================================================
ANALYZE n8n_chat_histories;
ANALYZE clientes_whatsapp;
