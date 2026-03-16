import { Link } from '@tanstack/react-router'
import { Cross, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'

export function DashboardHeader() {
  const { currentUser } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const userDisplayName =
    currentUser?.name ||
    (currentUser?.email ? currentUser.email.split('@')[0] : 'Usuário')

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: 'rgba(8,14,35,0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(201,168,76,0.15)',
        padding: '0 2rem',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 72,
        }}
      >
        {/* Logo e Branding */}
        <Link
          to="/dashboard"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            textDecoration: 'none',
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #C9A84C, #E8CC7A)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Cross size={18} color="#0F1729" strokeWidth={2.5} />
          </div>
          <span
            style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: 20,
              fontWeight: 700,
              color: '#E8CC7A',
              letterSpacing: 0.5,
            }}
          >
            financialChurch
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav
          style={{
            display: 'flex',
            gap: 20,
            alignItems: 'center',
          }}
          className="nav-desktop"
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              paddingRight: 16,
              borderRight: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #C9A84C, #E8CC7A)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#0F1729',
                }}
              >
                {userDisplayName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <p
                style={{
                  fontSize: 12,
                  color: 'rgba(255,255,255,0.5)',
                  margin: 0,
                }}
              >
                Conectado como
              </p>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.9)',
                  margin: 0,
                }}
              >
                {userDisplayName}
              </p>
            </div>
          </div>

          <Link
            to="/sign-out"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              color: '#E8CC7A',
              padding: '10px 16px',
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'none',
              letterSpacing: 0.5,
              fontFamily: 'Lato, sans-serif',
              border: '1.5px solid rgba(201,168,76,0.4)',
              transition: 'all 0.2s',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(201,168,76,0.1)'
              e.currentTarget.style.borderColor = 'rgba(201,168,76,0.6)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.borderColor = 'rgba(201,168,76,0.4)'
            }}
          >
            <LogOut size={16} />
            Logout
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#E8CC7A',
            zIndex: 200,
          }}
          className="nav-mobile-button"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <nav
          style={{
            display: 'none',
            flexDirection: 'column',
            gap: 12,
            padding: '16px 0',
            borderTop: '1px solid rgba(255,255,255,0.08)',
          }}
          className="nav-mobile"
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              paddingBottom: 12,
              borderBottom: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #C9A84C, #E8CC7A)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 700, color: '#0F1729' }}>
                {userDisplayName.charAt(0).toUpperCase()}
              </span>
            </div>
            <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>
              {userDisplayName}
            </span>
          </div>

          <Link
            to="/sign-out"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              color: '#E8CC7A',
              padding: '10px 0',
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            <LogOut size={16} />
            Logout
          </Link>
        </nav>
      )}

      <style>{`
        @media (max-width: 768px) {
          .nav-desktop {
            display: none !important;
          }
          .nav-mobile-button {
            display: flex !important;
          }
          .nav-mobile {
            display: flex !important;
          }
        }
      `}</style>
    </header>
  )
}
