import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/next-auth'
import { User, TimeRecord, RecordType } from '@prisma/client'

interface UserWithTimeRecords extends User {
  timeRecords: TimeRecord[]
}

interface DailyRecord {
  date: string
  entries: number
  exits: number
  lateEntries: number
  overtimeHours: number
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
          },
          orderBy: {
            timestamp: 'asc',
          },
        },
      },
    })

    const userData = users.map((user: UserWithTimeRecords) => {
      // Agrupa registros por dia
      const dailyRecords = new Map<string, DailyRecord>()

      user.timeRecords.forEach((record: TimeRecord) => {
        const date = record.timestamp.toISOString().split('T')[0]
        const currentRecord = dailyRecords.get(date) || {
          date,
          entries: 0,
          exits: 0,
          lateEntries: 0,
          overtimeHours: 0,
        }

        if (record.type === RecordType.ENTRY) {
          currentRecord.entries++
          // Verifica se é um atraso (após 8:00)
          const entryHour = record.timestamp.getHours()
          if (entryHour >= 8) {
            currentRecord.lateEntries++
          }
        } else {
          currentRecord.exits++
        }

        dailyRecords.set(date, currentRecord)
      })

      return {
        name: user.name,
        employeeId: user.employeeId,
        records: Array.from(dailyRecords.values()),
      }
    })

    return NextResponse.json(userData)
  } catch (error) {
    console.error('Erro ao buscar dados dos usuários:', error)
    return new NextResponse('Erro interno do servidor', { status: 500 })
  }
} 