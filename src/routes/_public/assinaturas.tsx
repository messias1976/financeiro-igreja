import { useMutation } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useAuth } from '@/hooks/use-auth'
import { createCheckoutSessionFn } from '@/server/functions/billing'
import { z } from 'zod'

const searchSchema = z.object({
  plano: z.enum(['inicial', 'padrao', 'premium', 'paroquia', 'diocese']).optional(),
  checkout: z.enum(['success', 'cancelled']).optional(),
})

type LegacyPlan = z.infer<typeof searchSchema>['plano']
type PlanKey = 'inicial' | 'padrao' | 'premium'

type PlanDetails = {
  nome: string
  preco: string
  descricao: string
  subtitulo: string
  selo: string
  features: string[]
}

const planAlias: Record<NonNullable<LegacyPlan>, PlanKey> = {
  inicial: 'inicial',
  padrao: 'padrao',
  premium: 'premium',
  paroquia: 'padrao',
  diocese: 'premium',
}

const planDetails: Record<PlanKey, PlanDetails> = {
  inicial: {
    nome: 'Plano Inicial',
    preco: 'Grátis',
    subtitulo: 'Para sempre',
    selo: 'Entrada imediata',
    descricao:
      'Perfeito para começar com acesso ao dashboard e recursos essenciais para a rotina da igreja.',
    features: [
      'Até 50 membros',
      'Registro de dízimos e ofertas',
      'Dashboard básico',
      'Exportação CSV',
      'Suporte por e-mail',
    ],
  },
  padrao: {
    nome: 'Plano Padrão',
    preco: 'R$ 89/mês',
    subtitulo: 'Cobrança mensal',
    selo: 'Mais escolhido',
    descricao:
      'Controle completo para igrejas em crescimento com checkout Stripe e acesso por função.',
    features: [
      'Membros ilimitados',
      'Módulos financeiros completos',
      'Relatórios PDF e Excel',
      'Checkout Stripe integrado',
      'Suporte prioritário',
    ],
  },
  premium: {
    nome: 'Plano Premium',
    preco: 'R$ 249/mês',
    subtitulo: 'Gestão avançada',
    selo: 'Escala multi-igreja',
    descricao:
      'Experiência completa para redes com gestão multi-igreja e consolidado financeiro centralizado.',
    features: [
      'Múltiplas filiais',
      'Relatórios consolidados',
      'Onboarding dedicado',
      'SLA e integrações avançadas',
      'Opção white-label',
    ],
  },
}

const planOrder: PlanKey[] = ['inicial', 'padrao', 'premium']

export const Route = createFileRoute('/_public/assinaturas')({
  component: AssinaturasPage,
  validateSearch: searchSchema,
})

function AssinaturasPage() {
  const search = Route.useSearch()
  const { currentUser } = useAuth()
  const createCheckoutSession = useServerFn(createCheckoutSessionFn)

  const plano = search.plano ? planAlias[search.plano] : 'inicial'
  const data = planDetails[plano]
  const redirect = `/dashboard?plano=${plano}`

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      if (plano === 'inicial') {
        throw new Error('Plano inicial nao possui checkout')
      }

      const checkoutPlan = plano === 'premium' ? 'premium' : 'padrao'

      return createCheckoutSession({
        data: {
          plan: checkoutPlan,
          email: currentUser?.email,
        },
      })
    },
    onSuccess: (result) => {
      window.location.href = result.url
    },
  })

  return (
    <main
      className="relative min-h-screen overflow-hidden px-5 py-8 text-white sm:px-8 lg:px-10"
      style={{
        background: 'linear-gradient(160deg, #080E23 0%, #0F1729 50%, #111E3A 100%)',
        fontFamily: 'Lato, sans-serif',
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute right-[8%] top-[8%] h-96 w-96 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.14) 0%, transparent 72%)' }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[6%] left-[4%] h-80 w-80 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.1) 0%, transparent 72%)' }}
      />

      <div className="relative mx-auto max-w-6xl">
        <header className="mb-7 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#080E23]/70 px-5 py-4 backdrop-blur-xl">
          <p className="text-2xl font-semibold text-[#E8CC7A]" style={{ fontFamily: '"Playfair Display", serif' }}>
            financialChurch
          </p>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Link to="/" className="rounded-lg border border-white/20 px-4 py-2 text-white/80 transition hover:text-[#E8CC7A]">
              Voltar para landing
            </Link>
            <Link to="/dashboard" search={{ plano }} className="rounded-lg border border-[#C9A84C]/45 px-4 py-2 text-[#E8CC7A] transition hover:bg-[#C9A84C]/10">
              Ir para painel
            </Link>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
          <aside className="rounded-3xl border border-white/10 bg-[#080E23]/70 p-6 backdrop-blur-xl">
            <p className="inline-flex rounded-full border border-[#C9A84C]/35 bg-[#C9A84C]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#E8CC7A]">
              Plano selecionado
            </p>
            <h1 className="mt-4 text-3xl font-semibold text-white" style={{ fontFamily: '"Playfair Display", serif' }}>
              {data.nome}
            </h1>
            <p className="mt-2 text-2xl font-semibold text-[#E8CC7A]">{data.preco}</p>
            <p className="mt-1 text-sm text-white/60">{data.subtitulo}</p>
            <p className="mt-4 text-sm leading-7 text-white/70">{data.descricao}</p>

            <div className="mt-6 rounded-2xl border border-[#C9A84C]/20 bg-[#C9A84C]/8 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#E8CC7A]">Destaque</p>
              <p className="mt-2 text-sm text-white/80">{data.selo}</p>
            </div>

            <div className="mt-6 space-y-3">
              {data.features.map((feature) => (
                <div key={feature} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/3 px-3 py-2">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#E8CC7A]" />
                  <p className="text-sm text-white/80">{feature}</p>
                </div>
              ))}
            </div>
          </aside>

          <section className="rounded-3xl border border-white/10 bg-[#080E23]/70 p-6 backdrop-blur-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#E8CC7A]">Assinaturas</p>
            <h2 className="mt-3 text-[clamp(1.9rem,3.8vw,2.8rem)] font-semibold text-white" style={{ fontFamily: '"Playfair Display", serif' }}>
              Escolha o plano ideal para sua igreja
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/65">
              A estrutura abaixo segue o mesmo padrão da landing page, com foco em comparação clara e ação direta para
              continuar o onboarding.
            </p>

            <div className="mt-7 grid grid-cols-1 gap-4 md:grid-cols-3">
              {planOrder.map((key) => {
                const plan = planDetails[key]
                const active = key === plano

                return (
                  <article
                    key={key}
                    className="rounded-2xl border p-4 transition"
                    style={{
                      background: active ? 'rgba(201,168,76,0.12)' : 'rgba(255,255,255,0.03)',
                      borderColor: active ? 'rgba(201,168,76,0.45)' : 'rgba(255,255,255,0.12)',
                      boxShadow: active ? '0 16px 36px rgba(201,168,76,0.15)' : 'none',
                    }}
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-white/55">{plan.selo}</p>
                    <h3 className="mt-2 text-xl font-semibold text-white" style={{ fontFamily: '"Playfair Display", serif' }}>
                      {plan.nome}
                    </h3>
                    <p className="mt-2 text-lg font-semibold text-[#E8CC7A]">{plan.preco}</p>
                    <p className="mt-3 text-xs leading-6 text-white/70">{plan.descricao}</p>
                    <Link
                      to="/assinaturas"
                      search={{ plano: key }}
                      className="mt-4 inline-flex w-full items-center justify-center rounded-lg border border-white/20 px-3 py-2 text-xs font-semibold uppercase tracking-widest text-white/85 transition hover:border-[#C9A84C]/45 hover:text-[#E8CC7A]"
                    >
                      {active ? 'Selecionado' : 'Selecionar'}
                    </Link>
                  </article>
                )
              })}
            </div>

            {search.checkout === 'success' && (
              <p className="mt-5 rounded-xl border border-emerald-300/35 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-100">
                Checkout concluído com sucesso. Entre ou crie sua conta para finalizar o acesso ao dashboard.
              </p>
            )}

            {search.checkout === 'cancelled' && (
              <p className="mt-5 rounded-xl border border-amber-300/35 bg-amber-500/10 px-4 py-3 text-xs text-amber-100">
                Pagamento cancelado. Você pode tentar novamente quando quiser.
              </p>
            )}

            {checkoutMutation.isError && (
              <p className="mt-5 rounded-xl border border-rose-300/35 bg-rose-500/10 px-4 py-3 text-xs text-rose-100">
                Não foi possível iniciar o checkout agora. Verifique as chaves do Stripe e tente novamente.
              </p>
            )}

            <div className="mt-7 flex flex-wrap gap-3">
              {plano !== 'inicial' && (
                <button
                  type="button"
                  onClick={() => checkoutMutation.mutate()}
                  disabled={checkoutMutation.isPending}
                  className="rounded-lg bg-linear-to-r from-emerald-500 to-emerald-400 px-6 py-3 text-sm font-semibold text-slate-950 shadow-[0_10px_24px_rgba(34,197,94,0.35)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {checkoutMutation.isPending ? 'Abrindo checkout...' : 'Pagar com Stripe'}
                </button>
              )}

              <Link
                to="/sign-up"
                search={{ redirect }}
                className="rounded-lg bg-linear-to-r from-[#C9A84C] to-[#E8CC7A] px-6 py-3 text-sm font-semibold text-slate-900 shadow-[0_10px_28px_rgba(201,168,76,0.35)] transition hover:brightness-110"
              >
                Criar conta e continuar
              </Link>

              <Link
                to="/sign-in"
                search={{ redirect }}
                className="rounded-lg border border-white/20 px-6 py-3 text-sm font-semibold text-white/90 transition hover:border-[#C9A84C]/45 hover:text-[#E8CC7A]"
              >
                Já tenho conta
              </Link>
            </div>

            {plano !== 'inicial' && (
              <p className="mt-6 text-xs text-white/50">
                Checkout recorrente via Stripe para cartão. Se quiser ativar Pix nativo, podemos adicionar um gateway
                complementar no próximo passo.
              </p>
            )}
          </section>
        </section>
      </div>
    </main>
  )
}
