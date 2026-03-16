import { useMutation } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useAuth } from '@/hooks/use-auth'
import { createCheckoutSessionFn } from '@/server/functions/billing'
import { Footer } from '@/components/landing/Footer'
import { NavBar } from '@/components/landing/NavBar'
import { Check, Zap } from 'lucide-react'
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
    <div className="church-root bg-slate-950 text-white">
      <NavBar />

      <section
        id="pricing"
        style={{
          background: 'linear-gradient(180deg, #0A1128 0%, #080E23 100%)',
          padding: '7rem 2rem 5rem',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div
              style={{
                display: 'inline-block',
                background: 'rgba(201,168,76,0.1)',
                border: '1px solid rgba(201,168,76,0.25)',
                borderRadius: 100,
                padding: '6px 20px',
                marginBottom: 20,
              }}
            >
              <span
                style={{
                  color: '#C9A84C',
                  fontSize: 12,
                  letterSpacing: 1,
                  fontFamily: 'Lato, sans-serif',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                }}
              >
                Assinaturas
              </span>
            </div>
            <h1
              style={{
                fontFamily: 'Playfair Display, serif',
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontWeight: 700,
                color: '#FFFFFF',
                marginBottom: 12,
              }}
            >
              Escolha o plano ideal para sua igreja
            </h1>
            <p
              style={{
                color: 'rgba(255,255,255,0.55)',
                fontSize: 16,
                fontFamily: 'Lato, sans-serif',
                maxWidth: 620,
                margin: '0 auto',
                lineHeight: 1.7,
              }}
            >
              Mesmo layout da landing page, com foco em comparação clara e ação direta para concluir o acesso ao painel.
            </p>
          </div>

          <div
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 16,
              padding: '1.4rem',
              marginBottom: '1.8rem',
            }}
          >
            <p
              style={{
                color: 'rgba(255,255,255,0.45)',
                fontSize: 12,
                letterSpacing: 1,
                textTransform: 'uppercase',
                fontFamily: 'Lato, sans-serif',
                marginBottom: 8,
              }}
            >
              Plano selecionado
            </p>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {data.nome}
                </h2>
                <p className="mt-1 text-sm text-white/65">{data.descricao}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-semibold text-[#E8CC7A]">{data.preco}</p>
                <p className="text-xs text-white/55">{data.subtitulo}</p>
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 24,
            }}
          >
            {planOrder.map((key) => {
              const plan = planDetails[key]
              const active = key === plano

              return (
                <article
                  key={key}
                  style={{
                    position: 'relative',
                    background: active
                      ? 'linear-gradient(160deg, rgba(201,168,76,0.1) 0%, rgba(201,168,76,0.04) 100%)'
                      : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${active ? 'rgba(201,168,76,0.45)' : 'rgba(255,255,255,0.07)'}`,
                    borderRadius: 20,
                    padding: '2rem 1.6rem',
                  }}
                >
                  {active && (
                    <div
                      style={{
                        position: 'absolute',
                        top: -14,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'linear-gradient(135deg, #C9A84C, #E8CC7A)',
                        color: '#0F1729',
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '4px 14px',
                        borderRadius: 100,
                        fontFamily: 'Lato, sans-serif',
                        letterSpacing: 0.8,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <Zap size={11} /> ATIVO
                    </div>
                  )}
                  <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-white/55">{plan.selo}</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                    {plan.nome}
                  </h3>
                  <p className="mt-2 text-xl font-semibold text-[#E8CC7A]">{plan.preco}</p>
                  <p className="mt-1 text-xs text-white/55">{plan.subtitulo}</p>

                  <div className="mt-5 space-y-3">
                    {plan.features.slice(0, 5).map((feature) => (
                      <div key={feature} className="flex items-start gap-2">
                        <div className="mt-0.5 rounded-full bg-white/8 p-1">
                          <Check size={10} color={active ? '#E8CC7A' : 'rgba(255,255,255,0.5)'} />
                        </div>
                        <span className="text-xs text-white/70">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Link
                    to="/assinaturas"
                    search={{ plano: key }}
                    className="mt-6 inline-flex w-full items-center justify-center rounded-lg border border-white/20 px-3 py-2 text-xs font-semibold uppercase tracking-widest text-white/85 transition hover:border-[#C9A84C]/45 hover:text-[#E8CC7A]"
                  >
                    {active ? 'Selecionado' : 'Selecionar'}
                  </Link>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section
        id="features"
        style={{
          background: '#080E23',
          padding: '4.5rem 2rem',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h2 className="text-3xl font-semibold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
            Recursos do plano {plano}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-white/65">{data.descricao}</p>
          <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
            {data.features.map((feature) => (
              <div key={feature} className="rounded-xl border border-white/10 bg-white/3 px-4 py-3 text-sm text-white/80">
                {feature}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="modules"
        style={{
          background: 'linear-gradient(180deg, #080E23 0%, #060B1A 100%)',
          padding: '4.5rem 2rem',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h2 className="text-3xl font-semibold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
            Próximo passo
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-white/65">
            Finalize sua assinatura e continue o onboarding no mesmo fluxo da landing.
          </p>

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

          <p className="mt-6 text-xs text-white/50">
            Checkout recorrente via Stripe para cartão. Se quiser ativar Pix nativo, podemos adicionar um gateway complementar no próximo passo.
          </p>
        </div>
      </section>

      <section id="docs" style={{ background: '#060B1A', padding: '3rem 2rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h3 className="text-2xl font-semibold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
            Dúvidas rápidas
          </h3>
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-white/3 p-4 text-sm text-white/75">
              Mudança de plano é imediata e mantém os dados já lançados.
            </div>
            <div className="rounded-xl border border-white/10 bg-white/3 p-4 text-sm text-white/75">
              Cancelamento pode ser feito a qualquer momento no painel.
            </div>
            <div className="rounded-xl border border-white/10 bg-white/3 p-4 text-sm text-white/75">
              Suporte por e-mail e onboarding assistido para planos maiores.
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
