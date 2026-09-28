import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { AuthForm } from '@/frontend/components/auth-form'
import { AuthPageFrame } from '@/frontend/components/auth-page-frame'
import { getSessionSafely } from '@/backend/lib/auth'

export const metadata: Metadata = {
  title: 'Create a Social Neuron account',
  description: 'Create an account for your Social Neuron audience intelligence workspace.',
}

export default async function SignUpPage() {
  const { session, databaseStatus } = await getSessionSafely(await headers())
  if (session?.user) redirect('/')

  return (
    <AuthPageFrame>
      <AuthForm mode="sign-up" databaseStatus={databaseStatus} />
    </AuthPageFrame>
  )
}
