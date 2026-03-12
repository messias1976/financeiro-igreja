/**
 * @imagine-readonly
 */

import { useMutation } from '@tanstack/react-query'
import {
  createFileRoute,
  Link,
  useNavigate,
  useRouter,
  useSearch,
} from '@tanstack/react-router'
import { z } from 'zod'
import { AuthCard } from '@/components/auth/auth-card'
import { AuthForm } from '@/components/auth/auth-form'
import { AuthField } from '@/components/auth/auth-field'
import { signInFn } from '@/server/functions/auth'
import { useServerFn } from '@tanstack/react-start'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ShieldCheck } from 'lucide-react'

const searchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/_auth/sign-in')({
  component: SignInPage,
  validateSearch: searchSchema,
})

const signInSchema = z.object({
  email: z.string().email('Informe um e-mail valido'),
  password: z.string().min(1, 'A senha e obrigatoria'),
})

function SignInPage() {
  const search = useSearch({ from: '/_auth/sign-in' })
  const navigate = useNavigate()
  const router = useRouter()
  const signIn = useServerFn(signInFn)
  const form = useForm({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const signInMutation = useMutation({
    mutationFn: async (data: z.infer<typeof signInSchema>) => {
      await signIn({
        data: { ...data, redirect: search.redirect },
      })
    },
    onSuccess: async () => {
      // Invalidate router to refresh auth state
      await router.invalidate()
      // Se houver redirect, navega para ele; senão, vai para o dashboard
      if (search.redirect) {
        await navigate({ to: search.redirect })
      } else {
        await navigate({ to: '/dashboard' })
      }
    },

    onError: async (error: {
      status: number
      redirect: boolean
      message: string
    }) => {
      // Check if it's a redirect error (TanStack Start throws redirects as errors)
      if (
        error?.status === 302 ||
        error?.redirect ||
        error?.message?.includes('redirect')
      ) {
        // Invalidate router to refresh auth state
        await router.invalidate()
        // Se houver redirect, navega para ele; senão, vai para o dashboard
        if (search.redirect) {
          await navigate({ to: search.redirect })
        } else {
          await navigate({ to: '/dashboard' })
        }
        return
      }
      console.error('Sign in error:', error)
      form.setError('root', { message: error.message || 'Failed to sign in' })
    },
  })

  return (
    <AuthCard
      title="Bem-vindo de volta"
      description="Entre na sua conta para acompanhar contribuicoes, campanhas e relatorios em tempo real."
    >
      <div className="mb-6 flex items-center justify-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-300/10 px-4 py-1.5 text-xs font-medium text-emerald-100">
          <ShieldCheck className="h-3.5 w-3.5" />
          Sessao protegida por autenticacao segura
        </span>
      </div>

      <AuthForm
        schema={signInSchema}
        defaultValues={{
          email: '',
          password: '',
        }}
        onSubmit={(data) => signInMutation.mutate(data)}
        submitText="Entrar no painel"
        loadingText="Entrando..."
        isLoading={signInMutation.isPending}
        className="space-y-5"
        form={form}
      >
        {(form) => (
          <>
            <AuthField
              control={form.control}
              name="email"
              label="E-mail"
              placeholder="voce@igreja.com"
              type="email"
            />

            <div className="space-y-2">
              <AuthField
                control={form.control}
                name="password"
                label="Senha"
                placeholder="Digite sua senha"
                type="password"
              />
              <div className="text-right">
                <Link
                  to="/forgot-password"
                  className="text-xs text-slate-300 transition hover:text-amber-200"
                >
                  Esqueceu sua senha?
                </Link>
              </div>
            </div>
          </>
        )}
      </AuthForm>

      <div className="mt-5 text-center text-sm text-slate-300 space-x-1">
        <div className="inline-block">Ainda nao tem conta?</div>
        <div className="inline-block">
          <Link
            to="/sign-up"
            search={search.redirect ? { redirect: search.redirect } : undefined}
            className="font-semibold text-amber-200 transition hover:text-amber-100"
          >
            Criar conta
          </Link>
        </div>
      </div>
    </AuthCard>
  )
}
