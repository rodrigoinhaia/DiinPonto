import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const workSchedule = await prisma.workSchedule.findUnique({
      where: { id: params.id },
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
      }
    })

    if (!workSchedule) {
      return NextResponse.json(
        { error: 'Horário de trabalho não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ workSchedule })
  } catch (error) {
    console.error('Erro ao buscar horário de trabalho:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { startTime, endTime, breakStart, breakEnd, daysOfWeek } = await request.json()

    // Verificar se o horário existe
    const existingSchedule = await prisma.workSchedule.findUnique({
      where: { id: params.id }
    })

    if (!existingSchedule) {
      return NextResponse.json(
        { error: 'Horário de trabalho não encontrado' },
        { status: 404 }
      )
    }

    // Validar dias da semana se fornecidos
    if (daysOfWeek && Array.isArray(daysOfWeek)) {
      const validDays = daysOfWeek.every((day: number) => day >= 0 && day <= 6)
      if (!validDays) {
        return NextResponse.json(
          { error: 'Dias da semana devem ser números entre 0 (domingo) e 6 (sábado)' },
          { status: 400 }
        )
      }
    }

    // Preparar dados para atualização
    const updateData: any = {}
    if (startTime) updateData.startTime = new Date(startTime)
    if (endTime) updateData.endTime = new Date(endTime)
    if (breakStart !== undefined) updateData.breakStart = breakStart ? new Date(breakStart) : null
    if (breakEnd !== undefined) updateData.breakEnd = breakEnd ? new Date(breakEnd) : null
    if (daysOfWeek) updateData.daysOfWeek = daysOfWeek

    // Atualizar horário de trabalho
    const workSchedule = await prisma.workSchedule.update({
      where: { id: params.id },
      data: updateData,
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
      }
    })

    return NextResponse.json({ workSchedule })
  } catch (error) {
    console.error('Erro ao atualizar horário de trabalho:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar se o horário existe
    const existingSchedule = await prisma.workSchedule.findUnique({
      where: { id: params.id }
    })

    if (!existingSchedule) {
      return NextResponse.json(
        { error: 'Horário de trabalho não encontrado' },
        { status: 404 }
      )
    }

    // Deletar horário de trabalho
    await prisma.workSchedule.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Horário de trabalho deletado com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar horário de trabalho:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

