import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { getTimeRecordsByDateRange } from '@/lib/services/timeRecord'

export async function GET(request: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    if (!from || !to) {
      return NextResponse.json(
        { error: 'Período não especificado' },
        { status: 400 }
      )
    }

    const records = await getTimeRecordsByDateRange(
      new Date(from),
      new Date(to)
    )

    return NextResponse.json(records)
  } catch (error) {
    console.error('Erro ao buscar registros:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao buscar registros' },
      { status: 500 }
    )
  }
} 