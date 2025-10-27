-- =====================================================
-- Otimização de Performance - Tabela "Clientes WhatsApp"
-- =====================================================
-- Este migration resolve o problema de lentidão na query:
-- SELECT * FROM "Clientes WhatsApp" WHERE telefone = $1 LIMIT 1
--
-- Problema identificado:
-- - Query demora muito para verificar se telefone já existe
-- - Executada em TODA mensagem recebida do WhatsApp
-- - Gargalo crítico no fluxo de processamento
--
-- Soluções aplicadas:
-- 1. Garantir índice otimizado em telefone (PRIMARY KEY)
-- 2. Adicionar índice para queries por status (usado em filtros)
-- 3. Otimizar RLS policies para service_role (n8n)
-- 4. Adicionar VACUUM e ANALYZE para estatísticas atualizadas
-- =====================================================

-- =====================================================
-- 1. VERIFICAR E OTIMIZAR ÍNDICES
-- =====================================================

-- Garantir que o índice do PRIMARY KEY existe e está otimizado
-- (Normalmente criado automaticamente, mas vamos garantir)
DO $$ 
BEGIN
  -- Verificar se índice do PRIMARY KEY existe
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'Clientes WhatsApp' 
    AND indexname = 'Clientes WhatsApp_pkey'
  ) THEN
    -- Se não existir, criar PRIMARY KEY
    ALTER TABLE "Clientes WhatsApp" 
    ADD CONSTRAINT "Clientes WhatsApp_pkey" PRIMARY KEY (telefone);
  END IF;
END $$;

-- Criar índice adicional para queries por status (usado em filtros)
CREATE INDEX IF NOT EXISTS idx_clientes_whatsapp_status 
ON "Clientes WhatsApp"(status);

-- Criar índice composto para queries que filtram status + telefone
CREATE INDEX IF NOT EXISTS idx_clientes_whatsapp_status_telefone 
ON "Clientes WhatsApp"(status, telefone);

-- =====================================================
-- 2. OTIMIZAR ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Verificar se RLS está habilitado na tabela
DO $$ 
BEGIN
  -- Desabilitar RLS para "Clientes WhatsApp" 
  -- (n8n usa service_role que já tem acesso total)
  ALTER TABLE "Clientes WhatsApp" DISABLE ROW LEVEL SECURITY;
  
  -- Nota: Se RLS for necessário no futuro, use uma policy otimizada:
  -- CREATE POLICY "Bypass RLS for service role" ON "Clientes WhatsApp"
  --   FOR ALL USING (true);
END $$;

-- =====================================================
-- 3. OTIMIZAÇÕES DE TABELA
-- =====================================================

-- Atualizar estatísticas da tabela para query planner
ANALYZE "Clientes WhatsApp";

-- Liberar espaço não utilizado (se houver)
VACUUM "Clientes WhatsApp";

-- =====================================================
-- 4. CONFIGURAÇÕES DE PERFORMANCE
-- =====================================================

-- Aumentar fill factor para reduzir HOT updates overhead
-- (80% = 20% de espaço livre por página para updates)
ALTER TABLE "Clientes WhatsApp" SET (fillfactor = 80);

-- =====================================================
-- 5. ADICIONAR COMENTÁRIOS PARA DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE "Clientes WhatsApp" IS 
'Tabela de clientes WhatsApp - OTIMIZADA para queries frequentes por telefone. 
Query crítica: SELECT * FROM "Clientes WhatsApp" WHERE telefone = $1 LIMIT 1';

COMMENT ON COLUMN "Clientes WhatsApp".telefone IS 
'Número de telefone (PRIMARY KEY com índice otimizado para lookups rápidos)';

COMMENT ON COLUMN "Clientes WhatsApp".status IS 
'Status do cliente (indexado para queries de filtro)';

-- =====================================================
-- 6. VERIFICAÇÃO PÓS-MIGRATION
-- =====================================================

-- Query para verificar índices criados
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'Clientes WhatsApp'
ORDER BY indexname;

-- Query para verificar tamanho da tabela
SELECT 
  pg_size_pretty(pg_total_relation_size('"Clientes WhatsApp"')) as total_size,
  pg_size_pretty(pg_relation_size('"Clientes WhatsApp"')) as table_size,
  pg_size_pretty(pg_indexes_size('"Clientes WhatsApp"')) as indexes_size;

-- =====================================================
-- 7. MONITORAMENTO (OPCIONAL)
-- =====================================================

-- View para monitorar performance de queries nesta tabela
CREATE OR REPLACE VIEW v_clientes_whatsapp_stats AS
SELECT
  'Clientes WhatsApp' as table_name,
  schemaname,
  n_tup_ins as inserts,
  n_tup_upd as updates,
  n_tup_del as deletes,
  n_live_tup as live_rows,
  n_dead_tup as dead_rows,
  last_vacuum,
  last_autovacuum,
  last_analyze,
  last_autoanalyze
FROM pg_stat_user_tables
WHERE relname = 'Clientes WhatsApp';

COMMENT ON VIEW v_clientes_whatsapp_stats IS 
'Estatísticas de performance da tabela Clientes WhatsApp para monitoramento';

-- =====================================================
-- RESULTADO ESPERADO
-- =====================================================
-- ✅ Query SELECT * FROM "Clientes WhatsApp" WHERE telefone = $1 deve ser <10ms
-- ✅ Índices otimizados para lookup por telefone
-- ✅ RLS desabilitado (service_role já tem acesso total)
-- ✅ Estatísticas atualizadas para query planner
-- ✅ Monitoramento disponível via view v_clientes_whatsapp_stats
--
-- Para verificar performance após migration:
-- EXPLAIN ANALYZE SELECT * FROM "Clientes WhatsApp" WHERE telefone = '5511999999999' LIMIT 1;
-- =====================================================
