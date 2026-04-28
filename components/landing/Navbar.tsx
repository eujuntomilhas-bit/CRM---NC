"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Logo from "@/components/shared/Logo"
import { cn } from "@/lib/utils"

const LINKS = [
  { label: "Funcionalidades", href: "#funcionalidades" },
  { label: "Resultados",      href: "#resultados"      },
  { label: "Preços",          href: "#precos"          },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-black/20"
          : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        {/* Logo */}
        <Logo size="sm" />

        {/* Nav links — desktop */}
        <nav className="hidden items-center gap-8 md:flex">
          {LINKS.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {label}
            </a>
          ))}
        </nav>

        {/* CTAs */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground md:block"
          >
            Entrar
          </Link>
          <Link
            href="/signup"
            className="rounded-lg px-4 py-2 text-sm font-bold transition-all duration-200 hover:-translate-y-0.5"
            style={{
              background: "#CAFF33",
              color: "#0C0C0E",
              boxShadow: "0 0 0 rgba(202,255,51,0)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = "0 0 22px rgba(202,255,51,0.35)"
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 rgba(202,255,51,0)"
            }}
          >
            Começar grátis
          </Link>
        </div>
      </div>
    </header>
  )
}
