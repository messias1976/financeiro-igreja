import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { Client, Account } from 'node-appwrite'

function loadEnvFromDotFile() {
  const envPath = resolve(process.cwd(), '.env')
  if (!existsSync(envPath)) {
    return
  }

  const content = readFileSync(envPath, 'utf-8')
  for (const raw of content.split(/\r?\n/)) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) {
      continue
    }

    const separatorIndex = line.indexOf('=')
    if (separatorIndex < 1) {
      continue
    }

    const key = line.slice(0, separatorIndex).trim()
    const value = line
      .slice(separatorIndex + 1)
      .trim()
      .replace(/^['\"]|['\"]$/g, '')

    if (process.env[key] === undefined) {
      process.env[key] = value
    }
  }
}

async function tryLogin(email, password) {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)

  if (process.env.APP_URL) {
    client.addHeader('origin', process.env.APP_URL.replace(/\/$/, ''))
  }

  const account = new Account(client)

  try {
    const session = await account.createEmailPasswordSession({ email, password })
    return { email, ok: true, sessionId: session.$id }
  } catch (error) {
    return {
      email,
      ok: false,
      code: typeof error === 'object' && error ? error.code : undefined,
      message:
        typeof error === 'object' && error && 'message' in error
          ? String(error.message)
          : String(error),
    }
  }
}

async function main() {
  loadEnvFromDotFile()

  const required = ['APPWRITE_ENDPOINT', 'APPWRITE_PROJECT_ID']
  const missing = required.filter((k) => !process.env[k])

  if (missing.length > 0) {
    console.log(JSON.stringify({ ok: false, reason: 'missing_env', missing }, null, 2))
    process.exit(1)
  }

  const checks = [
    ['admin@igreja.com', 'Admin@1234'],
    ['tesoureiro@igreja.com', 'Tesoureiro@1234'],
    ['pastor@igreja.com', 'Pastor@1234'],
    ['membro@igreja.com', 'Membro@1234'],
    ['dono@financialchurch.com', 'DonoSaas@1234'],
  ]

  const results = []
  for (const [email, password] of checks) {
    results.push(await tryLogin(email, password))
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        appUrl: process.env.APP_URL ?? null,
        results,
      },
      null,
      2,
    ),
  )
}

main().catch((error) => {
  console.log(
    JSON.stringify(
      {
        ok: false,
        reason: 'exception',
        message: error instanceof Error ? error.message : String(error),
      },
      null,
      2,
    ),
  )
  process.exit(1)
})
