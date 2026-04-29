"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import AuthCard from "@/components/shared/AuthCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

type Errors = {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
  form?: string
}

function validate(name: string, email: string, password: string, confirmPassword: string): Errors {
  const errors: Errors = {}
  if (!name.trim()) errors.name = "Nome obrigatório"
  if (!email) errors.email = "E-mail obrigatório"
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "E-mail inválido"
  if (!password) errors.password = "Senha obrigatória"
  else if (password.length < 8) errors.password = "Mínimo de 8 caracteres"
  if (!confirmPassword) errors.confirmPassword = "Confirme a senha"
  else if (password !== confirmPassword) errors.confirmPassword = "As senhas não coincidem"
  return errors
}

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [errors, setErrors] = useState<Errors>({})
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate(name, email, password, confirmPassword)
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setPending(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
      },
    })
    setPending(false)
    if (error) {
      setErrors({ form: error.message })
      return
    }
    router.push(`/confirm-email?email=${encodeURIComponent(email)}`)
  }

  return (
    <AuthCard title="Criar sua conta" description="Comece gratuitamente, sem cartão de crédito">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Nome completo</Label>
          <Input
            id="name"
            type="text"
            placeholder="Seu nome"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={!!errors.name}
            disabled={pending}
          />
          {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
        </div>

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

        <div className="space-y-1.5">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            type="password"
            placeholder="Mínimo 8 caracteres"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!!errors.password}
            disabled={pending}
          />
          {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">Confirmar senha</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Repita a senha"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            aria-invalid={!!errors.confirmPassword}
            disabled={pending}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-destructive">{errors.confirmPassword}</p>
          )}
        </div>

        {errors.form && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {errors.form}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? <><Loader2 className="mr-2 size-4 animate-spin" />Criando conta…</> : "Criar conta"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Já tem conta?{" "}
          <Link href="/login" className="text-foreground font-medium hover:underline">
            Entrar
          </Link>
        </p>
      </form>
    </AuthCard>
  )
}
