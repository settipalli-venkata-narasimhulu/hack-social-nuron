import { betterAuth } from 'better-auth'
import { pool } from '@/backend/lib/db'

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL)
const useDevelopmentMemoryDatabase = !hasDatabaseUrl && process.env.NODE_ENV === 'development'

if (useDevelopmentMemoryDatabase) {
  console.warn('DATABASE_URL is not set; authentication is using temporary in-memory storage.')
}

export const auth = betterAuth({
  database: hasDatabaseUrl || !useDevelopmentMemoryDatabase ? pool : undefined,
  baseURL:
    process.env.BETTER_AUTH_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.V0_RUNTIME_URL),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  trustedOrigins: [
    ...(process.env.NODE_ENV === 'development'
      ? [
          'http://localhost:3000',
          ...(process.env.V0_RUNTIME_URL ? [process.env.V0_RUNTIME_URL] : []),
          ...(process.env.V0_DEV_APP_URL ? [process.env.V0_DEV_APP_URL] : []),
          ...(process.env.V0_BUILD_URL ? [process.env.V0_BUILD_URL] : []),
          ...(process.env.V0_SANDBOX_URL ? [process.env.V0_SANDBOX_URL] : []),
        ]
      : []),
    ...(process.env.NODE_ENV === 'production'
      ? [
          ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
          ...(process.env.VERCEL_PROJECT_PRODUCTION_URL
            ? [`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`]
            : []),
        ]
      : []),
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  ...(process.env.NODE_ENV === 'development'
    ? {
        advanced: {
          defaultCookieAttributes: {
            sameSite: 'none' as const,
            secure: true,
          },
        },
      }
    : {}),
})

export async function getSessionSafely(requestHeaders: Headers) {
  try {
    return {
      session: await auth.api.getSession({ headers: requestHeaders }),
      databaseStatus: useDevelopmentMemoryDatabase ? 'memory' as const : 'persistent' as const,
    }
  } catch (error) {
    console.warn(
      'Unable to load the authentication session:',
      error instanceof Error ? error.message : String(error),
    )
    return { session: null, databaseStatus: 'unavailable' as const }
  }
}
