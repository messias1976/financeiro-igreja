import { Link } from '@tanstack/react-router'
import { GerenciarUsuarios } from './GerenciarUsuarios'

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
  to: '/dashboard' | '/example-protected-route' | '/sign-out'
}

const summaryCards: SummaryCard[] = [
  {
    label: 'Entradas do mês',
    value: 'R$ 64.420',
    detail: 'Dízimos + ofertas registradas',
    trend: '+12% contra mês anterior',
    icon: '↑',
    tone: 'text-emerald-300',
  },
  {
    label: 'Despesas do mês',
    value: 'R$ 19.450',
    detail: 'Pagamentos e custos operacionais',
    trend: '+3% contra mês anterior',
    icon: '↓',
    tone: 'text-rose-300',
  },
  {
    label: 'Saldo atual',
    value: 'R$ 44.970',
    detail: 'Disponível para a igreja',
    trend: '6 meses em saldo positivo',
    icon: '•',
    tone: 'text-amber-300',
  },
]

const quickLinks: QuickLink[] = [
  {
    title: 'Início do painel',
    description: 'Atualizar os números principais.',
    icon: '◉',
    to: '/dashboard',
  },
  {
    title: 'Área protegida',
    description: 'Acessar a rota interna de validação.',
    icon: '◈',
    to: '/example-protected-route',
  },
  {
    title: 'Sair da conta',
    description: 'Encerrar a sessão atual com segurança.',
    icon: '◎',
    to: '/sign-out',
  },
]

export function Dashboard() {
  return (
    <main className="relative min-h-screen w-full overflow-x-hidden border-t border-slate-800 bg-slate-950 text-white">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-16 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="absolute left-0 top-1/3 h-72 w-72 -translate-x-1/3 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute bottom-8 right-0 h-80 w-80 translate-x-1/4 rounded-full bg-emerald-400/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex w-full max-w-7xl flex-col items-center gap-20 px-5 pb-40 pt-32 sm:px-8 sm:pb-44 sm:pt-36 lg:px-10">
        <section className="animate-[fadeInUp_0.55s_ease-out_both] w-full max-w-5xl rounded-4xl border border-white/10 bg-linear-to-br from-slate-900/95 via-slate-900/85 to-slate-950/90 px-10 py-12 shadow-[0_24px_70px_rgba(2,6,23,0.45)] ring-1 ring-white/5 backdrop-blur-sm sm:px-14 sm:py-16">
          <div className="mx-auto  text-center">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Painel Administrativo</p>
            <h1
              className="mt-2 text-3xl font-semibold leading-tight text-slate-50 sm:text-5xl"
              style={{ fontFamily: '"Playfair Display", serif' }}
            >
              Controle financeiro da igreja
            </h1>
            
          </div>

          <nav className="mt-12 flex flex-wrap justify-center gap-3" aria-label="Atalhos internos do dashboard">
            <a
              href="#resumo"
              className="rounded-full border border-white/20 bg-slate-950/70 px-5 py-2 text-sm font-semibold text-slate-100 transition duration-200 hover:-translate-y-0.5 hover:border-amber-300/60 hover:text-amber-200"
            >
              Ver resumo
            </a>
            <a
              href="#acoes"
              className="rounded-full border border-white/20 bg-slate-950/70 px-5 py-2 text-sm font-semibold text-slate-100 transition duration-200 hover:-translate-y-0.5 hover:border-amber-300/60 hover:text-amber-200"
            >
              Ver ações
            </a>
            <a
              href="#usuarios"
              className="rounded-full border border-white/20 bg-slate-950/70 px-5 py-2 text-sm font-semibold text-slate-100 transition duration-200 hover:-translate-y-0.5 hover:border-amber-300/60 hover:text-amber-200"
            >
              Ir para usuários
            </a>
          </nav>
        </section>

        <section id="resumo" className="w-full max-w-5xl py-4">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-semibold text-slate-100">Resumo financeiro</h2>
            <p className="mt-1 text-sm text-slate-400">Panorama rápido para decisão da liderança</p>
          </div>
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {summaryCards.map((card) => (
              <article
                key={card.label}
                className="flex h-full flex-col items-center justify-center rounded-3xl border border-white/10 bg-slate-900/70 px-10 py-12 text-center shadow-[0_16px_40px_rgba(2,6,23,0.3)] ring-1 ring-white/5 transition duration-200 hover:-translate-y-0.5 hover:border-white/20"
              >
                <div className="mx-auto mb-4 h-1 w-16 rounded-full bg-linear-to-r from-amber-400/80 to-emerald-400/80" />
                <div className="mb-4 flex items-center justify-center gap-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{card.label}</p>
                  <span className="rounded-full border border-white/15 bg-slate-950/70 px-2 py-1 text-xs text-slate-300">{card.icon}</span>
                </div>
                <p className={`text-3xl font-semibold ${card.tone}`}>{card.value}</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">{card.detail}</p>
                <p className="mt-2 text-xs text-slate-400">{card.trend}</p>
              </article>
            ))}
          </div>
        </section>

        <section
          id="acoes"
          className="w-full max-w-5xl rounded-3xl border border-white/10 bg-slate-900/50 px-10 py-12 shadow-[0_14px_35px_rgba(2,6,23,0.28)] sm:px-12 sm:py-14"
        >
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-semibold">Ações rápidas</h2>
            <p className="mt-1 text-sm text-slate-400">Navegação direta e clicável</p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
            {quickLinks.map((item) => (
              <Link
                key={item.title}
                to={item.to}
                className="group flex h-full flex-col items-center justify-center rounded-2xl border border-white/10 bg-slate-950/65 px-9 py-10 text-center transition duration-200 hover:-translate-y-0.5 hover:border-amber-400/60 hover:bg-slate-900/90"
              >
                <div className="mb-2 inline-flex rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-300">{item.icon}</div>
                <p className="text-base font-semibold text-white group-hover:text-amber-300">{item.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{item.description}</p>
                <p className="mt-3 text-xs font-semibold text-amber-200/90">Abrir</p>
              </Link>
            ))}
          </div>
        </section>

        <section
          id="usuarios"
          className="w-full max-w-5xl rounded-3xl border border-white/10 bg-slate-900/50 px-10 py-12 shadow-[0_14px_35px_rgba(2,6,23,0.28)] sm:px-12 sm:py-14"
        >
          <div className="mx-auto mb-10 max-w-5xl text-center">
            <h2 className="text-3xl font-semibold">Usuários e permissões</h2>
            <p className="mt-1 text-sm text-slate-400">Gerencie acessos sem sair do painel principal.</p>
          </div>
          <div className="mx-auto w-full max-w-5xl">
            <GerenciarUsuarios />
          </div>
        </section>
      </div>
    </main>
  )
}
