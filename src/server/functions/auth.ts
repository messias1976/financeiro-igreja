import { createServerFn } from '@tanstack/react-start'
import z from 'zod'
import { redirect } from '@tanstack/react-router'
import {
  createAdminClient,
  createPublicAccountClient,
  createSessionClient,
} from '../lib/appwrite'
import { AppwriteException, ID } from 'node-appwrite'
import {
  deleteCookie,
  getCookie,
  getRequestHeader,
  setCookie,
  setResponseStatus,
} from '@tanstack/react-start/server'

const DEFAULT_LOGIN_PREFS = {
  role: 'membro',
  plan: 'premium',
  churchName: 'Igreja local',
} as const

type RoleKey = 'administrador' | 'tesoureiro' | 'pastor' | 'membro'
type PlanoAtivo = 'inicial' | 'padrao' | 'premium'

type AdminUsersClient = {
  get: (userId: string) => Promise<{ prefs?: unknown; email?: string }>
  updatePrefs: (userId: string, prefs: Record<string, unknown>) => Promise<unknown>
}

function resolveRequestOrigin() {
  const appUrl = process.env.APP_URL?.trim()
  if (appUrl) {
    return appUrl.replace(/\/$/, '')
  }

  const origin = getRequestHeader('origin')
  if (origin) {
    return origin
  }

  const host = getRequestHeader('host')
  if (host) {
    const protocol =
      process.env.NODE_ENV === 'production' ||
      getRequestHeader('x-forwarded-proto') === 'https'
        ? 'https'
        : 'http'
    return `${protocol}://${host}`
  }

  return `https://imagine-${process.env.APPWRITE_PROJECT_ID}.appwrite.network`
}

function parseProtocolFromUrl(value?: string | null) {
  if (!value) {
    return null
  }

  try {
    return new URL(value).protocol.toLowerCase()
  } catch {
    return null
  }
}

function shouldUseSecureCookies() {
  const secureCookieOverride = process.env.AUTH_COOKIE_SECURE?.trim().toLowerCase()
  if (secureCookieOverride === 'true') {
    return true
  }

  if (secureCookieOverride === 'false') {
    return false
  }

  const forwardedProto = getRequestHeader('x-forwarded-proto')
    ?.split(',')[0]
    ?.trim()
    .toLowerCase()

  if (forwardedProto === 'https') {
    return true
  }

  if (forwardedProto === 'http') {
    return false
  }

  const protocolCandidates = [
    getRequestHeader('origin'),
    getRequestHeader('referer'),
    process.env.APP_URL?.trim(),
    resolveRequestOrigin(),
  ]

  for (const candidate of protocolCandidates) {
    const protocol = parseProtocolFromUrl(candidate)
    if (protocol === 'https:') {
      return true
    }

    if (protocol === 'http:') {
      return false
    }
  }

  const host = getRequestHeader('host') ?? ''
  if (/localhost|127\.0\.0\.1|\[::1\]|0\.0\.0\.0/i.test(host)) {
    return false
  }

  return process.env.NODE_ENV === 'production'
}

function inferRoleFromEmail(email?: unknown): RoleKey | null {
  if (typeof email !== 'string') {
    return null
  }

  const normalized = email.trim().toLowerCase()

  if (normalized.startsWith('admin@') || normalized.startsWith('admin.')) {
    return 'administrador'
  }

  if (
    normalized.startsWith('tesoureiro@') ||
    normalized.startsWith('tesoureiro.') ||
    normalized.startsWith('tesouraria@') ||
    normalized.startsWith('tesouraria.') ||
    normalized.startsWith('financeiro@') ||
    normalized.startsWith('financeiro.')
  ) {
    return 'tesoureiro'
  }

  if (normalized.startsWith('pastor@') || normalized.startsWith('pastor.')) {
    return 'pastor'
  }

  return null
}

function normalizePlan(value?: unknown): PlanoAtivo | null {
  if (typeof value !== 'string') {
    return null
  }

  const normalized = value.trim().toLowerCase()

  if (normalized === 'inicial') return 'inicial'
  if (normalized === 'padrao' || normalized === 'paroquia') return 'padrao'
  if (normalized === 'premium' || normalized === 'diocese') return 'premium'

  return null
}

function inferPlanFromEmail(email?: unknown): PlanoAtivo | null {
  if (typeof email !== 'string') {
    return null
  }

  const normalized = email.trim().toLowerCase()

  if (normalized.includes('.inicial@')) return 'inicial'
  if (normalized.includes('.padrao@') || normalized.includes('.paroquia@')) return 'padrao'
  if (normalized.includes('.premium@') || normalized.includes('.diocese@')) return 'premium'

  return null
}

function buildMissingDefaultPrefs(prefs?: unknown, email?: unknown) {
  const currentPrefs = (prefs as Record<string, unknown> | undefined) ?? {}
  const missing: Record<string, string> = {}

  const storedRole = typeof currentPrefs.role === 'string' ? currentPrefs.role.trim().toLowerCase() : ''
  const inferredRole = inferRoleFromEmail(email)

  if (inferredRole && (!storedRole || storedRole === 'membro')) {
    missing.role = inferredRole
  } else if (!storedRole) {
    missing.role = DEFAULT_LOGIN_PREFS.role
  }

  const storedPlan = normalizePlan(currentPrefs.plan)
  const inferredPlan = inferPlanFromEmail(email)

  if (!storedPlan) {
    missing.plan = inferredPlan ?? DEFAULT_LOGIN_PREFS.plan
  }

  if (typeof currentPrefs.churchName !== 'string' || !currentPrefs.churchName.trim()) {
    missing.churchName = DEFAULT_LOGIN_PREFS.churchName
  }

  return {
    currentPrefs,
    missing,
  }
}

async function ensureMissingDefaultPrefsBestEffort(users: AdminUsersClient, userId: string) {
  try {
    const signedInUser = await users.get(userId)
    const { currentPrefs, missing } = buildMissingDefaultPrefs(signedInUser.prefs, signedInUser.email)

    if (Object.keys(missing).length > 0) {
      await users.updatePrefs(userId, {
        ...(currentPrefs as Record<string, string>),
        ...missing,
      })
    }
  } catch (error) {
    // Não pode bloquear autenticação por falha de permissão no Users API.
    console.warn('[auth] não foi possível atualizar prefs padrão no sign-in', error)
  }
}

export const getAppwriteSessionFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const session = getCookie(`appwrite-session-secret`)

    if (!session) {
      return null
    }

    return session
  },
)

const setAppwriteSessionCookiesSchema = z.object({
  id: z.string(),
  secret: z.string(),
  expires: z.string().optional(),
})

export const setAppwriteSessionCookiesFn = createServerFn({ method: 'POST' })
  .inputValidator(setAppwriteSessionCookiesSchema)
  .handler(
    async ({
      data,
    }: {
      data: z.infer<typeof setAppwriteSessionCookiesSchema>
    }) => {
      const { id, secret, expires } = data

      const useSecureCookies = shouldUseSecureCookies()
      const sameSitePolicy: 'none' | 'lax' = useSecureCookies ? 'none' : 'lax'

      let maxAge = 30 * 24 * 60 * 60
      if (expires) {
        const expireTime = Math.floor(new Date(expires).getTime() / 1000)
        const now = Math.floor(Date.now() / 1000)
        maxAge = Math.max(0, expireTime - now)
      }

      setCookie(`appwrite-session-secret`, secret, {
        httpOnly: true,
        secure: useSecureCookies,
        sameSite: sameSitePolicy,
        maxAge,
        path: '/',
      })

      setCookie(`appwrite-session-id`, id, {
        httpOnly: true,
        secure: useSecureCookies,
        sameSite: sameSitePolicy,
        maxAge,
        path: '/',
      })
    },
  )

const signUpInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  redirect: z.string().optional(),
})

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  redirect: z.string().optional(),
})

export const signUpFn = createServerFn({ method: 'POST' })
  .inputValidator(signUpInSchema)
  .handler(async ({ data }) => {
    const { email, password, redirect: redirectUrl } = data
    const { account } = createPublicAccountClient()

    const users = (() => {
      try {
        return createAdminClient().users
      } catch (error) {
        console.warn('[auth] cliente admin indisponivel no sign-up', error)
        return null
      }
    })()

    try {
      const origin = resolveRequestOrigin()

      account.client.addHeader('origin', origin)

      const createdUser = await account.create({ userId: ID.unique(), email, password })
      const session = await account.createEmailPasswordSession({
        email,
        password,
      })
      await setAppwriteSessionCookiesFn({
        data: {
          id: session.$id,
          secret: session.secret,
          expires: session.expire || undefined,
        },
      })

      if (users) {
        try {
          await users.updatePrefs(createdUser.$id, {
            ...DEFAULT_LOGIN_PREFS,
          })
        } catch (error) {
          console.warn('[auth] não foi possível aplicar prefs padrão no sign-up', error)
        }
      }
    } catch (_error) {
      const error = _error as AppwriteException
      setResponseStatus(error.code)
      throw {
        message: error.message,
        status: error.code,
      }
    }

    if (redirectUrl) {
      throw redirect({ to: redirectUrl })
    } else {
      throw redirect({ to: '/dashboard' })
    }
  })

export const signInFn = createServerFn({ method: 'POST' })
  .inputValidator(signInSchema)
  .handler(async ({ data }) => {
    const { email, password, redirect: redirectUrl } = data
    const { account } = createPublicAccountClient()

    const users = (() => {
      try {
        return createAdminClient().users
      } catch (error) {
        console.warn('[auth] cliente admin indisponivel no sign-in', error)
        return null
      }
    })()

    try {
      const origin = resolveRequestOrigin()

      account.client.addHeader('origin', origin)

      const session = await account.createEmailPasswordSession({
        email,
        password,
      })

      await setAppwriteSessionCookiesFn({
        data: {
          id: session.$id,
          secret: session.secret,
          expires: session.expire || undefined,
        },
      })

      const signedInUserId = (session as unknown as { userId?: string }).userId
      if (signedInUserId && users) {
        await ensureMissingDefaultPrefsBestEffort(users, signedInUserId)
      }
    } catch (_error) {
      const error = _error as AppwriteException
      setResponseStatus(error.code)
      throw {
        message: error.message,
        status: error.code,
      }
    }

    return {
      success: true,
      redirectTo: redirectUrl || '/dashboard',
    }
  })

export const signOutFn = createServerFn({ method: 'GET' }).handler(async () => {
  try {
    const session = await getAppwriteSessionFn()

    if (session) {
      const client = await createSessionClient(session)
      await client.account.deleteSession({ sessionId: 'current' })
    }
  } catch (error) {
    console.error('Error deleting session:', error)
  } finally {
    clearAuthCookies()
  }
})

export const authMiddleware = createServerFn({ method: 'GET' }).handler(
  async () => {
    const currentUser = await getCurrentUser()

    return {
      currentUser,
    }
  },
)

const clearAuthCookies = () => {
  deleteCookie(`appwrite-session-secret`)
  deleteCookie(`appwrite-session-id`)
  deleteCookie(`a_session_${process.env.APPWRITE_PROJECT_ID}`)
}

export const getCurrentUser = createServerFn({ method: 'GET' }).handler(
  async () => {
    const session = await getAppwriteSessionFn()

    if (!session) {
      return null
    }

    try {
      const client = await createSessionClient(session)
      const currentUser = await client.account.get()
      return currentUser
    } catch (_error) {
      const error = _error as AppwriteException
      if (error.code === 401) {
        clearAuthCookies()
      }
      return null
    }
  },
)

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

export const forgotPasswordFn = createServerFn({ method: 'POST' })
  .inputValidator(forgotPasswordSchema)
  .handler(async ({ data }) => {
    const { email } = data
    const { account } = createPublicAccountClient()

    try {
      const origin = resolveRequestOrigin()

      account.client.addHeader('origin', origin)

      const resetUrl = `${origin}/reset-password`
      await account.createRecovery({ email, url: resetUrl })

      return {
        success: true,
        message: 'Password recovery email sent successfully',
      }
    } catch (_error) {
      const error = _error as AppwriteException
      setResponseStatus(error.code)
      throw {
        message: error.message,
        status: error.code,
      }
    }
  })

const resetPasswordSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  secret: z.string().min(1, 'Secret is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
})

export const resetPasswordFn = createServerFn({ method: 'POST' })
  .inputValidator(resetPasswordSchema)
  .handler(async ({ data }) => {
    const { userId, secret, password, confirmPassword } = data
    const { account } = createPublicAccountClient()

    if (password !== confirmPassword) {
      setResponseStatus(400)
      throw {
        message: 'Passwords do not match',
        status: 400,
      }
    }

    try {
      const origin = resolveRequestOrigin()

      account.client.addHeader('origin', origin)

      await account.updateRecovery({
        userId,
        secret,
        password,
      })

      return {
        success: true,
        message: 'Password reset successfully',
      }
    } catch (_error) {
      const error = _error as AppwriteException
      setResponseStatus(error.code)
      throw {
        message: error.message,
        status: error.code,
      }
    }
  })