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

const planAlias: Record<NonNullable<LegacyPlan>, PlanKey> = {
  inicial: 'inicial',
  padrao: 'padrao',
  premium: 'premium',
  paroquia: 'padrao',
  diocese: 'premium',
}

const planDetails: Record<PlanKey, { nome: string; preco: string; descricao: string }> = {
  inicial: {
    nome: 'Plano Inicial',
    preco: 'Grátis',
    descricao:
      'Perfeito para começar: acesso ao dashboard com recursos essenciais e limitações do plano gratuito.',
  },
  padrao: {
    nome: 'Plano Padrão',
    preco: 'R$ 89/mês',
    descricao:
      'Plano para igrejas em crescimento, com checkout Stripe e recursos completos.',
  },
  premium: {
    nome: 'Plano Premium',
    preco: 'R$ 249/mês',
    descricao:
      'Gestão multi-igreja com recursos avançados e integrações premium em evolução.',
  },
}

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
      return createCheckoutSession({
        data: {
          plan: plano,
          email: currentUser?.email,
        },
      })
    },
    onSuccess: (result) => {
      window.location.href = result.url
    },
  })

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-24 text-white">
      <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-slate-900/60 p-10 text-center shadow-[0_24px_70px_rgba(2,6,23,0.45)]">
        <p className="inline-flex rounded-full border border-amber-300/30 bg-amber-300/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-amber-200">
          Assinaturas
        </p>

        <h1 className="mt-5 text-4xl font-semibold" style={{ fontFamily: '"Playfair Display", serif' }}>
          {data.nome}
        </h1>

        <p className="mt-2 text-xl text-amber-200">{data.preco}</p>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-300">{data.descricao}</p>

        {search.checkout === 'success' && (
          <p className="mx-auto mt-4 max-w-2xl rounded-lg border border-emerald-300/35 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-100">
            Checkout concluído com sucesso. Entre ou crie sua conta para finalizar o acesso ao dashboard.
          </p>
        )}

        {search.checkout === 'cancelled' && (
          <p className="mx-auto mt-4 max-w-2xl rounded-lg border border-amber-300/35 bg-amber-500/10 px-4 py-3 text-xs text-amber-100">
            Pagamento cancelado. Você pode tentar novamente quando quiser.
          </p>
        )}

        {checkoutMutation.isError && (
          <p className="mx-auto mt-4 max-w-2xl rounded-lg border border-rose-300/35 bg-rose-500/10 px-4 py-3 text-xs text-rose-100">
            Não foi possível iniciar o checkout agora. Verifique as chaves do Stripe e tente novamente.
          </p>
        )}

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {plano !== 'inicial' && (
            <button
              type="button"
              onClick={() => checkoutMutation.mutate()}
              disabled={checkoutMutation.isPending}
              className="rounded-lg bg-linear-to-r from-emerald-500 to-emerald-400 px-6 py-3 text-sm font-semibold text-slate-950 disabled:opacity-60"
            >
              {checkoutMutation.isPending ? 'Abrindo checkout...' : 'Pagar com Stripe'}
            </button>
          )}

          <Link
            to="/sign-up"
            search={{ redirect }}
            className="rounded-lg bg-linear-to-r from-amber-500 to-amber-400 px-6 py-3 text-sm font-semibold text-slate-900"
          >
            Criar conta e continuar
          </Link>

          <Link
            to="/sign-in"
            search={{ redirect }}
            className="rounded-lg border border-white/20 px-6 py-3 text-sm font-semibold text-white"
          >
            Já tenho conta
          </Link>
        </div>

        {plano !== 'inicial' && (
          <p className="mt-6 text-xs text-slate-400">
            Recomendação: para o Brasil, Stripe funciona bem para cartão e recorrência global. Se quiser Pix nativo,
            posso integrar Mercado Pago como alternativa.
          </p>
        )}
      </div>
    </main>
  )
}
