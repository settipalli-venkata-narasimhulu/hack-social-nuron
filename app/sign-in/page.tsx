import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { AuthForm } from '@/frontend/components/auth-form'
import { getSessionSafely } from '@/backend/lib/auth'
import { AuthPageFrame } from '@/frontend/components/auth-page-frame'

export const metadata: Metadata = {
  title: 'Sign in to Social Neuron',
  description: 'Sign in to your Social Neuron audience intelligence workspace.',
}

export default async function SignInPage() {
  const { session, databaseStatus } = await getSessionSafely(await headers())
  if (session?.user) redirect('/')

  return (
    <AuthPageFrame>
      <AuthForm mode="sign-in" databaseStatus={databaseStatus} />
    </AuthPageFrame>
  )
}
