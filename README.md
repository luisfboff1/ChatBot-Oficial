# WhatsApp SaaS Chatbot - Phase 2 Dashboard

Dashboard Next.js para gerenciamento de conversas WhatsApp integrado com n8n.

## Status do Projeto

**Phase 2 - Dashboard Next.js + n8n Backend**

- Dashboard read-only para visualização de conversas
- Envio de comandos via webhooks n8n
- Realtime updates via Supabase
- n8n continua processando mensagens

## Stack Tecnológico

- **Framework**: Next.js 14 (App Router)
- **Linguagem**: TypeScript
- **Estilo**: Tailwind CSS
- **Componentes**: shadcn/ui
- **Banco de Dados**: Supabase (PostgreSQL)
- **Backend**: n8n (webhook automation)
- **Deploy**: Vercel (recomendado)

## Estrutura do Projeto

```
.
├── migration.sql              # Schema do banco de dados
├── src/
│   ├── app/                   # Pages e API routes
│   │   ├── api/               # API routes (backend)
│   │   ├── dashboard/         # Dashboard pages
│   │   └── layout.tsx         # Root layout
│   ├── components/            # React components
│   │   ├── ui/                # shadcn components
│   │   └── *.tsx              # Custom components
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utilities e clients
│   │   ├── supabase.ts        # Supabase client
│   │   ├── types.ts           # TypeScript types
│   │   └── utils.ts           # Helper functions
└── .env.local                 # Environment variables (crie este)
```

## Instalação

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Banco de Dados

Execute o arquivo `migration.sql` no Supabase SQL Editor:

1. Acesse: https://app.supabase.com/project/_/sql
2. Cole o conteúdo de `migration.sql`
3. Execute o script

Isso criará as tabelas necessárias:
- `clients` - Configuração multi-tenant
- `conversations` - Estado das conversas
- `messages` - Mensagens individuais
- `usage_logs` - Tracking de custos

### 3. Configurar Variáveis de Ambiente

Copie `.env.example` para `.env.local`:

```bash
cp .env.example .env.local
```

Preencha as variáveis no `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key

# n8n Webhooks (opcional para Phase 2)
N8N_WEBHOOK_BASE_URL=https://sua-instancia-n8n.com
N8N_SEND_MESSAGE_WEBHOOK=/webhook/send-message
N8N_TRANSFER_HUMAN_WEBHOOK=/webhook/transfer-human
```

**Onde encontrar as chaves do Supabase:**
- Acesse: https://app.supabase.com/project/_/settings/api
- `NEXT_PUBLIC_SUPABASE_URL`: Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: anon/public key
- `SUPABASE_SERVICE_ROLE_KEY`: service_role key (cuidado!)

### 4. Executar em Desenvolvimento

```bash
npm run dev
```

Acesse: http://localhost:3000

## Funcionalidades

### Dashboard Principal
- Métricas em tempo real (total conversas, ativas, aguardando humano)
- Lista de conversas com filtros
- Atualização automática (polling 10s)

### Detalhes da Conversa
- Histórico completo de mensagens
- Realtime updates via Supabase
- Suporte para múltiplos tipos (text, audio, image)
- Status de entrega das mensagens

### Comandos
- Enviar mensagem manual (via webhook n8n)
- Transferir para atendimento humano (via webhook n8n)

## Integração com n8n

O dashboard se comunica com o n8n através de webhooks:

### Webhook: Enviar Mensagem Manual
- Endpoint: `POST ${N8N_WEBHOOK_BASE_URL}/webhook/send-message`
- Payload:
  ```json
  {
    "phone": "5511999999999",
    "content": "Mensagem manual do dashboard",
    "client_id": "uuid-do-cliente",
    "source": "dashboard"
  }
  ```

### Webhook: Transferir para Humano
- Endpoint: `POST ${N8N_WEBHOOK_BASE_URL}/webhook/transfer-human`
- Payload:
  ```json
  {
    "phone": "5511999999999",
    "client_id": "uuid-do-cliente",
    "assigned_to": "suporte"
  }
  ```

**Nota:** Esses webhooks precisam ser criados no workflow n8n.

## Arquitetura Multi-Tenant

O sistema suporta múltiplos clientes:

1. Cada cliente tem registro na tabela `clients`
2. Todas as tabelas incluem `client_id`
3. Dashboard usa `DEFAULT_CLIENT_ID` (hardcoded para Phase 2)
4. Phase 3 implementará seletor de cliente no UI

## Deploy (Vercel)

### 1. Conectar Repositório

```bash
vercel
```

### 2. Configurar Variáveis de Ambiente

No dashboard da Vercel:
- Settings → Environment Variables
- Adicione todas as variáveis do `.env.local`

### 3. Deploy

```bash
vercel --prod
```

## Desenvolvimento

### Estrutura de Código

**Princípios seguidos:**
- Functional programming (sem classes)
- Apenas `const` (nunca `let` ou `var`)
- Funções puras quando possível
- Nomes descritivos (sem comentários necessários)
- Error handling com try-catch
- TypeScript strict mode

### API Routes

Todas as rotas API usam:
- Server-side Supabase client (service role key)
- Validação de parâmetros
- Error handling consistente
- `export const dynamic = 'force-dynamic'` (evita cache)

### Custom Hooks

- `useConversations`: Busca lista de conversas
- `useMessages`: Busca mensagens de um número
- `useRealtimeMessages`: Supabase Realtime subscription

## Troubleshooting

### Erro: Missing SUPABASE_URL
- Verifique se `.env.local` existe
- Confirme que as variáveis estão corretas
- Reinicie `npm run dev`

### Conversas não aparecem
- Execute `migration.sql` no Supabase
- Verifique se há dados na tabela `conversations`
- Confirme `client_id` correto

### Realtime não funciona
- Habilite Realtime no Supabase: Database → Replication
- Verifique Row Level Security (RLS) policies
- Confirme que `NEXT_PUBLIC_SUPABASE_ANON_KEY` está correto

### Webhooks n8n retornam 501
- Webhooks são opcionais na Phase 2
- Configure `N8N_WEBHOOK_BASE_URL` se quiser testar
- Crie webhooks correspondentes no n8n

## Próximos Passos (Phase 3)

- Migrar lógica do n8n para Next.js API Routes
- Implementar autenticação (NextAuth)
- Adicionar seletor de clientes no UI
- Implementar filas (Upstash Queue)
- Dashboard de custos detalhado
- Configuração de webhooks Meta via UI

## Licença

Proprietário - Luis Fernando Boff

## Suporte

Para dúvidas ou problemas:
- Email: luisfboff@hotmail.com
- Consulte `CLAUDE.md` para arquitetura detalhada
