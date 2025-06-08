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

    // Verificar se o usuário tem permissão para exportar relatórios
    if (session.user.role === 'EMPLOYEE') {
      return NextResponse.json(
        { error: 'Sem permissão para exportar relatórios' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'csv' // csv, xlsx, pdf
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const userId = searchParams.get('userId')
    const departmentId = searchParams.get('departmentId')

    // Construir filtros
    let whereClause: any = {}

    if (userId) {
      whereClause.userId = userId
    }
    if (departmentId) {
      whereClause.user = {
        departmentId: departmentId
      }
    }

    // Filtrar por período
    if (startDate && endDate) {
      whereClause.timestamp = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    // Buscar registros
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

    // Gerar arquivo baseado no formato
    switch (format) {
      case 'csv':
        return generateCSV(records)
      case 'xlsx':
        return generateXLSX(records)
      case 'pdf':
        return generatePDF(records)
      default:
        return generateCSV(records)
    }
  } catch (error) {
    console.error('Erro ao exportar relatório:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

function generateCSV(records: any[]) {
  const headers = ['Data/Hora', 'Funcionário', 'ID Funcionário', 'Departamento', 'Tipo', 'Dispositivo']
  const csvContent = [
    headers.join(','),
    ...records.map(record => [
      new Date(record.timestamp).toLocaleString('pt-BR'),
      `"${record.user.name}"`,
      record.user.employeeId,
      `"${record.user.department?.name || 'N/A'}"`,
      record.type === 'ENTRY' ? 'Entrada' : 'Saída',
      record.device
    ].join(','))
  ].join('\n')

  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="relatorio-ponto-${new Date().toISOString().split('T')[0]}.csv"`
    }
  })
}

function generateXLSX(records: any[]) {
  // Para implementação completa, seria necessário usar uma biblioteca como 'xlsx'
  // Por simplicidade, retornando CSV com headers XLSX
  const csvContent = generateCSVContent(records)
  
  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="relatorio-ponto-${new Date().toISOString().split('T')[0]}.xlsx"`
    }
  })
}

function generatePDF(records: any[]) {
  // Para implementação completa, seria necessário usar uma biblioteca como 'jspdf' ou 'puppeteer'
  // Por simplicidade, retornando HTML que pode ser convertido para PDF
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Relatório de Ponto</title>
      <style>
        body { font-family: Arial, sans-serif; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
      </style>
    </head>
    <body>
      <h1>Relatório de Ponto</h1>
      <p>Gerado em: ${new Date().toLocaleString('pt-BR')}</p>
      <table>
        <thead>
          <tr>
            <th>Data/Hora</th>
            <th>Funcionário</th>
            <th>ID Funcionário</th>
            <th>Departamento</th>
            <th>Tipo</th>
            <th>Dispositivo</th>
          </tr>
        </thead>
        <tbody>
          ${records.map(record => `
            <tr>
              <td>${new Date(record.timestamp).toLocaleString('pt-BR')}</td>
              <td>${record.user.name}</td>
              <td>${record.user.employeeId}</td>
              <td>${record.user.department?.name || 'N/A'}</td>
              <td>${record.type === 'ENTRY' ? 'Entrada' : 'Saída'}</td>
              <td>${record.device}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </body>
    </html>
  `

  return new NextResponse(htmlContent, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Disposition': `attachment; filename="relatorio-ponto-${new Date().toISOString().split('T')[0]}.html"`
    }
  })
}

function generateCSVContent(records: any[]) {
  const headers = ['Data/Hora', 'Funcionário', 'ID Funcionário', 'Departamento', 'Tipo', 'Dispositivo']
  return [
    headers.join(','),
    ...records.map(record => [
      new Date(record.timestamp).toLocaleString('pt-BR'),
      `"${record.user.name}"`,
      record.user.employeeId,
      `"${record.user.department?.name || 'N/A'}"`,
      record.type === 'ENTRY' ? 'Entrada' : 'Saída',
      record.device
    ].join(','))
  ].join('\n')
}

