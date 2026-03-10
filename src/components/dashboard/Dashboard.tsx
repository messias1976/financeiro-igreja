import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { GerenciarUsuarios } from './GerenciarUsuarios'

type Tab =
  | 'visao-geral'
  | 'usuarios'
  | 'membros'
  | 'diezmos'
  | 'ofertas'
  | 'despesas'

const NAV_ITEMS: Array<{ id: Tab; icon: string; label: string }> = [
  { id: 'visao-geral', icon: '📊', label: 'Visão Geral' },
  { id: 'usuarios', icon: '👥', label: 'Usuários' },
  { id: 'membros', icon: '🙏', label: 'Membros' },
  { id: 'diezmos', icon: '💰', label: 'Dízimos' },
  { id: 'ofertas', icon: '🎁', label: 'Ofertas' },
  { id: 'despesas', icon: '📋', label: 'Despesas' },
]

const SUMMARY_CARDS = [
  {
    label: 'Total Dízimos',
    value: 'R$ 12.480,00',
    icon: '💰',
    trend: '+8%',
    trendUp: true,
    color: '#D4AF37',
  },
  {
    label: 'Total Ofertas',
    value: 'R$ 4.320,00',
    icon: '🎁',
    trend: '+12%',
    trendUp: true,
    color: '#4ADE80',
  },
  {
    label: 'Despesas',
    value: 'R$ 3.150,00',
    icon: '📋',
    trend: '-3%',
    trendUp: false,
    color: '#F87171',
  },
  {
    label: 'Saldo Mensal',
    value: 'R$ 13.650,00',
    icon: '📈',
    trend: '+15%',
    trendUp: true,
    color: '#818CF8',
  },
]

const RECENT_TRANSACTIONS = [
  {
    name: 'João da Silva',
    type: 'Dízimo',
    amount: 'R$ 580,00',
    date: '10/03/2026',
    icon: '💰',
    color: '#D4AF37',
  },
  {
    name: 'Maria Oliveira',
    type: 'Oferta',
    amount: 'R$ 200,00',
    date: '10/03/2026',
    icon: '🎁',
    color: '#4ADE80',
  },
  {
    name: 'Conta de Luz',
    type: 'Despesa',
    amount: 'R$ 450,00',
    date: '09/03/2026',
    icon: '📋',
    color: '#F87171',
  },
  {
    name: 'Carlos Pereira',
    type: 'Dízimo',
    amount: 'R$ 750,00',
    date: '08/03/2026',
    icon: '💰',
    color: '#D4AF37',
  },
  {
    name: 'Ana Costa',
    type: 'Oferta',
    amount: 'R$ 150,00',
    date: '07/03/2026',
    icon: '🎁',
    color: '#4ADE80',
  },
]

export function Dashboard() {
  const { currentUser, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('visao-geral')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const role = (currentUser?.prefs as Record<string, string>)?.role ?? 'usuário'

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: '#060C1E',
        fontFamily: "'Lato', sans-serif",
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: sidebarOpen ? 260 : 72,
          background: 'linear-gradient(180deg, #0A1228 0%, #080E23 100%)',
          borderRight: '1px solid rgba(212,175,55,0.12)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.3s ease',
          flexShrink: 0,
          position: 'relative',
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: '24px 16px 20px',
            borderBottom: '1px solid rgba(212,175,55,0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                flexShrink: 0,
                background: 'linear-gradient(135deg, #D4AF37, #B8962E)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                fontWeight: 900,
                color: '#080E23',
              }}
            >
              ✝
            </div>
            {sidebarOpen && (
              <div>
                <div
                  style={{
                    color: '#D4AF37',
                    fontFamily: "'Playfair Display', serif",
                    fontWeight: 700,
                    fontSize: 15,
                    lineHeight: 1,
                  }}
                >
                  SanctuaryBooks
                </div>
                <div style={{ color: '#8A92A6', fontSize: 11, marginTop: 2 }}>
                  Gestão Financeira
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Nav Items */}
        <nav style={{ padding: '16px 8px', flex: 1 }}>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '11px 12px',
                borderRadius: 10,
                background:
                  activeTab === item.id
                    ? 'rgba(212,175,55,0.12)'
                    : 'transparent',
                border:
                  activeTab === item.id
                    ? '1px solid rgba(212,175,55,0.25)'
                    : '1px solid transparent',
                color: activeTab === item.id ? '#D4AF37' : '#8A92A6',
                fontSize: 14,
                fontWeight: activeTab === item.id ? 700 : 400,
                cursor: 'pointer',
                marginBottom: 4,
                textAlign: 'left',
                transition: 'all 0.2s',
              }}
            >
              <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* User Info */}
        <div
          style={{
            padding: 12,
            borderTop: '1px solid rgba(212,175,55,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              flexShrink: 0,
              background: 'linear-gradient(135deg, #1A2445, #0D1533)',
              border: '1.5px solid rgba(212,175,55,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#D4AF37',
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            {currentUser?.name?.[0]?.toUpperCase() ??
              currentUser?.email?.[0]?.toUpperCase() ??
              '?'}
          </div>
          {sidebarOpen && (
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div
                style={{
                  color: '#F1E6C8',
                  fontSize: 13,
                  fontWeight: 600,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {currentUser?.name || currentUser?.email}
              </div>
              <div
                style={{
                  color: '#8A92A6',
                  fontSize: 11,
                  textTransform: 'capitalize',
                }}
              >
                {role}
              </div>
            </div>
          )}
          {sidebarOpen && (
            <button
              onClick={signOut}
              title="Sair"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#8A92A6',
                cursor: 'pointer',
                fontSize: 16,
                padding: 4,
              }}
            >
              ⏻
            </button>
          )}
        </div>

        {/* Toggle sidebar */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            position: 'absolute',
            top: 20,
            right: -12,
            width: 24,
            height: 24,
            borderRadius: '50%',
            background: '#0D1533',
            border: '1.5px solid rgba(212,175,55,0.3)',
            color: '#D4AF37',
            cursor: 'pointer',
            fontSize: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {sidebarOpen ? '◀' : '▶'}
        </button>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '32px 28px', overflowY: 'auto' }}>
        {/* Top bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 32,
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 26,
                fontWeight: 700,
                color: '#F1E6C8',
                marginBottom: 4,
              }}
            >
              {NAV_ITEMS.find((n) => n.id === activeTab)?.icon}{' '}
              {NAV_ITEMS.find((n) => n.id === activeTab)?.label}
            </h1>
            <p style={{ color: '#8A92A6', fontSize: 14 }}>
              {new Date().toLocaleDateString('pt-BR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span
              style={{
                padding: '6px 14px',
                borderRadius: 20,
                background: 'rgba(212,175,55,0.1)',
                border: '1px solid rgba(212,175,55,0.3)',
                color: '#D4AF37',
                fontSize: 13,
                fontWeight: 600,
                textTransform: 'capitalize',
              }}
            >
              ✝️ {role}
            </span>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'visao-geral' && <VisaoGeral />}
        {activeTab === 'usuarios' && <GerenciarUsuarios />}
        {activeTab !== 'visao-geral' && activeTab !== 'usuarios' && (
          <ComingSoon tab={activeTab} />
        )}
      </main>
    </div>
  )
}

function VisaoGeral() {
  return (
    <div>
      {/* Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
          marginBottom: 28,
        }}
      >
        {SUMMARY_CARDS.map((card) => (
          <div
            key={card.label}
            style={{
              background: 'linear-gradient(135deg, #0D1533 0%, #111A3E 100%)',
              border: `1.5px solid rgba(${hexToRgb(card.color)},0.2)`,
              borderRadius: 16,
              padding: '20px 22px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 12,
              }}
            >
              <span style={{ fontSize: 22 }}>{card.icon}</span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: card.trendUp ? '#4ADE80' : '#F87171',
                  background: card.trendUp
                    ? 'rgba(74,222,128,0.1)'
                    : 'rgba(248,113,113,0.1)',
                  padding: '3px 8px',
                  borderRadius: 8,
                }}
              >
                {card.trend}
              </span>
            </div>
            <div
              style={{
                color: card.color,
                fontSize: 22,
                fontWeight: 700,
                fontFamily: "'Playfair Display', serif",
                marginBottom: 4,
              }}
            >
              {card.value}
            </div>
            <div style={{ color: '#8A92A6', fontSize: 13 }}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Transactions */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0D1533 0%, #111A3E 100%)',
          border: '1.5px solid rgba(212,175,55,0.12)',
          borderRadius: 16,
          padding: 24,
        }}
      >
        <h3
          style={{
            fontFamily: "'Playfair Display', serif",
            color: '#F1E6C8',
            marginBottom: 20,
            fontSize: 18,
          }}
        >
          Lançamentos Recentes
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {RECENT_TRANSACTIONS.map((t, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                borderRadius: 10,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    fontSize: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `rgba(${hexToRgb(t.color)},0.12)`,
                  }}
                >
                  {t.icon}
                </span>
                <div>
                  <div
                    style={{ color: '#F1E6C8', fontSize: 14, fontWeight: 600 }}
                  >
                    {t.name}
                  </div>
                  <div style={{ color: '#8A92A6', fontSize: 12 }}>{t.type}</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: t.color, fontWeight: 700, fontSize: 14 }}>
                  {t.amount}
                </div>
                <div style={{ color: '#8A92A6', fontSize: 12 }}>{t.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ComingSoon({ tab }: { tab: string }) {
  const info = NAV_ITEMS.find((n) => n.id === tab)
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '80px 24px',
        background: 'linear-gradient(135deg, #0D1533, #111A3E)',
        borderRadius: 16,
        border: '1.5px dashed rgba(212,175,55,0.2)',
      }}
    >
      <div style={{ fontSize: 56, marginBottom: 16 }}>{info?.icon}</div>
      <h3
        style={{
          fontFamily: "'Playfair Display', serif",
          color: '#F1E6C8',
          fontSize: 24,
          marginBottom: 8,
        }}
      >
        Módulo {info?.label}
      </h3>
      <p style={{ color: '#8A92A6' }}>
        Este módulo está em desenvolvimento. Em breve disponível!
      </p>
    </div>
  )
}

function hexToRgb(hex: string): string {
  const h = hex.replace('#', '')
  const bigint = parseInt(h, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return `${r},${g},${b}`
}
