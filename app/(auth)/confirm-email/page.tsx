"use client"

import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import AuthCard from "@/components/shared/AuthCard"
import { Button } from "@/components/ui/button"
import { Loader2, MailCheck, ArrowLeft } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

function ConfirmEmailContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get("email") ?? ""
  const [pending, setPending] = useState(false)
  const [resent, setResent] = useState(false)
  const [error, setError] = useState("")

  async function handleResend() {
    if (!email) return
    setPending(true)
    setError("")
    const supabase = createClient()
    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
      },
    })
    setPending(false)
    if (resendError) {
      setError("Não foi possível reenviar. Tente novamente em alguns minutos.")
    } else {
      setResent(true)
    }
  }

  return (
    <AuthCard
      title="Verifique seu e-mail"
      description="Enviamos um link de confirmação para você"
    >
      <div className="space-y-5">
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="flex size-14 items-center justify-center rounded-full bg-primary/10">
            <MailCheck className="size-7 text-primary" />
          </div>
          {email && (
            <p className="text-center text-sm text-muted-foreground">
              Enviamos um link para{" "}
              <span className="font-medium text-foreground">{email}</span>.
              Clique no link para ativar sua conta.
            </p>
          )}
          <p className="text-center text-xs text-muted-foreground">
            Não encontrou? Verifique a pasta de spam.
          </p>
        </div>

        {error && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive text-center">
            {error}
          </p>
        )}

        {resent ? (
          <p className="rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary text-center">
            E-mail reenviado! Verifique sua caixa de entrada.
          </p>
        ) : (
          <Button
            variant="outline"
            className="w-full"
            onClick={handleResend}
            disabled={pending || !email}
          >
            {pending ? (
              <><Loader2 className="mr-2 size-4 animate-spin" />Reenviando…</>
            ) : (
              "Reenviar e-mail de confirmação"
            )}
          </Button>
        )}

        <Link
          href="/login"
          className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Voltar para o login
        </Link>
      </div>
    </AuthCard>
  )
}

export default function ConfirmEmailPage() {
  return (
    <Suspense>
      <ConfirmEmailContent />
    </Suspense>
  )
}
