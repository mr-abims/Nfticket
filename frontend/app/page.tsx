import Link from "next/link"
import { Header } from "./components/Header"
import CustomConnectButton from "./components/ConnectButton"
import { HeroSection } from "./components/HeroSection"
import { FeaturesSection } from "./components/FeaturesSection"
import { EventsPreview } from "./components/EventsPreview"
import { StatsSection } from "./components/StatsSection"
import { CreateEventCTA } from "./components/CreateEventCTA"
import { Footer } from "./components/Footer"

export default function Home() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#010612' }}>
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <EventsPreview />
        <StatsSection />
        <CreateEventCTA />
      </main>
      <Footer />
    </div>
  );
}
