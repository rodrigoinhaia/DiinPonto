import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { getTimeRecordsByDateRange } from '@/lib/services/timeRecord'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Location {
  latitude: number
  longitude: number
}

function isLocation(value: unknown): value is Location {
  return (
    typeof value === 'object' &&
    value !== null &&
    'latitude' in value &&
    'longitude' in value &&
    typeof (value as Location).latitude === 'number' &&
    typeof (value as Location).longitude === 'number'
  )
}

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

    // Criar cabeçalho do CSV
    const headers = [
      'Funcionário',
      'ID',
      'Tipo',
      'Data/Hora',
      'Dispositivo',
      'Localização',
    ].join(',')

    // Criar linhas do CSV
    const rows = records.map((record) => [
      record.user.name,
      record.user.employeeId,
      record.type === 'ENTRY' ? 'Entrada' : 'Saída',
      format(new Date(record.timestamp), 'dd/MM/yyyy HH:mm:ss', {
        locale: ptBR,
      }),
      record.device,
      record.location && isLocation(record.location)
        ? `${record.location.latitude},${record.location.longitude}`
        : '',
    ].join(','))

    // Juntar tudo
    const csv = [headers, ...rows].join('\n')

    // Retornar como arquivo CSV
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="registros-${format(
          new Date(from),
          'dd-MM-yyyy'
        )}-${format(new Date(to), 'dd-MM-yyyy')}.csv"`,
      },
    })
  } catch (error) {
    console.error('Erro ao exportar registros:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao exportar registros' },
      { status: 500 }
    )
  }
} 