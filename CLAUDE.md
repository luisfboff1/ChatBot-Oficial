# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a WhatsApp SaaS chatbot system built with n8n automation workflows. The project is designed to handle multi-client AI-powered conversations through WhatsApp Business API, with plans to migrate to a Next.js full-stack application.

**Current State**: Backend automation running on n8n with webhook integrations
**Target State**: Full Next.js application with TypeScript, Supabase, and Redis

## Architecture

### Current n8n Workflow (IA.json)

The main workflow handles the complete message lifecycle:

1. **Webhook Reception** (`/teste`) - Receives WhatsApp Cloud API events from Meta
2. **Message Filtering** - Filters out status updates, only processes actual messages
3. **Message Processing Pipeline**:
   - Extracts contact info (name, phone) and message content
   - Handles multiple message types: text, audio, image
   - Checks/creates customer records in Supabase (`Clientes WhatsApp` table)

4. **Media Processing**:
   - Audio: Downloads from Meta API → Transcribes with OpenAI Whisper
   - Image: Downloads from Meta API → Analyzes with GPT-4o Vision
   - Text: Passes through directly

5. **Message Batching with Redis**:
   - Pushes messages to Redis list (keyed by phone number)
   - Waits 10 seconds to batch multiple rapid messages
   - Retrieves and consolidates messages
   - Prevents duplicate AI responses for rapid user inputs

6. **AI Processing**:
   - **Main Agent**: Primary assistant for Luis Fernando Boff (engineer specializing in Solar Energy, Data Science, Full Stack Development)
   - **Sub-agent Tool**: Diagnostic agent to identify client needs and route to appropriate service area
   - **Vector Store RAG**: Retrieves relevant knowledge from Supabase vector store
   - **Memory**: PostgreSQL-backed chat history (15 message context window)
   - LLM: Groq Llama 3.3 70B

7. **Response Formatting**:
   - Second AI agent splits responses into natural WhatsApp-friendly messages
   - Splits on `\n\n` boundaries while preserving content integrity

8. **Message Delivery**:
   - Loops through split messages with delays
   - Sends via WhatsApp Business API

9. **Human Handoff** (when triggered by tool):
   - Updates customer status to "Transferido" in Supabase
   - Retrieves chat history from PostgreSQL
   - Summarizes conversation with third AI agent
   - Sends email notification to luisfboff@hotmail.com

### Data Storage (Supabase)

Key tables referenced in the workflow:
- `Clientes WhatsApp` - Customer records (phone, name, status)
- `n8n_chat_histories` - Conversation memory storage
- `documents` - Vector store for RAG knowledge base

### External Services

- **Meta (WhatsApp Business API)**: Message sending/receiving
  - Phone Number ID: `899639703222013`
  - Display: `555499567051`

- **OpenAI**: Image analysis (GPT-4o), Audio transcription (Whisper), Embeddings
- **Groq**: Main LLM inference (Llama 3.3 70B)
- **Redis**: Message batching and deduplication
- **PostgreSQL**: Chat memory persistence
- **Gmail**: Email notifications for human handoff

## Migration Roadmap (see plano_de_arquitetura)

The architectural plan outlines a 3-phase migration:

### Phase 1 (Current): 100% n8n Backend
- All logic in n8n workflows
- Direct Supabase writes
- No frontend

### Phase 2 (Next): Next.js Dashboard + n8n
- Next.js frontend for viewing conversations
- Dashboard reads from Supabase
- Sends commands via n8n webhooks
- n8n remains the processing engine

### Phase 3 (Future): Full Next.js Migration
**Target Stack**: Next.js 14 (App Router) + TypeScript + Vercel

**Planned Structure**:
```
src/
  app/
    api/
      webhook/[clientId]/route.ts  # Per-client webhook endpoints
      usage/route.ts
      messages/route.ts
  flows/
    chatbotFlow.ts                 # Main orchestration
  nodes/                           # Reusable atomic functions
    webhookHandler.ts
    parseMessage.ts
    openaiGenerate.ts
    saveToSupabase.ts
    sendToMeta.ts
  lib/
    clients.ts                     # getClientConfig(clientId)
    supabase.ts
    redis.ts
```

**Key Principles**:
- Multi-tenant architecture with `client_id` in all tables
- Config per client (loaded per request, never global)
- One webhook URL per client: `/api/webhook/[clientId]`
- Flows orchestrate nodes (pure TypeScript functions)
- No global state (serverless-friendly)

## Important Concepts

### Multi-Client Architecture
- Each client has unique webhook URL and configuration
- Client-specific tokens stored in database (not env vars)
- All database tables include `client_id` foreign key

### Message Batching Strategy
The Redis batching mechanism solves a critical UX problem:
- Users often send multiple messages in quick succession
- Without batching, each message triggers a separate AI response
- Solution: Collect messages for 10 seconds, then process as single context

### RAG Knowledge Base
- Knowledge lives in database vector store, not in code
- Supabase vector search with OpenAI embeddings
- Function name in n8n: `match_documents` (Supabase RPC)

### Hybrid Bot/Human Support
- Conversation status: `"bot"` | `"waiting"` | `"human"`
- Same WhatsApp number used for both bot and human agents
- Status switch triggers email notification with conversation summary

## Key Configuration

### Environment Variables (Future Next.js)
```
SUPABASE_URL=
SUPABASE_KEY=
REDIS_URL=
# Per-client tokens stored in database, NOT here
```

### Database Schema (Planned)
```sql
-- clients table
id (uuid), name, verify_token, meta_access_token,
phone_number_id, openai_api_key, created_at

-- messages table
id (uuid), client_id, phone, name, content, type,
direction (incoming/outgoing), status, timestamp

-- conversations table
id (uuid), client_id, phone, status (bot/waiting/human),
assigned_to, last_message, last_update

-- usage_logs table
id (uuid), client_id, source (openai/meta),
tokens_used, messages_sent, cost_usd, created_at
```

## AI Agent System Prompts

### Main Agent Role
Virtual assistant for engineer Luis Fernando Boff with expertise in:
- Solar Energy projects
- Data Science & AI
- Full Stack Development

**Behavior**: Consultative, empathetic, professional tone. Asks questions to understand client needs before offering services. No emojis.

### Diagnostic Sub-Agent
Identifies which service area matches client needs through contextual questions. Never lists all service options upfront. Routes to appropriate domain after understanding context.

### Message Formatter Agent
Splits AI responses into natural WhatsApp messages. Rules:
- Always split into 2+ messages when possible
- Exactly two line breaks (`\n\n`) between messages
- Never break sentences mid-thought
- Keep lists intact (don't split)
- Never alter content, only format

## Development Notes

### When Modifying n8n Workflow
- Test with pinned data (see `pinData` in IA.json)
- Verify Redis key cleanup (prevents memory leaks)
- Check that all Supabase writes include `client_id`
- Ensure media downloads handle Meta API token refresh

### When Building Next.js Migration
- Start with read-only dashboard (Phase 2)
- Implement webhook validation (verify_token per client)
- Use `getClientConfig()` pattern - never global config
- Handle concurrency (serverless = parallel execution)
- For long tasks, use queues (Upstash/Vercel Queue)

### Testing WhatsApp Integration
- Use Meta's webhook testing tool for validation
- Test message types: text, audio, image
- Verify 24-hour conversation window tracking
- Check status update filtering (don't process delivery receipts)

## Language

All prompts, messages, and documentation are in **Portuguese (Brazilian)**.

## Key Files

- `IA.json` - Main n8n workflow definition (1783 lines)
- `plano_de_arquitetura_saa_s_whats_app_resumao_n_8_n_→_next.md` - Complete architectural migration plan

## Common Patterns

### Client Configuration Loading
```typescript
// Future pattern
async function getClientConfig(clientId: string) {
  const { data } = await supabase
    .from('clients')
    .select('*')
    .eq('id', clientId)
    .single();
  return {
    META_ACCESS_TOKEN: data.meta_access_token,
    OPENAI_API_KEY: data.openai_api_key || process.env.OPENAI_API_KEY,
    // ...
  };
}
```

### Message Processing Flow
```typescript
// Future pattern
async function processMessage(clientId: string, message: Message) {
  const config = await getClientConfig(clientId);
  const parsed = parseMessage(message);
  const context = await enrichWithContext(parsed, config);
  const response = await openaiGenerate(context, config);
  await saveToSupabase(response, config);
  await sendToMeta(response, config);
}
```

### Cost Tracking
Track both OpenAI token usage and Meta conversation windows:
```typescript
// Log after each AI call
await logUsage({
  client_id,
  source: 'openai',
  tokens_used: completion.usage.total_tokens,
  cost_usd: calculateCost(tokens, model)
});

// Log after sending WhatsApp message
await logUsage({
  client_id,
  source: 'meta',
  messages_sent: 1,
  cost_usd: estimateWhatsAppCost(timestamp)
});
```
