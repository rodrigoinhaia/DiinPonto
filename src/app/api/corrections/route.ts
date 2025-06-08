import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/next-auth'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const { timeRecordId, reason, evidence, newTimestamp } = await request.json()

    if (!timeRecordId || !reason) {
      return NextResponse.json(
        { error: 'ID do registro e motivo são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se o registro de ponto existe e pertence ao usuário
    const timeRecord = await prisma.timeRecord.findUnique({
      where: { id: timeRecordId },
      include: {
        user: true,
        correction: true
      }
    })

    if (!timeRecord) {
      return NextResponse.json(
        { error: 'Registro de ponto não encontrado' },
        { status: 404 }
      )
    }

    if (timeRecord.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Você só pode solicitar correção dos seus próprios registros' },
        { status: 403 }
      )
    }

    // Verificar se já existe uma solicitação de correção para este registro
    if (timeRecord.correction) {
      return NextResponse.json(
        { error: 'Já existe uma solicitação de correção para este registro' },
        { status: 400 }
      )
    }

    // Criar solicitação de correção
    const correction = await prisma.correctionRequest.create({
      data: {
        timeRecordId,
        requestedById: session.user.id,
        reason,
        evidence: evidence || null,
        newTimestamp: newTimestamp ? new Date(newTimestamp) : null,
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
        }
      }
    })

    return NextResponse.json({ correction })
  } catch (error) {
    console.error('Erro ao criar solicitação de correção:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const userId = searchParams.get('userId')

    // Construir filtros baseados no papel do usuário
    let whereClause: any = {}

    // Se for funcionário comum, só pode ver suas próprias solicitações
    if (session.user.role === 'EMPLOYEE') {
      whereClause.requestedById = session.user.id
    } else {
      // Administradores e gerentes podem ver todas ou filtrar por usuário
      if (userId) {
        whereClause.requestedById = userId
      }
    }

    // Filtrar por status se especificado
    if (status && ['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
      whereClause.status = status
    }

    const corrections = await prisma.correctionRequest.findMany({
      where: whereClause,
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ corrections })
  } catch (error) {
    console.error('Erro ao buscar solicitações de correção:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

