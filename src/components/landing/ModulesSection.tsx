import { useState } from 'react'
import {
  Heart,
  Gift,
  CreditCard,
  LayoutDashboard,
  FileText,
  Users,
} from 'lucide-react'

const modules = [
  {
    icon: LayoutDashboard,
    title: 'Painel Financeiro',
    color: '#E8CC7A',
    desc: 'Visão geral em tempo real das finanças da sua igreja com gráficos, KPIs e transações recentes.',
    bullets: [
      'Gráficos de receita vs despesa mensal',
      'Ranking dos maiores contribuintes',
      'Resumo de saldo por fundo',
      'Comparativo ano a ano',
    ],
    preview: 'painel',
  },
  {
    icon: Heart,
    title: 'Gestão de Dízimos',
    color: '#7CB9E8',
    desc: 'Registre, acompanhe e reconheça cada pagamento de dízimo com trilha de auditoria completa.',
    bullets: [
      'Vincule dízimos a perfis de membros',
      'Recibos e extratos de dízimos',
      'Acompanhamento de dízimos recorrentes',
      'Filtro por data e valor',
    ],
    preview: 'dízimos',
  },
  {
    icon: Gift,
    title: 'Controle de Ofertas',
    color: '#A78BFA',
    desc: 'Categorize ofertas por tipo — fundo de construção, missões, coletas especiais.',
    bullets: [
      'Categorias e campanhas de ofertas',
      'Lançamento em lote para ofertas dominicais',
      'Resumos por culto',
      'Atribuição ao doador',
    ],
    preview: 'ofertas',
  },
  {
    icon: CreditCard,
    title: 'Módulo de Despesas',
    color: '#F87171',
    desc: 'Registre e categorize todas as despesas da igreja com fluxos de aprovação.',
    bullets: [
      'Categorias e orçamentos de despesas',
      'Gestão de fornecedores',
      'Upload de comprovantes',
      'Análise de orçado vs realizado',
    ],
    preview: 'despesas',
  },
  {
    icon: Users,
    title: 'Diretório de Membros',
    color: '#34D399',
    desc: 'Mantenha um banco de dados completo de membros vinculado a todas as atividades financeiras.',
    bullets: [
      'Perfis de membros com fotos',
      'Histórico de contribuições por membro',
      'Agrupamento por contato e família',
      'Acompanhamento de status de membro',
    ],
    preview: 'membros',
  },
  {
    icon: FileText,
    title: 'Relatórios e Exportação',
    color: '#FB923C',
    desc: 'Gere relatórios financeiros prontos para diretoria em formato PDF ou Excel.',
    bullets: [
      'Extratos anuais de contribuições',
      'Relatórios mensais de receitas e despesas',
      'Relatórios por período personalizado',
      'Exportação em CSV, PDF e Excel',
    ],
    preview: 'relatórios',
  },
]

export function ModulesSection() {
  const [active, setActive] = useState(0)
  const mod = modules[active]

  return (
    <section
      id="modules"
      style={{
        background: 'linear-gradient(180deg, #080E23 0%, #0A1128 100%)',
        padding: '6rem 2rem',
      }}
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
              Módulos Principais
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
            Uma Plataforma, Todas as Funções
          </h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '300px 1fr',
            gap: 32,
            alignItems: 'start',
          }}
          className="modules-grid"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {modules.map((m, i) => (
              <button
                key={m.title}
                onClick={() => setActive(i)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '14px 16px',
                  borderRadius: 10,
                  border: 'none',
                  cursor: 'pointer',
                  background:
                    active === i ? 'rgba(201,168,76,0.1)' : 'transparent',
                  borderLeft: `3px solid ${active === i ? m.color : 'transparent'}`,
                  transition: 'all 0.2s',
                  textAlign: 'left',
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background:
                      active === i ? `${m.color}20` : 'rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <m.icon
                    size={16}
                    color={active === i ? m.color : 'rgba(255,255,255,0.4)'}
                  />
                </div>
                <span
                  style={{
                    fontFamily: 'Lato, sans-serif',
                    fontSize: 14,
                    fontWeight: active === i ? 700 : 400,
                    color: active === i ? '#FFFFFF' : 'rgba(255,255,255,0.45)',
                  }}
                >
                  {m.title}
                </span>
              </button>
            ))}
          </div>

          <div
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16,
              padding: '2.5rem',
              minHeight: 380,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: `${mod.color}18`,
                  border: `1px solid ${mod.color}30`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <mod.icon size={24} color={mod.color} />
              </div>
              <div>
                <h3
                  style={{
                    fontFamily: 'Playfair Display, serif',
                    fontSize: 22,
                    fontWeight: 700,
                    color: '#FFFFFF',
                    marginBottom: 4,
                  }}
                >
                  {mod.title}
                </h3>
                <p
                  style={{
                    color: 'rgba(255,255,255,0.5)',
                    fontSize: 14,
                    fontFamily: 'Lato, sans-serif',
                  }}
                >
                  {mod.desc}
                </p>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 12,
              }}
            >
              {mod.bullets.map((b) => (
                <div
                  key={b}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '12px 14px',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: 8,
                    border: '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: mod.color,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      color: 'rgba(255,255,255,0.7)',
                      fontSize: 13,
                      fontFamily: 'Lato, sans-serif',
                    }}
                  >
                    {b}
                  </span>
                </div>
              ))}
            </div>

            <ModulePreview type={mod.preview} color={mod.color} />
          </div>
        </div>
      </div>
    </section>
  )
}

function ModulePreview({ type, color }: { type: string; color: string }) {
  const rows = [
    {
      name: 'Carlos Oliveira',
      amount: 'R$520',
      date: '01/12',
      status: 'Confirmado',
    },
    {
      name: 'Ana Paula Santos',
      amount: 'R$300',
      date: '01/12',
      status: 'Confirmado',
    },
    {
      name: 'João Pedro Lima',
      amount: 'R$750',
      date: '24/11',
      status: 'Pendente',
    },
    {
      name: 'Maria Fernanda Costa',
      amount: 'R$200',
      date: '24/11',
      status: 'Confirmado',
    },
  ]

  return (
    <div
      style={{
        marginTop: 24,
        background: 'rgba(0,0,0,0.2)',
        borderRadius: 10,
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '10px 14px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(255,255,255,0.02)',
        }}
      >
        <span
          style={{
            color: 'rgba(255,255,255,0.3)',
            fontSize: 11,
            fontFamily: 'Lato, sans-serif',
            letterSpacing: 0.8,
            textTransform: 'uppercase',
          }}
        >
          {type} recentes
        </span>
        <span
          style={{
            color: color,
            fontSize: 11,
            fontFamily: 'Lato, sans-serif',
            cursor: 'pointer',
          }}
        >
          Ver Todos →
        </span>
      </div>
      {rows.map((r) => (
        <div
          key={r.name}
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto auto auto',
            gap: 16,
            padding: '9px 14px',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              color: 'rgba(255,255,255,0.65)',
              fontSize: 12,
              fontFamily: 'Lato, sans-serif',
            }}
          >
            {r.name}
          </span>
          <span
            style={{
              color: color,
              fontSize: 12,
              fontWeight: 600,
              fontFamily: 'Lato, sans-serif',
            }}
          >
            {r.amount}
          </span>
          <span
            style={{
              color: 'rgba(255,255,255,0.3)',
              fontSize: 11,
              fontFamily: 'Lato, sans-serif',
            }}
          >
            {r.date}
          </span>
          <span
            style={{
              color: r.status === 'Confirmado' ? '#4ADE80' : '#FBBF24',
              fontSize: 10,
              fontFamily: 'Lato, sans-serif',
              background:
                r.status === 'Confirmado'
                  ? 'rgba(74,222,128,0.1)'
                  : 'rgba(251,191,36,0.1)',
              padding: '2px 8px',
              borderRadius: 100,
            }}
          >
            {r.status}
          </span>
        </div>
      ))}
    </div>
  )
}
