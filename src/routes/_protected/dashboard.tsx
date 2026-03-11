import { createFileRoute } from '@tanstack/react-router'
import { GerenciarUsuarios } from '../../components/dashboard/GerenciarUsuarios'

const summaryCards = [
  { title: 'Dízimos do mês', value: 'R$ 38.750', change: '+12% que o mês anterior' },
  { title: 'Ofertas registradas', value: 'R$ 12.260', change: '+6% em relação à média mensal' },
  { title: 'Despesas do mês', value: 'R$ 17.920', change: '-3% frente ao mês passado' },
  { title: 'Saldo disponível', value: 'R$ 32.150', change: 'Saldo em crescimento' },
]

const contributionLog = [
  { type: 'Dízimo', member: 'João Oliveira', amount: 'R$ 210', date: '12 de março', method: 'Pix' },
  { type: 'Oferta', member: 'Marina Pereira', amount: 'R$ 450', date: '12 de março', method: 'Dinheiro' },
  { type: 'Dízimo', member: 'Equipe de Louvor', amount: 'R$ 870', date: '11 de março', method: 'Cartão' },
]

const membersData = [
  { name: 'Pastor Rafael', ministry: 'Pastores', phone: '+55 11 98877-4455', email: 'rafael@igreja.com' },
  { name: 'Equipe de Louvor', ministry: 'Louvor', phone: '+55 11 98877-3344', email: 'louvor@igreja.com' },
  { name: 'Camila Souza', ministry: 'Intercessão', phone: '+55 11 99988-2233', email: 'camila@igreja.com' },
]

const expensesData = [
  { category: 'Infraestrutura', description: 'Troca de lâmpadas do salão principal', amount: 'R$ 2.400', date: '09 de março' },
  { category: 'Eventos', description: 'Coffee break culto familiar', amount: 'R$ 980', date: '10 de março' },
  { category: 'Transporte', description: 'Combustível van comunitária', amount: 'R$ 620', date: '08 de março' },
]

const campaigns = [
  { name: 'Reforma do salão', goal: 'R$ 60.000', raised: 'R$ 36.400', progress: 64 },
  { name: 'Viagem Missionária', goal: 'R$ 25.000', raised: 'R$ 8.500', progress: 34 },
]

const chartValues = [42, 58, 67, 74, 86, 72, 95, 104, 98, 84, 88, 102]
const chartLabels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

export const Route = createFileRoute('/_protected/dashboard')({
  component: Dashboard,
})

function Dashboard() {
  const maxValue = Math.max(...chartValues)

  return (
    <main className='min-h-screen bg-slate-950 px-6 py-8 md:px-10 text-slate-100'>
      <section className='mb-8 space-y-4'>
        <div className='flex flex-wrap items-center justify-between gap-2'>
          <div>
            <p className='text-sm uppercase tracking-[0.3em] text-slate-400'>Visão geral</p>
            <h1 className='text-3xl font-semibold text-white'>Painel financeiro</h1>
          </div>
          <button className='rounded-full border border-white/10 px-5 py-2 text-sm font-semibold text-white transition hover:border-amber-400/70 hover:text-amber-300'>
            Exportar relatório
          </button>
        </div>
        <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
          {summaryCards.map((card) => (
            <article
              key={card.title}
              className='rounded-2xl border border-white/10 bg-gradient-to-br p-5 shadow-[0_10px_30px_rgba(2,6,23,0.65)]'
            >
              <div className='text-xs uppercase tracking-[0.3em] text-slate-400'>{card.title}</div>
              <p className='text-3xl font-bold text-white'>{card.value}</p>
              <p className='mt-2 text-sm text-slate-300'>{card.change}</p>
            </article>
          ))}
        </div>
      </section>

      <section className='mb-10 rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-[0_20px_60px_rgba(3,7,18,0.8)]'>
        <div className='flex items-center justify-between'>
          <h2 className='text-xl font-semibold text-white'>Gráfico mensal</h2>
          <span className='text-xs uppercase tracking-[0.3em] text-slate-400'>Últimos 12 meses</span>
        </div>
        <div className='mt-6 grid gap-6 md:grid-cols-[1fr_1fr]'>
          <div className='space-y-4'>
            <div className='h-48 rounded-2xl border border-white/5 bg-gradient-to-b from-slate-900/70 to-slate-950 p-6'>
              <div className='flex h-full items-end gap-4'>
                {chartValues.map((value, index) => {
                  const height = (value / maxValue) * 100
                  return (
                    <div
                      key={'bar-' + index}
                      className='flex-1 rounded-full bg-gradient-to-t from-amber-400 via-orange-400 to-orange-500 transition-all duration-200'
                      style={{
                        height: height + '%',
                        alignSelf: 'flex-end',
                      }}
                    />
                  )
                })}
              </div>
            </div>
            <div className='grid grid-cols-3 gap-2 text-center text-xs font-semibold uppercase tracking-[0.3em] text-slate-400'>
              {chartLabels.map((label) => (
                <span key={label}>{label}</span>
              ))}
            </div>
          </div>
          <div className='space-y-4'>
            <div className='rounded-2xl border border-white/5 bg-slate-900/60 p-4'>
              <p className='text-xs uppercase tracking-[0.3em] text-slate-400'>Saldo acumulado</p>
              <p className='text-3xl font-bold text-white'>R$ 32.150</p>
              <p className='text-sm text-slate-300'>Lucro líquido do último trimestre</p>
            </div>
            <div className='rounded-2xl border border-white/5 bg-slate-900/60 p-4'>
              <div className='flex items-center justify-between'>
                <p className='text-xs uppercase tracking-[0.3em] text-slate-400'>Próxima campanha</p>
                <span className='text-xs text-emerald-300'>Ativa</span>
              </div>
              <p className='text-lg font-semibold text-white'>Reforma do templo</p>
              <p className='text-sm text-slate-300'>Meta R$ 60.000 · 64% arrecadado</p>
            </div>
          </div>
        </div>
      </section>

      <section className='mb-10 space-y-6 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-6'>
        <ContributionsPanel
          title='Registro de dízimos e ofertas'
          description='Cadastre novos valores ou acompanhe o histórico resumido.'
          items={contributionLog}
        />
        <ExpensesPanel />
      </section>

      <section className='mb-10 grid gap-6 lg:grid-cols-2'>
        <MembersPanel />
        <CampaignsPanel />
      </section>

      <section className='rounded-3xl border border-white/10 bg-slate-900/60 p-6'>
        <div className='flex items-center justify-between'>
          <h2 className='text-xl font-semibold text-white'>Relatórios</h2>
          <span className='text-xs uppercase tracking-[0.3em] text-slate-400'>Exportação PDF / Excel</span>
        </div>
        <div className='mt-4 grid gap-4 sm:grid-cols-3'>
          {['Mensal', 'Anual', 'Entradas & Saídas'].map((label) => (
            <button
              key={label}
              className='rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm font-semibold tracking-wide text-white transition hover:border-amber-400/70 hover:text-amber-300'
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className='mt-10'>
        <GerenciarUsuarios />
      </section>
    </main>
  )
}

function ContributionsPanel({ title, description, items }: {
  title: string
  description: string
  items: typeof contributionLog
}) {
  return (
    <article className='rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-950/70 p-6 shadow-[0_30px_80px_rgba(5,8,20,0.8)]'>
      <div className='flex items-center justify-between'>
        <div>
          <p className='text-xs uppercase tracking-[0.3em] text-slate-400'>{title}</p>
          <h3 className='text-2xl font-semibold text-white'>{description}</h3>
        </div>
        <div className='rounded-full bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-slate-400'>Planos ativos</div>
      </div>
      <div className='mt-6 space-y-4'>
        {items.map((item, index) => (
          <div
            key={'contribution-' + index}
            className='flex flex-col gap-2 rounded-2xl border border-white/5 bg-slate-950/60 p-4'
          >
            <div className='flex items-center justify-between text-sm text-slate-400'>
              <span>{item.type}</span>
              <span className='text-amber-300'>{item.method}</span>
            </div>
            <div className='flex items-center justify-between text-lg font-semibold text-white'>
              <span>{item.member}</span>
              <span>{item.amount}</span>
            </div>
            <p className='text-xs uppercase tracking-[0.3em] text-slate-500'>{item.date}</p>
          </div>
        ))}
      </div>
    </article>
  )
}

function MembersPanel() {
  return (
    <article className='rounded-3xl border border-white/10 bg-slate-900/70 p-6'>
      <div className='flex items-center justify-between'>
        <div>
          <p className='text-xs uppercase tracking-[0.3em] text-slate-400'>Cadastro de membros</p>
          <h3 className='text-2xl font-semibold text-white'>Histórico e contato</h3>
        </div>
        <button className='rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:border-cyan-400/70'>
          + Novo membro
        </button>
      </div>
      <div className='mt-6 space-y-4'>
        {membersData.map((member) => (
          <div
            key={member.email}
            className='flex flex-col gap-1 rounded-2xl border border-slate-800 bg-slate-950/60 p-4'
          >
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-lg font-semibold text-white'>{member.name}</p>
                <p className='text-sm text-slate-400'>{member.ministry}</p>
              </div>
              <span className='text-xs uppercase tracking-[0.3em] text-emerald-300'>Ministério ativo</span>
            </div>
            <div className='grid gap-2 text-sm text-slate-400 sm:grid-cols-2'>
              <span>{member.phone}</span>
              <span>{member.email}</span>
            </div>
          </div>
        ))}
      </div>
    </article>
  )
}

function ExpensesPanel() {
  return (
    <article className='rounded-3xl border border-white/10 bg-slate-900/70 p-6'>
      <div className='flex items-center justify-between'>
        <div>
          <p className='text-xs uppercase tracking-[0.3em] text-slate-400'>Controle de despesas</p>
          <h3 className='text-2xl font-semibold text-white'>Fluxo de saída</h3>
        </div>
        <button className='rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:border-rose-400/70'>
          Registrar gasto
        </button>
      </div>
      <div className='mt-6 space-y-4'>
        {expensesData.map((expense) => (
          <div
            key={expense.description + '-' + expense.date}
            className='grid gap-1 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 sm:grid-cols-2'
          >
            <div>
              <p className='text-lg font-semibold text-white'>{expense.category}</p>
              <p className='text-sm text-slate-400'>{expense.description}</p>
            </div>
            <div className='text-right text-sm'>
              <p className='text-lg font-semibold text-white'>{expense.amount}</p>
              <p className='text-slate-400'>{expense.date}</p>
            </div>
          </div>
        ))}
      </div>
    </article>
  )
}

function CampaignsPanel() {
  return (
    <article className='rounded-3xl border border-white/10 bg-slate-900/70 p-6'>
      <div className='flex items-center justify-between'>
        <div>
          <p className='text-xs uppercase tracking-[0.3em] text-slate-400'>Campanhas</p>
          <h3 className='text-2xl font-semibold text-white'>Metas e progresso</h3>
        </div>
        <button className='rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:border-emerald-400/70'>
          Criar campanha
        </button>
      </div>
      <div className='mt-6 space-y-5'>
        {campaigns.map((campaign) => (
          <div
            key={campaign.name}
            className='space-y-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-4'
          >
            <div className='flex items-center justify-between'>
              <p className='text-lg font-semibold text-white'>{campaign.name}</p>
              <p className='text-sm text-slate-400'>Meta {campaign.goal}</p>
            </div>
            <div className='h-2 rounded-full bg-white/5'>
              <div
                className='h-2 rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-orange-500'
                style={{ width: campaign.progress + '%' }}
              />
            </div>
            <div className='flex items-center justify-between text-sm text-slate-300'>
              <span>{campaign.raised} arrecadado</span>
              <span>{campaign.progress}%</span>
            </div>
          </div>
        ))}
      </div>
    </article>
  )
}
