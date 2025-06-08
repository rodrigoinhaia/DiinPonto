import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/next-auth'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Verificar se o usuário tem permissão para rejeitar correções
    if (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER') {
      return NextResponse.json(
        { error: 'Sem permissão para rejeitar correções' },
        { status: 403 }
      )
    }

    const { rejectionReason } = await request.json()

    // Verificar se a solicitação existe e está pendente
    const existingCorrection = await prisma.correctionRequest.findUnique({
      where: { id: params.id }
    })

    if (!existingCorrection) {
      return NextResponse.json(
        { error: 'Solicitação de correção não encontrada' },
        { status: 404 }
      )
    }

    if (existingCorrection.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Esta solicitação já foi processada' },
        { status: 400 }
      )
    }

    // Atualizar a solicitação para rejeitada
    const updatedCorrection = await prisma.correctionRequest.update({
      where: { id: params.id },
      data: {
        status: 'REJECTED',
        approvedById: session.user.id,
        reason: rejectionReason ? `${existingCorrection.reason}\n\nMotivo da rejeição: ${rejectionReason}` : existingCorrection.reason
      },
      include: {
        timeRecord: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                employeeId: true
              }
            }
          }
        },
        requestedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            employeeId: true
          }
        },
        approvedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            employeeId: true
          }
        }
      }
    })

    return NextResponse.json({ 
      message: 'Solicitação rejeitada com sucesso',
      correction: updatedCorrection 
    })
  } catch (error) {
    console.error('Erro ao rejeitar solicitação de correção:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

