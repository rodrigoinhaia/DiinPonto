import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        employeeId: true,
        department: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('Erro ao buscar usuários:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar usuários' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, email, password, pin, role, employeeId, departmentId, barcode } = body

    if (!pin || !/^\d{6}$/.test(pin)) {
      return NextResponse.json(
        { error: 'PIN deve conter exatamente 6 dígitos numéricos.' },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { employeeId },
          { barcode },
        ],
      },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Usuário já existe com este email, ID de funcionário ou barcode' },
        { status: 400 }
      )
    }

    const hashedPassword = await hash(password, 12)
    const hashedPin = await hash(pin, 12)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        pin: hashedPin,
        role,
        employeeId,
        barcode: barcode || employeeId, // fallback para employeeId
        departmentId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        employeeId: true,
        department: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Erro ao criar usuário:', error)
    return NextResponse.json(
      { error: 'Erro ao criar usuário' },
      { status: 500 }
    )
  }
} 