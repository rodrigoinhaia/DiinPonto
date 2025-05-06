import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { createTimeRecord, getLastTimeRecord } from '@/lib/services/timeRecord'
import { authOptions } from '@/lib/next-auth'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      console.error('Sessão inválida:', session)
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const data = await request.json()
    const { type, location, device } = data

    if (!type || !device) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      )
    }

    const lastRecord = await getLastTimeRecord(session.user.id)

    if (lastRecord?.type === type) {
      return NextResponse.json(
        { error: `Você já registrou ${type === 'ENTRY' ? 'entrada' : 'saída'} hoje` },
        { status: 400 }
      )
    }

    console.log('Criando registro de ponto:', {
      userId: session.user.id,
      type,
      location,
      device
    })

    const record = await createTimeRecord({
      userId: session.user.id,
      type,
      location,
      device,
    })

    return NextResponse.json(record)
  } catch (error) {
    console.error('Erro ao registrar ponto:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao registrar ponto' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const record = await getLastTimeRecord(session.user.id)
    return NextResponse.json(record)
  } catch (error) {
    console.error('Erro ao buscar último registro:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao buscar último registro' },
      { status: 500 }
    )
  }
} 