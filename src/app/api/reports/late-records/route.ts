import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/next-auth'
import { User, TimeRecord, RecordType, WorkSchedule } from '@prisma/client'
import { differenceInMinutes, setHours, setMinutes } from 'date-fns'

interface UserWithRecords extends User {
  timeRecords: TimeRecord[]
  workSchedule: WorkSchedule | null
  department: {
    name: string
  } | null
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse('Não autorizado', { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    if (!from || !to) {
      return new NextResponse('Parâmetros inválidos', { status: 400 })
    }

    const users = await prisma.user.findMany({
      where: {
        role: {
          not: 'ADMIN',
        },
      },
      include: {
        timeRecords: {
          where: {
            timestamp: {
              gte: new Date(from),
              lte: new Date(to),
            },
            type: RecordType.ENTRY,
          },
          orderBy: {
            timestamp: 'asc',
          },
        },
        workSchedule: true,
        department: {
          select: {
            name: true,
          },
        },
      },
    })

    // Agrupa registros por dia
    const dailyRecords = new Map<string, {
      totalLates: number
      averageDelay: number
      records: {
        date: string
        userId: string
        userName: string
        departmentName: string
        timestamp: string
        delayMinutes: number
      }[]
    }>()

    users.forEach((user: UserWithRecords) => {
      const schedule = user.workSchedule
      if (!schedule) return

      user.timeRecords.forEach((record: TimeRecord) => {
        const date = record.timestamp.toISOString().split('T')[0]
        const expectedTime = setMinutes(
          setHours(new Date(record.timestamp), schedule.startTime.getHours()),
          schedule.startTime.getMinutes()
        )

        // Calcula o atraso em minutos
        const delayMinutes = differenceInMinutes(record.timestamp, expectedTime)
        if (delayMinutes <= 0) return // Ignora registros no horário ou adiantados

        const currentRecord = dailyRecords.get(date) || {
          totalLates: 0,
          averageDelay: 0,
          records: [],
        }

        currentRecord.totalLates++
        currentRecord.records.push({
          date,
          userId: user.id,
          userName: user.name,
          departmentName: user.department?.name || 'Sem departamento',
          timestamp: record.timestamp.toISOString(),
          delayMinutes,
        })

        // Atualiza o atraso médio
        currentRecord.averageDelay =
          currentRecord.records.reduce((sum, r) => sum + r.delayMinutes, 0) /
          currentRecord.records.length

        dailyRecords.set(date, currentRecord)
      })
    })

    // Converte o Map para um array de objetos
    const lateRecordsData = Array.from(dailyRecords.entries()).map(([date, data]) => ({
      date,
      ...data,
    }))

    return NextResponse.json(lateRecordsData)
  } catch (error) {
    console.error('Erro ao buscar dados de atrasos:', error)
    return new NextResponse('Erro interno do servidor', { status: 500 })
  }
} 