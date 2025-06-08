import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'
import { Role } from '@prisma/client'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
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
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Erro ao buscar usuário:', error)
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
    const { name, email, role, employeeId, barcode, departmentId, password } = await request.json()

    // Verificar se o usuário existe
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Verificar conflitos com outros usuários
    const conflictUser = await prisma.user.findFirst({
      where: {
        AND: [
          { id: { not: params.id } },
          {
            OR: [
              { email },
              { employeeId },
              { barcode }
            ]
          }
        ]
      }
    })

    if (conflictUser) {
      return NextResponse.json(
        { error: 'Já existe outro usuário com este email, ID de funcionário ou código de barras' },
        { status: 400 }
      )
    }

    // Preparar dados para atualização
    const updateData: any = {
      name,
      email,
      role: role as Role,
      employeeId,
      barcode,
      departmentId: departmentId || null,
    }

    // Se uma nova senha foi fornecida, hash ela
    if (password && password.trim() !== '') {
      updateData.password = await hash(password, 12)
    }

    // Atualizar usuário
    const user = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      include: {
        department: true
      }
    })

    // Remover dados sensíveis da resposta
    const { password: _, pin: __, ...userWithoutSensitiveData } = user

    return NextResponse.json({ user: userWithoutSensitiveData })
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error)
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
    // Verificar se o usuário existe
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Deletar usuário
    await prisma.user.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Usuário deletado com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar usuário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

