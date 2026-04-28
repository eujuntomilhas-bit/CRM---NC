"use client"

import Link from "next/link"
import { Check, Zap } from "lucide-react"
import AnimateOnScroll from "@/components/shared/AnimateOnScroll"

const FREE_ITEMS = [
  "Até 2 colaboradores",
  "Até 50 leads",
  "Pipeline Kanban completo",
  "Histórico de atividades",
  "Dashboard de métricas",
  "Suporte por e-mail",
]

const PRO_ITEMS = [
  "Colaboradores ilimitados",
  "Leads ilimitados",
  "Pipeline Kanban completo",
  "Histórico de atividades",
  "Dashboard de métricas",
  "Multi-workspace",
  "Convites por e-mail",
  "Suporte prioritário",
]

function CheckItem({ label, accent = false }: { label: string; accent?: boolean }) {
  return (
    <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
      <Check
        className="mt-0.5 size-4 shrink-0"
        style={{ color: accent ? "#CAFF33" : "#2ED573" }}
      />
      {label}
    </li>
  )
}

export default function Pricing() {
  return (
    <section id="precos" className="relative py-24">
      {/* top separator */}
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(202,255,51,0.12), transparent)" }}
      />

      <div className="mx-auto max-w-6xl px-6">
        <AnimateOnScroll className="mb-14 text-center">
          <p
            className="font-mono-design mb-3 text-xs font-semibold uppercase tracking-widest"
            style={{ color: "#CAFF33" }}
          >
            Preços
          </p>
          <h2 className="font-heading text-3xl font-bold text-foreground md:text-4xl">
            Simples e transparente
          </h2>
          <p className="mx-auto mt-4 max-w-md text-base text-muted-foreground">
            Comece de graça e faça upgrade conforme seu time cresce.
          </p>
        </AnimateOnScroll>

        <div className="mx-auto grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2">
          {/* FREE */}
          <AnimateOnScroll delay={0}>
            <div className="glass-card flex h-full flex-col rounded-2xl p-8">
              <div className="mb-6">
                <p className="font-mono-design mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
                  Grátis
                </p>
                <div className="flex items-end gap-1">
                  <span className="font-heading text-4xl font-extrabold text-foreground">R$&nbsp;0</span>
                  <span className="mb-1.5 text-sm text-muted-foreground">/mês</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">Para quem está começando</p>
              </div>

              <ul className="mb-8 flex flex-col gap-3">
                {FREE_ITEMS.map((item) => <CheckItem key={item} label={item} />)}
              </ul>

              <Link
                href="/signup"
                className="mt-auto block rounded-xl border border-white/10 bg-white/5 py-3 text-center text-sm font-semibold text-foreground transition-all duration-200 hover:border-white/20 hover:bg-white/10"
              >
                Criar conta grátis
              </Link>
            </div>
          </AnimateOnScroll>

          {/* PRO */}
          <AnimateOnScroll delay={1}>
            <div
              className="relative flex h-full flex-col overflow-hidden rounded-2xl p-8"
              style={{
                background: "rgba(20,20,22,0.9)",
                border: "1px solid rgba(202,255,51,0.35)",
                boxShadow: "0 0 40px rgba(202,255,51,0.08)",
              }}
            >
              {/* badge */}
              <div
                className="absolute right-5 top-5 flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider"
                style={{ background: "#CAFF33", color: "#0C0C0E" }}
              >
                <Zap className="size-3 fill-current" />
                Popular
              </div>

              <div className="mb-6">
                <p
                  className="font-mono-design mb-1 text-xs font-semibold uppercase tracking-widest"
                  style={{ color: "#CAFF33" }}
                >
                  Pro
                </p>
                <div className="flex items-end gap-1">
                  <span className="font-heading text-4xl font-extrabold text-foreground">R$&nbsp;49</span>
                  <span className="mb-1.5 text-sm text-muted-foreground">/mês</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">Para times em crescimento</p>
              </div>

              <ul className="mb-8 flex flex-col gap-3">
                {PRO_ITEMS.map((item) => <CheckItem key={item} label={item} accent />)}
              </ul>

              <Link
                href="/signup"
                className="mt-auto block rounded-xl py-3 text-center text-sm font-bold transition-all duration-200 hover:-translate-y-0.5"
                style={{ background: "#CAFF33", color: "#0C0C0E" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 0 28px rgba(202,255,51,0.35)"
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = "none"
                }}
              >
                Começar com o Pro
              </Link>
            </div>
          </AnimateOnScroll>
        </div>
      </div>
    </section>
  )
}
