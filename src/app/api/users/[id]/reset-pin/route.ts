import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Gerar novo PIN aleatório de 6 dígitos
    const newPin = Math.floor(100000 + Math.random() * 900000).toString()
    const hashedPin = await hash(newPin, 12)

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

    // Atualizar PIN do usuário
    await prisma.user.update({
      where: { id: params.id },
      data: { pin: hashedPin }
    })

    return NextResponse.json({ 
      message: 'PIN resetado com sucesso',
      newPin: newPin // Retornar novo PIN para o admin configurar
    })
  } catch (error) {
    console.error('Erro ao resetar PIN:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

