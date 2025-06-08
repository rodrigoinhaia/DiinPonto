import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const department = await prisma.department.findUnique({
      where: { id: params.id },
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
            role: true,
            employeeId: true
          }
        }
      }
    })

    if (!department) {
      return NextResponse.json(
        { error: 'Departamento não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ department })
  } catch (error) {
    console.error('Erro ao buscar departamento:', error)
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
    const { name, managerId } = await request.json()

    // Verificar se o departamento existe
    const existingDepartment = await prisma.department.findUnique({
      where: { id: params.id }
    })

    if (!existingDepartment) {
      return NextResponse.json(
        { error: 'Departamento não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se já existe outro departamento com este nome
    if (name && name.trim() !== '') {
      const conflictDepartment = await prisma.department.findFirst({
        where: {
          AND: [
            { id: { not: params.id } },
            { name: name.trim() }
          ]
        }
      })

      if (conflictDepartment) {
        return NextResponse.json(
          { error: 'Já existe outro departamento com este nome' },
          { status: 400 }
        )
      }
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

    // Atualizar departamento
    const department = await prisma.department.update({
      where: { id: params.id },
      data: {
        name: name?.trim() || existingDepartment.name,
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
    console.error('Erro ao atualizar departamento:', error)
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
    // Verificar se o departamento existe
    const existingDepartment = await prisma.department.findUnique({
      where: { id: params.id },
      include: {
        users: true
      }
    })

    if (!existingDepartment) {
      return NextResponse.json(
        { error: 'Departamento não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se há usuários no departamento
    if (existingDepartment.users.length > 0) {
      return NextResponse.json(
        { error: 'Não é possível deletar departamento com usuários. Remova os usuários primeiro.' },
        { status: 400 }
      )
    }

    // Deletar departamento
    await prisma.department.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Departamento deletado com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar departamento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

