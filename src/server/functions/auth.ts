import { createServerFn } from '@tanstack/react-start'
import z from 'zod'
import { redirect } from '@tanstack/react-router'
import { createHmac, timingSafeEqual } from 'node:crypto'
import {
  createAdminClient,
  createPublicAccountClient,
  createSessionClient,
} from '../lib/appwrite'
import { AppwriteException, ID, Query } from 'node-appwrite'
import {
  deleteCookie,
  getCookie,
  getRequestHeader,
  setCookie,
  setResponseStatus,
} from '@tanstack/react-start/server'

const DEFAULT_LOGIN_PREFS = {
  role: 'membro',
  churchPlan: 'inicial',
  plan: 'inicial',
  churchName: 'Igreja local',
} as const

type RoleKey = 'dono_saas' | 'administrador' | 'tesoureiro' | 'pastor' | 'membro'
type PlanoAtivo = 'inicial' | 'padrao' | 'premium'
type AuthCookiePayload = {
  userId: string
  exp: number
}

const AUTH_USER_COOKIE_NAME = 'financialchurch-auth'

const TEST_USER_PROFILES: Record<
  string,
  { role: RoleKey; churchPlan: PlanoAtivo; churchName: string }
> = {
  'dono@financialchurch.com': {
    role: 'dono_saas',
    churchPlan: 'premium',
    churchName: 'Painel SaaS financialChurch',
  },
  'admin@igreja.com': {
    role: 'administrador',
    churchPlan: 'padrao',
    churchName: 'Igreja de teste: igreja-seed',
  },
  'tesoureiro@igreja.com': {
    role: 'tesoureiro',
    churchPlan: 'padrao',
    churchName: 'Igreja de teste: igreja-seed',
  },
  'pastor@igreja.com': {
    role: 'pastor',
    churchPlan: 'padrao',
    churchName: 'Igreja de teste: igreja-seed',
  },
  'membro@igreja.com': {
    role: 'membro',
    churchPlan: 'padrao',
    churchName: 'Igreja de teste: igreja-seed',
  },
}

function getSaasOwnerEmails() {
  const configured = process.env.SAAS_OWNER_EMAILS ?? process.env.SAAS_OWNER_EMAIL ?? ''
  const configuredList = configured
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)

  return new Set(['dono@financialchurch.com', 'owner@financialchurch.com', ...configuredList])
}

function isSaasOwnerEmail(email?: unknown) {
  if (typeof email !== 'string') {
    return false
  }

  return getSaasOwnerEmails().has(email.trim().toLowerCase())
}

function getTestUserProfile(email?: unknown) {
  if (typeof email !== 'string') {
    return null
  }

  return TEST_USER_PROFILES[email.trim().toLowerCase()] ?? null
}

function toBase64Url(value: string) {
  return Buffer.from(value, 'utf-8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

function fromBase64Url(value: string) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padding = (4 - (normalized.length % 4)) % 4
  return Buffer.from(`${normalized}${'='.repeat(padding)}`, 'base64').toString('utf-8')
}

function getAuthCookieSecret() {
  return (
    process.env.APP_AUTH_SECRET?.trim() ||
    process.env.APPWRITE_API_KEY?.trim() ||
    process.env.APPWRITE_PROJECT_ID?.trim() ||
    'financialchurch-dev-secret'
  )
}

function createSignedAuthCookie(payload: AuthCookiePayload) {
  const serializedPayload = JSON.stringify(payload)
  const encodedPayload = toBase64Url(serializedPayload)
  const signature = createHmac('sha256', getAuthCookieSecret())
    .update(encodedPayload)
    .digest('base64url')

  return `${encodedPayload}.${signature}`
}

function parseSignedAuthCookie(value?: string | null): AuthCookiePayload | null {
  if (!value) {
    return null
  }

  const [encodedPayload, providedSignature] = value.split('.')
  if (!encodedPayload || !providedSignature) {
    return null
  }

  const expectedSignature = createHmac('sha256', getAuthCookieSecret())
    .update(encodedPayload)
    .digest('base64url')

  const providedBuffer = Buffer.from(providedSignature)
  const expectedBuffer = Buffer.from(expectedSignature)

  if (
    providedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(providedBuffer, expectedBuffer)
  ) {
    return null
  }

  try {
    const parsed = JSON.parse(fromBase64Url(encodedPayload)) as AuthCookiePayload
    if (!parsed?.userId || typeof parsed.userId !== 'string') {
      return null
    }

    if (!parsed?.exp || typeof parsed.exp !== 'number' || parsed.exp <= Date.now()) {
      return null
    }

    return parsed
  } catch {
    return null
  }
}

type AdminUsersClient = {
  get: (userId: string) => Promise<{ prefs?: unknown; email?: string }>
  updatePrefs: (userId: string, prefs: Record<string, unknown>) => Promise<unknown>
  list?: (params?: {
    queries?: string[]
    search?: string
    total?: boolean
  }) => Promise<{ users: Array<{ email?: string; prefs?: unknown }> }>
}

function normalizeComparableText(value?: unknown) {
  if (typeof value !== 'string') {
    return ''
  }

  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
}

function buildLoginEmailCandidates(login: string, churchName?: string) {
  const normalizedLogin = login.trim().toLowerCase()
  const candidates = new Set<string>()

  if (!normalizedLogin) {
    return []
  }

  if (normalizedLogin.includes('@')) {
    candidates.add(normalizedLogin)
  } else {
    candidates.add(`${normalizedLogin}@igreja.com`)

    if (normalizedLogin === 'dono' || normalizedLogin === 'owner') {
      for (const ownerEmail of getSaasOwnerEmails()) {
        candidates.add(ownerEmail)
      }
    }
  }

  const normalizedChurch = normalizeComparableText(churchName)
  if (normalizedChurch) {
    const churchSlug = normalizedChurch
      .replace(/[^a-z0-9]+/g, '.')
      .replace(/^\.+|\.+$/g, '')

    if (churchSlug && !normalizedLogin.includes('@')) {
      candidates.add(`${normalizedLogin}@${churchSlug}.com`)

      const firstToken = churchSlug.split('.')[0]
      if (firstToken && firstToken !== 'igreja') {
        candidates.add(`${normalizedLogin}@${firstToken}.com`)
      }
    }
  }

  return Array.from(candidates)
}

async function buildLoginEmailCandidatesWithDirectory(
  login: string,
  churchName: string | undefined,
  users: AdminUsersClient | null,
) {
  const defaultCandidates = buildLoginEmailCandidates(login, churchName)

  if (!users?.list) {
    return defaultCandidates
  }

  const normalizedLogin = normalizeComparableText(login)
  const normalizedChurch = normalizeComparableText(churchName)

  if (!normalizedLogin) {
    return defaultCandidates
  }

  try {
    const result = await users.list({
      queries: [Query.limit(200)],
      search: normalizedLogin,
      total: false,
    })

    const directoryCandidates = result.users
      .filter((user) => typeof user.email === 'string')
      .filter((user) => {
        const email = String(user.email).trim().toLowerCase()
        if (!email) {
          return false
        }

        if (normalizedLogin.includes('@')) {
          if (email !== normalizedLogin) {
            return false
          }
        } else {
          const localPart = email.split('@')[0]?.trim().toLowerCase() ?? ''
          if (localPart !== normalizedLogin) {
            return false
          }
        }

        if (!normalizedChurch) {
          return true
        }

        const userChurch = normalizeComparableText(
          (user.prefs as Record<string, unknown> | undefined)?.churchName,
        )

        if (!userChurch) {
          return false
        }

        return userChurch.includes(normalizedChurch) || normalizedChurch.includes(userChurch)
      })
      .map((user) => String(user.email).trim().toLowerCase())

    return Array.from(new Set([...directoryCandidates, ...defaultCandidates]))
  } catch (error) {
    console.warn('[auth] nao foi possivel resolver usuario via lista do Appwrite', error)
    return defaultCandidates
  }
}

function resolveRequestOrigin() {
  const requestOrigin = getRequestHeader('origin')
  if (requestOrigin) {
    return requestOrigin
  }

  const requestHost = getRequestHeader('host')
  if (requestHost) {
    const protocol =
      process.env.NODE_ENV === 'production' ||
      getRequestHeader('x-forwarded-proto') === 'https'
        ? 'https'
        : 'http'
    return `${protocol}://${requestHost}`
  }

  const appUrl = process.env.APP_URL?.trim()
  if (appUrl) {
    return appUrl.replace(/\/$/, '')
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

  const host = getRequestHeader('host') ?? ''
  if (/localhost|127\.0\.0\.1|\[::1\]|0\.0\.0\.0/i.test(host)) {
    return false
  }

  const protocolCandidates = [
    getRequestHeader('origin'),
    getRequestHeader('referer'),
    resolveRequestOrigin(),
    process.env.APP_URL?.trim(),
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

  return process.env.NODE_ENV === 'production'
}

function inferRoleFromEmail(email?: unknown): RoleKey | null {
  if (typeof email !== 'string') {
    return null
  }

  const normalized = email.trim().toLowerCase()

  if (
    isSaasOwnerEmail(normalized) ||
    normalized.startsWith('dono@') ||
    normalized.startsWith('owner@')
  ) {
    return 'dono_saas'
  }

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

  if (normalized.startsWith('membro@') || normalized.startsWith('member@')) {
    return 'membro'
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
  const testProfile = getTestUserProfile(email)
  const ownerByEmail = isSaasOwnerEmail(email)

  if (testProfile) {
    if (currentPrefs.role !== testProfile.role) {
      missing.role = testProfile.role
    }

    const currentPlan = normalizePlan(currentPrefs.churchPlan ?? currentPrefs.plan)
    if (currentPlan !== testProfile.churchPlan) {
      missing.churchPlan = testProfile.churchPlan
      missing.plan = testProfile.churchPlan
    }

    if (currentPrefs.churchName !== testProfile.churchName) {
      missing.churchName = testProfile.churchName
    }

    return {
      currentPrefs,
      missing,
    }
  }

  const storedRole = typeof currentPrefs.role === 'string' ? currentPrefs.role.trim().toLowerCase() : ''
  const inferredRole = inferRoleFromEmail(email)

  if (ownerByEmail && storedRole !== 'dono_saas') {
    missing.role = 'dono_saas'
  } else if (inferredRole && (!storedRole || storedRole === 'membro')) {
    missing.role = inferredRole
  } else if (!storedRole) {
    missing.role = DEFAULT_LOGIN_PREFS.role
  }

  const storedPlan = normalizePlan(currentPrefs.churchPlan ?? currentPrefs.plan)
  const inferredPlan = inferPlanFromEmail(email)

  if (!storedPlan) {
    const resolvedPlan = inferredPlan ?? DEFAULT_LOGIN_PREFS.churchPlan
    missing.churchPlan = resolvedPlan
    missing.plan = resolvedPlan
  } else if (typeof currentPrefs.churchPlan !== 'string' || !currentPrefs.churchPlan.trim()) {
    missing.churchPlan = storedPlan
  }

  if (ownerByEmail) {
    if (currentPrefs.churchName !== 'Painel SaaS financialChurch') {
      missing.churchName = 'Painel SaaS financialChurch'
    }
  } else if (typeof currentPrefs.churchName !== 'string' || !currentPrefs.churchName.trim()) {
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
    const session = getCookie(`appwrite-session-secret`)?.trim()

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

function setAppwriteSessionCookies(data: z.infer<typeof setAppwriteSessionCookiesSchema>) {
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
}

function setAuthenticatedUserCookie({
  userId,
  expires,
}: {
  userId: string
  expires?: string
}) {
  const useSecureCookies = shouldUseSecureCookies()
  const sameSitePolicy: 'none' | 'lax' = useSecureCookies ? 'none' : 'lax'

  let maxAge = 30 * 24 * 60 * 60
  let exp = Date.now() + maxAge * 1000
  if (expires) {
    const expireTime = new Date(expires).getTime()
    if (!Number.isNaN(expireTime)) {
      exp = expireTime
      maxAge = Math.max(0, Math.floor((expireTime - Date.now()) / 1000))
    }
  }

  const token = createSignedAuthCookie({ userId, exp })

  setCookie(AUTH_USER_COOKIE_NAME, token, {
    httpOnly: true,
    secure: useSecureCookies,
    sameSite: sameSitePolicy,
    maxAge,
    path: '/',
  })
}

export const setAppwriteSessionCookiesFn = createServerFn({ method: 'POST' })
  .inputValidator(setAppwriteSessionCookiesSchema)
  .handler(
    async ({
      data,
    }: {
      data: z.infer<typeof setAppwriteSessionCookiesSchema>
    }) => {
      setAppwriteSessionCookies(data)
    },
  )

const signUpInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  redirect: z.string().optional(),
})

const signInSchema = z.object({
  churchName: z.string().optional(),
  username: z.string().min(1, 'Username is required'),
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

      if (session.secret) {
        setAppwriteSessionCookies({
          id: session.$id,
          secret: session.secret,
          expires: session.expire || undefined,
        })
      }

      setAuthenticatedUserCookie({
        userId: createdUser.$id,
        expires: session.expire || undefined,
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
    const {
      churchName,
      username,
      password,
      redirect: redirectUrl,
    } = data
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
      const emailCandidates = await buildLoginEmailCandidatesWithDirectory(
        username,
        churchName,
        users,
      )

      account.client.addHeader('origin', origin)

      if (emailCandidates.length === 0) {
        setResponseStatus(401)
        throw {
          message: 'Invalid login credentials',
          status: 401,
        }
      }

      let session: Awaited<ReturnType<typeof account.createEmailPasswordSession>> | null = null
      let lastError: AppwriteException | null = null

      for (const emailCandidate of emailCandidates) {
        try {
          session = await account.createEmailPasswordSession({
            email: emailCandidate,
            password,
          })
          break
        } catch (_error) {
          const error = _error as AppwriteException
          lastError = error

          if (error.code === 401) {
            continue
          }

          throw error
        }
      }

      if (!session) {
        const statusCode = lastError?.code ?? 401
        setResponseStatus(statusCode)
        throw {
          message: lastError?.message ?? 'Invalid login credentials',
          status: statusCode,
        }
      }

      const signedInUserId = (session as unknown as { userId?: string }).userId
      if (session.secret) {
        setAppwriteSessionCookies({
          id: session.$id,
          secret: session.secret,
          expires: session.expire || undefined,
        })
      }

      if (signedInUserId && users) {
        await ensureMissingDefaultPrefsBestEffort(users, signedInUserId)
      }

      if (signedInUserId) {
        setAuthenticatedUserCookie({
          userId: signedInUserId,
          expires: session.expire || undefined,
        })
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
  deleteCookie(AUTH_USER_COOKIE_NAME)
  deleteCookie(`appwrite-session-secret`)
  deleteCookie(`appwrite-session-id`)
  deleteCookie(`a_session_${process.env.APPWRITE_PROJECT_ID}`)
}

export const getCurrentUser = createServerFn({ method: 'GET' }).handler(
  async () => {
    const authenticatedUser = parseSignedAuthCookie(getCookie(AUTH_USER_COOKIE_NAME))

    if (authenticatedUser) {
      try {
        const { users } = createAdminClient()
        return await users.get(authenticatedUser.userId)
      } catch {
        clearAuthCookies()
      }
    }

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