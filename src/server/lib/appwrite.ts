/**
 * @imagine-readonly
 * These should only be imported in server-side actions (SSR, functions).
 */

import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { Client, Account, Storage, Avatars, Users } from 'node-appwrite'

let loadedDotEnv = false

function loadDotEnvIfNeeded() {
  if (loadedDotEnv) {
    return
  }

  loadedDotEnv = true

  const envPath = resolve(process.cwd(), '.env')
  if (!existsSync(envPath)) {
    return
  }

  const content = readFileSync(envPath, 'utf-8')
  const lines = content.split(/\r?\n/)

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) {
      continue
    }

    const delimiterIndex = line.indexOf('=')
    if (delimiterIndex < 1) {
      continue
    }

    const key = line.slice(0, delimiterIndex).trim()
    const value = line.slice(delimiterIndex + 1).trim()

    if (process.env[key] !== undefined) {
      continue
    }

    process.env[key] = value.replace(/^['"]|['"]$/g, '')
  }
}

const getAppwriteBaseCredentials = () => {
  loadDotEnvIfNeeded()

  const endpoint = process.env.APPWRITE_ENDPOINT
  if (!endpoint) {
    throw new Error('APPWRITE_ENDPOINT is not set')
  }

  const projectId = process.env.APPWRITE_PROJECT_ID
  if (!projectId) {
    throw new Error('APPWRITE_PROJECT_ID is not set')
  }

  return {
    endpoint,
    projectId,
  }
}

const getAppwriteAdminCredentials = () => {
  const { endpoint, projectId } = getAppwriteBaseCredentials()

  const apiKey = process.env.APPWRITE_API_KEY
  if (!apiKey) {
    throw new Error('APPWRITE_API_KEY is not set')
  }

  return {
    endpoint,
    projectId,
    apiKey,
  }
}

export function createPublicAccountClient(): {
  client: Client
  account: Account
} {
  const { endpoint, projectId } = getAppwriteBaseCredentials()
  const client = new Client().setEndpoint(endpoint).setProject(projectId)

  return {
    client,
    account: new Account(client),
  }
}

export async function createSessionClient(session: string) {
  const { endpoint, projectId } = getAppwriteBaseCredentials()
  const client = new Client().setEndpoint(endpoint).setProject(projectId)
  client.setSession(session)

  return {
    client: client,
    account: new Account(client),
    users: new Users(client),
    storage: new Storage(client),
  }
}

export function createAdminClient(): {
  client: Client
  account: Account
  avatars: Avatars
  users: Users
} {
  const { endpoint, projectId, apiKey } = getAppwriteAdminCredentials()
  const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setKey(apiKey)

  return {
    client: client,
    account: new Account(client),
    avatars: new Avatars(client),
    users: new Users(client),
  }
}
