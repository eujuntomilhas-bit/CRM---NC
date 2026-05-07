"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import AuthCard from "@/components/shared/AuthCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

type Errors = { password?: string; confirm?: string; form?: string }

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [errors, setErrors] = useState<Errors>({})
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs: Errors = {}
    if (!password) errs.password = "Senha obrigatória"
    else if (password.length < 6) errs.password = "Mínimo 6 caracteres"
    if (!confirm) errs.confirm = "Confirmação obrigatória"
    else if (confirm !== password) errs.confirm = "As senhas não coincidem"
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setPending(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    setPending(false)
    if (error) {
      setErrors({ form: "Não foi possível redefinir a senha. O link pode ter expirado." })
      return
    }
    router.push("/dashboard")
  }

  return (
    <AuthCard title="Redefinir senha" description="Digite sua nova senha">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="password">Nova senha</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!!errors.password}
            disabled={pending}
          />
          {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirm">Confirmar senha</Label>
          <Input
            id="confirm"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            aria-invalid={!!errors.confirm}
            disabled={pending}
          />
          {errors.confirm && <p className="text-xs text-destructive">{errors.confirm}</p>}
        </div>

        {errors.form && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {errors.form}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? <><Loader2 className="mr-2 size-4 animate-spin" />Salvando…</> : "Redefinir senha"}
        </Button>
      </form>
    </AuthCard>
  )
}
