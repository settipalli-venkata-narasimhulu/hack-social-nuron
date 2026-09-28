import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import SeaDashboard from '@/frontend/components/sea-dashboard'
import { getSessionSafely } from '@/backend/lib/auth'

export default async function Page() {
  const { session } = await getSessionSafely(await headers())
  if (!session?.user) redirect('/sign-in')

  return <SeaDashboard userName={session.user.name} />
}
