import { Link } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { Cross } from 'lucide-react'
import { useState, type CSSProperties, type FormEvent } from 'react'
import { GerenciarUsuarios } from './GerenciarUsuarios'
import { useAuth } from '@/hooks/use-auth'
import {
  createTitheFn,
  createOfferingFn,
  createExpenseFn,
  exportFinanceReportFn,
} from '@/server/functions/finance'

type SummaryCard = {
  label: string
  value: string
  detail: string
  trend: string
  icon: string
  tone: string
}

type QuickLink = {
  title: string
  description: string
  icon: string
  to: '/dashboard' | '/example-protected-route' | '/sign-out' | '/assinaturas'
  search?: { plano?: PlanoInput }
}

type FinanceAction = {
  title: string
  description: string
  mode: 'cadastro' | 'visualizacao'
}

type PlanoAtivo = 'inicial' | 'padrao' | 'premium'
type PlanoInput = PlanoAtivo | 'paroquia' | 'diocese'
type RoleKey = 'dono_saas' | 'administrador' | 'tesoureiro' | 'pastor' | 'membro'

const seedProfilesByEmail: Record<
  string,
  { role: RoleKey; churchPlan: PlanoAtivo; churchName: string }
> = {
  'dono@financialchurch.com': {
    role: 'dono_saas',
    churchPlan: 'premium',
    churchName: 'Painel SaaS financialChurch',
  },
  'admin@igreja.com': {
    role: 'administrador',
    churchPlan: 'padrao',
    churchName: 'Igreja de teste: igreja-seed',
  },
  'tesoureiro@igreja.com': {
    role: 'tesoureiro',
    churchPlan: 'padrao',
    churchName: 'Igreja de teste: igreja-seed',
  },
  'pastor@igreja.com': {
    role: 'pastor',
    churchPlan: 'padrao',
    churchName: 'Igreja de teste: igreja-seed',
  },
  'membro@igreja.com': {
    role: 'membro',
    churchPlan: 'padrao',
    churchName: 'Igreja de teste: igreja-seed',
  },
}

const defaultPlanByRole: Record<RoleKey, PlanoAtivo> = {
  dono_saas: 'premium',
  administrador: 'premium',
  tesoureiro: 'padrao',
  pastor: 'inicial',
  membro: 'inicial',
}

function getSaasOwnerEmails() {
  const configured = `${import.meta.env.VITE_SAAS_OWNER_EMAILS ?? import.meta.env.VITE_SAAS_OWNER_EMAIL ?? ''}`
  const configuredList = configured
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)

  return new Set(['dono@financialchurch.com', 'owner@financialchurch.com', ...configuredList])
}

function isSaasOwnerEmail(email?: unknown) {
  if (typeof email !== 'string') {
    return false
  }

  return getSaasOwnerEmails().has(email.trim().toLowerCase())
}

function getSeedProfileByEmail(email?: unknown) {
  if (typeof email !== 'string') {
    return null
  }

  return seedProfilesByEmail[email.trim().toLowerCase()] ?? null
}

const planoInfo: Record<PlanoAtivo, { nome: string; detalhe: string; limite: string }> = {
  inicial: {
    nome: 'Plano Inicial (Gratuito)',
    detalhe: 'Recursos essenciais ativos para a operacao diaria.',
    limite: 'Limites: sem multi-igreja e com capacidade reduzida para relatorios avancados.',
  },
  padrao: {
    nome: 'Plano Padrao',
    detalhe: 'Recursos avancados liberados para gestao em crescimento.',
    limite: 'Limites: capacidade para unidade unica com equipe estendida.',
  },
  premium: {
    nome: 'Plano Premium',
    detalhe: 'Operacao multi-igreja com consolidacao e governanca.',
    limite: 'Sem limitacoes de consolidacao e com fluxo completo de administracao.',
  },
}

function normalizePlano(plano?: PlanoInput): PlanoAtivo {
  if (!plano || plano === 'inicial') {
    return 'inicial'
  }

  if (plano === 'paroquia' || plano === 'padrao') {
    return 'padrao'
  }

  return 'premium'
}

type PlanFeatureCatalog = {
  descricao: string
  recursosLiberados: string[]
  recursosBloqueados: string[]
}

const planFeatureCatalog: Record<PlanoAtivo, PlanFeatureCatalog> = {
  inicial: {
    descricao: 'Painel basico com foco em dizimos e ofertas para comunidades em inicio de operacao.',
    recursosLiberados: [
      'Registro de dizimos e ofertas',
      'Painel basico por perfil',
      'Exportacao CSV',
      'Suporte por e-mail',
    ],
    recursosBloqueados: [
      'Cadastro de despesas',
      'Relatorios PDF e Excel',
      'Relatorios consolidados multi-igreja',
      'API e analytics avancados',
    ],
  },
  padrao: {
    descricao: 'Controle completo para igrejas em crescimento com relatorios e operacao por funcao.',
    recursosLiberados: [
      'Todos os modulos principais',
      'Cadastro de despesas',
      'Relatorios PDF e Excel',
      'Checkout Stripe e acesso por funcao',
      'Suporte prioritario e identidade personalizada',
      'Acesso a API',
    ],
    recursosBloqueados: [
      'Relatorios consolidados multi-igreja',
      'White-label e SLA dedicado',
      'Onboarding premium e analytics avancados',
    ],
  },
  premium: {
    descricao: 'Experiencia completa para redes com governanca multi-igreja e recursos avancados.',
    recursosLiberados: [
      'Multiplas filiais de igrejas',
      'Relatorios consolidados',
      'Onboarding dedicado',
      'Integracoes personalizadas e SLA',
      'Analises avancadas',
      'White-label',
    ],
    recursosBloqueados: [],
  },
}

function resolvePlanoAtivo(plano: PlanoInput | undefined, prefs: unknown, role: RoleKey, email?: unknown): PlanoAtivo {
  const seedProfile = getSeedProfileByEmail(email)
  if (seedProfile) {
    return seedProfile.churchPlan
  }

  const userPlan =
    (prefs as Record<string, unknown> | undefined)?.churchPlan ??
    (prefs as Record<string, unknown> | undefined)?.plan
  if (typeof userPlan === 'string') {
    return normalizePlano(userPlan as PlanoInput)
  }

  if (plano) {
    return normalizePlano(plano)
  }

  return defaultPlanByRole[role]
}

function getRequiredPlanForFinanceAction(title: string): PlanoAtivo {
  const normalizedTitle = title.toLowerCase()

  if (normalizedTitle.includes('consolidad')) {
    return 'premium'
  }

  if (normalizedTitle.includes('despesa') || normalizedTitle.includes('exportar')) {
    return 'padrao'
  }

  return 'inicial'
}

function isFinanceActionUnlocked(title: string, activePlan: PlanoAtivo) {
  const requiredPlan = getRequiredPlanForFinanceAction(title)

  if (requiredPlan === 'inicial') {
    return true
  }

  if (requiredPlan === 'padrao') {
    return activePlan === 'padrao' || activePlan === 'premium'
  }

  return activePlan === 'premium'
}

function isQuickLinkUnlocked(link: QuickLink, activePlan: PlanoAtivo) {
  if (activePlan === 'inicial' && link.to === '/example-protected-route') {
    return false
  }
  return true
}

const roleConfigs: Record<
  RoleKey,
  {
    title: string
    subtitle: string
    sectionTitle: string
    canManageUsers: boolean
    financeTitle: string
    financeDescription: string
    financeActions: FinanceAction[]
    permissions: string[]
    summaryCards: SummaryCard[]
    quickLinks: QuickLink[]
  }
> = {
  dono_saas: {
    title: 'Painel do Dono do SaaS',
    subtitle: 'Controle geral da plataforma multi-igreja, assinaturas e saude operacional.',
    sectionTitle: 'Governanca SaaS',
    canManageUsers: true,
    financeTitle: 'Visao executiva da plataforma',
    financeDescription: 'Acompanhe crescimento de tenants, receita recorrente e saude da operacao em um unico painel.',
    financeActions: [
      {
        title: 'Visualizar indicadores globais',
        description: 'MRR, churn, conversao e distribuicao de planos por igreja.',
        mode: 'visualizacao',
      },
      {
        title: 'Visualizar auditoria de assinaturas',
        description: 'Acompanhar upgrades, downgrades e cancelamentos por tenant.',
        mode: 'visualizacao',
      },
      {
        title: 'Visualizar uso por tenant',
        description: 'Monitorar uso de modulos, relatorios e limites por igreja.',
        mode: 'visualizacao',
      },
    ],
    permissions: [
      'Acesso ao painel geral multi-igreja',
      'Visao consolidada de assinaturas e planos',
      'Acompanhamento de tenants e crescimento',
      'Governanca global da plataforma SaaS',
    ],
    summaryCards: [
      {
        label: 'Tenants ativos',
        value: '37',
        detail: 'Igrejas com assinatura ativa na plataforma',
        trend: '+4 novos tenants neste mes',
        icon: 'TEN',
        tone: 'text-emerald-300',
      },
      {
        label: 'MRR estimado',
        value: 'R$ 12.780',
        detail: 'Receita recorrente mensal consolidada',
        trend: '+9% vs mes anterior',
        icon: 'MRR',
        tone: 'text-cyan-300',
      },
      {
        label: 'Planos premium',
        value: '11',
        detail: 'Igrejas em plano premium',
        trend: 'Conversao premium em crescimento',
        icon: 'PRM',
        tone: 'text-amber-300',
      },
    ],
    quickLinks: [
      {
        title: 'Atualizar visao global',
        description: 'Sincronizar metricas consolidadas da plataforma.',
        icon: '01',
        to: '/dashboard',
      },
      {
        title: 'Gerenciar planos',
        description: 'Abrir pagina de assinaturas e planos.',
        icon: '02',
        to: '/assinaturas',
        search: { plano: 'premium' },
      },
      {
        title: 'Encerrar sessao',
        description: 'Sair do painel de controle geral.',
        icon: '03',
        to: '/sign-out',
      },
    ],
  },
  administrador: {
    title: 'Painel do Administrador',
    subtitle: 'Controle total de usuarios, configuracoes e visao executiva da igreja.',
    sectionTitle: 'Governanca e controle geral',
    canManageUsers: true,
    financeTitle: 'Operacao financeira e governanca',
    financeDescription: 'Como administrador do SaaS da igreja, voce libera, acompanha e audita todas as rotinas financeiras.',
    financeActions: [
      {
        title: 'Cadastrar dizimos',
        description: 'Controle entradas, recorrencias e origem das contribuicoes.',
        mode: 'cadastro',
      },
      {
        title: 'Cadastrar ofertas',
        description: 'Registre ofertas por campanha, culto ou contribuinte.',
        mode: 'cadastro',
      },
      {
        title: 'Cadastrar despesas',
        description: 'Lance despesas, acompanhe aprovacoes e fluxo de caixa.',
        mode: 'cadastro',
      },
      {
        title: 'Visualizar relatorios consolidados',
        description: 'Acompanhe consolidado geral para tomada de decisao.',
        mode: 'visualizacao',
      },
    ],
    permissions: [
      'Gerenciar usuarios e papeis',
      'Adicionar membros e equipes ministeriais',
      'Visualizar receitas, despesas e saldo',
      'Acessar relatorios completos',
      'Administrar configuracoes do sistema',
    ],
    summaryCards: [
      {
        label: 'Receitas no mes',
        value: 'R$ 64.420',
        detail: 'Dizimos e ofertas consolidados',
        trend: '+12% vs mes anterior',
        icon: 'ADM',
        tone: 'text-emerald-300',
      },
      {
        label: 'Despesas no mes',
        value: 'R$ 19.450',
        detail: 'Pagamentos e custos operacionais',
        trend: '+3% vs mes anterior',
        icon: 'FIN',
        tone: 'text-rose-300',
      },
      {
        label: 'Usuarios ativos',
        value: '18',
        detail: 'Equipe com acesso ao sistema',
        trend: '3 novos acessos nesta semana',
        icon: 'USR',
        tone: 'text-amber-300',
      },
    ],
    quickLinks: [
      {
        title: 'Atualizar painel',
        description: 'Recarregar resumo de indicadores.',
        icon: '01',
        to: '/dashboard',
      },
      {
        title: 'Area protegida',
        description: 'Validar politicas internas de acesso.',
        icon: '02',
        to: '/example-protected-route',
      },
      {
        title: 'Encerrar sessao',
        description: 'Finalizar login com seguranca.',
        icon: '03',
        to: '/sign-out',
      },
    ],
  },
  tesoureiro: {
    title: 'Painel do Tesoureiro',
    subtitle: 'Foco em entradas, despesas, saldos e prestacao de contas.',
    sectionTitle: 'Operacao financeira',
    canManageUsers: false,
    financeTitle: 'Cadastro financeiro completo',
    financeDescription: 'Seu painel e voltado para cadastro de tudo que e financeiro: entradas, saidas e conciliacao.',
    financeActions: [
      {
        title: 'Cadastrar dizimos',
        description: 'Registro diario com rastreio por periodo e forma de pagamento.',
        mode: 'cadastro',
      },
      {
        title: 'Cadastrar ofertas',
        description: 'Classificacao por campanha, tipo e contribuinte.',
        mode: 'cadastro',
      },
      {
        title: 'Cadastrar despesas',
        description: 'Controle de categorias, vencimentos e aprovacao.',
        mode: 'cadastro',
      },
      {
        title: 'Exportar relatorios financeiros',
        description: 'Prestacao de contas para lideranca e conselho.',
        mode: 'cadastro',
      },
    ],
    permissions: [
      'Registrar dizimos e ofertas',
      'Lancar e acompanhar despesas',
      'Visualizar saldo e fluxo de caixa',
      'Exportar relatorios financeiros do periodo',
    ],
    summaryCards: [
      {
        label: 'Entradas no dia',
        value: 'R$ 3.280',
        detail: 'Culto e contribuicoes online',
        trend: '+8% vs ultimo culto',
        icon: 'ENT',
        tone: 'text-emerald-300',
      },
      {
        label: 'Despesas previstas',
        value: 'R$ 7.900',
        detail: 'Compromissos da semana',
        trend: '2 despesas aguardando aprovacao',
        icon: 'DSP',
        tone: 'text-rose-300',
      },
      {
        label: 'Saldo disponivel',
        value: 'R$ 44.970',
        detail: 'Disponivel para planejamento mensal',
        trend: 'Estavel nas ultimas 4 semanas',
        icon: 'SLD',
        tone: 'text-amber-300',
      },
    ],
    quickLinks: [
      {
        title: 'Atualizar resumo',
        description: 'Sincronizar transacoes recentes.',
        icon: '01',
        to: '/dashboard',
      },
      {
        title: 'Comparar planos',
        description: 'Ver recursos adicionais de assinatura.',
        icon: '02',
        to: '/assinaturas',
        search: { plano: 'padrao' },
      },
      {
        title: 'Encerrar sessao',
        description: 'Sair do painel atual.',
        icon: '03',
        to: '/sign-out',
      },
    ],
  },
  pastor: {
    title: 'Painel do Pastor',
    subtitle: 'Visao ministerial com foco em transparencia e acompanhamento da igreja.',
    sectionTitle: 'Acompanhamento ministerial',
    canManageUsers: false,
    financeTitle: 'Painel de visualizacao ministerial',
    financeDescription: 'Perfil de leitura para acompanhar saude financeira sem alterar dados do sistema.',
    financeActions: [
      {
        title: 'Visualizar receitas e despesas',
        description: 'Acesso somente leitura aos indicadores consolidados.',
        mode: 'visualizacao',
      },
      {
        title: 'Visualizar campanhas e metas',
        description: 'Acompanhamento pastoral do engajamento financeiro.',
        mode: 'visualizacao',
      },
      {
        title: 'Visualizar relatorios de contribuicao',
        description: 'Consulta de prestacoes sem permissao de edicao.',
        mode: 'visualizacao',
      },
    ],
    permissions: [
      'Visualizar indicadores consolidados (somente leitura)',
      'Acompanhar campanhas e metas (somente leitura)',
      'Consultar relatorios de contribuicao (somente leitura)',
      'Sem permissao para criar/excluir usuarios',
      'Sem permissao para cadastrar movimentacoes financeiras',
    ],
    summaryCards: [
      {
        label: 'Campanhas ativas',
        value: '4',
        detail: 'Metas em andamento na comunidade',
        trend: '2 acima de 70% da meta',
        icon: 'CMP',
        tone: 'text-emerald-300',
      },
      {
        label: 'Contribuidores no mes',
        value: '146',
        detail: 'Membros com participacao financeira',
        trend: '+11% vs mes anterior',
        icon: 'MBR',
        tone: 'text-cyan-300',
      },
      {
        label: 'Relatorios enviados',
        value: '12',
        detail: 'Prestacoes para lideranca',
        trend: '100% dentro do prazo',
        icon: 'RPT',
        tone: 'text-amber-300',
      },
    ],
    quickLinks: [
      {
        title: 'Atualizar visao',
        description: 'Revisar indicadores atuais.',
        icon: '01',
        to: '/dashboard',
      },
      {
        title: 'Comparar planos',
        description: 'Ver recursos para consolidacao.',
        icon: '02',
        to: '/assinaturas',
        search: { plano: 'premium' },
      },
      {
        title: 'Encerrar sessao',
        description: 'Sair do painel atual.',
        icon: '03',
        to: '/sign-out',
      },
    ],
  },
  membro: {
    title: 'Painel do Membro',
    subtitle: 'Acesso limitado para consulta basica.',
    sectionTitle: 'Acesso restrito',
    canManageUsers: false,
    financeTitle: 'Acesso financeiro restrito',
    financeDescription: 'Perfil sem acesso operacional para cadastro ou gestao financeira.',
    financeActions: [
      {
        title: 'Consulta basica liberada',
        description: 'Visualizacao minima de dados permitidos pelo administrador.',
        mode: 'visualizacao',
      },
    ],
    permissions: [
      'Visualizar apenas informacoes permitidas',
      'Sem acesso a gestao de usuarios',
      'Sem acesso a relatorios administrativos',
    ],
    summaryCards: [
      {
        label: 'Status de acesso',
        value: 'Limitado',
        detail: 'Aguardando atribuicao de papel pela administracao',
        trend: 'Contate um administrador da igreja',
        icon: 'INF',
        tone: 'text-amber-300',
      },
    ],
    quickLinks: [
      {
        title: 'Comparar planos',
        description: 'Ver recursos por assinatura.',
        icon: '01',
        to: '/assinaturas',
        search: { plano: 'inicial' },
      },
      {
        title: 'Encerrar sessao',
        description: 'Sair com seguranca.',
        icon: '02',
        to: '/sign-out',
      },
    ],
  },
}

const dashboardNavLinksByRole: Record<RoleKey, Array<{ label: string; href: string }>> = {
  dono_saas: [
    { label: 'Resumo', href: '#resumo' },
    { label: 'Permissoes', href: '#permissoes' },
    { label: 'Visao', href: '#financeiro' },
    { label: 'SaaS', href: '#saas' },
    { label: 'Acoes', href: '#acoes' },
  ],
  administrador: [
    { label: 'Resumo', href: '#resumo' },
    { label: 'Permissoes', href: '#permissoes' },
    { label: 'Financeiro', href: '#financeiro' },
    { label: 'Acoes', href: '#acoes' },
    { label: 'Usuarios', href: '#usuarios' },
  ],
  tesoureiro: [
    { label: 'Resumo', href: '#resumo' },
    { label: 'Financeiro', href: '#financeiro' },
    { label: 'Cadastros', href: '#cadastros' },
    { label: 'Permissoes', href: '#permissoes' },
    { label: 'Acoes', href: '#acoes' },
  ],
  pastor: [
    { label: 'Resumo', href: '#resumo' },
    { label: 'Visao', href: '#financeiro' },
    { label: 'Permissoes', href: '#permissoes' },
    { label: 'Acoes', href: '#acoes' },
  ],
  membro: [
    { label: 'Resumo', href: '#resumo' },
    { label: 'Acesso', href: '#permissoes' },
    { label: 'Acoes', href: '#acoes' },
  ],
}

const sectionPanelStyle: CSSProperties = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: 16,
  padding: '2.2rem',
}

const contentCardStyle: CSSProperties = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: 14,
  padding: '1.1rem',
  transition: 'border-color 0.3s, transform 0.3s, background 0.3s',
}

type RoleConfigData = (typeof roleConfigs)[RoleKey]

function SummaryCardsSection({ title, description, roleConfig }: { title: string; description: string; roleConfig: RoleConfigData }) {
  return (
    <section id="resumo" className="mt-14" style={sectionPanelStyle}>
      <div className="mb-7">
        <h2 className="text-[clamp(1.8rem,3.8vw,2.8rem)] font-semibold text-white" style={{ fontFamily: '"Playfair Display", serif' }}>
          {title}
        </h2>
        <p className="mt-1 text-base text-white/55">{description}</p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {roleConfig.summaryCards.map((card) => (
          <article
            key={card.label}
            style={{ ...contentCardStyle, cursor: 'default' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(201,168,76,0.4)'
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.background = 'rgba(201,168,76,0.04)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
              e.currentTarget.style.transform = 'none'
              e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
            }}
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/45">{card.label}</p>
              <span className="rounded-full border border-white/15 px-2 py-1 text-[10px] text-white/70">{card.icon}</span>
            </div>
            <p className={`text-3xl font-semibold ${card.tone}`}>{card.value}</p>
            <p className="mt-2 text-sm text-white/70">{card.detail}</p>
            <p className="mt-4 border-t border-white/10 pt-3 text-xs text-white/50">{card.trend}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function PlanFeaturesSection({ activePlan }: { activePlan: PlanoAtivo }) {
  const features = planFeatureCatalog[activePlan]

  return (
    <section id="plano" className="mt-14" style={sectionPanelStyle}>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-white sm:text-3xl" style={{ fontFamily: '"Playfair Display", serif' }}>
          Recursos liberados no plano {activePlan}
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-white/60">{features.descricao}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div
          style={{
            ...contentCardStyle,
            background: 'rgba(16,185,129,0.08)',
            border: '1px solid rgba(110,231,183,0.25)',
          }}
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-200">Liberado</p>
          <div className="space-y-2">
            {features.recursosLiberados.map((feature) => (
              <p key={feature} className="text-sm text-emerald-100/90">
                + {feature}
              </p>
            ))}
          </div>
        </div>

        <div
          style={{
            ...contentCardStyle,
            background: 'rgba(245,158,11,0.08)',
            border: '1px solid rgba(251,191,36,0.3)',
          }}
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-amber-200">Requer upgrade</p>
          <div className="space-y-2">
            {features.recursosBloqueados.length === 0 && (
              <p className="text-sm text-amber-100/90">Plano completo sem bloqueios de recursos.</p>
            )}
            {features.recursosBloqueados.map((feature) => (
              <p key={feature} className="text-sm text-amber-100/90">
                - {feature}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function PermissionsSection({ role, roleConfig, badge }: { role: RoleKey; roleConfig: RoleConfigData; badge: string }) {
  return (
    <section id="permissoes" className="mt-14" style={sectionPanelStyle}>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-white sm:text-3xl" style={{ fontFamily: '"Playfair Display", serif' }}>
            Permissoes do acesso
          </h2>
          <p className="mt-1 text-sm text-white/55">Papel atual: {role}</p>
        </div>
        <span className="rounded-full border border-[#C9A84C]/35 bg-[#C9A84C]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#E8CC7A]">
          {badge}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {roleConfig.permissions.map((permission) => (
          <div
            key={permission}
            style={{
              ...contentCardStyle,
              background: 'rgba(8,14,35,0.45)',
              border: '1px solid rgba(255,255,255,0.1)',
              padding: '0.95rem 1rem',
            }}
            className="text-sm text-white/80"
          >
            <span className="mr-2 text-[#E8CC7A]">•</span>
            {permission}
          </div>
        ))}
      </div>
    </section>
  )
}

function FinanceSection({ roleConfig, activePlan }: { roleConfig: RoleConfigData; activePlan: PlanoAtivo }) {
  return (
    <section id="financeiro" className="mt-14" style={sectionPanelStyle}>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-white sm:text-3xl" style={{ fontFamily: '"Playfair Display", serif' }}>
          {roleConfig.financeTitle}
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-white/60">{roleConfig.financeDescription}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {roleConfig.financeActions.map((action) => {
          const isReadOnly = action.mode === 'visualizacao'
          const isUnlocked = isFinanceActionUnlocked(action.title, activePlan)
          const requiredPlan = getRequiredPlanForFinanceAction(action.title)
          const requiredPlanLabel = planoInfo[requiredPlan].nome

          return (
            <article
              key={action.title}
              style={{
                ...contentCardStyle,
                border: !isUnlocked
                  ? '1px solid rgba(251,191,36,0.28)'
                  : isReadOnly
                    ? '1px solid rgba(103,232,249,0.25)'
                    : '1px solid rgba(110,231,183,0.25)',
                background: !isUnlocked
                  ? 'rgba(245,158,11,0.07)'
                  : isReadOnly
                    ? 'rgba(6,182,212,0.06)'
                    : 'rgba(16,185,129,0.06)',
                padding: '1.1rem 1.25rem',
                opacity: isUnlocked ? 1 : 0.72,
              }}
            >
              <span className="inline-flex rounded-full border border-white/20 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.13em] text-white/70">
                {isReadOnly ? 'Somente visualizacao' : 'Cadastro financeiro'}
              </span>
              <p className="mt-3 text-base font-semibold text-white">{action.title}</p>
              <p className="mt-1 text-sm text-white/70">
                {isUnlocked
                  ? action.description
                  : `Disponivel a partir do ${requiredPlanLabel}.`}
              </p>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function TreasurerFinanceFormsSection({ activePlan }: { activePlan: PlanoAtivo }) {
  const createTithe = useServerFn(createTitheFn)
  const createOffering = useServerFn(createOfferingFn)
  const createExpense = useServerFn(createExpenseFn)
  const exportFinanceReport = useServerFn(exportFinanceReportFn)

  const [feedback, setFeedback] = useState<{ message: string; tone: 'success' | 'warning' } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState<'tithe' | 'offering' | 'expense' | 'report' | null>(null)
  const [reportSummary, setReportSummary] = useState<{
    totals: {
      tithes: number
      offerings: number
      expenses: number
      net: number
    }
    breakdown: Array<{ key: string; value: number }>
    generatedFormat: string
    requestedFormat: string
  } | null>(null)
  const expenseAndExportLocked = activePlan === 'inicial'

  function getFormTextValue(formData: FormData, key: string) {
    const value = formData.get(key)
    return typeof value === 'string' ? value.trim() : ''
  }

  function getFormNumberValue(formData: FormData, key: string) {
    const raw = getFormTextValue(formData, key)
    const parsed = Number(raw)
    return Number.isFinite(parsed) ? parsed : 0
  }

  function getErrorMessage(error: unknown, fallback: string) {
    if (typeof error === 'object' && error && 'message' in error) {
      const message = (error as { message?: unknown }).message
      if (typeof message === 'string' && message.trim()) {
        return message
      }
    }

    if (error instanceof Error && error.message) {
      return error.message
    }

    return fallback
  }

  async function handleTitheSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setReportSummary(null)
    setIsSubmitting('tithe')

    const formData = new FormData(event.currentTarget)

    try {
      await createTithe({
        data: {
          amount: getFormNumberValue(formData, 'amount'),
          titheDate: getFormTextValue(formData, 'titheDate'),
          paymentMethod: getFormTextValue(formData, 'paymentMethod'),
          referenceNumber: getFormTextValue(formData, 'referenceNumber') || undefined,
          notes: getFormTextValue(formData, 'notes') || undefined,
          periodReference: getFormTextValue(formData, 'periodReference') || undefined,
          contributorName: getFormTextValue(formData, 'contributorName') || undefined,
        },
      })

      setFeedback({ message: 'Dizimo registrado com sucesso no Appwrite.', tone: 'success' })
      event.currentTarget.reset()
    } catch (error) {
      setFeedback({ message: getErrorMessage(error, 'Nao foi possivel registrar o dizimo.'), tone: 'warning' })
    } finally {
      setIsSubmitting(null)
    }
  }

  async function handleOfferingSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setReportSummary(null)
    setIsSubmitting('offering')

    const formData = new FormData(event.currentTarget)

    try {
      await createOffering({
        data: {
          amount: getFormNumberValue(formData, 'amount'),
          offeringDate: getFormTextValue(formData, 'offeringDate'),
          offeringType: getFormTextValue(formData, 'offeringType'),
          campaign: getFormTextValue(formData, 'campaign') || undefined,
          paymentMethod: getFormTextValue(formData, 'paymentMethod'),
          contributorName: getFormTextValue(formData, 'contributorName') || undefined,
          notes: getFormTextValue(formData, 'notes') || undefined,
        },
      })

      setFeedback({ message: 'Oferta registrada com sucesso no Appwrite.', tone: 'success' })
      event.currentTarget.reset()
    } catch (error) {
      setFeedback({ message: getErrorMessage(error, 'Nao foi possivel registrar a oferta.'), tone: 'warning' })
    } finally {
      setIsSubmitting(null)
    }
  }

  async function handleExpenseSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setReportSummary(null)

    if (expenseAndExportLocked) {
      setFeedback({
        message: 'Cadastro de despesas requer Plano Padrao ou Premium para envio.',
        tone: 'warning',
      })
      return
    }

    setIsSubmitting('expense')

    const formData = new FormData(event.currentTarget)

    try {
      await createExpense({
        data: {
          description: getFormTextValue(formData, 'description'),
          amount: getFormNumberValue(formData, 'amount'),
          expenseDate: getFormTextValue(formData, 'expenseDate'),
          category: getFormTextValue(formData, 'category'),
          vendor: getFormTextValue(formData, 'vendor') || undefined,
          paymentMethod: getFormTextValue(formData, 'paymentMethod'),
          status: getFormTextValue(formData, 'status') as 'pending' | 'approved' | 'paid',
          notes: getFormTextValue(formData, 'notes') || undefined,
        },
      })

      setFeedback({ message: 'Despesa registrada com sucesso no Appwrite.', tone: 'success' })
      event.currentTarget.reset()
    } catch (error) {
      setFeedback({ message: getErrorMessage(error, 'Nao foi possivel registrar a despesa.'), tone: 'warning' })
    } finally {
      setIsSubmitting(null)
    }
  }

  async function handleReportSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (expenseAndExportLocked) {
      setFeedback({
        message: 'Exportacao de relatorios requer Plano Padrao ou Premium para envio.',
        tone: 'warning',
      })
      return
    }

    setIsSubmitting('report')
    const formData = new FormData(event.currentTarget)

    try {
      const result = await exportFinanceReport({
        data: {
          startDate: getFormTextValue(formData, 'startDate'),
          endDate: getFormTextValue(formData, 'endDate'),
          format: getFormTextValue(formData, 'format') as 'csv' | 'pdf' | 'xlsx',
          consolidation: getFormTextValue(formData, 'consolidation') as 'categoria' | 'forma' | 'campanha',
        },
      })

      setReportSummary(result.summary)

      if (typeof window !== 'undefined') {
        const blob = new Blob([result.file.content], { type: result.file.mimeType })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = result.file.name
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      }

      const formatMessage =
        result.summary.generatedFormat !== result.summary.requestedFormat
          ? ` Formato solicitado (${result.summary.requestedFormat.toUpperCase()}) entregue em ${result.summary.generatedFormat.toUpperCase()}.`
          : ''

      setFeedback({ message: `Relatorio gerado com sucesso.${formatMessage}`, tone: 'success' })
    } catch (error) {
      setFeedback({ message: getErrorMessage(error, 'Nao foi possivel gerar o relatorio.'), tone: 'warning' })
    } finally {
      setIsSubmitting(null)
    }
  }

  return (
    <section id="cadastros" className="mt-14" style={sectionPanelStyle}>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-white sm:text-3xl" style={{ fontFamily: '"Playfair Display", serif' }}>
          Formularios financeiros do tesoureiro
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-white/60">
          Preencha os lancamentos de dizimos, ofertas e despesas, alem da exportacao de relatorios para prestacao de contas.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <form
          onSubmit={handleTitheSubmit}
          style={{ ...contentCardStyle, background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(110,231,183,0.25)', padding: '1.25rem' }}
          className="space-y-3"
        >
          <p className="text-base font-semibold text-white">Cadastrar dizimos</p>
          <p className="text-sm text-white/65">Registro diario com rastreio por periodo e forma de pagamento.</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="text-sm text-white/80">
              Data do registro
              <input name="titheDate" required type="date" className="mt-1 w-full rounded-lg border border-white/15 bg-[#080E23]/70 px-3 py-2.5 text-sm text-white outline-none focus:border-[#C9A84C]/60" />
            </label>
            <label className="text-sm text-white/80">
              Periodo de referencia
              <input name="periodReference" required type="month" className="mt-1 w-full rounded-lg border border-white/15 bg-[#080E23]/70 px-3 py-2.5 text-sm text-white outline-none focus:border-[#C9A84C]/60" />
            </label>
            <label className="text-sm text-white/80 sm:col-span-2">
              Contribuinte
              <input name="contributorName" required type="text" placeholder="Nome do membro" className="mt-1 w-full rounded-lg border border-white/15 bg-[#080E23]/70 px-3 py-2.5 text-sm text-white placeholder:text-white/35 outline-none focus:border-[#C9A84C]/60" />
            </label>
            <label className="text-sm text-white/80">
              Valor
              <input name="amount" required type="number" min="0" step="0.01" placeholder="0,00" className="mt-1 w-full rounded-lg border border-white/15 bg-[#080E23]/70 px-3 py-2.5 text-sm text-white placeholder:text-white/35 outline-none focus:border-[#C9A84C]/60" />
            </label>
            <label className="text-sm text-white/80">
              Forma de pagamento
              <select name="paymentMethod" required className="mt-1 w-full rounded-lg border border-white/15 bg-[#080E23]/70 px-3 py-2.5 text-sm text-white outline-none focus:border-[#C9A84C]/60">
                <option value="">Selecione</option>
                <option value="dinheiro">Dinheiro</option>
                <option value="pix">Pix</option>
                <option value="transferencia">Transferencia</option>
                <option value="cartao">Cartao</option>
                <option value="deposito">Deposito</option>
              </select>
            </label>
            <label className="text-sm text-white/80">
              Numero de referencia
              <input name="referenceNumber" type="text" placeholder="Opcional" className="mt-1 w-full rounded-lg border border-white/15 bg-[#080E23]/70 px-3 py-2.5 text-sm text-white placeholder:text-white/35 outline-none focus:border-[#C9A84C]/60" />
            </label>
            <label className="text-sm text-white/80 sm:col-span-2">
              Observacoes
              <textarea name="notes" rows={2} placeholder="Opcional" className="mt-1 w-full rounded-lg border border-white/15 bg-[#080E23]/70 px-3 py-2.5 text-sm text-white placeholder:text-white/35 outline-none focus:border-[#C9A84C]/60" />
            </label>
          </div>
          <button
            type="submit"
            disabled={isSubmitting === 'tithe'}
            className="inline-flex items-center rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-[#0F1729] transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting === 'tithe' ? 'Salvando...' : 'Salvar dizimo'}
          </button>
        </form>

        <form
          onSubmit={handleOfferingSubmit}
          style={{ ...contentCardStyle, background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(103,232,249,0.25)', padding: '1.25rem' }}
          className="space-y-3"
        >
          <p className="text-base font-semibold text-white">Cadastrar ofertas</p>
          <p className="text-sm text-white/65">Classificacao por campanha, tipo e contribuinte.</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="text-sm text-white/80">
              Data da oferta
              <input name="offeringDate" required type="date" className="mt-1 w-full rounded-lg border border-white/15 bg-[#080E23]/70 px-3 py-2.5 text-sm text-white outline-none focus:border-[#C9A84C]/60" />
            </label>
            <label className="text-sm text-white/80">
              Tipo da oferta
              <select name="offeringType" required className="mt-1 w-full rounded-lg border border-white/15 bg-[#080E23]/70 px-3 py-2.5 text-sm text-white outline-none focus:border-[#C9A84C]/60">
                <option value="">Selecione</option>
                <option value="geral">Geral</option>
                <option value="missoes">Missoes</option>
                <option value="construcao">Construcao</option>
                <option value="acao-social">Acao social</option>
                <option value="especial">Especial</option>
              </select>
            </label>
            <label className="text-sm text-white/80 sm:col-span-2">
              Campanha ou culto
              <input name="campaign" required type="text" placeholder="Ex: Culto de domingo" className="mt-1 w-full rounded-lg border border-white/15 bg-[#080E23]/70 px-3 py-2.5 text-sm text-white placeholder:text-white/35 outline-none focus:border-[#C9A84C]/60" />
            </label>
            <label className="text-sm text-white/80">
              Contribuinte
              <input name="contributorName" type="text" placeholder="Opcional" className="mt-1 w-full rounded-lg border border-white/15 bg-[#080E23]/70 px-3 py-2.5 text-sm text-white placeholder:text-white/35 outline-none focus:border-[#C9A84C]/60" />
            </label>
            <label className="text-sm text-white/80">
              Valor
              <input name="amount" required type="number" min="0" step="0.01" placeholder="0,00" className="mt-1 w-full rounded-lg border border-white/15 bg-[#080E23]/70 px-3 py-2.5 text-sm text-white placeholder:text-white/35 outline-none focus:border-[#C9A84C]/60" />
            </label>
            <label className="text-sm text-white/80">
              Forma de pagamento
              <select name="paymentMethod" required className="mt-1 w-full rounded-lg border border-white/15 bg-[#080E23]/70 px-3 py-2.5 text-sm text-white outline-none focus:border-[#C9A84C]/60">
                <option value="">Selecione</option>
                <option value="dinheiro">Dinheiro</option>
                <option value="pix">Pix</option>
                <option value="transferencia">Transferencia</option>
                <option value="cartao">Cartao</option>
                <option value="deposito">Deposito</option>
              </select>
            </label>
            <label className="text-sm text-white/80 sm:col-span-2">
              Observacoes
              <textarea name="notes" rows={2} placeholder="Opcional" className="mt-1 w-full rounded-lg border border-white/15 bg-[#080E23]/70 px-3 py-2.5 text-sm text-white placeholder:text-white/35 outline-none focus:border-[#C9A84C]/60" />
            </label>
          </div>
          <button
            type="submit"
            disabled={isSubmitting === 'offering'}
            className="inline-flex items-center rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-[#0F1729] transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting === 'offering' ? 'Salvando...' : 'Salvar oferta'}
          </button>
        </form>

        <form
          onSubmit={handleExpenseSubmit}
          style={{
            ...contentCardStyle,
            background: expenseAndExportLocked ? 'rgba(245,158,11,0.08)' : 'rgba(239,68,68,0.08)',
            border: expenseAndExportLocked ? '1px solid rgba(251,191,36,0.3)' : '1px solid rgba(251,113,133,0.28)',
            padding: '1.25rem',
            opacity: expenseAndExportLocked ? 0.8 : 1,
          }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-base font-semibold text-white">Cadastrar despesas</p>
            {expenseAndExportLocked && (
              <span className="rounded-full border border-amber-300/40 bg-amber-300/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-amber-200">
                Requer Plano Padrao
              </span>
            )}
          </div>
          <p className="text-sm text-white/65">Controle de categorias, vencimentos e aprovacao.</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="text-sm text-white/80">
              Vencimento
              <input name="expenseDate" disabled={expenseAndExportLocked} required type="date" className="mt-1 w-full rounded-lg border border-white/15 bg-[#080E23]/70 px-3 py-2.5 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-60" />
            </label>
            <label className="text-sm text-white/80">
              Categoria
              <select name="category" disabled={expenseAndExportLocked} required className="mt-1 w-full rounded-lg border border-white/15 bg-[#080E23]/70 px-3 py-2.5 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-60">
                <option value="">Selecione</option>
                <option value="infraestrutura">Infraestrutura</option>
                <option value="ministerio">Ministerio</option>
                <option value="manutencao">Manutencao</option>
                <option value="administrativo">Administrativo</option>
                <option value="outros">Outros</option>
              </select>
            </label>
            <label className="text-sm text-white/80 sm:col-span-2">
              Descricao
              <input name="description" disabled={expenseAndExportLocked} required type="text" placeholder="Ex: Conta de energia da sede" className="mt-1 w-full rounded-lg border border-white/15 bg-[#080E23]/70 px-3 py-2.5 text-sm text-white placeholder:text-white/35 outline-none disabled:cursor-not-allowed disabled:opacity-60" />
            </label>
            <label className="text-sm text-white/80 sm:col-span-2">
              Fornecedor
              <input name="vendor" disabled={expenseAndExportLocked} required type="text" placeholder="Nome do fornecedor" className="mt-1 w-full rounded-lg border border-white/15 bg-[#080E23]/70 px-3 py-2.5 text-sm text-white placeholder:text-white/35 outline-none disabled:cursor-not-allowed disabled:opacity-60" />
            </label>
            <label className="text-sm text-white/80">
              Valor
              <input name="amount" disabled={expenseAndExportLocked} required type="number" min="0" step="0.01" placeholder="0,00" className="mt-1 w-full rounded-lg border border-white/15 bg-[#080E23]/70 px-3 py-2.5 text-sm text-white placeholder:text-white/35 outline-none disabled:cursor-not-allowed disabled:opacity-60" />
            </label>
            <label className="text-sm text-white/80">
              Forma de pagamento
              <select name="paymentMethod" disabled={expenseAndExportLocked} required className="mt-1 w-full rounded-lg border border-white/15 bg-[#080E23]/70 px-3 py-2.5 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-60">
                <option value="">Selecione</option>
                <option value="pix">Pix</option>
                <option value="transferencia">Transferencia</option>
                <option value="cartao">Cartao</option>
                <option value="boleto">Boleto</option>
                <option value="dinheiro">Dinheiro</option>
              </select>
            </label>
            <label className="text-sm text-white/80">
              Aprovacao
              <select name="status" disabled={expenseAndExportLocked} required className="mt-1 w-full rounded-lg border border-white/15 bg-[#080E23]/70 px-3 py-2.5 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-60">
                <option value="">Selecione</option>
                <option value="pending">Pendente</option>
                <option value="approved">Aprovada</option>
                <option value="paid">Paga</option>
              </select>
            </label>
            <label className="text-sm text-white/80 sm:col-span-2">
              Observacoes
              <textarea name="notes" disabled={expenseAndExportLocked} rows={2} placeholder="Opcional" className="mt-1 w-full rounded-lg border border-white/15 bg-[#080E23]/70 px-3 py-2.5 text-sm text-white placeholder:text-white/35 outline-none disabled:cursor-not-allowed disabled:opacity-60" />
            </label>
          </div>
          <button
            type="submit"
            disabled={expenseAndExportLocked || isSubmitting === 'expense'}
            className="inline-flex items-center rounded-lg bg-rose-400 px-4 py-2 text-sm font-semibold text-[#0F1729] transition hover:bg-rose-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting === 'expense' ? 'Salvando...' : 'Salvar despesa'}
          </button>
        </form>

        <form
          onSubmit={handleReportSubmit}
          style={{
            ...contentCardStyle,
            background: expenseAndExportLocked ? 'rgba(245,158,11,0.08)' : 'rgba(14,165,233,0.08)',
            border: expenseAndExportLocked ? '1px solid rgba(251,191,36,0.3)' : '1px solid rgba(125,211,252,0.28)',
            padding: '1.25rem',
            opacity: expenseAndExportLocked ? 0.8 : 1,
          }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-base font-semibold text-white">Exportar relatorios financeiros</p>
            {expenseAndExportLocked && (
              <span className="rounded-full border border-amber-300/40 bg-amber-300/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-amber-200">
                Requer Plano Padrao
              </span>
            )}
          </div>
          <p className="text-sm text-white/65">Prestacao de contas para lideranca e conselho.</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="text-sm text-white/80">
              Inicio do periodo
              <input name="startDate" disabled={expenseAndExportLocked} required type="date" className="mt-1 w-full rounded-lg border border-white/15 bg-[#080E23]/70 px-3 py-2.5 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-60" />
            </label>
            <label className="text-sm text-white/80">
              Fim do periodo
              <input name="endDate" disabled={expenseAndExportLocked} required type="date" className="mt-1 w-full rounded-lg border border-white/15 bg-[#080E23]/70 px-3 py-2.5 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-60" />
            </label>
            <label className="text-sm text-white/80">
              Formato
              <select name="format" disabled={expenseAndExportLocked} required className="mt-1 w-full rounded-lg border border-white/15 bg-[#080E23]/70 px-3 py-2.5 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-60">
                <option value="">Selecione</option>
                <option value="csv">CSV</option>
                <option value="pdf">PDF</option>
                <option value="xlsx">Excel (XLSX)</option>
              </select>
            </label>
            <label className="text-sm text-white/80">
              Consolidacao
              <select name="consolidation" disabled={expenseAndExportLocked} required className="mt-1 w-full rounded-lg border border-white/15 bg-[#080E23]/70 px-3 py-2.5 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-60">
                <option value="">Selecione</option>
                <option value="categoria">Por categoria</option>
                <option value="forma">Por forma de pagamento</option>
                <option value="campanha">Por campanha</option>
              </select>
            </label>
          </div>
          <button
            type="submit"
            disabled={expenseAndExportLocked || isSubmitting === 'report'}
            className="inline-flex items-center rounded-lg bg-sky-300 px-4 py-2 text-sm font-semibold text-[#0F1729] transition hover:bg-sky-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting === 'report' ? 'Gerando...' : 'Gerar relatorio'}
          </button>
        </form>
      </div>

      {feedback && (
        <p
          className={`mt-5 rounded-lg border px-4 py-3 text-sm ${
            feedback.tone === 'success'
              ? 'border-emerald-300/35 bg-emerald-300/10 text-emerald-100'
              : 'border-amber-300/35 bg-amber-300/10 text-amber-100'
          }`}
        >
          {feedback.message}
        </p>
      )}

      {reportSummary && (
        <div
          className="mt-5 rounded-lg border border-sky-300/25 bg-sky-300/10 px-4 py-4 text-sm text-sky-100"
        >
          <p className="font-semibold">Resumo do relatorio</p>
          <p className="mt-2">Dizimos: R$ {reportSummary.totals.tithes.toFixed(2)}</p>
          <p>Ofertas: R$ {reportSummary.totals.offerings.toFixed(2)}</p>
          <p>Despesas: R$ {reportSummary.totals.expenses.toFixed(2)}</p>
          <p className="mt-1 font-semibold">Saldo liquido: R$ {reportSummary.totals.net.toFixed(2)}</p>
          <p className="mt-2 text-sky-100/85">
            Formato solicitado: {reportSummary.requestedFormat.toUpperCase()} | Entregue: {reportSummary.generatedFormat.toUpperCase()}
          </p>
          {reportSummary.breakdown.length > 0 && (
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {reportSummary.breakdown.slice(0, 6).map((item) => (
                <p key={item.key} className="rounded-md border border-white/15 bg-white/5 px-3 py-2">
                  {item.key}: R$ {item.value.toFixed(2)}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  )
}

function QuickLinksSection({ roleConfig, activePlan }: { roleConfig: RoleConfigData; activePlan: PlanoAtivo }) {
  return (
    <section id="acoes" className="mt-14" style={sectionPanelStyle}>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-white sm:text-3xl" style={{ fontFamily: '"Playfair Display", serif' }}>
          Acoes rapidas
        </h2>
        <p className="mt-1 text-sm text-white/55">Atalhos para o fluxo principal da sua equipe</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {roleConfig.quickLinks.map((item) => {
          const unlocked = isQuickLinkUnlocked(item, activePlan)

          if (!unlocked) {
            return (
              <div
                key={item.title}
                style={{
                  ...contentCardStyle,
                  background: 'rgba(245,158,11,0.08)',
                  border: '1px solid rgba(251,191,36,0.3)',
                  padding: '1.1rem 1.25rem',
                  opacity: 0.76,
                }}
              >
                <span className="inline-flex rounded-full border border-white/15 px-2 py-1 text-[10px] font-semibold text-white/70">
                  {item.icon}
                </span>
                <p className="mt-3 text-base font-semibold text-white">{item.title}</p>
                <p className="mt-1 text-sm text-white/70">Disponivel a partir do Plano Padrao.</p>
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-[#E8CC7A]">Recurso bloqueado</p>
              </div>
            )
          }

          return (
            <Link
              key={item.title}
              to={item.to}
              search={item.search}
              style={{
                ...contentCardStyle,
                background: 'rgba(8,14,35,0.45)',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '1.1rem 1.25rem',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(201,168,76,0.4)'
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.background = 'rgba(201,168,76,0.04)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                e.currentTarget.style.transform = 'none'
                e.currentTarget.style.background = 'rgba(8,14,35,0.45)'
              }}
              className="group"
            >
              <span className="inline-flex rounded-full border border-white/15 px-2 py-1 text-[10px] font-semibold text-white/70">
                {item.icon}
              </span>
              <p className="mt-3 text-base font-semibold text-white group-hover:text-[#E8CC7A]">{item.title}</p>
              <p className="mt-1 text-sm text-white/65">{item.description}</p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-[#E8CC7A]">Abrir {'->'}</p>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

function SaasGovernanceSection() {
  return (
    <section id="saas" className="mt-14" style={sectionPanelStyle}>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-white sm:text-3xl" style={{ fontFamily: '"Playfair Display", serif' }}>
          Controle geral do SaaS
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-white/60">
          Visao consolidada para governanca da plataforma, saude de tenants e distribuicao de planos por igreja.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <article style={{ ...contentCardStyle, background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(110,231,183,0.25)' }}>
          <p className="text-xs font-semibold uppercase tracking-[0.13em] text-emerald-200">Tenants</p>
          <p className="mt-2 text-lg font-semibold text-white">Saude por igreja</p>
          <p className="mt-2 text-sm text-white/70">Monitoramento de uso, acessos e erros por tenant.</p>
        </article>

        <article style={{ ...contentCardStyle, background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(103,232,249,0.25)' }}>
          <p className="text-xs font-semibold uppercase tracking-[0.13em] text-cyan-200">Assinaturas</p>
          <p className="mt-2 text-lg font-semibold text-white">Ciclo de receita</p>
          <p className="mt-2 text-sm text-white/70">Acompanhar upgrades, renovacoes e cancelamentos por plano.</p>
        </article>

        <article style={{ ...contentCardStyle, background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(251,191,36,0.3)' }}>
          <p className="text-xs font-semibold uppercase tracking-[0.13em] text-amber-200">Governanca</p>
          <p className="mt-2 text-lg font-semibold text-white">Operacao global</p>
          <p className="mt-2 text-sm text-white/70">Decisoes de produto, suporte e estrategia de crescimento.</p>
        </article>
      </div>
    </section>
  )
}

function SaasOwnerDashboardBody({
  role,
  roleConfig,
  activePlan,
}: {
  role: RoleKey
  roleConfig: RoleConfigData
  activePlan: PlanoAtivo
}) {
  return (
    <>
      <SummaryCardsSection
        title="Resumo executivo da plataforma"
        description="Metricas globais para acompanhamento do crescimento do SaaS"
        roleConfig={roleConfig}
      />
      <PermissionsSection role={role} roleConfig={roleConfig} badge="Controle global" />
      <FinanceSection roleConfig={roleConfig} activePlan={activePlan} />
      <SaasGovernanceSection />
      <QuickLinksSection roleConfig={roleConfig} activePlan={activePlan} />
    </>
  )
}

function AdministratorDashboardBody({
  role,
  roleConfig,
  activePlan,
}: {
  role: RoleKey
  roleConfig: RoleConfigData
  activePlan: PlanoAtivo
}) {
  return (
    <>
      <SummaryCardsSection
        title="Resumo administrativo"
        description="Visao executiva para controle financeiro e governanca da equipe"
        roleConfig={roleConfig}
      />
      <PermissionsSection role={role} roleConfig={roleConfig} badge="Controle por perfil" />
      <FinanceSection roleConfig={roleConfig} activePlan={activePlan} />
      <QuickLinksSection roleConfig={roleConfig} activePlan={activePlan} />
      <PlanFeaturesSection activePlan={activePlan} />

      <section id="usuarios" className="mt-14" style={sectionPanelStyle}>
        <div className="mb-7">
          <h2 className="text-2xl font-semibold text-white sm:text-3xl" style={{ fontFamily: '"Playfair Display", serif' }}>
            Usuarios e permissoes
          </h2>
          <p className="mt-1 text-sm text-white/55">Somente administradores podem gerenciar usuarios e adicionar membros.</p>
        </div>
        <GerenciarUsuarios />
      </section>
    </>
  )
}

function TreasurerDashboardBody({
  role,
  roleConfig,
  activePlan,
}: {
  role: RoleKey
  roleConfig: RoleConfigData
  activePlan: PlanoAtivo
}) {
  return (
    <>
      <SummaryCardsSection
        title="Painel financeiro do tesoureiro"
        description="Acompanhamento diario de entradas, saidas e saldo operacional"
        roleConfig={roleConfig}
      />
      <FinanceSection roleConfig={roleConfig} activePlan={activePlan} />
      <TreasurerFinanceFormsSection activePlan={activePlan} />
      <PermissionsSection role={role} roleConfig={roleConfig} badge="Fluxo de operacao" />
      <QuickLinksSection roleConfig={roleConfig} activePlan={activePlan} />
      <PlanFeaturesSection activePlan={activePlan} />
    </>
  )
}

function PastorDashboardBody({
  role,
  roleConfig,
  activePlan,
}: {
  role: RoleKey
  roleConfig: RoleConfigData
  activePlan: PlanoAtivo
}) {
  return (
    <>
      <SummaryCardsSection
        title="Painel ministerial do pastor"
        description="Visao consolidada de contribuicoes e campanhas em modo somente leitura"
        roleConfig={roleConfig}
      />
      <FinanceSection roleConfig={roleConfig} activePlan={activePlan} />
      <PermissionsSection role={role} roleConfig={roleConfig} badge="Modo leitura" />
      <QuickLinksSection roleConfig={roleConfig} activePlan={activePlan} />
      <PlanFeaturesSection activePlan={activePlan} />
    </>
  )
}

function MemberDashboardBody({
  role,
  roleConfig,
  activePlan,
}: {
  role: RoleKey
  roleConfig: RoleConfigData
  activePlan: PlanoAtivo
}) {
  return (
    <>
      <SummaryCardsSection
        title="Resumo de acesso do membro"
        description="Visao basica liberada pelo administrador do workspace"
        roleConfig={roleConfig}
      />
      <PermissionsSection role={role} roleConfig={roleConfig} badge="Acesso restrito" />
      <FinanceSection roleConfig={roleConfig} activePlan={activePlan} />
      <QuickLinksSection roleConfig={roleConfig} activePlan={activePlan} />
      <PlanFeaturesSection activePlan={activePlan} />
    </>
  )
}

function parseRoleCandidate(value?: unknown): RoleKey | null {
  if (typeof value !== 'string') {
    return null
  }

  const normalized = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()

  if (normalized === 'dono_saas' || normalized === 'dono' || normalized === 'owner') {
    return 'dono_saas'
  }

  if (normalized === 'administrador' || normalized === 'admin') {
    return 'administrador'
  }

  if (normalized === 'tesoureiro' || normalized === 'tesouraria') {
    return 'tesoureiro'
  }

  if (normalized === 'pastor') {
    return 'pastor'
  }

  if (normalized === 'membro' || normalized === 'member') {
    return 'membro'
  }

  return null
}

function inferRoleFromEmail(value?: unknown): RoleKey | null {
  if (typeof value !== 'string') {
    return null
  }

  const normalized = value.trim().toLowerCase()

  if (
    isSaasOwnerEmail(normalized) ||
    normalized.startsWith('dono@') ||
    normalized.startsWith('owner@')
  ) {
    return 'dono_saas'
  }

  if (normalized.startsWith('admin@') || normalized.startsWith('admin.')) {
    return 'administrador'
  }

  if (
    normalized.startsWith('tesoureiro@') ||
    normalized.startsWith('tesoureiro.') ||
    normalized.startsWith('tesouraria@') ||
    normalized.startsWith('tesouraria.') ||
    normalized.startsWith('financeiro@') ||
    normalized.startsWith('financeiro.')
  ) {
    return 'tesoureiro'
  }

  if (normalized.startsWith('pastor@') || normalized.startsWith('pastor.')) {
    return 'pastor'
  }

  if (normalized.startsWith('membro@') || normalized.startsWith('member@')) {
    return 'membro'
  }

  return null
}

function resolveRole(currentUser?: unknown): RoleKey {
  const user = (currentUser as Record<string, unknown> | undefined) ?? {}
  const prefs = (user.prefs as Record<string, unknown> | undefined) ?? {}
  if (isSaasOwnerEmail(user.email)) {
    return 'dono_saas'
  }

  const seedProfile = getSeedProfileByEmail(user.email)

  if (seedProfile) {
    return seedProfile.role
  }

  const inferredByEmail = inferRoleFromEmail(user.email)

  const directCandidates = [prefs.role, prefs.userRole, prefs.perfil, user.role]

  for (const candidate of directCandidates) {
    const parsed = parseRoleCandidate(candidate)
    if (parsed) {
      if (parsed === 'membro' && inferredByEmail && inferredByEmail !== 'membro') {
        return inferredByEmail
      }
      return parsed
    }
  }

  const labels = user.labels
  if (Array.isArray(labels)) {
    for (const label of labels) {
      const parsed = parseRoleCandidate(label)
      if (parsed) {
        if (parsed === 'membro' && inferredByEmail && inferredByEmail !== 'membro') {
          return inferredByEmail
        }
        return parsed
      }
    }
  }

  if (inferredByEmail) {
    return inferredByEmail
  }

  return 'membro'
}

export function Dashboard({ plano }: { plano?: PlanoInput }) {
  const { currentUser } = useAuth()
  const role = resolveRole(currentUser)
  const roleConfig = roleConfigs[role]
  const planoAtivo = resolvePlanoAtivo(plano, currentUser?.prefs, role, currentUser?.email)
  const isReadOnlyRole = role === 'pastor' || role === 'membro'
  const seedProfile = getSeedProfileByEmail(currentUser?.email)
  const tenantName =
    seedProfile?.churchName ??
    (typeof (currentUser?.prefs as Record<string, unknown> | undefined)?.churchName === 'string'
      ? String((currentUser?.prefs as Record<string, unknown>).churchName)
      : 'Igreja local'
    )
  const primarySummary = roleConfig.summaryCards[0]
  const roleNavLinks = dashboardNavLinksByRole[role]

  return (
    <main
      className="relative min-h-screen w-full overflow-x-hidden text-white"
      style={{
        background: 'linear-gradient(160deg, #080E23 0%, #0F1729 50%, #111E3A 100%)',
        fontFamily: 'Lato, sans-serif',
      }}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute right-[8%] top-[10%] h-104 w-104 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-[8%] left-[5%] h-72 w-72 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%)' }}
        />
      </div>

      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: 'rgba(8,14,35,0.97)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(201,168,76,0.15)',
          padding: '0 2rem',
        }}
      >
        <div
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 72,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: 'linear-gradient(135deg, #C9A84C, #E8CC7A)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Cross size={18} color="#0F1729" strokeWidth={2.5} />
            </div>
            <p
              className="text-2xl font-semibold text-[#E8CC7A]"
              style={{ fontFamily: '"Playfair Display", serif' }}
            >
              financialChurch
            </p>
          </div>

          <nav className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/85">
            {roleNavLinks.map((item) => (
              <a key={item.label} href={item.href} className="rounded-md px-3 py-2 transition hover:text-[#E8CC7A]">
                {item.label}
              </a>
            ))}
            <Link
              to="/dashboard"
              search={{ plano: planoAtivo }}
              style={{
                background: 'linear-gradient(135deg, #C9A84C, #E8CC7A)',
                color: '#0F1729',
                padding: '10px 20px',
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 700,
                textDecoration: 'none',
                letterSpacing: 0.4,
              }}
            >
              Painel
            </Link>
          </nav>
        </div>
      </header>

      <div className="relative w-full px-5 pb-20 pt-28 sm:px-8 lg:px-10">
        <section className="mt-4 grid items-center gap-8 lg:grid-cols-2" style={sectionPanelStyle}>
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#C9A84C]/40 bg-[#C9A84C]/10 px-4 py-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#E8CC7A]">{roleConfig.sectionTitle}</span>
            </div>
            <h1
              className="mt-5 text-[clamp(2.3rem,5vw,4.1rem)] font-semibold leading-[1.08] text-white"
              style={{ fontFamily: '"Playfair Display", serif' }}
            >
              {roleConfig.title}
              <span className="mt-2 block text-[#E8CC7A]">{tenantName}</span>
            </h1>

            <p className="mt-5 max-w-xl text-[17px] leading-[1.7] text-white/65">{roleConfig.subtitle}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#resumo"
                className="inline-flex items-center rounded-lg px-6 py-3 text-sm font-bold text-[#0F1729] transition hover:-translate-y-0.5"
                style={{ background: 'linear-gradient(135deg, #C9A84C, #E8CC7A)', boxShadow: '0 8px 32px rgba(201,168,76,0.35)' }}
              >
                Ver painel
              </a>
              <Link
                to="/assinaturas"
                search={{ plano: planoAtivo }}
                className="inline-flex items-center rounded-lg border border-white/20 px-6 py-3 text-sm font-semibold text-white/85 transition hover:border-[#C9A84C]/50 hover:text-[#E8CC7A]"
              >
                Gerenciar plano
              </Link>
            </div>
          </div>

          <aside
            className="backdrop-blur"
            style={{
              ...contentCardStyle,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 16,
              padding: '1.5rem',
            }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.13em] text-white/45">Visao geral - 2026</p>
            <p className="mt-3 text-4xl font-semibold text-[#E8CC7A]" style={{ fontFamily: '"Playfair Display", serif' }}>
              {primarySummary?.value ?? 'R$ 0'}
            </p>
            <p className="mt-2 text-sm text-emerald-300">{primarySummary?.trend ?? 'Sem variacao'}</p>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {roleConfig.summaryCards.slice(0, 3).map((card) => (
                <div
                  key={card.label}
                  style={{
                    ...contentCardStyle,
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 12,
                    padding: '0.75rem',
                  }}
                >
                  <p className="text-[11px] uppercase tracking-[0.08em] text-white/45">{card.label}</p>
                  <p className="mt-1 text-base font-semibold text-white">{card.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t border-white/10 pt-4">
              <p className="text-xs text-white/55">SaaS workspace</p>
              <p className="mt-1 text-lg font-semibold text-white">{tenantName}</p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#E8CC7A]">{planoInfo[planoAtivo].nome}</p>
              <p className="mt-1 text-sm text-white/65">{planoInfo[planoAtivo].detalhe}</p>
              <p className="mt-2 text-xs text-white/45">{planoInfo[planoAtivo].limite}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full border border-white/15 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-white/70">Perfil: {role}</span>
                <span className="rounded-full border border-white/15 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-white/70">
                  Acesso: {isReadOnlyRole ? 'Leitura' : 'Operacao'}
                </span>
              </div>
            </div>
          </aside>
        </section>

        {role === 'dono_saas' && (
          <SaasOwnerDashboardBody role={role} roleConfig={roleConfig} activePlan={planoAtivo} />
        )}
        {role === 'administrador' && (
          <AdministratorDashboardBody role={role} roleConfig={roleConfig} activePlan={planoAtivo} />
        )}
        {role === 'tesoureiro' && (
          <TreasurerDashboardBody role={role} roleConfig={roleConfig} activePlan={planoAtivo} />
        )}
        {role === 'pastor' && <PastorDashboardBody role={role} roleConfig={roleConfig} activePlan={planoAtivo} />}
        {role === 'membro' && <MemberDashboardBody role={role} roleConfig={roleConfig} activePlan={planoAtivo} />}
      </div>
    </main>
  )
}
