import { Link } from '@tanstack/react-router'
import { GerenciarUsuarios } from './GerenciarUsuarios'

type SummaryCard = {
  label: string
  value: string
  detail: string
  icon: string
  tone: string
}

const summaryCards: SummaryCard[] = [
  {
    label: 'Entradas do mês',
    value: 'R$ 64.420',
    detail: 'Dízimos + ofertas registradas',
    icon: '↑',
    tone: 'text-emerald-300',
  },
  {
    label: 'Despesas do mês',
    value: 'R$ 19.450',
    detail: 'Pagamentos e custos operacionais',
    icon: '↓',
    tone: 'text-rose-300',
  },
  {
    label: 'Saldo atual',
    value: 'R$ 44.970',
    detail: 'Disponível para a igreja',
    icon: '•',
    tone: 'text-amber-300',
  },
]

const quickLinks = [
  {
    title: 'Início do painel',
    description: 'Atualizar os números principais.',
    to: '/dashboard' as const,
  },
  {
    title: 'Área protegida',
    description: 'Acessar a rota interna de validação.',
    to: '/example-protected-route' as const,
  },
  {
    title: 'Sair da conta',
    description: 'Encerrar a sessão atual com segurança.',
    to: '/sign-out' as const,
  },
]

export function Dashboard() {
  return (
    <div className="min-h-screen w-full overflow-x-hidden border-t border-slate-800 bg-slate-950 text-white">
      <div className="mx-auto w-full max-w-[1120px] px-4 pb-16 pt-12 sm:px-8 lg:px-12">
        <section className="rounded-4xl border border-white/10 bg-linear-to-br from-slate-900 via-slate-900/80 to-slate-950 p-6 shadow-[0_24px_70px_rgba(2,6,23,0.45)] sm:p-10">
          <header className="mx-auto max-w-3xl text-center">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Painel Administrativo</p>
            <h1 className="mt-2 text-3xl font-semibold leading-tight sm:text-4xl">Controle financeiro da igreja</h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
              Visão rápida dos números, atalhos úteis e gestão de usuários com uma interface limpa e centralizada.
            </p>
          </header>

          <nav className="mt-7 flex flex-wrap justify-center gap-3" aria-label="Atalhos internos do dashboard">
            <a
              href="#resumo"
              className="rounded-full border border-white/20 bg-slate-950/70 px-5 py-2 text-sm font-semibold text-slate-100 transition hover:border-amber-300/60 hover:text-amber-200"
            >
              Ver resumo
            </a>
            <a
              href="#acoes"
              className="rounded-full border border-white/20 bg-slate-950/70 px-5 py-2 text-sm font-semibold text-slate-100 transition hover:border-amber-300/60 hover:text-amber-200"
            >
              Ver ações
            </a>
            <a
              href="#usuarios"
              className="rounded-full border border-white/20 bg-slate-950/70 px-5 py-2 text-sm font-semibold text-slate-100 transition hover:border-amber-300/60 hover:text-amber-200"
            >
              Ir para usuários
            </a>
          </nav>
        </section>

        <section id="resumo" className="mt-10">
          <div className="mx-auto flex w-full max-w-[1020px] flex-wrap justify-center gap-6">
            {summaryCards.map((card) => (
              <article
                key={card.label}
                className="w-full max-w-[320px] rounded-3xl border border-white/10 bg-slate-900/65 p-6 text-center shadow-[0_16px_40px_rgba(2,6,23,0.3)]"
              >
                <div className="mb-4 flex items-center justify-center gap-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{card.label}</p>
                  <span className="rounded-full border border-white/15 bg-slate-950/70 px-2 py-1 text-xs text-slate-300">{card.icon}</span>
                </div>
                <p className={`text-3xl font-semibold ${card.tone}`}>{card.value}</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">{card.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section
          id="acoes"
          className="mx-auto mt-10 w-full max-w-[1020px] rounded-3xl border border-white/10 bg-slate-900/50 p-6 shadow-[0_14px_35px_rgba(2,6,23,0.28)] sm:p-8"
        >
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-semibold">Ações rápidas</h2>
            <p className="mt-1 text-sm text-slate-400">Navegação direta e clicável</p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {quickLinks.map((item) => (
              <Link
                key={item.title}
                to={item.to}
                className="group w-full max-w-[300px] rounded-2xl border border-white/10 bg-slate-950/60 p-5 text-center transition duration-200 hover:-translate-y-0.5 hover:border-amber-400/60 hover:bg-slate-900/90"
              >
                <p className="text-base font-semibold text-white group-hover:text-amber-300">{item.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{item.description}</p>
              </Link>
            ))}
          </div>
        </section>

        <section
          id="usuarios"
          className="mx-auto mt-10 w-full max-w-[1020px] rounded-3xl border border-white/10 bg-slate-900/50 p-4 shadow-[0_14px_35px_rgba(2,6,23,0.28)] sm:p-6"
        >
          <div className="mx-auto mb-4 max-w-3xl text-center">
            <h2 className="text-2xl font-semibold">Usuários e permissões</h2>
            <p className="mt-1 text-sm text-slate-400">Gerencie acessos sem sair do painel principal.</p>
          </div>
          <div className="mx-auto w-full max-w-4xl">
            <GerenciarUsuarios />
          </div>
        </section>
      </div>
    </div>
  )
}
