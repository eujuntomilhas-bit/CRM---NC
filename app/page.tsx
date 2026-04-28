import Navbar   from "@/components/landing/Navbar"
import Hero     from "@/components/landing/Hero"
import Stats    from "@/components/landing/Stats"
import Features from "@/components/landing/Features"
import Pricing  from "@/components/landing/Pricing"
import CTA      from "@/components/landing/CTA"
import Footer   from "@/components/landing/Footer"

export default function RootPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <Hero />
      <Stats />
      <Features />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  )
}
