import { Footer } from './Footer'
import { FeaturesSection } from './FeaturesSection'
import { HeroSection } from './HeroSection'
import { ModulesSection } from './ModulesSection'
import { NavBar } from './NavBar'
import { PricingSection } from './PricingSection'
import { Building2, HandCoins, FileBarChart2 } from 'lucide-react'

const highlightStats = [
  {
    value: '750+',
    label: 'Igrejas conectadas',
    detail: 'Compartilham dízimos e campanhas via painel seguro.',
    icon: Building2,
    badge: 'Multi-igreja',
  },
  {
    value: 'R$ 9,4M',
    label: 'Contribuições processadas',
    detail: 'Pix, cartão e dinheiro com rastreio completo.',
    icon: HandCoins,
    badge: 'Fluxo contínuo',
  },
  {
    value: '24h',
    label: 'Relatórios prontos',
    detail: 'Mensal, anual e entradas/saídas em PDF e Excel.',
    icon: FileBarChart2,
    badge: 'Gestão ágil',
  },
]

const campaignSpotlight = [
  {
    title: 'Reforma do templo',
    goal: 'R$ 60.000',
    progress: 72,
    tag: 'Campanha ativa',
  },
  {
    title: 'Missões do Nordeste',
    goal: 'R$ 28.000',
    progress: 45,
    tag: 'Compartilhe com a comunidade',
  },
]

export function LandingPage() {
  return (
    <div className="church-root bg-slate-950 text-white">
      <NavBar />
      <HeroSection />

      <FeaturesSection />

      <ModulesSection />

      <section
        style={{
          background: 'linear-gradient(180deg, #0A1128 0%, #080E23 100%)',
          padding: '6rem 2rem',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
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
                Impacto em números
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
              Uma base financeira sólida para sua comunidade
            </h2>
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
              O mesmo padrão visual e operacional presente no produto inteiro,
              com foco em transparência e prestação de contas.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 24,
              marginBottom: 28,
            }}
          >
            {highlightStats.map((stat) => (
              <div
                key={stat.label}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 16,
                  padding: '1.8rem',
                  transition: 'border-color 0.3s, transform 0.3s, background 0.3s',
                  cursor: 'default',
                }}
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
                <div
                  style={{
                    marginBottom: 18,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: 'rgba(201,168,76,0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <stat.icon size={18} color="#C9A84C" />
                  </div>
                  <span
                    style={{
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: 999,
                      padding: '4px 10px',
                      fontSize: 10,
                      color: 'rgba(255,255,255,0.6)',
                      textTransform: 'uppercase',
                      letterSpacing: 1,
                      fontWeight: 600,
                      fontFamily: 'Lato, sans-serif',
                    }}
                  >
                    {stat.badge}
                  </span>
                </div>
                <p
                  style={{
                    fontFamily: 'Playfair Display, serif',
                    fontSize: 36,
                    fontWeight: 700,
                    color: '#E8CC7A',
                    marginBottom: 6,
                  }}
                >
                  {stat.value}
                </p>
                <p
                  style={{
                    color: 'rgba(255,255,255,0.45)',
                    fontSize: 12,
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                    fontWeight: 600,
                    fontFamily: 'Lato, sans-serif',
                    marginBottom: 10,
                  }}
                >
                  {stat.label}
                </p>
                <p
                  style={{
                    color: 'rgba(255,255,255,0.6)',
                    fontSize: 14,
                    lineHeight: 1.7,
                    fontFamily: 'Lato, sans-serif',
                  }}
                >
                  {stat.detail}
                </p>
              </div>
            ))}
          </div>

          <div
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 16,
              padding: '2.2rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 24,
              }}
              className="lg:flex-row lg:items-center lg:justify-between"
            >
              <div style={{ textAlign: 'left' }}>
                <p
                  style={{
                    color: 'rgba(255,255,255,0.45)',
                    fontSize: 12,
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                    fontFamily: 'Lato, sans-serif',
                    fontWeight: 700,
                    marginBottom: 10,
                  }}
                >
                  Campanhas que inspiram
                </p>
                <h3
                  style={{
                    fontFamily: 'Playfair Display, serif',
                    fontSize: 'clamp(1.5rem, 3vw, 2.1rem)',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    marginBottom: 10,
                  }}
                >
                  Meta, progresso e transparência em um único lugar.
                </h3>
                <p
                  style={{
                    maxWidth: 580,
                    color: 'rgba(255,255,255,0.6)',
                    fontSize: 14,
                    lineHeight: 1.8,
                    fontFamily: 'Lato, sans-serif',
                  }}
                >
                  Conecte membros aos objetivos da igreja, compartilhe barras de
                  progresso e mantenha o tesoureiro informado via notificações e
                  relatórios automáticos.
                </p>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: 14,
                  width: '100%',
                  maxWidth: 520,
                }}
              >
                {campaignSpotlight.map((camp) => (
                  <div
                    key={camp.title}
                    style={{
                      borderRadius: 12,
                      border: '1px solid rgba(255,255,255,0.1)',
                      background: 'rgba(255,255,255,0.04)',
                      padding: '0.9rem',
                    }}
                  >
                    <p
                      style={{
                        color: 'rgba(255,255,255,0.6)',
                        fontSize: 12,
                        fontFamily: 'Lato, sans-serif',
                      }}
                    >
                      {camp.tag}
                    </p>
                    <p
                      style={{
                        marginTop: 8,
                        color: '#FFFFFF',
                        fontSize: 16,
                        fontWeight: 700,
                        fontFamily: 'Lato, sans-serif',
                      }}
                    >
                      {camp.title}
                    </p>
                    <div
                      style={{
                        marginTop: 10,
                        height: 8,
                        borderRadius: 999,
                        background: 'rgba(255,255,255,0.1)',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          borderRadius: 999,
                          background: 'linear-gradient(90deg, #F59E0B 0%, #10B981 100%)',
                          width: `${camp.progress}%`,
                        }}
                      />
                    </div>
                    <p
                      style={{
                        marginTop: 8,
                        color: 'rgba(255,255,255,0.5)',
                        fontSize: 12,
                        fontFamily: 'Lato, sans-serif',
                      }}
                    >
                      Meta {camp.goal} • {camp.progress}%
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <PricingSection />

      <section
        id="docs"
        style={{
          background: 'linear-gradient(180deg, #080E23 0%, #060B1A 100%)',
          padding: '6rem 2rem',
          borderTop: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 16,
              padding: '2.6rem 2rem',
              textAlign: 'center',
            }}
          >
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
                Próximo passo
              </span>
            </div>

            <h2
              style={{
                fontFamily: 'Playfair Display, serif',
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontWeight: 700,
                color: '#FFFFFF',
                marginBottom: 14,
              }}
            >
              Pronto para manter o fluxo financeiro organizado?
            </h2>

            <p
              style={{
                color: 'rgba(255,255,255,0.55)',
                fontSize: 16,
                fontFamily: 'Lato, sans-serif',
                maxWidth: 680,
                margin: '0 auto',
                lineHeight: 1.7,
              }}
            >
              Experimente o dashboard completo sem custo por 14 dias e veja como
              dízimos, ofertas e despesas ficam sincronizados envolvendo toda a
              liderança.
            </p>

            <div
              style={{
                marginTop: 30,
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: 12,
              }}
            >
              <a
                href="#pricing"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, #C9A84C, #E8CC7A)',
                  color: '#0F1729',
                  padding: '12px 26px',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 700,
                  textDecoration: 'none',
                  letterSpacing: 0.4,
                  fontFamily: 'Lato, sans-serif',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  boxShadow: '0 8px 24px rgba(201,168,76,0.25)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow =
                    '0 14px 28px rgba(201,168,76,0.35)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none'
                  e.currentTarget.style.boxShadow =
                    '0 8px 24px rgba(201,168,76,0.25)'
                }}
              >
                Iniciar teste gratuito
              </a>
              <a
                href="mailto:contato@igreja.com"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'rgba(255,255,255,0.9)',
                  padding: '12px 26px',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  textDecoration: 'none',
                  letterSpacing: 0.4,
                  fontFamily: 'Lato, sans-serif',
                  border: '1px solid rgba(255,255,255,0.2)',
                  transition: 'border-color 0.2s, color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(201,168,76,0.45)'
                  e.currentTarget.style.color = '#E8CC7A'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
                  e.currentTarget.style.color = 'rgba(255,255,255,0.9)'
                }}
              >
                Falar com suporte
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
