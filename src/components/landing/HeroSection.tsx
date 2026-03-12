import { useEffect, useRef } from 'react'
import { ArrowRight, ShieldCheck, TrendingUp } from 'lucide-react'

export function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const particles: {
      x: number
      y: number
      r: number
      vx: number
      vy: number
      alpha: number
    }[] = []
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.5,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        alpha: Math.random() * 0.4 + 0.1,
      })
    }

    let raf: number
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(201,168,76,${p.alpha})`
        ctx.fill()
      }
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(201,168,76,${0.06 * (1 - dist / 120)})`
            ctx.stroke()
          }
        }
      }
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <section
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        background:
          'linear-gradient(160deg, #080E23 0%, #0F1729 50%, #111E3A 100%)',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          opacity: 0.7,
        }}
      />

      {/* Orbe dourado decorativo */}
      <div
        style={{
          position: 'absolute',
          top: '15%',
          right: '8%',
          width: 480,
          height: 480,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '10%',
          left: '5%',
          width: 320,
          height: 320,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'relative',
          maxWidth: 1200,
          margin: '0 auto',
          padding: '8rem 2rem 6rem',
          width: '100%',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '4rem',
            alignItems: 'center',
          }}
          className="hero-grid"
        >
          <div style={{ animation: 'fadeInUp 0.8s ease forwards' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(201,168,76,0.12)',
                border: '1px solid rgba(201,168,76,0.3)',
                borderRadius: 100,
                padding: '6px 16px',
                marginBottom: 28,
              }}
            >
              <ShieldCheck size={14} color="#C9A84C" />
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
                Confiado por mais de 500 igrejas
              </span>
            </div>

            <h1
              style={{
                fontFamily: 'Playfair Display, serif',
                fontSize: 'clamp(2.6rem, 5vw, 4.2rem)',
                fontWeight: 700,
                color: '#FFFFFF',
                lineHeight: 1.15,
                marginBottom: 24,
                letterSpacing: -0.5,
              }}
            >
              Administre as Finanças
              <span style={{ display: 'block', color: '#E8CC7A' }}>
                da Sua Igreja com Fé
              </span>
            </h1>

            <p
              style={{
                color: 'rgba(255,255,255,0.65)',
                fontSize: 17,
                lineHeight: 1.75,
                marginBottom: 40,
                fontFamily: 'Lato, sans-serif',
                maxWidth: 480,
              }}
            >
              Uma plataforma SaaS multi-tenant completa para registrar dízimos,
              ofertas, despesas e gerar relatórios financeiros detalhados —
              desenvolvida especialmente para comunidades de fé.
            </p>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <a
                href="/assinaturas?plano=inicial"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'linear-gradient(135deg, #C9A84C, #E8CC7A)',
                  color: '#0F1729',
                  padding: '14px 32px',
                  borderRadius: 8,
                  fontSize: 15,
                  fontWeight: 700,
                  textDecoration: 'none',
                  fontFamily: 'Lato, sans-serif',
                  boxShadow: '0 8px 32px rgba(201,168,76,0.35)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow =
                    '0 12px 40px rgba(201,168,76,0.45)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none'
                  e.currentTarget.style.boxShadow =
                    '0 8px 32px rgba(201,168,76,0.35)'
                }}
              >
                Começar Grátis <ArrowRight size={16} />
              </a>
              <a
                href="#features"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'transparent',
                  color: 'rgba(255,255,255,0.85)',
                  padding: '14px 32px',
                  borderRadius: 8,
                  fontSize: 15,
                  fontWeight: 600,
                  textDecoration: 'none',
                  fontFamily: 'Lato, sans-serif',
                  border: '1px solid rgba(255,255,255,0.2)',
                  transition: 'border-color 0.2s, color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(201,168,76,0.5)'
                  e.currentTarget.style.color = '#E8CC7A'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
                  e.currentTarget.style.color = 'rgba(255,255,255,0.85)'
                }}
              >
                Ver Demonstração
              </a>
            </div>

            <div
              style={{
                display: 'flex',
                gap: 32,
                marginTop: 48,
                paddingTop: 32,
                borderTop: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {[
                { v: 'R$ 2,4M+', l: 'Dízimos Registrados' },
                { v: '1.200+', l: 'Membros Gerenciados' },
                { v: '99,9%', l: 'Disponibilidade' },
              ].map((s) => (
                <div key={s.l}>
                  <div
                    style={{
                      fontFamily: 'Playfair Display, serif',
                      fontSize: 26,
                      fontWeight: 700,
                      color: '#E8CC7A',
                    }}
                  >
                    {s.v}
                  </div>
                  <div
                    style={{
                      color: 'rgba(255,255,255,0.45)',
                      fontSize: 12,
                      fontFamily: 'Lato, sans-serif',
                      marginTop: 2,
                    }}
                  >
                    {s.l}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card de prévia do painel */}
          <div style={{ animation: 'fadeInUp 0.8s ease 0.2s both' }}>
            <DashboardPreview />
          </div>
        </div>
      </div>
    </section>
  )
}

function DashboardPreview() {
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun']
  const values = [42, 68, 55, 80, 63, 91]
  const max = Math.max(...values)

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(201,168,76,0.2)',
        borderRadius: 16,
        padding: '1.5rem',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 32px 80px rgba(0,0,0,0.4)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
        }}
      >
        <div>
          <div
            style={{
              color: 'rgba(255,255,255,0.45)',
              fontSize: 11,
              fontFamily: 'Lato, sans-serif',
              letterSpacing: 1,
              textTransform: 'uppercase',
              marginBottom: 4,
            }}
          >
            Total Recebido — 2024
          </div>
          <div
            style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: 30,
              fontWeight: 700,
              color: '#E8CC7A',
            }}
          >
            R$ 184.320
          </div>
        </div>
        <div
          style={{
            background: 'rgba(201,168,76,0.12)',
            border: '1px solid rgba(201,168,76,0.2)',
            borderRadius: 8,
            padding: '6px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <TrendingUp size={14} color="#4ADE80" />
          <span
            style={{
              color: '#4ADE80',
              fontSize: 13,
              fontFamily: 'Lato, sans-serif',
              fontWeight: 600,
            }}
          >
            +18,4%
          </span>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 8,
          height: 120,
          marginBottom: 8,
        }}
      >
        {values.map((v, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <div
              style={{
                width: '100%',
                height: `${(v / max) * 100}%`,
                background:
                  i === 5
                    ? 'linear-gradient(to top, #C9A84C, #E8CC7A)'
                    : 'rgba(201,168,76,0.25)',
                borderRadius: '4px 4px 0 0',
                transition: 'height 0.4s ease',
              }}
            />
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {months.map((m, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              textAlign: 'center',
              color: 'rgba(255,255,255,0.3)',
              fontSize: 10,
              fontFamily: 'Lato, sans-serif',
            }}
          >
            {m}
          </div>
        ))}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 12,
          marginTop: 20,
        }}
      >
        {[
          { label: 'Dízimos', value: 'R$ 98.450', color: '#E8CC7A' },
          { label: 'Ofertas', value: 'R$ 52.180', color: '#7CB9E8' },
          { label: 'Despesas', value: 'R$ 34.220', color: '#F87171' },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              background: 'rgba(255,255,255,0.03)',
              borderRadius: 8,
              padding: '10px 12px',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: item.color,
                marginBottom: 6,
              }}
            />
            <div
              style={{
                color: 'rgba(255,255,255,0.45)',
                fontSize: 10,
                fontFamily: 'Lato, sans-serif',
                marginBottom: 3,
              }}
            >
              {item.label}
            </div>
            <div
              style={{
                color: '#fff',
                fontSize: 13,
                fontWeight: 600,
                fontFamily: 'Lato, sans-serif',
              }}
            >
              {item.value}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 20,
          padding: '12px 0',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div
          style={{
            color: 'rgba(255,255,255,0.35)',
            fontSize: 11,
            fontFamily: 'Lato, sans-serif',
            marginBottom: 10,
            letterSpacing: 0.5,
          }}
        >
          TRANSAÇÕES RECENTES
        </div>
        {[
          {
            name: 'Dízimo Domingo — Irmão Carlos Silva',
            amt: '+R$420',
            t: '2h atrás',
          },
          {
            name: 'Oferta Fundo de Construção',
            amt: '+R$1.200',
            t: '5h atrás',
          },
          { name: 'Despesa de Utilidades', amt: '-R$380', t: '1d atrás' },
        ].map((tx) => (
          <div
            key={tx.name}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '7px 0',
              borderBottom: '1px solid rgba(255,255,255,0.04)',
            }}
          >
            <span
              style={{
                color: 'rgba(255,255,255,0.6)',
                fontSize: 11,
                fontFamily: 'Lato, sans-serif',
              }}
            >
              {tx.name}
            </span>
            <div style={{ textAlign: 'right' }}>
              <div
                style={{
                  color: tx.amt.startsWith('+') ? '#4ADE80' : '#F87171',
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: 'Lato, sans-serif',
                }}
              >
                {tx.amt}
              </div>
              <div
                style={{
                  color: 'rgba(255,255,255,0.25)',
                  fontSize: 10,
                  fontFamily: 'Lato, sans-serif',
                }}
              >
                {tx.t}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
