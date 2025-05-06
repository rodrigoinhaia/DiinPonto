import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { User, TimeRecord, Department } from '@prisma/client'

interface UserWithRecords extends User {
  timeRecords: TimeRecord[]
}

interface DepartmentWithUsers extends Department {
  users: UserWithRecords[]
}

interface DepartmentStats {
  name: string
  totalRecords: number
  lateRecords: number
  overtimeHours: number
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

    const departments = await prisma.department.findMany({
      include: {
        users: {
          include: {
            timeRecords: {
              where: {
                timestamp: {
                  gte: new Date(from),
                  lte: new Date(to),
                },
              },
            },
          },
        },
      },
    }) as DepartmentWithUsers[]

    const data: DepartmentStats[] = departments.map((department) => {
      const totalRecords = department.users.reduce(
        (acc: number, user: UserWithRecords) => acc + user.timeRecords.length,
        0
      )

      const lateRecords = department.users.reduce((acc: number, user: UserWithRecords) => {
        return (
          acc +
          user.timeRecords.filter((record: TimeRecord) => {
            const recordTime = new Date(record.timestamp)
            const isLate = record.type === 'ENTRY' && recordTime.getHours() > 8
            return isLate
          }).length
        )
      }, 0)

      const overtimeHours = department.users.reduce((acc: number, user: UserWithRecords) => {
        return (
          acc +
          user.timeRecords.reduce((hours: number, record: TimeRecord) => {
            if (record.type === 'EXIT') {
              const exitTime = new Date(record.timestamp)
              const isOvertime = exitTime.getHours() > 18
              return isOvertime ? hours + (exitTime.getHours() - 18) : hours
            }
            return hours
          }, 0)
        )
      }, 0)

      return {
        name: department.name,
        totalRecords,
        lateRecords,
        overtimeHours,
      }
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error('Erro ao buscar dados dos departamentos:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao buscar dados' },
      { status: 500 }
    )
  }
} 