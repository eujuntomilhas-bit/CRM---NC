"use client"

import Link from "next/link"
import { ArrowRight, Play } from "lucide-react"

export default function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-16 text-center">
      {/* Orbs */}
      <div
        className="design-orb animate-orb-float"
        style={{
          width: 520, height: 520,
          background: "radial-gradient(circle, rgba(202,255,51,0.18), transparent 70%)",
          top: "5%", left: "-8%",
        }}
      />
      <div
        className="design-orb animate-orb-float"
        style={{
          width: 400, height: 400,
          background: "radial-gradient(circle, rgba(91,127,255,0.14), transparent 70%)",
          top: "20%", right: "-6%",
          animationDelay: "-4s",
        }}
      />
      <div
        className="design-orb animate-orb-float"
        style={{
          width: 280, height: 280,
          background: "radial-gradient(circle, rgba(202,255,51,0.08), transparent 70%)",
          bottom: "15%", left: "30%",
          animationDelay: "-7s",
        }}
      />

      {/* Badge */}
      <div className="animate-fade-slide-up relative z-10 mb-6">
        <span
          className="font-mono-design inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-widest"
          style={{
            borderColor: "rgba(202,255,51,0.3)",
            background: "rgba(202,255,51,0.06)",
            color: "#CAFF33",
          }}
        >
          <span
            className="inline-block size-1.5 rounded-full"
            style={{ background: "#CAFF33", animation: "livePulse 2s ease-in-out infinite" }}
          />
          CRM para times que fecham negócios
        </span>
      </div>

      {/* Headline */}
      <h1 className="animate-fade-slide-up-1 relative z-10 max-w-4xl font-heading text-5xl font-extrabold leading-[1.08] tracking-tight text-foreground md:text-6xl lg:text-7xl">
        Gerencie seu pipeline
        <br />
        com{" "}
        <span style={{ color: "#CAFF33" }}>
          total fluidez
        </span>
      </h1>

      {/* Subheadline */}
      <p className="animate-fade-slide-up-2 relative z-10 mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
        CRM moderno para pequenas e médias empresas. Kanban visual, gestão completa de leads,
        dashboard em tempo real e plano gratuito para começar agora.
      </p>

      {/* CTAs */}
      <div className="animate-fade-slide-up-3 relative z-10 mt-10 flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/signup"
          className="group flex items-center gap-2 rounded-xl px-7 py-3.5 text-sm font-bold transition-all duration-200 hover:-translate-y-0.5"
          style={{
            background: "#CAFF33",
            color: "#0C0C0E",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow = "0 0 32px rgba(202,255,51,0.4)"
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow = "none"
          }}
        >
          Começar grátis
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
        <Link
          href="/login"
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-7 py-3.5 text-sm font-medium text-muted-foreground backdrop-blur-sm transition-all duration-200 hover:border-white/20 hover:bg-white/8 hover:text-foreground"
        >
          <Play className="size-3.5 fill-current" />
          Ver demonstração
        </Link>
      </div>

      {/* Trust line */}
      <p className="animate-fade-slide-up-3 relative z-10 mt-8 text-xs text-muted-foreground/50">
        Sem cartão de crédito · Configuração em 2 minutos · Cancele quando quiser
      </p>

      {/* Wave bottom */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
        <svg
          className="animate-wave-scroll"
          style={{ width: "200%", height: "48px" }}
          viewBox="0 0 2400 48"
          preserveAspectRatio="none"
        >
          <path
            d="M0,24 C200,48 400,0 600,24 C800,48 1000,0 1200,24 C1400,48 1600,0 1800,24 C2000,48 2200,0 2400,24 L2400,48 L0,48 Z"
            fill="rgba(202,255,51,0.055)"
          />
        </svg>
        <svg
          className="animate-wave-scroll absolute bottom-1"
          style={{ width: "200%", height: "32px", animationDuration: "20s", animationDirection: "reverse", opacity: 0.35 }}
          viewBox="0 0 2400 32"
          preserveAspectRatio="none"
        >
          <path
            d="M0,16 C150,32 300,0 450,16 C600,32 750,0 900,16 C1050,32 1200,0 1350,16 C1500,32 1650,0 1800,16 C1950,32 2100,0 2250,16 L2400,16 L2400,32 L0,32 Z"
            fill="rgba(91,127,255,0.06)"
          />
        </svg>
      </div>
    </section>
  )
}
