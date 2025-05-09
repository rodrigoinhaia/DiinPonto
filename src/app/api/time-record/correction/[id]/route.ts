import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { checkPermission } from '@/lib/permissions'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return new NextResponse('Não autorizado', { status: 401 })
    }

    const body = await request.json()
    const { status } = body

    if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
      return new NextResponse('Status inválido', { status: 400 })
    }

    // Verifica se o usuário tem permissão para aprovar/rejeitar correções
    const hasPermission = await checkPermission(
      session.user.id,
      'update',
      'correction'
    )

    if (!hasPermission) {
      return new NextResponse('Sem permissão', { status: 403 })
    }

    // Busca a solicitação de correção
    const correctionRequest = await prisma.correctionRequest.findUnique({
      where: { id: params.id },
      include: {
        timeRecord: {
          include: {
            user: true,
          },
        },
      },
    })

    if (!correctionRequest) {
      return new NextResponse('Solicitação não encontrada', { status: 404 })
    }

    // Verifica se o usuário é gestor do departamento
    if (session.user.role === 'MANAGER') {
      const department = await prisma.department.findFirst({
        where: { managerId: session.user.id },
        include: { users: true },
      })

      if (!department) {
        return new NextResponse('Sem permissão', { status: 403 })
      }

      const isDepartmentMember = department.users.some(
        (user) => user.id === correctionRequest.timeRecord.userId
      )

      if (!isDepartmentMember) {
        return new NextResponse('Sem permissão', { status: 403 })
      }
    }

    // Atualiza a solicitação
    const updatedRequest = await prisma.correctionRequest.update({
      where: { id: params.id },
      data: {
        status,
        approvedById: session.user.id,
      },
      include: {
        timeRecord: {
          include: {
            user: true,
          },
        },
        requestedBy: true,
        approvedBy: true,
      },
    })

    // Se aprovada, atualiza o registro de ponto
    if (status === 'APPROVED') {
      await prisma.timeRecord.update({
        where: { id: correctionRequest.timeRecordId },
        data: {
          timestamp: correctionRequest.newTimestamp,
        },
      })
    }

    return NextResponse.json(updatedRequest)
  } catch (error) {
    console.error('Erro ao processar aprovação/rejeição:', error)
    return new NextResponse('Erro interno do servidor', { status: 500 })
  }
} 