import { useMutation } from '@tanstack/react-query'
import { createFileRoute, Link, useNavigate, useRouter, useSearch } from '@tanstack/react-router'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useServerFn } from '@tanstack/react-start'
import { ShieldCheck } from 'lucide-react'

import { AuthCard } from '@/components/auth/auth-card'
import { AuthForm } from '@/components/auth/auth-form'
import { AuthField } from '@/components/auth/auth-field'
import { signInFn } from '@/server/functions/auth'
import { NavBar } from '@/components/landing/NavBar'
import { Footer } from '@/components/landing/Footer'

const searchSchema = z.object({
  redirect: z.string().optional(),
})

const signInSchema = z.object({
  churchName: z.string().optional(),
  username: z.string().min(1, 'O usuário é obrigatório'),
  password: z.string().min(1, 'A senha é obrigatória'),
})

export const Route = createFileRoute('/_auth/sign-in')({
  validateSearch: searchSchema,
  component: SignInPage,
})

function normalizeRedirectPath(redirect?: string) {
  if (!redirect) {
    return undefined
  }

  if (redirect.includes('[object Object]')) {
    return undefined
  }

  if (redirect.startsWith('/')) {
    try {
      const parsed = new URL(redirect, 'http://local')
      const path = `${parsed.pathname}${parsed.search}${parsed.hash}`
      return path.startsWith('/') ? path : undefined
    } catch {
      return undefined
    }
  }

  return undefined
}

function SignInPage() {
  const search = useSearch({ from: '/_auth/sign-in' })
  const navigate = useNavigate()
  const router = useRouter()
  const signIn = useServerFn(signInFn)
  const safeRedirect = normalizeRedirectPath(search.redirect)

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      churchName: '',
      username: '',
      password: '',
    },
  })

  const finishAuth = async (serverRedirect?: string) => {
    const destination =
      typeof serverRedirect === 'string' && serverRedirect.startsWith('/')
        ? serverRedirect
        : safeRedirect || '/dashboard'

    await router.invalidate()

    if (typeof window !== 'undefined') {
      window.location.assign(destination)
      return
    }

    await navigate({ to: destination })
  }

  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof signInSchema>) => {
      return signIn({
        data: {
          ...data,
          redirect: safeRedirect,
        },
      })
    },
    onSuccess: async (result: unknown) => {
      const redirectTo =
        result &&
        typeof result === 'object' &&
        'redirectTo' in result &&
        typeof (result as { redirectTo?: unknown }).redirectTo === 'string'
          ? (result as { redirectTo: string }).redirectTo
          : undefined

      await finishAuth(redirectTo)
    },
    onError: async (error: unknown) => {
      const candidate = (error as {
        status?: unknown
        redirect?: unknown
        message?: unknown
      } | null) ?? null

      const isRedirectError =
        candidate?.redirect === true ||
        candidate?.status === 302 ||
        (typeof candidate?.message === 'string' && candidate.message.includes('redirect'))

      if (isRedirectError) {
        await finishAuth()
        return
      }

      form.setError('root', { message: 'Igreja, usuário ou senha incorretos.' })
    },
  })

  return (
    <div style={{ background: 'linear-gradient(180deg, #0A1128 0%, #080E23 100%)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <NavBar />
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem' }}>
        <AuthCard
          title="Login"
          description="Aceda à plataforma de gestão financeira com os seus dados de acesso."
        >
          <div className="flex flex-col">
            <div className="mb-8 flex justify-center">
              <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-tighter text-emerald-400 border border-emerald-500/20">
                <ShieldCheck size={12} /> Conexão Encriptada
              </div>
            </div>

            <AuthForm
              form={form}
              onSubmit={(data) => mutation.mutate(data)}
              isLoading={mutation.isPending}
              submitText="Entrar no Sistema"
              loadingText="Verificando..."
            >
              {(f) => (
                <>
                  <AuthField
                    control={f.control}
                    name="churchName"
                    label="Nome da Igreja (opcional)"
                    placeholder="Igreja de teste: igreja-seed"
                    type="text"
                  />

                  <AuthField
                    control={f.control}
                    name="username"
                    label="Usuário"
                    placeholder="admin ou admin@igreja.com"
                    type="text"
                  />

                  <div className="space-y-2">
                    <AuthField control={f.control} name="password" label="Senha" placeholder="••••••••" type="password" />
                    <div className="text-right">
                      <Link to="/forgot-password" title="Recuperar senha" className="text-xs text-slate-500 hover:text-amber-400 transition-colors">
                        Esqueceu a senha?
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </AuthForm>

            <div className="mt-8 pt-6 border-t border-white/5 text-center">
              <p className="text-sm text-slate-400">
                Novo por aqui? <Link to="/sign-up" className="text-amber-400 font-bold hover:underline">Criar conta</Link>
              </p>
            </div>
          </div>
        </AuthCard>
      </main>
      <Footer />
    </div>
  )
}