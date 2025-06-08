import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { compare } from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { pin, barcode } = await request.json()

    if (!pin && !barcode) {
      return NextResponse.json(
        { error: 'PIN ou código de barras é obrigatório' },
        { status: 400 }
      )
    }

    let user = null
    let authMethod = ''

    // Autenticação por código de barras
    if (barcode) {
      user = await prisma.user.findUnique({
        where: { barcode },
        include: {
          department: true
        }
      })
      authMethod = 'BARCODE'
    }
    // Autenticação por PIN
    else if (pin) {
      // Buscar todos os usuários e verificar PIN
      const users = await prisma.user.findMany({
        include: {
          department: true
        }
      })

      for (const u of users) {
        const isValidPin = await compare(pin, u.pin)
        if (isValidPin) {
          user = u
          authMethod = 'PIN'
          break
        }
      }
    }

    // Registrar tentativa de autenticação
    await prisma.kioskAuthLog.create({
      data: {
        userId: user?.id || null,
        method: authMethod,
        success: !!user,
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        message: user ? 'Autenticação bem-sucedida' : 'Credenciais inválidas'
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      )
    }

    // Buscar último registro do usuário
    const lastRecord = await prisma.timeRecord.findFirst({
      where: { userId: user.id },
      orderBy: { timestamp: 'desc' }
    })

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        employeeId: user.employeeId,
        department: user.department
      },
      lastRecord: lastRecord ? {
        id: lastRecord.id,
        type: lastRecord.type,
        timestamp: lastRecord.timestamp
      } : null
    })
  } catch (error) {
    console.error('Erro na autenticação do quiosque:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

