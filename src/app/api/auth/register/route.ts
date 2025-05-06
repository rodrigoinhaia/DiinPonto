import { NextResponse } from 'next/server'
import { createUser } from '@/lib/services/user'
import { Role } from '@prisma/client'

export async function POST(request: Request) {
  try {
    const data = await request.json()

    const user = await createUser({
      ...data,
      role: Role.EMPLOYEE, // Por padrão, novos usuários são funcionários
    })

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      employeeId: user.employeeId,
      department: user.department,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao registrar' },
      { status: 400 }
    )
  }
} 