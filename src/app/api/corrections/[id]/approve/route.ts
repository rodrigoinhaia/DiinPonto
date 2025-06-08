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

    // Verificar se o usuário tem permissão para aprovar correções
    if (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER') {
      return NextResponse.json(
        { error: 'Sem permissão para aprovar correções' },
        { status: 403 }
      )
    }

    // Verificar se a solicitação existe e está pendente
    const existingCorrection = await prisma.correctionRequest.findUnique({
      where: { id: params.id },
      include: {
        timeRecord: true
      }
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

    // Usar transação para aprovar e atualizar o registro
    const result = await prisma.$transaction(async (tx) => {
      // Atualizar a solicitação para aprovada
      const updatedCorrection = await tx.correctionRequest.update({
        where: { id: params.id },
        data: {
          status: 'APPROVED',
          approvedById: session.user.id,
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

      // Se há um novo timestamp, atualizar o registro de ponto
      if (updatedCorrection.newTimestamp) {
        await tx.timeRecord.update({
          where: { id: existingCorrection.timeRecordId },
          data: {
            timestamp: updatedCorrection.newTimestamp
          }
        })
      }

      return updatedCorrection
    })

    return NextResponse.json({ 
      message: 'Solicitação aprovada com sucesso',
      correction: result 
    })
  } catch (error) {
    console.error('Erro ao aprovar solicitação de correção:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

