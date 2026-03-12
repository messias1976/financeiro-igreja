import { Link } from '@tanstack/react-router'
import { Cross } from 'lucide-react'
import type { CSSProperties } from 'react'
import { GerenciarUsuarios } from './GerenciarUsuarios'
import { useAuth } from '@/hooks/use-auth'

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
type RoleKey = 'administrador' | 'tesoureiro' | 'pastor' | 'membro'

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

function resolvePlanoAtivo(plano?: PlanoInput, prefs?: unknown): PlanoAtivo {
  const userPlan = (prefs as Record<string, unknown> | undefined)?.plan
  if (typeof userPlan === 'string') {
    return normalizePlano(userPlan as PlanoInput)
  }

  if (plano) {
    return normalizePlano(plano)
  }

  // Logins legados sem plano definido ficam no Premium por padrão.
  return 'premium'
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

function resolveRole(role?: unknown): RoleKey {
  if (role === 'administrador' || role === 'tesoureiro' || role === 'pastor') {
    return role
  }
  return 'membro'
}

export function Dashboard({ plano }: { plano?: PlanoInput }) {
  const { currentUser } = useAuth()
  const role = resolveRole((currentUser?.prefs as Record<string, unknown> | undefined)?.role)
  const roleConfig = roleConfigs[role]
  const planoAtivo = resolvePlanoAtivo(plano, currentUser?.prefs)
  const isReadOnlyRole = role === 'pastor' || role === 'membro'
  const tenantName =
    typeof (currentUser?.prefs as Record<string, unknown> | undefined)?.churchName === 'string'
      ? String((currentUser?.prefs as Record<string, unknown>).churchName)
      : 'Igreja local'
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
