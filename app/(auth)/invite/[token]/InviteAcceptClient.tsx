'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { Building2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

type Props = {
  token: string
  inviteEmail: string
  workspaceName: string
  role: 'admin' | 'member'
}

type Mode = 'choice' | 'signup' | 'login'

export default function InviteAcceptClient({ token, inviteEmail, workspaceName, role }: Props) {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('choice')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  async function acceptInviteAfterAuth() {
    const res = await fetch(`/api/invite/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error ?? 'Erro ao aceitar convite')
  }

  function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!name.trim()) { setError('Nome obrigatório'); return }
    if (password.length < 8) { setError('Senha precisa ter ao menos 8 caracteres'); return }
    if (password !== confirmPassword) { setError('As senhas não coincidem'); return }

    startTransition(async () => {
      const supabase = createClient()

      // Criar conta com email pré-preenchido do convite
      const { error: signupError } = await supabase.auth.signUp({
        email: inviteEmail,
        password,
        options: {
          data: { full_name: name },
          // Redirecionar de volta para aceitar o convite após confirmar email
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/invite/${token}`,
        },
      })

      if (signupError) {
        // Se o usuário já existe, orientar a fazer login
        if (signupError.message.toLowerCase().includes('already registered')) {
          setError('Este e-mail já tem uma conta. Faça login abaixo.')
          setMode('login')
          return
        }
        setError(signupError.message)
        return
      }

      // Supabase envia email de confirmação — mostrar aviso
      toast.success('Conta criada! Verifique seu e-mail para confirmar antes de continuar.')
      setMode('choice')
      setError('Verifique seu e-mail e clique no link de confirmação. Depois volte aqui e faça login.')
    })
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 1) { setError('Senha obrigatória'); return }

    startTransition(async () => {
      const supabase = createClient()

      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: inviteEmail,
        password,
      })

      if (loginError) {
        if (loginError.code === 'email_not_confirmed') {
          setError('Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.')
          return
        }
        setError('Senha incorreta.')
        return
      }

      // Logado — aceitar o convite via API
      try {
        await acceptInviteAfterAuth()
        router.push('/dashboard')
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao aceitar convite')
      }
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card shadow-sm overflow-hidden">

        {/* Header */}
        <div className="bg-primary/10 px-8 py-6 text-center border-b border-border">
          <div className="flex justify-center mb-3">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/20">
              <Building2 className="size-6 text-primary" />
            </div>
          </div>
          <h1 className="text-lg font-semibold text-foreground">
            Você foi convidado
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            para o workspace <span className="font-medium text-foreground">{workspaceName}</span>
            {' '}como <span className="font-medium text-foreground">{role === 'admin' ? 'Admin' : 'Membro'}</span>
          </p>
          <p className="text-xs text-muted-foreground mt-2 font-mono bg-muted/50 rounded px-2 py-1 inline-block">
            {inviteEmail}
          </p>
        </div>

        <div className="p-8">
          {/* Tela de escolha */}
          {mode === 'choice' && (
            <div className="space-y-3">
              {error && (
                <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-600 dark:text-amber-400 text-center">
                  {error}
                </p>
              )}
              <p className="text-sm text-muted-foreground text-center mb-4">
                Para aceitar o convite, escolha uma opção:
              </p>
              <Button className="w-full" onClick={() => { setMode('signup'); setError('') }}>
                Criar uma conta nova
              </Button>
              <Button variant="outline" className="w-full" onClick={() => { setMode('login'); setError('') }}>
                Já tenho conta — Entrar
              </Button>
            </div>
          )}

          {/* Formulário de signup */}
          {mode === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <p className="text-sm font-medium text-foreground mb-4">Criar conta</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="invite-email-display">E-mail</Label>
                <Input
                  id="invite-email-display"
                  type="email"
                  value={inviteEmail}
                  disabled
                  className="opacity-60"
                />
                <p className="text-xs text-muted-foreground">E-mail fixado pelo convite</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="invite-name">Seu nome</Label>
                <Input
                  id="invite-name"
                  type="text"
                  placeholder="Como você quer ser chamado"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isPending}
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="invite-password">Senha</Label>
                <Input
                  id="invite-password"
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isPending}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="invite-confirm">Confirmar senha</Label>
                <Input
                  id="invite-confirm"
                  type="password"
                  placeholder="Repita a senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isPending}
                />
              </div>

              {error && (
                <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? <><Loader2 className="mr-2 size-4 animate-spin" />Criando conta…</> : 'Criar conta e aceitar convite'}
              </Button>

              <button
                type="button"
                onClick={() => { setMode('choice'); setError('') }}
                className="w-full text-xs text-muted-foreground hover:text-foreground text-center"
              >
                Voltar
              </button>
            </form>
          )}

          {/* Formulário de login */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <p className="text-sm font-medium text-foreground mb-4">Entrar na sua conta</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="login-email-display">E-mail</Label>
                <Input
                  id="login-email-display"
                  type="email"
                  value={inviteEmail}
                  disabled
                  className="opacity-60"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="login-password">Senha</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isPending}
                  autoFocus
                />
              </div>

              {error && (
                <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? <><Loader2 className="mr-2 size-4 animate-spin" />Entrando…</> : 'Entrar e aceitar convite'}
              </Button>

              <button
                type="button"
                onClick={() => { setMode('choice'); setError('') }}
                className="w-full text-xs text-muted-foreground hover:text-foreground text-center"
              >
                Voltar
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
