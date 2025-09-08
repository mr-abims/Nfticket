import Link from "next/link"
import { Header } from "./components/Header"
import { HeroSection } from "./components/HeroSection"
import { FeaturesSection } from "./components/FeaturesSection"
import { EventsPreview } from "./components/EventsPreview"
import { StatsSection } from "./components/StatsSection"
import { Footer } from "./components/Footer"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <EventsPreview />
        <StatsSection />
      </main>
      <Footer />
    </div>
  );
}
