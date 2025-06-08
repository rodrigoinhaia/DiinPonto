import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { name, managerId } = await request.json()

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Nome do departamento é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se já existe um departamento com este nome
    const existingDepartment = await prisma.department.findFirst({
      where: { name: name.trim() }
    })

    if (existingDepartment) {
      return NextResponse.json(
        { error: 'Já existe um departamento com este nome' },
        { status: 400 }
      )
    }

    // Se um gerente foi especificado, verificar se ele existe e tem permissão
    if (managerId) {
      const manager = await prisma.user.findUnique({
        where: { id: managerId }
      })

      if (!manager) {
        return NextResponse.json(
          { error: 'Gerente não encontrado' },
          { status: 400 }
        )
      }

      if (manager.role !== 'ADMIN' && manager.role !== 'MANAGER') {
        return NextResponse.json(
          { error: 'Usuário não tem permissão para ser gerente de departamento' },
          { status: 400 }
        )
      }
    }

    // Criar departamento
    const department = await prisma.department.create({
      data: {
        name: name.trim(),
        managerId: managerId || null,
      },
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    })

    return NextResponse.json({ department })
  } catch (error) {
    console.error('Erro ao criar departamento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json({ departments })
  } catch (error) {
    console.error('Erro ao buscar departamentos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

