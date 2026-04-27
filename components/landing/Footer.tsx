import Link from "next/link"
import Logo from "@/components/shared/Logo"

export default function Footer() {
  return (
    <footer className="border-t py-10" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 md:flex-row md:justify-between">
        <Logo size="sm" />

        <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground/60">
          <Link href="/signup" className="transition-colors hover:text-foreground">Criar conta</Link>
          <Link href="/login"  className="transition-colors hover:text-foreground">Entrar</Link>
          <a href="#funcionalidades" className="transition-colors hover:text-foreground">Funcionalidades</a>
          <a href="#precos"          className="transition-colors hover:text-foreground">Preços</a>
        </nav>

        <p className="text-xs text-muted-foreground/40">
          © {new Date().getFullYear()} CRM-NC. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  )
}
