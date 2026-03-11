# Blueprint do SaaS Financeiro para Igrejas

## Objetivo
A proposta do *Tesouro da Igreja* é entregar um painel financeiro simples e confiável para igrejas evangélicas, garantindo controle de dízimos, ofertas, despesas, campanhas e relatórios mesmo para equipes sem conhecimento técnico.

## Estrutura do Banco de Dados
O esquema em `schema.sql` cobre os elementos essenciais:

- **churches**: entidade multi-tenancy que armazena informações da igreja, moeda e endereço.
- **users**: credenciais, hash de senha e papéis (`admin`, `pastor`, `tesoureiro`) vinculados a uma igreja.
- **members**: voluntários e líderes com ministério, contato e histórico de contribuições conectado a `transactions`.
- **transactions**: registros de dízimos/ofertas com valor, data, método de pagamento e ligação opcional a campanhas e membros.
- **expenses**: despesas certificadas com categoria, comprovante (URL) e responsável.
- **campaigns** + **campaign_contributions**: metas com percentuais de progresso ligados a transações específicas para mostrar evolução.
- **reports_cache**: cache de relatórios mensais/anuais/entradas-saídas para exportação rápida em PDF/Excel.
- **audit_logs**: trilhas de auditoria de ações do usuário, útil para compliance financeiro.

## Wireframes (UX simplificada)
1. **Dashboard Administrativo (`/dashboard` ou `/example-protected-route`)**
   - Cabeçalho com resumo: cartões de dízimos, ofertas, despesas e saldo líquido do mês.
   - Linha do tempo: gráfico mensal com entradas e saídas sobreposto.
   - Seções por aba ou cards:
     - **Membros**: lista com filtros (nome, ministério), botões de convite/edição, histórico rápido de contribuições.
     - **Dízimos e Ofertas**: formulário rápido (valor, data, membro opcional, método) e tabela que mostra as últimas contribuções com etiquetas de método.
     - **Despesas**: formulário de cadastro, seleção de categoria, valor e comprovante com tabela de despesas recentes e alertas de limiares.
     - **Campanhas**: cards com barra de progresso, meta e botões de compartilhamento para manter metas transparentes.
     - **Permissões**: painel que descreve papéis (Admin, Pastor, Tesoureiro) e permite emitir convites ou revogar acesso.

2. **Landing Page (marketing)**
   - Hero com título positivo, CTA de demonstração e contadores (igrejas ativadas, dízimos processados, campanhas acompanhadas).
   - Seção de módulos com iconografia (Dashboard, Relatórios, Campanhas, Exportações).
   - Preço e planos, destacando funcionalidades como automação de relatórios, integração com Appwrite ou PostgreSQL.
   - Rodapé com links de suporte, políticas e contato.

## Arquitetura do Sistema
- **Frontend:** React 19 + TanStack Router + TanStack React Query; o `LandingPage` usa componentes estilizados com Tailwind CSS (via `@tailwindcss/vite`) e o `ThemeProvider` do `next-themes` garante modo escuro consistente.
- **Backend:** TanStack Start server (Bun/Node) executando o entrypoint em `server.ts`, que carrega estáticos com pré-cache inteligente, expõe rotas SSR e permite configurações via variáveis de ambiente.
- **Banco de Dados:** PostgreSQL com o esquema descrito em `schema.sql`, relatórios cacheados (`reports_cache`) e auditoria de ações financeiras.
- **Autenticação & Segurança:** Appwrite com endpoints definidos no `.env` controla login e roles; o `authMiddleware` valida o usuário antes de liberar `/dashboard`.
- **Infra & Observabilidade:** Bun serve os ativos com ETag/Gzip configurável; logs sinalizam carregamento de assets, e `audit_logs` garante trilha completa para qualquer mudança financeira.

## Modelo de Monetização SaaS
1. **Plano Comunidade (gratuito)**
   - Dashboard básico (dízimos, ofertas, despesas) e centro de membros limitado a 10 registros.
   - Exportação mensal em CSV e suporte via centro de ajuda.

2. **Plano Igreja Conectada (R$ 149/mês)**
   - Formulários guiados para dízimos/ofertas com métodos (Pix, dinheiro, cartão).
   - Relatórios mensais e anuais com PDFs/Excel e alertas de limites em despesas.
   - Campanhas ilimitadas, checklist de progresso visível e histórico de membros.

3. **Plano Ministério (sob consulta)**
   - Multi-igrejas, permissões avançadas (Admin/Pastor/Tesoureiro), auditoria em tempo real e integrações (Appwrite, PostgreSQL, APIs externas).
   - Onboarding guiado, SLA e suporte prioritário para relatórios e migração.

Os planos podem ser cobrados mensalmente ou anualmente com desconto e upgrades/downgrades diretamente pelo painel.
