import PerspectiveTunnelHero from "../components/ui/PerspectiveTunnelHero";
import FeaturesWithPanel from "../components/ui/FeaturesWithPanel";
import HowItWorks from "../components/ui/HowItWorks";
import WhoItsFor from "../components/ui/WhoItsFor";
import Testimonials from "../components/ui/Testimonials";
import Pricing from "../components/ui/Pricing";
import FAQ from "../components/ui/FAQ";
import FinalCTA from "../components/ui/FinalCTA";

function Home() {
  return (
    <main>
      {/* HOME PAGE - HERO */}
      <PerspectiveTunnelHero />

      {/* HOME PAGE - FEATURES */}
      <FeaturesWithPanel />

      {/* HOME PAGE - HOW IT WORKS */}
      <HowItWorks />

      {/* HOME PAGE - TARGET AUDIENCE */}
      <WhoItsFor />

      {/* HOME PAGE - TESTIMONIALS (PLACEHOLDER CONTENT) */}
      <Testimonials />

      {/* HOME PAGE - PRICING */}
      <Pricing />

      <FAQ />
      <FinalCTA />
    </main>
  );
}

export default Home;
