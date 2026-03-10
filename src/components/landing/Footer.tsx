import { Cross, Mail, Globe, Github } from 'lucide-react'

export function Footer() {
  return (
    <footer
      style={{
        background: '#060B1A',
        borderTop: '1px solid rgba(201,168,76,0.12)',
        padding: '4rem 2rem 2rem',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr',
            gap: '3rem',
            marginBottom: '3rem',
          }}
          className="footer-grid"
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 7,
                  background: 'linear-gradient(135deg, #C9A84C, #E8CC7A)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Cross size={16} color="#0F1729" strokeWidth={2.5} />
              </div>
              <span
                style={{
                  fontFamily: 'Playfair Display, serif',
                  fontSize: 18,
                  fontWeight: 700,
                  color: '#E8CC7A',
                }}
              >
                SanctuaryBooks
              </span>
            </div>
            <p
              style={{
                color: 'rgba(255,255,255,0.4)',
                fontSize: 14,
                fontFamily: 'Lato, sans-serif',
                lineHeight: 1.7,
                maxWidth: 280,
                marginBottom: 20,
              }}
            >
              Capacitando igrejas a gerenciar suas finanças com integridade,
              transparência e propósito.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              {[Mail, Globe, Github].map((Icon, i) => (
                <div
                  key={i}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    ;(e.currentTarget as HTMLElement).style.borderColor =
                      'rgba(201,168,76,0.4)'
                  }}
                  onMouseLeave={(e) => {
                    ;(e.currentTarget as HTMLElement).style.borderColor =
                      'rgba(255,255,255,0.08)'
                  }}
                >
                  <Icon size={15} color="rgba(255,255,255,0.45)" />
                </div>
              ))}
            </div>
          </div>

          {[
            {
              heading: 'Produto',
              links: ['Painel', 'Dízimos', 'Ofertas', 'Despesas', 'Relatórios'],
            },
            {
              heading: 'Empresa',
              links: ['Sobre Nós', 'Blog', 'Vagas', 'Imprensa'],
            },
            {
              heading: 'Legal',
              links: [
                'Política de Privacidade',
                'Termos de Uso',
                'Segurança',
                'LGPD',
              ],
            },
          ].map((col) => (
            <div key={col.heading}>
              <h4
                style={{
                  fontFamily: 'Lato, sans-serif',
                  fontSize: 12,
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.4)',
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  marginBottom: 16,
                }}
              >
                {col.heading}
              </h4>
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                {col.links.map((l) => (
                  <li key={l}>
                    <a
                      href="#"
                      style={{
                        color: 'rgba(255,255,255,0.5)',
                        fontSize: 14,
                        fontFamily: 'Lato, sans-serif',
                        textDecoration: 'none',
                        transition: 'color 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#E8CC7A'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'rgba(255,255,255,0.5)'
                      }}
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          style={{
            borderTop: '1px solid rgba(255,255,255,0.06)',
            paddingTop: '2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <span
            style={{
              color: 'rgba(255,255,255,0.3)',
              fontSize: 13,
              fontFamily: 'Lato, sans-serif',
            }}
          >
            © 2024 SanctuaryBooks. Todos os direitos reservados.
          </span>
          <span
            style={{
              color: 'rgba(255,255,255,0.3)',
              fontSize: 13,
              fontFamily: 'Lato, sans-serif',
            }}
          >
            Desenvolvido com fé &amp; precisão ✝
          </span>
        </div>
      </div>
    </footer>
  )
}
