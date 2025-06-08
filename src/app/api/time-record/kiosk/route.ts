import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { compare } from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { userId, type, location, device } = await request.json()

    if (!userId || !type) {
      return NextResponse.json(
        { error: 'ID do usuário e tipo são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        department: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Verificar último registro para validar sequência
    const lastRecord = await prisma.timeRecord.findFirst({
      where: { userId },
      orderBy: { timestamp: 'desc' }
    })

    // Validar sequência de registros
    if (lastRecord) {
      const today = new Date()
      const lastRecordDate = new Date(lastRecord.timestamp)
      const isToday = 
        today.getDate() === lastRecordDate.getDate() &&
        today.getMonth() === lastRecordDate.getMonth() &&
        today.getFullYear() === lastRecordDate.getFullYear()

      if (isToday && lastRecord.type === type) {
        return NextResponse.json(
          { error: `Você já registrou ${type === 'ENTRY' ? 'entrada' : 'saída'} hoje` },
          { status: 400 }
        )
      }
    }

    // Criar registro de ponto
    const timeRecord = await prisma.timeRecord.create({
      data: {
        userId,
        type,
        location: location || null,
        device: 'kiosk',
        timestamp: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
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

    // Registrar log de autenticação do quiosque
    await prisma.kioskAuthLog.create({
      data: {
        userId,
        method: 'SYSTEM', // Método usado no quiosque
        success: true,
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: device?.userAgent || 'unknown',
        message: `Registro de ponto: ${type}`
      }
    })

    return NextResponse.json({ 
      record: timeRecord,
      message: 'Ponto registrado com sucesso'
    })
  } catch (error) {
    console.error('Erro ao registrar ponto no quiosque:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

