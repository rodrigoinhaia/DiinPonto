import { NextResponse } from 'next/server'
import { getUserById, getLastTimeRecord, createTimeRecord } from '@/lib/services/timeRecord'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { userId, type, location, device } = data

    if (!userId || !type || !device) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      )
    }

    const user = await getUserById(userId)

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    const lastRecord = await getLastTimeRecord(user.id)

    // Validação do tipo de registro
    if (type === 'ENTRY' && lastRecord && lastRecord.type !== 'EXIT') {
      return NextResponse.json(
        { error: 'Já existe um registro de entrada ativo' },
        { status: 400 }
      )
    }

    if (type === 'PAUSE' && (!lastRecord || lastRecord.type !== 'ENTRY')) {
      return NextResponse.json(
        { error: 'Não é possível registrar pausa sem um registro de entrada' },
        { status: 400 }
      )
    }

    if (type === 'RETURN' && (!lastRecord || lastRecord.type !== 'PAUSE')) {
      return NextResponse.json(
        { error: 'Não é possível registrar retorno sem um registro de pausa' },
        { status: 400 }
      )
    }

    if (type === 'EXIT' && (!lastRecord || lastRecord.type !== 'RETURN')) {
      return NextResponse.json(
        { error: 'Não é possível registrar saída sem um registro de retorno' },
        { status: 400 }
      )
    }

    const record = await createTimeRecord({
      userId: user.id,
      type,
      location,
      device,
    })

    return NextResponse.json({
      ...record,
      user: {
        name: user.name,
        employeeId: user.employeeId,
      },
    })
  } catch (error) {
    console.error('Erro ao registrar ponto:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao registrar ponto' },
      { status: 500 }
    )
  }
} 