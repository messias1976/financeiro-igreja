import { HeroSection } from './HeroSection'
import { FeaturesSection } from './FeaturesSection'
import { ModulesSection } from './ModulesSection'
import { PricingSection } from './PricingSection'
import { SnakeSection } from './SnakeSection'
import { Footer } from './Footer'
import { NavBar } from './NavBar'

export function LandingPage() {
  return (
    <div className="church-root">
      <NavBar />
      <HeroSection />
      <SnakeSection />
      <FeaturesSection />
      <ModulesSection />
      <PricingSection />
      <Footer />
    </div>
  )
}
