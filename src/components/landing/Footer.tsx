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
                financialChurch
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
              {[
                {
                  icon: Mail,
                  href: 'mailto:contato@igreja.com',
                  label: 'Contato por e-mail',
                },
                {
                  icon: Globe,
                  href: '#features',
                  label: 'Ir para recursos',
                },
                {
                  icon: Github,
                  href: 'https://github.com/messias1976/financeiro-igreja',
                  label: 'Repositório no GitHub',
                },
              ].map(({ icon: Icon, href, label }, i) => (
                <a
                  key={i}
                  href={href}
                  aria-label={label}
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
                    textDecoration: 'none',
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
                </a>
              ))}
            </div>
          </div>

          {[
            {
              heading: 'Produto',
              links: [
                { label: 'Painel', href: '/sign-in' },
                { label: 'Dízimos', href: '#modules' },
                { label: 'Ofertas', href: '#modules' },
                { label: 'Despesas', href: '#modules' },
                { label: 'Relatórios', href: '#modules' },
              ],
            },
            {
              heading: 'Empresa',
              links: [
                { label: 'Sobre Nós', href: '#features' },
                { label: 'Blog', href: '#docs' },
                {
                  label: 'Vagas',
                  href: 'mailto:contato@igreja.com?subject=Vagas%20financialChurch',
                },
                {
                  label: 'Imprensa',
                  href: 'mailto:contato@igreja.com?subject=Contato%20de%20Imprensa',
                },
              ],
            },
            {
              heading: 'Legal',
              links: [
                { label: 'Política de Privacidade', href: '#docs' },
                { label: 'Termos de Uso', href: '#docs' },
                { label: 'Segurança', href: '#features' },
                { label: 'LGPD', href: '#docs' },
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
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
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
                      {link.label}
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
            © 2024 financialChurch. Todos os direitos reservados.
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
