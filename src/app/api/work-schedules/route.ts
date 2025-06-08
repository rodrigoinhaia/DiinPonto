import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { userId, startTime, endTime, breakStart, breakEnd, daysOfWeek } = await request.json()

    if (!userId || !startTime || !endTime || !daysOfWeek || !Array.isArray(daysOfWeek)) {
      return NextResponse.json(
        { error: 'Dados obrigatórios: userId, startTime, endTime, daysOfWeek' },
        { status: 400 }
      )
    }

    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se já existe um horário para este usuário
    const existingSchedule = await prisma.workSchedule.findUnique({
      where: { userId }
    })

    if (existingSchedule) {
      return NextResponse.json(
        { error: 'Usuário já possui um horário de trabalho. Use PUT para atualizar.' },
        { status: 400 }
      )
    }

    // Validar dias da semana (0-6)
    const validDays = daysOfWeek.every((day: number) => day >= 0 && day <= 6)
    if (!validDays) {
      return NextResponse.json(
        { error: 'Dias da semana devem ser números entre 0 (domingo) e 6 (sábado)' },
        { status: 400 }
      )
    }

    // Criar horário de trabalho
    const workSchedule = await prisma.workSchedule.create({
      data: {
        userId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        breakStart: breakStart ? new Date(breakStart) : null,
        breakEnd: breakEnd ? new Date(breakEnd) : null,
        daysOfWeek,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            employeeId: true
          }
        }
      }
    })

    return NextResponse.json({ workSchedule })
  } catch (error) {
    console.error('Erro ao criar horário de trabalho:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const workSchedules = await prisma.workSchedule.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            employeeId: true,
            department: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        user: {
          name: 'asc'
        }
      }
    })

    return NextResponse.json({ workSchedules })
  } catch (error) {
    console.error('Erro ao buscar horários de trabalho:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

