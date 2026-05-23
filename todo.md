# Art 7 Geo-Dashboard TODO

## Phase 1: Database & Backend Setup
- [x] Create geolocation_pages table schema with city, state, status fields
- [x] Seed database with all MA and CT cities (99 cidades total)
- [x] Create tRPC procedures for CRUD operations on geolocation pages
- [x] Removed auth requirement - public access via link

## Phase 2: Frontend - Dashboard Layout
- [x] Design and implement architectural blueprint-inspired layout with grid background
- [x] Create unified dashboard with tab navigation
- [x] Implement header with statistics cards (total, active, pending)
- [x] Add progress bar showing completion percentage
- [x] Set up color scheme (royal blue, white lines, CAD-style typography)

## Phase 3: Frontend - Data Display
- [x] Build table/list component with state grouping (MA vs CT)
- [x] Implement city listing with status indicators
- [x] Add toggle buttons for status change (Active/Pending)
- [x] Create responsive layout for mobile and desktop

## Phase 4: Frontend - Filters & Search
- [x] Implement search by city name
- [x] Add filter by state (MA/CT)
- [x] Add filter by status (Active/Pending)
- [x] Implement real-time filtering and search

## Phase 5: Testing & Deployment
- [x] Write vitest tests for backend procedures (18 tests passing)
- [x] Test all filter combinations (implemented in Dashboard component)
- [x] Remove authentication requirement for public access
- [x] Remove logout button and user info display
- [x] Verify public access works correctly
- [x] All tests passing (18/18)
- [x] Create checkpoint and prepare for deployment
## Phase 6: Unificação dos Dashboards (Geo + Listing)
- [x] Analisar dashboard de listing existente (https://art7epoxy-rtehphrv.manus.space/)
- [x] Criar schema e backend para portais de listing
- [x] Migrar dados dos 37 portais de listing para o banco de dados
- [x] Implementar sistema de abas/módulos (Geo Pages / Listing Portals)
- [x] Criar interface do módulo de Listing Portals com tabela, filtros e status
- [x] Unificar navegação e layout entre os dois módulos
- [x] Corrigir bug de rota vazia que impedia renderização
- [x] Testar alternância entre abas e funcionalidades (18 testes passando)
- [x] Salvar checkpoint e entregar ao usuário

## Phase 7: Atualização dos Dados de Listing via CSV
- [x] Analisar CSV e comparar com schema atual
- [x] Atualizar dados dos 37 portais com informações completas do CSV
- [x] Adicionar coluna Plano na tabela desktop (paidPlanInfo)
- [x] Adicionar observações nos cards mobile
- [x] Verificar visualmente no navegador (37 portais com dados corretos)
- [x] Todos os 18 testes passando
- [x] Salvar checkpoint

## Phase 8: Atualização das Páginas Geolocalizadas via PDF
- [x] Extrair lista de 57 cidades do PDF (46 MA + 11 NH)
- [x] Verificar quais cidades já possuem páginas no site art7epoxy.com (padrão: /garage-floor-coating-in-{city}-{state}/)
- [x] Atualizar banco de dados com status correto (43 Ativas / 14 Pendentes)
- [x] Sincronizar lista do dashboard com cidades do PDF (substituiu MA/CT por MA/NH)
- [x] Atualizar testes vitest (18/18 passando)
- [x] Salvar checkpoint

## Phase 9: Reconfiguração para Cidades Premium
- [x] Reduzir para 36 cidades premium (31 MA + 5 NH)
- [x] Marcar apenas Wellesley, MA como ativa (3% de progresso)
- [x] Renumerar de 1 a 36 para acompanhamento de producao
- [x] Atualizar testes vitest (18/18 passando)
- [x] Verificar dashboard no navegador (36 cidades, 1 ativa, 35 pendentes)
