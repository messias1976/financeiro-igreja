import { ShieldCheck, BarChart3, Users, Globe, Lock, Zap } from 'lucide-react'

const features = [
  {
    icon: ShieldCheck,
    title: 'Segurança Bancária',
    desc: 'Autenticação JWT, sessões criptografadas e controle de acesso por função protegem cada registro.',
  },
  {
    icon: BarChart3,
    title: 'Relatórios em Tempo Real',
    desc: 'Gere relatórios em PDF e Excel para dízimos, ofertas e despesas filtrados por período.',
  },
  {
    icon: Users,
    title: 'Gestão de Membros',
    desc: 'Diretório completo de membros com histórico de contribuições, contatos e frequência por igreja.',
  },
  {
    icon: Globe,
    title: 'Multi-Tenant Pronto',
    desc: 'Cada igreja tem seu ambiente de dados isolado. Escale com segurança de 1 a 1.000 igrejas.',
  },
  {
    icon: Lock,
    title: 'Acesso por Função',
    desc: 'Atribua funções de Pastor, Tesoureiro ou Contador com controles de permissão detalhados.',
  },
  {
    icon: Zap,
    title: 'API Extremamente Rápida',
    desc: 'API REST em PHP com MySQL em hospedagem compartilhada — sem infraestrutura cara na nuvem.',
  },
]

export function FeaturesSection() {
  return (
    <section
      id="features"
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
              Por que financialChurch
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
            Tudo o que Sua Igreja Precisa
          </h2>
          <p
            style={{
              color: 'rgba(255,255,255,0.55)',
              fontSize: 16,
              fontFamily: 'Lato, sans-serif',
              maxWidth: 560,
              margin: '0 auto',
              lineHeight: 1.7,
            }}
          >
            Desenvolvido especialmente para comunidades de fé — sem softwares
            empresariais inflados, sem planilhas confusas.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 24,
          }}
        >
          {features.map((f, i) => (
            <div
              key={f.title}
              className="feature-card"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 16,
                padding: '2rem',
                transition:
                  'border-color 0.3s, transform 0.3s, background 0.3s',
                cursor: 'default',
                animationDelay: `${i * 0.1}s`,
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
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: 'rgba(201,168,76,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                }}
              >
                <f.icon size={22} color="#C9A84C" />
              </div>
              <h3
                style={{
                  fontFamily: 'Playfair Display, serif',
                  fontSize: 18,
                  fontWeight: 700,
                  color: '#FFFFFF',
                  marginBottom: 8,
                }}
              >
                {f.title}
              </h3>
              <p
                style={{
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: 14,
                  lineHeight: 1.7,
                  fontFamily: 'Lato, sans-serif',
                }}
              >
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
