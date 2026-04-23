"use client"

import { useState } from "react"
import Link from "next/link"
import AuthCard from "@/components/shared/AuthCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, CheckCircle2 } from "lucide-react"

type Errors = { email?: string }

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [errors, setErrors] = useState<Errors>({})
  const [pending, setPending] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs: Errors = {}
    if (!email) errs.email = "E-mail obrigatório"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "E-mail inválido"
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setPending(true)
    await new Promise((r) => setTimeout(r, 800))
    setPending(false)
    setSent(true)
  }

  if (sent) {
    return (
      <AuthCard title="Verifique seu e-mail">
        <div className="flex flex-col items-center gap-4 py-2 text-center">
          <CheckCircle2 className="size-12 text-green-500" />
          <p className="text-sm text-muted-foreground">
            Enviamos um link de recuperação para <span className="font-medium text-foreground">{email}</span>.
            Verifique sua caixa de entrada.
          </p>
          <Link href="/login" className="text-sm font-medium hover:underline">
            Voltar para o login
          </Link>
        </div>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title="Recuperar senha"
      description="Digite seu e-mail e enviaremos um link de recuperação"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            placeholder="voce@empresa.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!errors.email}
            disabled={pending}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? <><Loader2 className="mr-2 size-4 animate-spin" />Enviando…</> : "Enviar link"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Lembrou a senha?{" "}
          <Link href="/login" className="text-foreground font-medium hover:underline">
            Entrar
          </Link>
        </p>
      </form>
    </AuthCard>
  )
}
