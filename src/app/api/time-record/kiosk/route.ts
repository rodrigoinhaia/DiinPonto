import { NextResponse } from 'next/server'
import { getUserByBarcode, getLastTimeRecord, createTimeRecord } from '@/lib/services/timeRecord'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { barcode, location, device } = data

    if (!barcode || !device) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      )
    }

    const user = await getUserByBarcode(barcode)

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    const lastRecord = await getLastTimeRecord(user.id)
    const type = !lastRecord || lastRecord.type === 'EXIT' ? 'ENTRY' : 'EXIT'

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