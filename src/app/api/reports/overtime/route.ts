import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/next-auth'
import { User, TimeRecord, RecordType, WorkSchedule } from '@prisma/client'
import { differenceInHours, differenceInMinutes, isWithinInterval } from 'date-fns'

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
    const from = searchParams.get('from') as string
    const to = searchParams.get('to') as string

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
      totalOvertime: number
      averageOvertime: number
      records: {
        date: string
        userId: string
        userName: string
        departmentName: string
        startTime: string
        endTime: string
        overtimeHours: number
      }[]
    }>()

    users.forEach((user: UserWithRecords) => {
      const schedule = user.workSchedule
      if (!schedule) return

      // Agrupa registros por dia
      const recordsByDay = new Map<string, TimeRecord[]>()
      user.timeRecords.forEach((record: TimeRecord) => {
        const date = record.timestamp.toISOString().split('T')[0]
        const dayRecords = recordsByDay.get(date) || []
        dayRecords.push(record)
        recordsByDay.set(date, dayRecords)
      })

      // Processa os registros de cada dia
      recordsByDay.forEach((records: TimeRecord[], date: string) => {
        let overtimeHours = 0
        let startTime: Date | null = null
        let endTime: Date | null = null

        records.forEach((record: TimeRecord, index: number) => {
          if (index === 0) return // Pula o primeiro registro

          const prevRecord = records[index - 1]
          const isOutsideSchedule = !isWithinInterval(record.timestamp, {
            start: schedule.startTime,
            end: schedule.endTime,
          })

          if (isOutsideSchedule) {
            const hoursDiff = differenceInHours(record.timestamp, prevRecord.timestamp)
            const minutesDiff = differenceInMinutes(record.timestamp, prevRecord.timestamp) % 60
            overtimeHours += hoursDiff + minutesDiff / 60

            if (!startTime) {
              startTime = prevRecord.timestamp
            }
            endTime = record.timestamp
          }
        })

        if (overtimeHours > 0 && startTime && endTime) {
          const currentRecord = dailyRecords.get(date) || {
            totalOvertime: 0,
            averageOvertime: 0,
            records: [],
          }

          currentRecord.totalOvertime += overtimeHours
          currentRecord.records.push({
            date,
            userId: user.id,
            userName: user.name,
            departmentName: user.department?.name || 'Sem departamento',
            startTime: new Date(startTime).toISOString(),
            endTime: new Date(endTime).toISOString(),
            overtimeHours,
          })

          // Atualiza a média de horas extras
          currentRecord.averageOvertime =
            currentRecord.records.reduce((sum, r) => sum + r.overtimeHours, 0) /
            currentRecord.records.length

          dailyRecords.set(date, currentRecord)
        }
      })
    })

    // Converte o Map para um array de objetos
    const overtimeData = Array.from(dailyRecords.entries()).map(([date, data]) => ({
      date,
      ...data,
    }))

    return NextResponse.json(overtimeData)
  } catch (error) {
    console.error('Erro ao buscar dados de horas extras:', error)
    return new NextResponse('Erro interno do servidor', { status: 500 })
  }
} 