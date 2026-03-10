import { Check, Zap } from 'lucide-react'

const plans = [
  {
    name: 'Inicial',
    price: 'Grátis',
    sub: 'Para sempre',
    desc: 'Ideal para pequenas congregações que estão começando.',
    features: [
      'Até 50 membros',
      'Registro de dízimos e ofertas',
      'Painel básico',
      'Exportação CSV',
      'Suporte por e-mail',
    ],
    cta: 'Começar Gratuitamente',
    highlight: false,
  },
  {
    name: 'Paróquia',
    price: 'R$ 89',
    sub: '/mês',
    desc: 'Para igrejas em crescimento que precisam de controle financeiro completo.',
    features: [
      'Membros ilimitados',
      'Todos os 6 módulos principais',
      'Relatórios em PDF e Excel',
      'Acesso por função',
      'Suporte prioritário',
      'Logo e identidade visual personalizados',
      'Acesso à API',
    ],
    cta: 'Testar por 14 Dias',
    highlight: true,
  },
  {
    name: 'Diocese',
    price: 'R$ 249',
    sub: '/mês',
    desc: 'Gestão multi-igreja para redes denominacionais.',
    features: [
      'Múltiplas filiais de igrejas',
      'Relatórios consolidados',
      'Onboarding dedicado',
      'Integrações personalizadas',
      'Garantia de SLA',
      'Análises avançadas',
      'Opção white-label',
    ],
    cta: 'Falar com Vendas',
    highlight: false,
  },
]

export function PricingSection() {
  return (
    <section
      id="pricing"
      style={{ background: '#080E23', padding: '6rem 2rem' }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
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
              Preços Simples
            </span>
          </div>
          <h2
            style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 700,
              color: '#FFFFFF',
              marginBottom: 16,
            }}
          >
            Preços Transparentes e Justos
          </h2>
          <p
            style={{
              color: 'rgba(255,255,255,0.55)',
              fontSize: 16,
              fontFamily: 'Lato, sans-serif',
              maxWidth: 480,
              margin: '0 auto',
              lineHeight: 1.7,
            }}
          >
            Sem taxas ocultas. Cancele a qualquer momento. Servindo igrejas de
            todos os tamanhos.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 24,
          }}
        >
          {plans.map((plan) => (
            <div
              key={plan.name}
              style={{
                position: 'relative',
                background: plan.highlight
                  ? 'linear-gradient(160deg, rgba(201,168,76,0.1) 0%, rgba(201,168,76,0.04) 100%)'
                  : 'rgba(255,255,255,0.03)',
                border: `1px solid ${
                  plan.highlight
                    ? 'rgba(201,168,76,0.45)'
                    : 'rgba(255,255,255,0.07)'
                }`,
                borderRadius: 20,
                padding: '2.5rem 2rem',
                transition: 'transform 0.3s, box-shadow 0.3s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)'
                e.currentTarget.style.boxShadow = plan.highlight
                  ? '0 24px 60px rgba(201,168,76,0.2)'
                  : '0 16px 40px rgba(0,0,0,0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              {plan.highlight && (
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
                    padding: '4px 16px',
                    borderRadius: 100,
                    fontFamily: 'Lato, sans-serif',
                    letterSpacing: 0.8,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Zap size={11} /> MAIS POPULAR
                </div>
              )}
              <div style={{ marginBottom: 8 }}>
                <span
                  style={{
                    fontFamily: 'Lato, sans-serif',
                    fontSize: 13,
                    fontWeight: 600,
                    color: plan.highlight ? '#E8CC7A' : 'rgba(255,255,255,0.5)',
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                  }}
                >
                  {plan.name}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 4,
                  marginBottom: 8,
                }}
              >
                <span
                  style={{
                    fontFamily: 'Playfair Display, serif',
                    fontSize: 42,
                    fontWeight: 700,
                    color: '#FFFFFF',
                  }}
                >
                  {plan.price}
                </span>
                <span
                  style={{
                    color: 'rgba(255,255,255,0.4)',
                    fontSize: 14,
                    fontFamily: 'Lato, sans-serif',
                  }}
                >
                  {plan.sub}
                </span>
              </div>
              <p
                style={{
                  color: 'rgba(255,255,255,0.45)',
                  fontSize: 14,
                  fontFamily: 'Lato, sans-serif',
                  marginBottom: 28,
                  lineHeight: 1.6,
                }}
              >
                {plan.desc}
              </p>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  marginBottom: 32,
                }}
              >
                {plan.features.map((f) => (
                  <div
                    key={f}
                    style={{ display: 'flex', alignItems: 'center', gap: 10 }}
                  >
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: '50%',
                        background: plan.highlight
                          ? 'rgba(201,168,76,0.2)'
                          : 'rgba(255,255,255,0.06)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Check
                        size={11}
                        color={
                          plan.highlight ? '#E8CC7A' : 'rgba(255,255,255,0.4)'
                        }
                      />
                    </div>
                    <span
                      style={{
                        color: 'rgba(255,255,255,0.65)',
                        fontSize: 13,
                        fontFamily: 'Lato, sans-serif',
                      }}
                    >
                      {f}
                    </span>
                  </div>
                ))}
              </div>

              <button
                style={{
                  width: '100%',
                  padding: '13px 0',
                  borderRadius: 8,
                  border: plan.highlight
                    ? 'none'
                    : '1px solid rgba(255,255,255,0.15)',
                  background: plan.highlight
                    ? 'linear-gradient(135deg, #C9A84C, #E8CC7A)'
                    : 'transparent',
                  color: plan.highlight ? '#0F1729' : 'rgba(255,255,255,0.7)',
                  fontSize: 14,
                  fontWeight: 700,
                  fontFamily: 'Lato, sans-serif',
                  cursor: 'pointer',
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.85'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1'
                }}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
