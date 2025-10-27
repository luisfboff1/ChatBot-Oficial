-- =====================================================
-- DIAGNÓSTICO DE PERFORMANCE - Clientes WhatsApp
-- =====================================================
-- Execute este script no Supabase SQL Editor para diagnosticar
-- problemas de performance na tabela "Clientes WhatsApp"
-- =====================================================

\echo '🔍 INICIANDO DIAGNÓSTICO DE PERFORMANCE...\n'

-- =====================================================
-- 1. INFORMAÇÕES BÁSICAS DA TABELA
-- =====================================================
\echo '📊 1. INFORMAÇÕES DA TABELA:'
SELECT 
  schemaname as schema,
  tablename as tabela,
  pg_size_pretty(pg_total_relation_size('"Clientes WhatsApp"')) as tamanho_total,
  pg_size_pretty(pg_relation_size('"Clientes WhatsApp"')) as tamanho_tabela,
  pg_size_pretty(pg_indexes_size('"Clientes WhatsApp"')) as tamanho_indices
FROM pg_tables
WHERE tablename = 'Clientes WhatsApp';

\echo '\n'

-- =====================================================
-- 2. VERIFICAR ÍNDICES
-- =====================================================
\echo '🔑 2. ÍNDICES EXISTENTES:'
SELECT 
  indexname as nome_indice,
  indexdef as definicao
FROM pg_indexes
WHERE tablename = 'Clientes WhatsApp'
ORDER BY indexname;

\echo '\n'

-- =====================================================
-- 3. VERIFICAR ROW LEVEL SECURITY
-- =====================================================
\echo '🔐 3. ROW LEVEL SECURITY (RLS):'
SELECT 
  tablename as tabela,
  CASE 
    WHEN rowsecurity THEN '❌ HABILITADO (pode causar lentidão)'
    ELSE '✅ DESABILITADO (otimizado)'
  END as status_rls
FROM pg_tables
WHERE tablename = 'Clientes WhatsApp';

\echo '\n'

-- =====================================================
-- 4. ESTATÍSTICAS DA TABELA
-- =====================================================
\echo '📈 4. ESTATÍSTICAS DE USO:'
SELECT 
  relname as tabela,
  n_tup_ins as inserts,
  n_tup_upd as updates,
  n_tup_del as deletes,
  n_live_tup as linhas_ativas,
  n_dead_tup as linhas_mortas,
  CASE 
    WHEN n_live_tup > 0 THEN 
      ROUND((n_dead_tup::numeric / n_live_tup::numeric) * 100, 2)
    ELSE 0
  END as pct_mortas,
  last_vacuum as ultimo_vacuum,
  last_autovacuum as ultimo_autovacuum,
  last_analyze as ultimo_analyze,
  last_autoanalyze as ultimo_autoanalyze
FROM pg_stat_user_tables
WHERE relname = 'Clientes WhatsApp';

\echo '\n'

-- =====================================================
-- 5. TESTE DE PERFORMANCE DA QUERY CRÍTICA
-- =====================================================
\echo '⚡ 5. TESTE DE PERFORMANCE:'
\echo 'Query: SELECT * FROM "Clientes WhatsApp" WHERE telefone = (primeiro registro) LIMIT 1'
\echo ''

-- Executar EXPLAIN ANALYZE na query crítica
EXPLAIN (ANALYZE, BUFFERS, TIMING) 
SELECT * FROM "Clientes WhatsApp" 
WHERE telefone = (
  SELECT telefone FROM "Clientes WhatsApp" LIMIT 1
)
LIMIT 1;

\echo '\n'

-- =====================================================
-- 6. VERIFICAR CONEXÕES ATIVAS
-- =====================================================
\echo '🔌 6. CONEXÕES ATIVAS NO BANCO:'
SELECT 
  count(*) as total_conexoes,
  count(*) FILTER (WHERE state = 'active') as conexoes_ativas,
  count(*) FILTER (WHERE state = 'idle') as conexoes_idle,
  count(*) FILTER (WHERE wait_event_type = 'Lock') as esperando_lock
FROM pg_stat_activity;

\echo '\n'

-- =====================================================
-- 7. VERIFICAR LOCKS NA TABELA
-- =====================================================
\echo '🔒 7. LOCKS ATIVOS NA TABELA:'
SELECT 
  locktype as tipo,
  mode as modo,
  granted as concedido,
  pid as process_id
FROM pg_locks 
WHERE relation = '"Clientes WhatsApp"'::regclass;

\echo '\n'

-- =====================================================
-- 8. RESUMO E RECOMENDAÇÕES
-- =====================================================
\echo '✅ 8. RESUMO DO DIAGNÓSTICO:\n'

-- Criar tabela temporária com diagnóstico
WITH diagnostico AS (
  SELECT 
    -- Verifica índice
    EXISTS(
      SELECT 1 FROM pg_indexes 
      WHERE tablename = 'Clientes WhatsApp' 
      AND indexname = 'Clientes WhatsApp_pkey'
    ) as tem_indice_pk,
    
    -- Verifica RLS
    NOT (SELECT rowsecurity FROM pg_tables WHERE tablename = 'Clientes WhatsApp') as rls_desabilitado,
    
    -- Verifica dead rows
    (
      SELECT 
        CASE 
          WHEN n_live_tup = 0 THEN true
          WHEN (n_dead_tup::numeric / n_live_tup::numeric) < 0.2 THEN true
          ELSE false
        END
      FROM pg_stat_user_tables 
      WHERE relname = 'Clientes WhatsApp'
    ) as dead_rows_ok,
    
    -- Verifica último analyze
    (
      SELECT last_analyze > (NOW() - INTERVAL '7 days')
      FROM pg_stat_user_tables 
      WHERE relname = 'Clientes WhatsApp'
    ) as analyze_recente
)
SELECT 
  CASE WHEN tem_indice_pk THEN '✅' ELSE '❌' END || ' Índice PRIMARY KEY em telefone' as check_1,
  CASE WHEN rls_desabilitado THEN '✅' ELSE '❌' END || ' RLS desabilitado (otimizado)' as check_2,
  CASE WHEN dead_rows_ok THEN '✅' ELSE '⚠️' END || ' Dead rows < 20%' as check_3,
  CASE WHEN analyze_recente THEN '✅' ELSE '⚠️' END || ' Estatísticas atualizadas (< 7 dias)' as check_4
FROM diagnostico;

\echo '\n'

-- =====================================================
-- 9. RECOMENDAÇÕES BASEADAS NO DIAGNÓSTICO
-- =====================================================
\echo '💡 RECOMENDAÇÕES:\n'

DO $$
DECLARE
  tem_indice boolean;
  rls_habilitado boolean;
  pct_mortas numeric;
  analyze_antigo boolean;
BEGIN
  -- Verificar índice
  SELECT EXISTS(
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'Clientes WhatsApp' 
    AND indexname = 'Clientes WhatsApp_pkey'
  ) INTO tem_indice;
  
  IF NOT tem_indice THEN
    RAISE NOTICE '❌ CRÍTICO: Índice PRIMARY KEY ausente!';
    RAISE NOTICE '   Execute: migrations/003_optimize_clientes_whatsapp.sql';
  END IF;
  
  -- Verificar RLS
  SELECT rowsecurity FROM pg_tables 
  WHERE tablename = 'Clientes WhatsApp' 
  INTO rls_habilitado;
  
  IF rls_habilitado THEN
    RAISE NOTICE '⚠️  ATENÇÃO: RLS está habilitado e pode causar lentidão';
    RAISE NOTICE '   Execute: migrations/003_optimize_clientes_whatsapp.sql';
  END IF;
  
  -- Verificar dead rows
  SELECT 
    CASE 
      WHEN n_live_tup > 0 THEN (n_dead_tup::numeric / n_live_tup::numeric) * 100
      ELSE 0
    END
  FROM pg_stat_user_tables 
  WHERE relname = 'Clientes WhatsApp'
  INTO pct_mortas;
  
  IF pct_mortas > 20 THEN
    RAISE NOTICE '⚠️  ATENÇÃO: %.2f%% de dead rows detectadas', pct_mortas;
    RAISE NOTICE '   Execute: VACUUM "Clientes WhatsApp";';
  END IF;
  
  -- Verificar analyze
  SELECT (last_analyze IS NULL OR last_analyze < (NOW() - INTERVAL '7 days'))
  FROM pg_stat_user_tables 
  WHERE relname = 'Clientes WhatsApp'
  INTO analyze_antigo;
  
  IF analyze_antigo THEN
    RAISE NOTICE '⚠️  ATENÇÃO: Estatísticas desatualizadas';
    RAISE NOTICE '   Execute: ANALYZE "Clientes WhatsApp";';
  END IF;
  
  -- Se tudo OK
  IF tem_indice AND NOT rls_habilitado AND pct_mortas < 20 AND NOT analyze_antigo THEN
    RAISE NOTICE '✅ TUDO OK: Tabela otimizada e funcionando bem!';
  END IF;
END $$;

\echo '\n'
\echo '📚 Para mais informações, veja: explicacoes/SOLUCAO-QUERY-LENTA.md'
\echo '✅ Diagnóstico completo!'
