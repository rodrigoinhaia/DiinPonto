import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'
import { Role } from '@prisma/client'

export async function POST(request: Request) {
  try {
    const { name, email, password, employeeId, barcode, department } = await request.json()

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

    // Criar ou encontrar departamento
    let departmentRecord = null
    if (department && department.trim() !== '') {
      departmentRecord = await prisma.department.upsert({
        where: { name: department },
        update: {},
        create: { name: department }
      })
    }

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        pin: hashedPin,
        role: Role.EMPLOYEE, // Por padrão, novos usuários são funcionários
        employeeId,
        barcode,
        departmentId: departmentRecord?.id || null,
      },
      include: {
        department: true
      }
    })

    // Remover dados sensíveis da resposta
    const { password: _, pin: __, ...userWithoutSensitiveData } = user

    return NextResponse.json({
      message: 'Usuário criado com sucesso',
      user: userWithoutSensitiveData,
      generatedPin: pin // Retornar PIN apenas na criação
    })
  } catch (error) {
    console.error('Erro ao criar usuário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

