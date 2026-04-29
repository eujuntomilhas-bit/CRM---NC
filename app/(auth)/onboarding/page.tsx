"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import AuthCard from "@/components/shared/AuthCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, ArrowRight, Users } from "lucide-react"
import { createWorkspace } from "./actions"

type Step = 1 | 2

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [workspaceName, setWorkspaceName] = useState("")
  const [workspaceError, setWorkspaceError] = useState("")
  const [isPending, startTransition] = useTransition()

  async function handleStep1(e: React.FormEvent) {
    e.preventDefault()
    if (!workspaceName.trim()) { setWorkspaceError("Nome do workspace obrigatório"); return }
    setWorkspaceError("")

    const formData = new FormData()
    formData.set("workspaceName", workspaceName)

    startTransition(async () => {
      const result = await createWorkspace(formData)
      if (result?.error) {
        setWorkspaceError(result.error)
      }
      // On success, createWorkspace calls redirect("/dashboard") server-side
    })
  }

  return (
    <AuthCard
      title={step === 1 ? "Criar seu workspace" : "Convidar sua equipe"}
      description={
        step === 1
          ? "Passo 1 de 2 — Como se chama sua empresa ou projeto?"
          : "Passo 2 de 2 — Convide colaboradores (opcional)"
      }
    >
      {/* Step indicators */}
      <div className="mb-6 flex items-center gap-2">
        <div className="flex size-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
          1
        </div>
        <div className={`h-px flex-1 transition-colors ${step === 2 ? "bg-primary" : "bg-border"}`} />
        <div
          className={`flex size-6 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
            step === 2
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          2
        </div>
      </div>

      {step === 1 && (
        <form onSubmit={handleStep1} noValidate className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="workspaceName">Nome do workspace</Label>
            <Input
              id="workspaceName"
              type="text"
              placeholder="Ex: Acme Corp"
              autoFocus
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              aria-invalid={!!workspaceError}
              disabled={isPending}
            />
            {workspaceError && <p className="text-xs text-destructive">{workspaceError}</p>}
            <p className="text-xs text-muted-foreground">
              Pode ser o nome da sua empresa, agência ou projeto.
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <><Loader2 className="mr-2 size-4 animate-spin" />Criando…</>
            ) : (
              <>Continuar <ArrowRight className="ml-2 size-4" /></>
            )}
          </Button>
        </form>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Workspace criado com sucesso! Convide colaboradores depois em Configurações.
          </p>
          <Button
            className="w-full"
            variant="outline"
            onClick={() => router.push("/dashboard")}
          >
            <Users className="mr-2 size-4" />
            Ir para o Dashboard
          </Button>
        </div>
      )}
    </AuthCard>
  )
}
