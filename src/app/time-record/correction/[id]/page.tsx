import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CorrectionRequestForm } from '@/components/time-record/CorrectionRequestForm'

interface CorrectionPageProps {
  params: {
    id: string
  }
}

export default async function CorrectionPage({ params }: CorrectionPageProps) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  const timeRecord = await prisma.timeRecord.findUnique({
    where: { id: params.id },
    include: { user: true },
  })

  if (!timeRecord) {
    redirect('/time-record')
  }

  // Verifica se o usuário é o dono do registro ou um gestor
  const isOwner = timeRecord.userId === session.user.id
  const isManager = session.user.role === 'MANAGER'

  if (!isOwner && !isManager) {
    redirect('/time-record')
  }

  // Verifica se já existe uma solicitação pendente
  const existingRequest = await prisma.correctionRequest.findFirst({
    where: {
      timeRecordId: params.id,
      status: 'PENDING',
    },
  })

  if (existingRequest) {
    redirect('/time-record/corrections')
  }

  // Formata o registro para o formato esperado pelo componente
  const formattedTimeRecord = {
    id: timeRecord.id,
    type: timeRecord.type,
    timestamp: timeRecord.timestamp.toISOString(),
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Solicitar Correção de Ponto</h1>
      <div className="max-w-2xl">
        <CorrectionRequestForm
          timeRecord={formattedTimeRecord}
          onSuccess={() => redirect('/time-record/corrections')}
          onCancel={() => redirect('/time-record')}
        />
      </div>
    </div>
  )
} 