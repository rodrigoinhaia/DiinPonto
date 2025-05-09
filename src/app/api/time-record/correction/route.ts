import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { checkPermission } from '@/lib/permissions'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return new NextResponse('Não autorizado', { status: 401 })
    }

    const body = await request.json()
    const { timeRecordId, newTimestamp, reason, evidence } = body

    if (!timeRecordId || !newTimestamp || !reason) {
      return new NextResponse('Dados inválidos', { status: 400 })
    }

    // Verifica se o usuário tem permissão para solicitar correção
    const hasPermission = await checkPermission(
      session.user.id,
      'create',
      'correction'
    )

    if (!hasPermission) {
      return new NextResponse('Sem permissão', { status: 403 })
    }

    // Verifica se o registro existe e pertence ao usuário
    const timeRecord = await prisma.timeRecord.findUnique({
      where: { id: timeRecordId },
      include: { user: true },
    })

    if (!timeRecord) {
      return new NextResponse('Registro não encontrado', { status: 404 })
    }

    // Verifica se o usuário é o dono do registro ou um gestor
    const isOwner = timeRecord.userId === session.user.id
    const isManager = session.user.role === 'MANAGER'

    if (!isOwner && !isManager) {
      return new NextResponse('Sem permissão', { status: 403 })
    }

    // Verifica se já existe uma solicitação pendente
    const existingRequest = await prisma.correctionRequest.findFirst({
      where: {
        timeRecordId,
        status: 'PENDING',
      },
    })

    if (existingRequest) {
      return new NextResponse(
        'Já existe uma solicitação pendente para este registro',
        { status: 400 }
      )
    }

    // Cria a solicitação de correção
    const correctionRequest = await prisma.correctionRequest.create({
      data: {
        timeRecordId,
        requestedById: session.user.id,
        newTimestamp: new Date(newTimestamp),
        reason,
        evidence,
      },
      include: {
        timeRecord: {
          include: {
            user: true,
          },
        },
        requestedBy: true,
      },
    })

    // Se o solicitante for um gestor, aprova automaticamente
    if (isManager) {
      await prisma.correctionRequest.update({
        where: { id: correctionRequest.id },
        data: {
          status: 'APPROVED',
          approvedById: session.user.id,
        },
      })

      // Atualiza o registro de ponto
      await prisma.timeRecord.update({
        where: { id: timeRecordId },
        data: {
          timestamp: new Date(newTimestamp),
        },
      })
    }

    return NextResponse.json(correctionRequest)
  } catch (error) {
    console.error('Erro ao processar solicitação de correção:', error)
    return new NextResponse('Erro interno do servidor', { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return new NextResponse('Não autorizado', { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const userId = searchParams.get('userId')

    // Verifica se o usuário tem permissão para listar correções
    const hasPermission = await checkPermission(
      session.user.id,
      'read',
      'correction'
    )

    if (!hasPermission) {
      return new NextResponse('Sem permissão', { status: 403 })
    }

    // Define o filtro baseado no papel do usuário
    let where: any = {}

    if (session.user.role === 'EMPLOYEE') {
      // Colaboradores veem apenas suas solicitações
      where.requestedById = session.user.id
    } else if (session.user.role === 'MANAGER') {
      // Gestores veem solicitações de seus departamentos
      const department = await prisma.department.findFirst({
        where: { managerId: session.user.id },
        include: { users: true },
      })

      if (department) {
        where.requestedById = {
          in: department.users.map((user) => user.id),
        }
      }
    }

    // Aplica filtros adicionais
    if (status) {
      where.status = status
    }

    if (userId) {
      where.requestedById = userId
    }

    const correctionRequests = await prisma.correctionRequest.findMany({
      where,
      include: {
        timeRecord: {
          include: {
            user: true,
          },
        },
        requestedBy: true,
        approvedBy: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(correctionRequests)
  } catch (error) {
    console.error('Erro ao listar solicitações de correção:', error)
    return new NextResponse('Erro interno do servidor', { status: 500 })
  }
} 