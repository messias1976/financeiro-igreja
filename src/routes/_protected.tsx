import { createFileRoute, redirect } from '@tanstack/react-router'
import { authMiddleware } from '@/server/functions/auth'

function buildRedirectPath(location: { pathname: string; searchStr?: unknown; hash?: unknown }) {
  const searchPart = typeof location.searchStr === 'string' ? location.searchStr : ''
  const hashPart = typeof location.hash === 'string' ? location.hash : ''
  return `${location.pathname}${searchPart}${hashPart}`
}

function isRedirectLikeError(error: unknown) {
  if (!error || typeof error !== 'object') {
    return false
  }

  const candidate = error as {
    status?: unknown
    statusCode?: unknown
    redirect?: unknown
    message?: unknown
  }

  return (
    candidate.redirect === true ||
    candidate.status === 302 ||
    candidate.statusCode === 302 ||
    (typeof candidate.message === 'string' && candidate.message.includes('redirect'))
  )
}

export const Route = createFileRoute('/_protected')({
  loader: async ({ location }) => {
    try {
      const { currentUser } = await authMiddleware()

      if (!currentUser) {
        // Se não houver utilizador, redireciona guardando a URL atual para voltar depois
        const redirectPath = buildRedirectPath(location)
        throw redirect({
          to: '/sign-in',
          search: {
            redirect: redirectPath,
          },
        })
      }

      return {
        currentUser,
      }
    } catch (error) {
      // Se for um redirect do TanStack, deixa passar
      if (isRedirectLikeError(error)) throw error

      // Qualquer outro erro de auth, manda para o login por segurança
      throw redirect({ to: '/sign-in' })
    }
  },
})