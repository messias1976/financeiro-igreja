import { Footer } from './Footer'
import { FeaturesSection } from './FeaturesSection'
import { HeroSection } from './HeroSection'
import { ModulesSection } from './ModulesSection'
import { NavBar } from './NavBar'
import { PricingSection } from './PricingSection'

const highlightStats = [
  { value: '750+', label: 'Igrejas conectadas', detail: 'Compartilham dízimos e campanhas via painel seguro.' },
  { value: 'R$ 9,4M', label: 'Contribuições processadas', detail: 'Pix, cartão e dinheiro com rastreio completo.' },
  { value: '24h', label: 'Relatórios prontos', detail: 'Mensal, anual e entradas/saídas em PDF e Excel.' },
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

      <section id="features" className="bg-slate-950">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <FeaturesSection />
        </div>
      </section>

      <section id="modules" className="bg-slate-950">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <ModulesSection />
        </div>
      </section>

      <section className="border-y border-white/10 bg-slate-900/40">
        <div className="mx-auto max-w-6xl px-6 py-14 space-y-10">
          <div className="grid gap-6 md:grid-cols-3">
            {highlightStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-3xl border border-white/5 bg-white/5 p-6 shadow-[0_20px_45px_rgba(0,0,0,0.35)]"
              >
                <p className="text-4xl font-serif text-amber-300">{stat.value}</p>
                <p className="mt-2 text-sm uppercase tracking-[0.4em] text-white/40">{stat.label}</p>
                <p className="mt-4 text-sm text-white/70">{stat.detail}</p>
              </div>
            ))}
          </div>
          <div className="rounded-[32px] border border-amber-400/40 bg-gradient-to-br from-slate-900/60 to-slate-900/20 p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.5em] text-white/60">Campanhas que inspiram</p>
                <h3 className="text-3xl font-semibold text-white">Meta, progresso e transparência em um único lugar.</h3>
                <p className="mt-3 max-w-2xl text-sm text-white/70">
                  Conecte membros aos objetivos da igreja, compartilhe barras de progresso e mantenha o tesoureiro informado
                  via notificações e relatórios automáticos.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {campaignSpotlight.map((camp) => (
                  <div key={camp.title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-sm text-white/70">{camp.tag}</p>
                    <p className="mt-2 text-lg font-semibold text-white">{camp.title}</p>
                    <div className="mt-2 h-2 rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-500"
                        style={{ width: `${camp.progress}%` }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-white/60">Meta {camp.goal} • {camp.progress}%</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="bg-slate-950">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <PricingSection />
        </div>
      </section>

      <section className="bg-gradient-to-b from-slate-950/80 to-slate-950/60 border-t border-white/5">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="rounded-[32px] border border-white/5 bg-slate-900/30 p-10 text-center">
            <h3 className="text-3xl font-semibold text-white">Pronto para manter o fluxo financeiro organizado?</h3>
            <p className="mt-4 text-sm text-white/70">
              Experimente o dashboard completo sem custo por 14 dias e veja como dízimos, ofertas e despesas ficam sincronizados
envolvendo toda a liderança.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <a
                href="#pricing"
                className="rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 text-sm font-semibold text-slate-900"
              >
                Iniciar teste gratuito
              </a>
              <a
                href="mailto:contato@igreja.com"
                className="rounded-2xl border border-white/20 px-6 py-3 text-sm font-semibold text-white"
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
