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

type Errors = { email?: string; password?: string; form?: string }

function validate(email: string, password: string): Errors {
  const errors: Errors = {}
  if (!email) errors.email = "E-mail obrigatório"
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "E-mail inválido"
  if (!password) errors.password = "Senha obrigatória"
  return errors
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<Errors>({})
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate(email, password)
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setPending(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setPending(false)
    if (error) {
      if (error.code === "email_not_confirmed") {
        router.push(`/confirm-email?email=${encodeURIComponent(email)}`)
        return
      }
      setErrors({ form: "E-mail ou senha incorretos." })
      return
    }
    router.push("/dashboard")
    router.refresh()
  }

  return (
    <AuthCard title="Entrar na sua conta" description="Bem-vindo de volta ao CRM-NC">
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

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Senha</Label>
            <Link
              href="/forgot-password"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Esqueci a senha
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!!errors.password}
            disabled={pending}
          />
          {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
        </div>

        {errors.form && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {errors.form}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? <><Loader2 className="mr-2 size-4 animate-spin" />Entrando…</> : "Entrar"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Não tem conta?{" "}
          <Link href="/signup" className="text-foreground font-medium hover:underline">
            Criar conta
          </Link>
        </p>
      </form>
    </AuthCard>
  )
}
