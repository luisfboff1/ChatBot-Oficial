'use client'

import { useMemo, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'
import { signInWithEmail } from '@/lib/supabase-browser'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

/**
 * Página de Login - Server-side Auth
 *
 * Features:
 * - Login com email/senha usando Supabase Auth
 * - Feedback de sessão expirada via query (?expired=true)
 * - Verifica profile antes de redirecionar
 */
export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [formData, setFormData] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const sessionExpired = useMemo(() => searchParams?.get('expired') === 'true', [searchParams])
  const redirectTo = useMemo(() => searchParams?.get('redirect') ?? '/dashboard', [searchParams])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Validação básica
      if (!formData.email || !formData.password) {
        setError('Por favor, preencha todos os campos')
        setLoading(false)
        return
      }

      // Login via Supabase Auth
      const { data, error: signInError } = await signInWithEmail(formData.email, formData.password)

      if (signInError) {
        console.error('[Login] Erro:', signInError)

        // Mensagens de erro amigáveis
        if (signInError.message.includes('Invalid login credentials')) {
          setError('Email ou senha incorretos')
        } else if (signInError.message.includes('Email not confirmed')) {
          setError('Email não confirmado. Verifique sua caixa de entrada.')
        } else {
          setError(signInError.message)
        }

        setLoading(false)
        return
      }

      if (!data.user) {
        setError('Erro ao fazer login. Tente novamente.')
        setLoading(false)
        return
      }

      console.log('[Login] Usuário autenticado:', data.user.email)

      // Verificar se usuário tem profile com client_id
      const profileResponse = await fetch('/api/auth/verify-profile')
      const profileData = await profileResponse.json()

      if (!profileData.success) {
        setError('Usuário sem perfil configurado. Contate o administrador.')
        setLoading(false)
        return
      }

      console.log('[Login] Profile verificado, client_id:', profileData.client_id)

      // Redirect para destino
      router.push(redirectTo)
      router.refresh()
    } catch (err) {
      console.error('[Login] Erro inesperado:', err)
      setError('Erro inesperado ao fazer login. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-blue">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-mint-500/15 via-transparent to-azure-500/10" />
      <div className="absolute inset-x-0 top-0 -z-10 h-64 bg-gradient-to-b from-mint-500/20 to-transparent blur-[140px]" />
      <div className="absolute inset-y-0 right-0 -z-10 hidden w-1/3 bg-gradient-to-bl from-azure-500/20 to-transparent blur-[180px] lg:block" />

      <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center gap-12 px-6 py-24 lg:flex-row lg:items-center">
        <div className="space-y-6 text-foreground lg:w-1/2">
          <span className="inline-flex items-center gap-2 rounded-full border border-mint-500/40 bg-mint-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.4em] text-mint-300">
            UzzApp • acesso seguro
          </span>
          <h1 className="text-4xl font-bold leading-tight md:text-5xl">
            Conecte-se ao{' '}
            <span className="bg-gradient-to-r from-mint-500 to-azure-500 bg-clip-text text-transparent">
              UzzApp Dashboard
            </span>
          </h1>
          <p className="text-base text-foreground/70 md:text-lg">
            Centralize conversas, métricas e configurações do seu atendimento 24/7. Acesso exclusivo
            para equipes autenticadas.
          </p>
          <ul className="space-y-3 text-sm text-foreground/70">
            <li className="flex items-start gap-3">
              <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-mint-500/20 text-xs font-semibold text-mint-300">
                ✓
              </span>
              Sessão segura com Supabase Auth e tokens de curta duração.
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-mint-500/20 text-xs font-semibold text-mint-300">
                ✓
              </span>
              Apenas clientes ativos com perfil configurado acessam o painel.
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-mint-500/20 text-xs font-semibold text-mint-300">
                ✓
              </span>
              Preparado para login social (Google/Microsoft) e MFA do Supabase.
            </li>
          </ul>
        </div>

        <div className="lg:w-1/2">
          <Card className="w-full max-w-md border border-mint-500/20 bg-ink-800/80 shadow-glow backdrop-blur">
            <CardHeader className="space-y-3 text-left">
              <CardTitle className="text-2xl font-semibold text-mint-200">Entrar no UzzApp</CardTitle>
              <CardDescription className="text-sm text-foreground/70">
                Central de atendimento 24/7 com inteligência multiagente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {sessionExpired && (
                <div className="flex items-start gap-3 rounded-xl border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-none" />
                  <span>Sessão expirada. Entre novamente para continuar.</span>
                </div>
              )}

              {error && (
                <div className="flex items-start gap-3 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-none" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2 text-left">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={(event) =>
                      setFormData((prev) => ({ ...prev, email: event.target.value }))
                    }
                    disabled={loading}
                    className="border border-mint-500/20 bg-ink-900/60"
                  />
                </div>

                <div className="space-y-2 text-left">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="Digite sua senha"
                      value={formData.password}
                      onChange={(event) =>
                        setFormData((prev) => ({ ...prev, password: event.target.value }))
                      }
                      disabled={loading}
                      className="border border-mint-500/20 bg-ink-900/60 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-3 flex items-center text-foreground/60 transition-colors hover:text-foreground"
                      aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                      disabled={loading}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="glow"
                  disabled={
                    loading || !formData.email.trim() || !formData.password.trim()
                  }
                  className="w-full"
                >
                  {loading ? 'Entrando...' : 'Entrar'}
                </Button>
              </form>

              <div className="text-center text-sm text-foreground/70">
                <p>
                  Esqueceu sua senha?{' '}
                  <Link href="/forgot-password" className="text-mint-300 hover:text-mint-200">
                    Recuperar acesso
                  </Link>
                </p>
                <p className="mt-4">
                  Não tem conta?{' '}
                  <Link href="/register" className="text-mint-300 hover:text-mint-200">
                    Criar acesso
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
