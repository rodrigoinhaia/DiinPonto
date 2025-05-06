import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/next-auth'
import { getTodayRecords } from '@/lib/services/timeRecord'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const records = await getTodayRecords(session.user.id)
    return NextResponse.json(records)
  } catch (error) {
    console.error('Erro ao buscar registros do dia:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao buscar registros do dia' },
      { status: 500 }
    )
  }
} 