"use client"

import { useEffect, useRef, useState } from "react"
import AnimateOnScroll from "@/components/shared/AnimateOnScroll"

type Stat = { value: string; numericEnd: number; prefix: string; suffix: string; label: string; sub: string }

const STATS: Stat[] = [
  { value: "+47%",  numericEnd: 47,   prefix: "+", suffix: "%",  label: "Taxa de Conversão",       sub: "média nos primeiros 90 dias" },
  { value: "3.2x",  numericEnd: 3.2,  prefix: "",  suffix: "x",  label: "Leads Qualificados",       sub: "mais oportunidades por mês" },
  { value: "-62%",  numericEnd: 62,   prefix: "-", suffix: "%",  label: "Ciclo de Venda",           sub: "redução no tempo de fechamento" },
  { value: "1200+", numericEnd: 1200, prefix: "",  suffix: "+",  label: "Times Ativos",             sub: "em todo o Brasil" },
]

function CountUp({ stat }: { stat: Stat }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [started, setStarted] = useState(false)
  const [display, setDisplay] = useState("0")

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStarted(true); observer.disconnect() } },
      { threshold: 0.5 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!started) return
    const duration = 1400
    const start = performance.now()
    const end = stat.numericEnd
    const decimals = end % 1 !== 0 ? 1 : 0

    const frame = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = eased * end
      setDisplay(current.toFixed(decimals))
      if (progress < 1) requestAnimationFrame(frame)
    }
    requestAnimationFrame(frame)
  }, [started, stat.numericEnd])

  return (
    <span ref={ref}>
      {stat.prefix}{display}{stat.suffix}
    </span>
  )
}

export default function Stats() {
  return (
    <section id="resultados" className="relative overflow-hidden py-24">
      {/* subtle separator line */}
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(202,255,51,0.15), transparent)" }}
      />

      <div className="mx-auto max-w-6xl px-6">
        <AnimateOnScroll className="mb-14 text-center">
          <p className="font-mono-design mb-3 text-xs font-semibold uppercase tracking-widest" style={{ color: "#CAFF33" }}>
            Resultados reais
          </p>
          <h2 className="font-heading text-3xl font-bold text-foreground md:text-4xl">
            Números que comprovam o impacto
          </h2>
        </AnimateOnScroll>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {STATS.map((stat, i) => (
            <AnimateOnScroll key={stat.label} delay={i as 0 | 1 | 2 | 3}>
              <div
                className="glass-card rounded-2xl p-6 text-center"
                style={{ cursor: "default" }}
              >
                <p
                  className="font-heading text-3xl font-extrabold tabular-nums sm:text-4xl md:text-5xl"
                  style={{ color: "#CAFF33" }}
                >
                  <CountUp stat={stat} />
                </p>
                <p className="mt-2 text-sm font-semibold text-foreground">{stat.label}</p>
                <p className="mt-1 text-xs text-muted-foreground/60">{stat.sub}</p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>

      <div
        className="absolute inset-x-0 bottom-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(202,255,51,0.1), transparent)" }}
      />
    </section>
  )
}
