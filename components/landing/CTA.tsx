"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import AnimateOnScroll from "@/components/shared/AnimateOnScroll"

export default function CTA() {
  return (
    <section className="relative overflow-hidden py-28">
      {/* orb central */}
      <div
        className="design-orb animate-orb-float"
        style={{
          width: 480, height: 480,
          background: "radial-gradient(circle, rgba(202,255,51,0.12), transparent 70%)",
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
        <AnimateOnScroll>
          <p
            className="font-mono-design mb-4 text-xs font-semibold uppercase tracking-widest"
            style={{ color: "#CAFF33" }}
          >
            Pronto para começar?
          </p>
          <h2 className="font-heading text-4xl font-extrabold leading-tight text-foreground md:text-5xl">
            Organize seu pipeline{" "}
            <span style={{ color: "#CAFF33" }}>hoje</span>
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-lg text-muted-foreground">
            Junte-se a mais de 1.200 times que já transformaram seu processo de vendas com o CRM-NC.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/signup"
              className="group flex items-center gap-2 rounded-xl px-8 py-4 text-base font-bold transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: "#CAFF33", color: "#0C0C0E" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = "0 0 36px rgba(202,255,51,0.4)"
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = "none"
              }}
            >
              Criar conta grátis
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Já tenho conta
            </Link>
          </div>

          <p className="mt-6 text-xs text-muted-foreground/40">
            Sem cartão de crédito · Cancele quando quiser · LGPD compliant
          </p>
        </AnimateOnScroll>
      </div>
    </section>
  )
}
