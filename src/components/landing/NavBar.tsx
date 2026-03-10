import { useState, useEffect } from 'react'
import { Cross, Menu, X } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { useAuth } from '@/hooks/use-auth'

const navLinks = [
  { label: 'Recursos', href: '#features' },
  { label: 'Módulos', href: '#modules' },
  { label: 'Preços', href: '#pricing' },
  { label: 'Docs', href: '#docs' },
]

export function NavBar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { currentUser } = useAuth()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: scrolled ? 'rgba(8,14,35,0.97)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(201,168,76,0.15)' : 'none',
        transition: 'all 0.4s ease',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
            SanctuaryBooks
          </span>
        </div>

        <nav
          style={{ display: 'flex', gap: 32, alignItems: 'center' }}
          className="nav-desktop"
        >
          {navLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              style={{
                color: 'rgba(255,255,255,0.7)',
                fontSize: 14,
                letterSpacing: 0.5,
                textDecoration: 'none',
                transition: 'color 0.2s',
                fontFamily: 'Lato, sans-serif',
                textTransform: 'uppercase',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#E8CC7A')}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')
              }
            >
              {item.label}
            </a>
          ))}

          {currentUser ? (
            <Link
              to="/dashboard"
              style={{
                background: 'linear-gradient(135deg, #C9A84C, #E8CC7A)',
                color: '#0F1729',
                padding: '10px 24px',
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 700,
                textDecoration: 'none',
                letterSpacing: 0.5,
                fontFamily: 'Lato, sans-serif',
              }}
            >
              📊 Painel
            </Link>
          ) : (
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <Link
                to="/sign-in"
                style={{
                  color: '#E8CC7A',
                  padding: '10px 18px',
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: 600,
                  textDecoration: 'none',
                  letterSpacing: 0.5,
                  fontFamily: 'Lato, sans-serif',
                  border: '1.5px solid rgba(201,168,76,0.4)',
                }}
              >
                Entrar
              </Link>
              <a
                href="#pricing"
                style={{
                  background: 'linear-gradient(135deg, #C9A84C, #E8CC7A)',
                  color: '#0F1729',
                  padding: '10px 24px',
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: 700,
                  textDecoration: 'none',
                  letterSpacing: 0.5,
                  fontFamily: 'Lato, sans-serif',
                }}
              >
                Começar Agora
              </a>
            </div>
          )}
        </nav>

        <button
          onClick={() => setOpen(!open)}
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#E8CC7A',
          }}
          className="nav-mobile-btn"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div
          style={{
            background: 'rgba(8,14,35,0.99)',
            padding: '1rem 2rem 2rem',
            borderTop: '1px solid rgba(201,168,76,0.15)',
          }}
        >
          {navLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={() => setOpen(false)}
              style={{
                display: 'block',
                color: 'rgba(255,255,255,0.8)',
                padding: '12px 0',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                textDecoration: 'none',
                fontFamily: 'Lato, sans-serif',
              }}
            >
              {item.label}
            </a>
          ))}
          {currentUser ? (
            <Link
              to="/dashboard"
              onClick={() => setOpen(false)}
              style={{
                display: 'block',
                padding: '12px 0',
                color: '#E8CC7A',
                textDecoration: 'none',
                fontFamily: 'Lato, sans-serif',
                fontWeight: 600,
              }}
            >
              📊 Painel
            </Link>
          ) : (
            <Link
              to="/sign-in"
              onClick={() => setOpen(false)}
              style={{
                display: 'block',
                padding: '12px 0',
                color: '#E8CC7A',
                textDecoration: 'none',
                fontFamily: 'Lato, sans-serif',
                fontWeight: 600,
              }}
            >
              Entrar
            </Link>
          )}
        </div>
      )}
    </header>
  )
}
