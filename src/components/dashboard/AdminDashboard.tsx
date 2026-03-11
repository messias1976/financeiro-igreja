import { useMemo, useState } from 'react'
import type { Dispatch, FormEvent, SetStateAction } from 'react'
import { GerenciarUsuarios } from './GerenciarUsuarios'

const summaryCards = [
  { label: 'Dízimos do mês', amount: 'R$ 48.600', change: '+18% vs. último mês', accent: 'from-amber-400 to-amber-600', icon: '✝️' },
  { label: 'Ofertas registradas', amount: 'R$ 15.820', change: '+9% sobre a média mensal', accent: 'from-sky-400 to-sky-600', icon: '🎁' },
  { label: 'Despesas do mês', amount: 'R$ 19.450', change: '+3% frente ao último mês', accent: 'from-rose-500 to-rose-700', icon: '🪛' },
  { label: 'Saldo disponível', amount: 'R$ 44.970', change: 'Saldo positivo há 6 meses', accent: 'from-emerald-400 to-emerald-600', icon: '💰' },
]

const monthlyChart = [62, 78, 85, 92, 108, 99, 114, 122, 118, 130, 125, 140]
const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

const membersData = [
  { name: 'Pastor Rafael', ministry: 'Pastores', phone: '+55 11 98877-4455', email: 'rafael@igreja.com', contributions: 'R$ 2.400', lastContribution: '07 mar' },
  { name: 'Camila Souza', ministry: 'Intercessão', phone: '+55 11 99988-2233', email: 'camila@igreja.com', contributions: 'R$ 730', lastContribution: '12 mar' },
  { name: 'Equipe de Louvor', ministry: 'Louvor', phone: '+55 11 98888-3344', email: 'louvor@igreja.com', contributions: 'R$ 870', lastContribution: '11 mar' },
]

const contributionLog = [
  { type: 'Dízimo', member: 'João Oliveira', amount: 'R$ 210', date: '12 mar', method: 'Pix' },
  { type: 'Oferta', member: 'Marina Pereira', amount: 'R$ 450', date: '12 mar', method: 'Dinheiro' },
  { type: 'Dízimo', member: 'Equipe de Louvor', amount: 'R$ 870', date: '11 mar', method: 'Cartão' },
]

const expensesData = [
  { category: 'Infraestrutura', description: 'Troca de lâmpadas e manutenção elétrica', amount: 'R$ 2.400', date: '09 mar' },
  { category: 'Eventos', description: 'Coffee break culto de casais', amount: 'R$ 980', date: '10 mar' },
  { category: 'Transporte', description: 'Combustível da van comunitária', amount: 'R$ 620', date: '08 mar' },
]

const campaigns = [
  { name: 'Reforma do Salão', goal: 'R$ 60.000', raised: 'R$ 36.400', progress: 61, status: 'Campanha ativa' },
  { name: 'Viagem Missionária', goal: 'R$ 25.000', raised: 'R$ 8.500', progress: 34, status: 'Compartilhe com a liderança' },
]

const roleCards = [
  { title: 'Administrador', description: 'Cria campanhas, libera permissões e valida exportações em PDF/Excel.', privileges: ['Gerenciar membros', 'Criar campanhas', 'Exportar relatórios'], accent: 'bg-amber-500', action: 'Revisar acessos' },
  { title: 'Pastor', description: 'Confere relatórios mensais e aprova campanhas missionárias.', privileges: ['Aprovar campanhas', 'Revisar relatórios', 'Orientar dízimos'], accent: 'bg-indigo-500', action: 'Enviar alerta espiritual' },
  { title: 'Tesoureiro', description: 'Lança dízimos/ofertas e mantém controle de despesas recorrentes.', privileges: ['Registrar contribuições', 'Lançar despesas', 'Auditar pagamentos'], accent: 'bg-emerald-500', action: 'Abrir livro caixa' },
]

type PaymentMethod = 'Pix' | 'Dinheiro' | 'Cartão'

type ContributionFormState = {
  member: string
  amount: string
  date: string
  paymentMethod: PaymentMethod
  type: 'Dízimo' | 'Oferta'
}

type ExpenseFormState = {
  category: string
  amount: string
  date: string
  description: string
}

export function Dashboard() {
  const [contributionForm, setContributionForm] = useState<ContributionFormState>({
    member: '',
    amount: '',
    date: '',
    paymentMethod: 'Pix',
    type: 'Dízimo',
  })
  const [expenseForm, setExpenseForm] = useState<ExpenseFormState>({
    category: 'Infraestrutura',
    amount: '',
    date: '',
    description: '',
  })
  const [lastContribution, setLastContribution] = useState<string | null>(null)
  const [lastExpense, setLastExpense] = useState<string | null>(null)

  const chartMax = useMemo(() => Math.max(...monthlyChart), [])

  const handleContributionSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLastContribution(
      `${contributionForm.type} de ${contributionForm.amount || '0'} registrado para ${
        contributionForm.member || 'membro anônimo'
      }`,
    )
    setContributionForm({ member: '', amount: '', date: '', paymentMethod: 'Pix', type: 'Dízimo' })
  }

  const handleExpenseSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLastExpense(
      `${expenseForm.category}: ${expenseForm.amount || '0'} - ${expenseForm.description || 'Sem descrição'}`,
    )
    setExpenseForm({ category: 'Infraestrutura', amount: '', date: '', description: '' })
  }

  return (
    <div className="min-h-screen border-t border-slate-800 bg-slate-950 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-10">
        <header className="space-y-3">
          <p className="text-sm uppercase tracking-[0.4em] text-slate-400">Painel Administrativo</p>
          <h1 className="text-3xl font-semibold text-white">Controle financeiro da igreja</h1>
          <p className="text-slate-400">
            Centralize dízimos, ofertas, despesas, campanhas e relatórios. Configure papéis e permita que
            voluntários contribuam sem perder o controle.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {summaryCards.map((card) => (
            <div
              key={card.label}
              className={`space-y-2 rounded-2xl border border-white/10 bg-gradient-to-br ${card.accent} p-5 shadow-[0_20px_45px_rgba(15,23,42,0.5)]`}
            >
              <div className="flex items-center justify-between text-sm text-white/70">
                <span>{card.label}</span>
                <span>{card.icon}</span>
              </div>
              <p className="text-2xl font-semibold">{card.amount}</p>
              <p className="text-xs text-white/70">{card.change}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Fluxo financeiro mensal</h2>
              <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/70">Atualizado hoje</span>
            </div>
            <div className="mt-6 h-48 w-full rounded-2xl bg-gradient-to-br from-white/5 to-transparent p-6">
              <div className="relative h-full w-full">
                <div className="absolute inset-0 flex items-end justify-between text-[10px] text-white/30">
                  {months.map((month) => (
                    <span key={month}>{month}</span>
                  ))}
                </div>
                <svg className="relative h-full w-full">
                  <polyline
                    fill="none"
                    stroke="url(#lineGradient)"
                    strokeWidth="3"
                    points={monthlyChart
                      .map((value, index) => {
                        const x = (index / (monthlyChart.length - 1)) * 100
                        const y = 100 - (value / chartMax) * 100
                        return `${x},${y}`
                      })
                      .join(' ')}
                  />
                  <defs>
                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#FACC15" />
                      <stop offset="100%" stopColor="#14B8A6" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </div>
          <ReportsPanel />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
          <div className="space-y-5 rounded-3xl border border-white/10 bg-slate-900/40 p-6">
            <div className="flex items-center justify-between space-x-2">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Membros</p>
                <h2 className="text-2xl font-semibold">Cadastro e histórico</h2>
              </div>
              <button className="rounded-lg border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-200 transition hover:border-white/40">
                Novo membro
              </button>
            </div>
            <MembersTable />
          </div>

          <div className="space-y-5 rounded-3xl border border-white/10 bg-slate-900/40 p-6">
            <ContributionForm form={contributionForm} onChange={setContributionForm} onSubmit={handleContributionSubmit} />
            <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-xs text-white/70">
              {lastContribution ?? 'Nenhuma nova entrada registrada ainda.'}
            </div>
            <ContributionsTable data={contributionLog} />
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="space-y-5 rounded-3xl border border-white/10 bg-slate-900/40 p-6">
            <ExpenseForm form={expenseForm} onChange={setExpenseForm} onSubmit={handleExpenseSubmit} />
            <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-xs text-white/70">
              {lastExpense ?? 'Nenhuma despesa lançada nesta sessão.'}
            </div>
            <ExpensesTable data={expensesData} />
          </div>
          <div className="space-y-6 rounded-3xl border border-white/10 bg-slate-900/40 p-6">
            <h2 className="text-lg font-semibold">Campanhas em destaque</h2>
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <CampaignCard key={campaign.name} campaign={campaign} />
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          {roleCards.map((role) => (
            <PermissionCard key={role.title} role={role} />
          ))}
        </section>

        <section className="rounded-3xl border border-white/10 bg-slate-900/40 p-6">
          <GerenciarUsuarios />
        </section>
      </div>
    </div>
  )
}

function ReportsPanel() {
  const reports = [
    { title: 'Relatório mensal', description: 'Resumo consolidado dos lançamentos e despesas do mês atual.' },
    { title: 'Relatório anual', description: 'Comparação ano a ano com exportação pronta para contabilidade.' },
    { title: 'Entradas e saídas', description: 'Balanço diário com filtros rápidos e campo de notas.' },
  ]

  return (
    <div className="space-y-4 rounded-3xl border border-white/10 bg-slate-950/20 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Relatórios</p>
          <h2 className="text-lg font-semibold">Exportação imediata</h2>
        </div>
        <div className="flex gap-2">
          <button className="rounded-full border border-white/20 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-200">PDF</button>
          <button className="rounded-full border border-white/20 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-200">Excel</button>
        </div>
      </div>
      <div className="space-y-3">
        {reports.map((report) => (
          <div key={report.title} className="rounded-2xl border border-white/5 bg-white/5 p-3 text-xs text-white/70">
            <p className="font-semibold text-white">{report.title}</p>
            <p>{report.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function ContributionForm({
  form,
  onChange,
  onSubmit,
}: {
  form: ContributionFormState
  onChange: Dispatch<SetStateAction<ContributionFormState>>
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}) {
  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm text-white/70">
          Tipo
          <select
            value={form.type}
            onChange={(event) => onChange((prev) => ({ ...prev, type: event.target.value as 'Dízimo' | 'Oferta' }))}
            className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-2 text-white"
          >
            <option>Dízimo</option>
            <option>Oferta</option>
          </select>
        </label>
        <label className="text-sm text-white/70">
          Método
          <select
            value={form.paymentMethod}
            onChange={(event) => onChange((prev) => ({ ...prev, paymentMethod: event.target.value as PaymentMethod }))}
            className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-2 text-white"
          >
            <option>Pix</option>
            <option>Dinheiro</option>
            <option>Cartão</option>
          </select>
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm text-white/70">
          Valor
          <input
            type="text"
            value={form.amount}
            onChange={(event) => onChange((prev) => ({ ...prev, amount: event.target.value }))}
            placeholder="Ex: 250"
            className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-2 text-white"
          />
        </label>
        <label className="text-sm text-white/70">
          Data
          <input
            type="date"
            value={form.date}
            onChange={(event) => onChange((prev) => ({ ...prev, date: event.target.value }))}
            className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-2 text-white"
          />
        </label>
      </div>
      <label className="text-sm text-white/70">
        Membro (opcional)
        <input
          type="text"
          value={form.member}
          onChange={(event) => onChange((prev) => ({ ...prev, member: event.target.value }))}
          placeholder="Ex: João Oliveira"
          className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-2 text-white"
        />
      </label>
      <button className="w-full rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-amber-500/40 transition hover:opacity-90">
        Registrar contribuição
      </button>
    </form>
  )
}

function ContributionsTable({ data }: { data: typeof contributionLog }) {
  return (
    <div className="space-y-3 rounded-2xl border border-white/5 bg-slate-950/40 p-4 text-sm text-white/80">
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.4em] text-white/40">
        <span>Recentes</span>
        <span>Método</span>
      </div>
      <div className="space-y-2">
        {data.map((entry) => (
          <div
            key={`${entry.member}-${entry.date}-${entry.amount}`}
            className="flex items-center justify-between rounded-2xl border border-white/5 bg-slate-900/60 px-3 py-2"
          >
            <div>
              <p className="font-semibold text-white">{entry.member}</p>
              <p className="text-xs text-white/50">
                {entry.type} • {entry.date}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-white">{entry.amount}</p>
              <p className="text-xs text-white/50">{entry.method}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function MembersTable() {
  return (
    <div className="space-y-3 text-sm text-white/80">
      {membersData.map((member) => (
        <div
          key={member.name}
          className="grid grid-cols-2 items-center gap-4 rounded-2xl border border-white/5 bg-slate-950/50 p-3"
        >
          <div>
            <p className="font-semibold text-white">{member.name}</p>
            <p className="text-xs text-white/40">{member.ministry}</p>
          </div>
          <div className="flex flex-col text-right">
            <p className="text-xs">{member.phone}</p>
            <p className="text-xs text-white/60">{member.email}</p>
          </div>
          <div className="text-xs text-white/50">
            {member.contributions} • Última {member.lastContribution}
          </div>
          <div className="flex items-center justify-end gap-2">
            <button className="rounded-full border border-white/10 px-2 py-1 text-[11px] uppercase tracking-[0.4em] text-white/60">Detalhes</button>
            <button className="rounded-full border border-white/10 px-2 py-1 text-[11px] uppercase tracking-[0.4em] text-white/60">Propor convite</button>
          </div>
        </div>
      ))}
    </div>
  )
}

function ExpenseForm({
  form,
  onChange,
  onSubmit,
}: {
  form: ExpenseFormState
  onChange: Dispatch<SetStateAction<ExpenseFormState>>
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}) {
  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm text-white/70">
          Categoria
          <select
            value={form.category}
            onChange={(event) => onChange((prev) => ({ ...prev, category: event.target.value }))}
            className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-2 text-white"
          >
            <option>Infraestrutura</option>
            <option>Eventos</option>
            <option>Transporte</option>
            <option>Comunicação</option>
          </select>
        </label>
        <label className="text-sm text-white/70">
          Valor
          <input
            type="text"
            value={form.amount}
            onChange={(event) => onChange((prev) => ({ ...prev, amount: event.target.value }))}
            placeholder="Ex: 980"
            className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-2 text-white"
          />
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm text-white/70">
          Data
          <input
            type="date"
            value={form.date}
            onChange={(event) => onChange((prev) => ({ ...prev, date: event.target.value }))}
            className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-2 text-white"
          />
        </label>
        <label className="text-sm text-white/70">
          Descrição
          <input
            type="text"
            value={form.description}
            onChange={(event) => onChange((prev) => ({ ...prev, description: event.target.value }))}
            placeholder="Ex: Pagamento do buffet"
            className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-2 text-white"
          />
        </label>
      </div>
      <button className="w-full rounded-2xl border border-white/10 bg-gradient-to-r from-rose-500 to-rose-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-500/40 transition hover:opacity-90">
        Registrar despesa
      </button>
    </form>
  )
}

function ExpensesTable({ data }: { data: typeof expensesData }) {
  return (
    <div className="space-y-3 text-sm text-white/80">
      {data.map((expense) => (
        <div
          key={`${expense.category}-${expense.date}`}
          className="grid grid-cols-2 gap-4 rounded-2xl border border-white/5 bg-slate-950/40 p-3"
        >
          <div>
            <p className="font-semibold text-white">{expense.category}</p>
            <p className="text-xs text-white/50">{expense.description}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-white">{expense.amount}</p>
            <p className="text-xs text-white/50">{expense.date}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function CampaignCard({
  campaign,
}: {
  campaign: (typeof campaigns)[number]
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-white">{campaign.name}</h3>
        <span className="text-xs text-white/60">{campaign.status}</span>
      </div>
      <div className="mt-3 flex items-end justify-between">
        <p className="text-sm text-white/70">Meta {campaign.goal} • Arrecadado {campaign.raised}</p>
        <span className="text-sm font-semibold text-white">{campaign.progress}%</span>
      </div>
      <div className="mt-3 h-2 rounded-full bg-slate-900">
        <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-400" style={{ width: `${campaign.progress}%` }} />
      </div>
    </div>
  )
}

function PermissionCard({
  role,
}: {
  role: (typeof roleCards)[number]
}) {
  return (
    <div className="rounded-3xl border border-white/5 bg-slate-950/30 p-5 shadow-[0_20px_50px_rgba(2,6,23,0.4)]">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">{role.title}</h3>
        <span className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white/70">Role</span>
      </div>
      <p className="mt-2 text-sm text-white/70">{role.description}</p>
      <div className="mt-4 space-y-2 text-sm text-white/60">
        {role.privileges.map((privilege) => (
          <p key={privilege} className="flex items-center gap-2">
            <span className="inline-flex h-2 w-2 rounded-full bg-white/60" />
            {privilege}
          </p>
        ))}
      </div>
      <button className={`mt-5 w-full rounded-2xl ${role.accent} px-4 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-slate-900 transition hover:opacity-90`}>
        {role.action}
      </button>
    </div>
  )
}
