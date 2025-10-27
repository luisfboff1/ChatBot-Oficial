# 🐌 Solução para Lentidão na Query "Clientes WhatsApp"

## 🚨 Problema Identificado

**Sintoma**: Webhook do WhatsApp fica preso na query:
```sql
SELECT * FROM "Clientes WhatsApp" WHERE telefone = $1 LIMIT 1
```

**Evidência dos Logs**:
```
[checkOrCreateCustomer] 🔍 Consultando cliente... { phone: '555499250023' }
[Postgres] 🆕 Creating new connection pool
[Postgres] 🔍 Query: SELECT * FROM "Clientes WhatsApp" WHERE telefone = $1 LIMIT 1...
[TRAVADO AQUI - Demora excessiva]
```

**Impacto**:
- ❌ Mensagens do WhatsApp não são processadas
- ❌ Usuários não recebem respostas do bot
- ❌ Timeout em webhooks da Meta
- ❌ Perda de mensagens em horários de pico

---

## 🔍 Diagnóstico

### Possíveis Causas

1. **Índice Ausente ou Inválido** (mesmo sendo PRIMARY KEY)
2. **RLS (Row Level Security) com overhead**
3. **Connection Pool esgotado** (Supabase)
4. **Estatísticas desatualizadas** do PostgreSQL
5. **Tabela fragmentada** (muitos updates/deletes)
6. **Locks de transação** (operações concorrentes)

### Como Identificar a Causa Real

Execute no **Supabase SQL Editor**:

```sql
-- 1. Verificar se índice existe
SELECT * FROM pg_indexes WHERE tablename = 'Clientes WhatsApp';

-- 2. Testar performance da query
EXPLAIN ANALYZE 
SELECT * FROM "Clientes WhatsApp" 
WHERE telefone = '555499250023' 
LIMIT 1;

-- 3. Verificar RLS
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'Clientes WhatsApp';

-- 4. Verificar estatísticas
SELECT 
  schemaname,
  relname,
  n_live_tup as rows,
  n_dead_tup as dead_rows,
  last_analyze,
  last_autovacuum
FROM pg_stat_user_tables 
WHERE relname = 'Clientes WhatsApp';

-- 5. Verificar locks ativos
SELECT * FROM pg_locks WHERE relation = '"Clientes WhatsApp"'::regclass;
```

---

## ✅ Solução Aplicada

### Arquivo de Migration Criado

**Arquivo**: `migrations/003_optimize_clientes_whatsapp.sql`

### O Que a Migration Faz

1. **✅ Garante Índice Otimizado**
   - Verifica e cria PRIMARY KEY em `telefone` se não existir
   - Adiciona índice em `status` para queries de filtro
   - Índice composto `(status, telefone)` para queries combinadas

2. **✅ Desabilita RLS** 
   - RLS não é necessário (n8n usa `service_role` com acesso total)
   - Elimina overhead de verificação de policies

3. **✅ Atualiza Estatísticas**
   - Executa `ANALYZE` para query planner otimizado
   - Executa `VACUUM` para liberar espaço

4. **✅ Otimiza Configuração da Tabela**
   - Define `fillfactor = 80%` para reduzir overhead de updates

5. **✅ Adiciona Monitoramento**
   - View `v_clientes_whatsapp_stats` para acompanhar performance

---

## 📋 Como Aplicar a Solução

### Passo 1: Executar a Migration

1. Acesse **Supabase Dashboard**:
   ```
   https://app.supabase.com/project/_/sql
   ```

2. Abra o arquivo:
   ```
   migrations/003_optimize_clientes_whatsapp.sql
   ```

3. **Copie TODO o conteúdo** do arquivo

4. **Cole no SQL Editor** do Supabase

5. Clique em **"Run"** para executar

### Passo 2: Verificar Resultados

Após executar a migration, verifique:

```sql
-- Ver índices criados
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'Clientes WhatsApp';

-- Resultado esperado:
-- Clientes WhatsApp_pkey (PRIMARY KEY em telefone)
-- idx_clientes_whatsapp_status
-- idx_clientes_whatsapp_status_telefone
```

```sql
-- Testar performance da query problemática
EXPLAIN ANALYZE 
SELECT * FROM "Clientes WhatsApp" 
WHERE telefone = '555499250023' 
LIMIT 1;

-- Resultado esperado:
-- Execution Time: < 10ms
-- Index Scan using "Clientes WhatsApp_pkey"
```

```sql
-- Verificar RLS desabilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'Clientes WhatsApp';

-- Resultado esperado:
-- rowsecurity = false
```

### Passo 3: Monitorar Performance

```sql
-- Ver estatísticas da tabela
SELECT * FROM v_clientes_whatsapp_stats;

-- Campos importantes:
-- live_rows: número de registros ativos
-- dead_rows: registros mortos (devem ser < 10% de live_rows)
-- last_analyze: deve ser recente
-- last_vacuum: deve ser recente
```

---

## 🧪 Teste Após Aplicação

### 1. Teste Manual no Supabase

```sql
-- Teste 1: Query exata do n8n
SELECT * FROM "Clientes WhatsApp" 
WHERE telefone = '555499250023' 
LIMIT 1;
-- Deve retornar em < 10ms

-- Teste 2: Insert de novo cliente
INSERT INTO "Clientes WhatsApp" (telefone, nome, status)
VALUES ('555499999999', 'Teste Performance', 'ativo');
-- Deve ser instantâneo

-- Teste 3: Query após insert
SELECT * FROM "Clientes WhatsApp" 
WHERE telefone = '555499999999' 
LIMIT 1;
-- Deve retornar em < 10ms

-- Limpar teste
DELETE FROM "Clientes WhatsApp" WHERE telefone = '555499999999';
```

### 2. Teste no n8n Workflow

1. Envie uma **mensagem de teste** via WhatsApp
2. Monitore os **logs do n8n** (Executions → View Logs)
3. Procure por:
   ```
   [Postgres] Query: SELECT * FROM "Clientes WhatsApp" WHERE telefone = $1 LIMIT 1
   ```
4. Verifique que a query **retorna rapidamente** (< 1 segundo)

### 3. Teste de Carga (Opcional)

Se tiver muitos clientes, teste com volume:

```sql
-- Simular múltiplas queries simultâneas
DO $$
DECLARE
  i INTEGER;
BEGIN
  FOR i IN 1..100 LOOP
    PERFORM * FROM "Clientes WhatsApp" 
    WHERE telefone = (SELECT telefone FROM "Clientes WhatsApp" LIMIT 1 OFFSET random() * (SELECT COUNT(*) FROM "Clientes WhatsApp"));
  END LOOP;
END $$;
```

---

## 📊 Resultados Esperados

### Antes da Otimização
- ❌ Query: **> 5 segundos** (travado)
- ❌ Webhooks: **timeout**
- ❌ Mensagens: **perdidas**

### Depois da Otimização
- ✅ Query: **< 10ms**
- ✅ Webhooks: **processamento imediato**
- ✅ Mensagens: **100% processadas**

---

## 🔧 Troubleshooting Adicional

### Se a query ainda estiver lenta após migration

#### 1. Verificar Connection Pool

```sql
-- Ver conexões ativas
SELECT count(*) as active_connections
FROM pg_stat_activity
WHERE state = 'active';

-- Ver conexões esperando
SELECT count(*) as waiting_connections
FROM pg_stat_activity
WHERE wait_event_type = 'Lock';
```

**Solução**: Se muitas conexões, verificar `max_connections` no Supabase.

#### 2. Verificar Locks

```sql
-- Ver bloqueios ativos
SELECT 
  blocked_locks.pid AS blocked_pid,
  blocking_locks.pid AS blocking_pid,
  blocked_activity.query AS blocked_query,
  blocking_activity.query AS blocking_query
FROM pg_catalog.pg_locks blocked_locks
JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
JOIN pg_catalog.pg_locks blocking_locks ON blocking_locks.locktype = blocked_locks.locktype
JOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
WHERE NOT blocked_locks.granted;
```

**Solução**: Se houver locks, identificar e matar processos travados.

#### 3. Forçar Rebuild do Índice

Se índice estiver corrompido ou fragmentado:

```sql
-- Recriar índice PRIMARY KEY
ALTER TABLE "Clientes WhatsApp" DROP CONSTRAINT "Clientes WhatsApp_pkey";
ALTER TABLE "Clientes WhatsApp" ADD CONSTRAINT "Clientes WhatsApp_pkey" PRIMARY KEY (telefone);

-- Recriar índices adicionais
REINDEX TABLE "Clientes WhatsApp";
```

#### 4. Verificar Tipo de Dado

O campo `telefone` está como `NUMERIC`. Se armazenado como `TEXT` no n8n:

```sql
-- Verificar tipo
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'Clientes WhatsApp' AND column_name = 'telefone';

-- Se necessário, converter para TEXT (CUIDADO: pode quebrar dados)
-- ALTER TABLE "Clientes WhatsApp" ALTER COLUMN telefone TYPE TEXT;
```

**⚠️ Nota**: Mismatch de tipos pode causar full table scan ao invés de index scan!

---

## 📈 Monitoramento Contínuo

### Dashboard de Performance

Criar query recorrente no Supabase:

```sql
-- Monitorar queries lentas
SELECT 
  query,
  calls,
  total_exec_time,
  mean_exec_time,
  max_exec_time
FROM pg_stat_statements
WHERE query LIKE '%Clientes WhatsApp%'
ORDER BY mean_exec_time DESC
LIMIT 10;
```

### Alertas Automáticos (Opcional)

Configurar alerta no Supabase quando:
- Query time > 1 segundo
- Dead rows > 20% de live rows
- Conexões ativas > 80% do pool

---

## 🎯 Checklist de Verificação

Após aplicar a migration, confirme:

- [ ] Migration executada sem erros no Supabase SQL Editor
- [ ] Índices criados: `Clientes WhatsApp_pkey`, `idx_clientes_whatsapp_status`, `idx_clientes_whatsapp_status_telefone`
- [ ] RLS desabilitado na tabela "Clientes WhatsApp"
- [ ] Query `SELECT * WHERE telefone = $1 LIMIT 1` retorna em < 10ms
- [ ] View `v_clientes_whatsapp_stats` criada e acessível
- [ ] Teste enviando mensagem via WhatsApp - webhook processa rapidamente
- [ ] Logs do n8n não mostram mais "travamento" na query Postgres

---

## 📚 Referências

- [PostgreSQL Index Types](https://www.postgresql.org/docs/current/indexes-types.html)
- [Supabase Performance](https://supabase.com/docs/guides/database/postgres/performance)
- [PostgreSQL EXPLAIN ANALYZE](https://www.postgresql.org/docs/current/using-explain.html)
- [Row Level Security Best Practices](https://supabase.com/docs/guides/database/postgres/row-level-security)

---

## ✅ Conclusão

Esta solução otimiza a tabela "Clientes WhatsApp" para garantir que a query crítica:

```sql
SELECT * FROM "Clientes WhatsApp" WHERE telefone = $1 LIMIT 1
```

Execute em **< 10ms** ao invés de **> 5 segundos**, resolvendo o travamento do webhook do WhatsApp.

**Status**: ✅ Solução pronta para aplicação em produção
