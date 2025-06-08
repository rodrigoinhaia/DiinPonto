import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/next-auth'

export async function GET(
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

    const correction = await prisma.correctionRequest.findUnique({
      where: { id: params.id },
      include: {
        timeRecord: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                employeeId: true,
                department: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          }
        },
        requestedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            employeeId: true,
            department: {
              select: {
                id: true,
                name: true
              }
            }
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

    if (!correction) {
      return NextResponse.json(
        { error: 'Solicitação de correção não encontrada' },
        { status: 404 }
      )
    }

    // Verificar permissões
    const canView = 
      session.user.role === 'ADMIN' ||
      session.user.role === 'MANAGER' ||
      correction.requestedById === session.user.id

    if (!canView) {
      return NextResponse.json(
        { error: 'Sem permissão para visualizar esta solicitação' },
        { status: 403 }
      )
    }

    return NextResponse.json({ correction })
  } catch (error) {
    console.error('Erro ao buscar solicitação de correção:', error)
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

    const { status, reason, evidence, newTimestamp } = await request.json()

    if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { error: 'Status deve ser APPROVED ou REJECTED' },
        { status: 400 }
      )
    }

    // Verificar se a solicitação existe
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

    // Preparar dados para atualização
    const updateData: any = {
      status,
      approvedById: session.user.id,
    }

    // Se for uma atualização da própria solicitação (antes da aprovação)
    if (reason !== undefined) updateData.reason = reason
    if (evidence !== undefined) updateData.evidence = evidence
    if (newTimestamp !== undefined) updateData.newTimestamp = newTimestamp ? new Date(newTimestamp) : null

    // Usar transação para atualizar a correção e o registro de ponto se aprovado
    const result = await prisma.$transaction(async (tx) => {
      // Atualizar a solicitação de correção
      const updatedCorrection = await tx.correctionRequest.update({
        where: { id: params.id },
        data: updateData,
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

      // Se aprovado e há um novo timestamp, atualizar o registro de ponto
      if (status === 'APPROVED' && updatedCorrection.newTimestamp) {
        await tx.timeRecord.update({
          where: { id: existingCorrection.timeRecordId },
          data: {
            timestamp: updatedCorrection.newTimestamp
          }
        })
      }

      return updatedCorrection
    })

    return NextResponse.json({ correction: result })
  } catch (error) {
    console.error('Erro ao atualizar solicitação de correção:', error)
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
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Verificar se a solicitação existe
    const existingCorrection = await prisma.correctionRequest.findUnique({
      where: { id: params.id }
    })

    if (!existingCorrection) {
      return NextResponse.json(
        { error: 'Solicitação de correção não encontrada' },
        { status: 404 }
      )
    }

    // Verificar permissões - só o solicitante pode deletar se ainda estiver pendente
    const canDelete = 
      (existingCorrection.requestedById === session.user.id && existingCorrection.status === 'PENDING') ||
      session.user.role === 'ADMIN'

    if (!canDelete) {
      return NextResponse.json(
        { error: 'Sem permissão para deletar esta solicitação' },
        { status: 403 }
      )
    }

    // Deletar solicitação
    await prisma.correctionRequest.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Solicitação de correção deletada com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar solicitação de correção:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

