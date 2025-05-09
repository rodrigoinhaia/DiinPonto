import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { CorrectionRequestsList } from '@/components/time-record/CorrectionRequestsList'

export default async function CorrectionsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Solicitações de Correção</h1>
      <CorrectionRequestsList />
    </div>
  )
} 