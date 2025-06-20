import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'
import { Role } from '@prisma/client'

export async function POST(request: Request) {
  try {
    const { name, email, password, role, employeeId, barcode, departmentId } = await request.json()

    // Verificar se o usuário já existe
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { employeeId },
          { barcode }
        ]
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Usuário já existe com este email, ID de funcionário ou código de barras' },
        { status: 400 }
      )
    }

    // Gerar PIN aleatório de 6 dígitos
    const pin = Math.floor(100000 + Math.random() * 900000).toString()
    
    // Hash da senha e PIN
    const hashedPassword = await hash(password, 12)
    const hashedPin = await hash(pin, 12)

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        pin: hashedPin,
        role: role as Role,
        employeeId,
        barcode,
        departmentId: departmentId || null,
      },
      include: {
        department: true
      }
    })

    // Remover dados sensíveis da resposta
    const { password: _, pin: __, ...userWithoutSensitiveData } = user

    return NextResponse.json({
      user: userWithoutSensitiveData,
      generatedPin: pin // Retornar PIN apenas na criação para o admin configurar
    })
  } catch (error) {
    console.error('Erro ao criar usuário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        employeeId: true,
        barcode: true,
        createdAt: true,
        updatedAt: true,
        department: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Erro ao buscar usuários:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

