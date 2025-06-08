import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/next-auth'

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
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const userId = searchParams.get('userId')
    const departmentId = searchParams.get('departmentId')
    const type = searchParams.get('type') // 'summary', 'detailed', 'attendance'

    // Construir filtros baseados no papel do usuário
    let whereClause: any = {}

    // Se for funcionário comum, só pode ver seus próprios registros
    if (session.user.role === 'EMPLOYEE') {
      whereClause.userId = session.user.id
    } else {
      // Administradores e gerentes podem filtrar por usuário/departamento
      if (userId) {
        whereClause.userId = userId
      }
      if (departmentId) {
        whereClause.user = {
          departmentId: departmentId
        }
      }
    }

    // Filtrar por período
    if (startDate && endDate) {
      whereClause.timestamp = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    } else if (startDate) {
      whereClause.timestamp = {
        gte: new Date(startDate)
      }
    } else if (endDate) {
      whereClause.timestamp = {
        lte: new Date(endDate)
      }
    }

    // Buscar registros baseado no tipo de relatório
    switch (type) {
      case 'summary':
        return await generateSummaryReport(whereClause)
      case 'detailed':
        return await generateDetailedReport(whereClause)
      case 'attendance':
        return await generateAttendanceReport(whereClause)
      default:
        return await generateDetailedReport(whereClause)
    }
  } catch (error) {
    console.error('Erro ao gerar relatório:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

async function generateSummaryReport(whereClause: any) {
  const records = await prisma.timeRecord.findMany({
    where: whereClause,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          employeeId: true,
          department: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }
    },
    orderBy: {
      timestamp: 'desc'
    }
  })

  // Agrupar por usuário e calcular estatísticas
  const userStats = records.reduce((acc: any, record) => {
    const userId = record.user.id
    if (!acc[userId]) {
      acc[userId] = {
        user: record.user,
        totalRecords: 0,
        entryRecords: 0,
        exitRecords: 0,
        firstRecord: record.timestamp,
        lastRecord: record.timestamp
      }
    }

    acc[userId].totalRecords++
    if (record.type === 'ENTRY') acc[userId].entryRecords++
    if (record.type === 'EXIT') acc[userId].exitRecords++
    
    if (record.timestamp < acc[userId].firstRecord) {
      acc[userId].firstRecord = record.timestamp
    }
    if (record.timestamp > acc[userId].lastRecord) {
      acc[userId].lastRecord = record.timestamp
    }

    return acc
  }, {})

  return NextResponse.json({
    type: 'summary',
    data: Object.values(userStats),
    totalUsers: Object.keys(userStats).length,
    totalRecords: records.length
  })
}

async function generateDetailedReport(whereClause: any) {
  const records = await prisma.timeRecord.findMany({
    where: whereClause,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          employeeId: true,
          department: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }
    },
    orderBy: {
      timestamp: 'desc'
    }
  })

  return NextResponse.json({
    type: 'detailed',
    data: records,
    totalRecords: records.length
  })
}

async function generateAttendanceReport(whereClause: any) {
  const records = await prisma.timeRecord.findMany({
    where: whereClause,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          employeeId: true,
          department: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }
    },
    orderBy: [
      { user: { name: 'asc' } },
      { timestamp: 'asc' }
    ]
  })

  // Agrupar por usuário e dia
  const attendanceData = records.reduce((acc: any, record) => {
    const userId = record.user.id
    const date = record.timestamp.toISOString().split('T')[0]
    const key = `${userId}-${date}`

    if (!acc[key]) {
      acc[key] = {
        user: record.user,
        date,
        records: [],
        firstEntry: null,
        lastExit: null,
        totalHours: 0
      }
    }

    acc[key].records.push(record)

    if (record.type === 'ENTRY' && (!acc[key].firstEntry || record.timestamp < acc[key].firstEntry)) {
      acc[key].firstEntry = record.timestamp
    }
    if (record.type === 'EXIT' && (!acc[key].lastExit || record.timestamp > acc[key].lastExit)) {
      acc[key].lastExit = record.timestamp
    }

    // Calcular horas trabalhadas (simplificado)
    if (acc[key].firstEntry && acc[key].lastExit) {
      const diffMs = new Date(acc[key].lastExit).getTime() - new Date(acc[key].firstEntry).getTime()
      acc[key].totalHours = diffMs / (1000 * 60 * 60) // Converter para horas
    }

    return acc
  }, {})

  return NextResponse.json({
    type: 'attendance',
    data: Object.values(attendanceData),
    totalDays: Object.keys(attendanceData).length
  })
}

