import { createServerFn } from '@tanstack/react-start'
import { setResponseStatus, getRequestHeader } from '@tanstack/react-start/server'
import { z } from 'zod'
import Stripe from 'stripe'

const planInputSchema = z.object({
  plan: z.enum(['padrao', 'premium', 'paroquia', 'diocese']),
  email: z.string().email().optional(),
})

function normalizePlan(plan: z.infer<typeof planInputSchema>['plan']) {
  if (plan === 'paroquia') {
    return 'padrao' as const
  }

  if (plan === 'diocese') {
    return 'premium' as const
  }

  return plan
}

function getPriceId(plan: 'padrao' | 'premium') {
  const legacyPriceId =
    plan === 'padrao'
      ? process.env.STRIPE_PRICE_PAROQUIA
      : process.env.STRIPE_PRICE_DIOCESE

  const currentPriceId =
    plan === 'padrao'
      ? process.env.STRIPE_PRICE_PADRAO
      : process.env.STRIPE_PRICE_PREMIUM

  return currentPriceId || legacyPriceId
}

export const createCheckoutSessionFn = createServerFn({ method: 'POST' })
  .inputValidator(planInputSchema)
  .handler(async ({ data }) => {
    const secretKey = process.env.STRIPE_SECRET_KEY

    if (!secretKey) {
      setResponseStatus(500)
      throw {
        message: 'STRIPE_SECRET_KEY não configurada no servidor',
        status: 500,
      }
    }

    const normalizedPlan = normalizePlan(data.plan)
    const priceId = getPriceId(normalizedPlan)

    if (!priceId) {
      setResponseStatus(500)
      throw {
        message: `Price ID do plano ${normalizedPlan} não configurado`,
        status: 500,
      }
    }

    const stripe = new Stripe(secretKey)

    const origin =
      getRequestHeader('origin') ||
      process.env.APP_URL ||
      'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: data.email,
      success_url: `${origin}/assinaturas?plano=${normalizedPlan}&checkout=success`,
      cancel_url: `${origin}/assinaturas?plano=${normalizedPlan}&checkout=cancelled`,
      metadata: {
        plano: normalizedPlan,
      },
      locale: 'pt-BR',
      allow_promotion_codes: true,
    })

    if (!session.url) {
      setResponseStatus(500)
      throw {
        message: 'Não foi possível gerar URL de checkout',
        status: 500,
      }
    }

    return {
      url: session.url,
      plan: normalizedPlan,
    }
  })
