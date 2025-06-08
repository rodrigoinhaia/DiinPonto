import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/next-auth'
import { PrinterService } from '@/lib/services/printer'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Verificar se o usuário tem permissão para testar impressora
    if (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER') {
      return NextResponse.json(
        { error: 'Sem permissão para testar impressora' },
        { status: 403 }
      )
    }

    const { type, address, vendorId, productId, baudRate } = await request.json()

    if (!type) {
      return NextResponse.json(
        { error: 'Tipo de impressora é obrigatório' },
        { status: 400 }
      )
    }

    // Configurar impressora para teste
    PrinterService.configure({
      type,
      address,
      vendorId,
      productId,
      baudRate
    })

    // Gerar comando de teste
    const testData = {
      record: {
        id: 'TEST-' + Date.now(),
        type: 'ENTRY' as const,
        timestamp: new Date().toISOString(),
        user: {
          name: 'Teste Sistema',
          employeeId: 'TEST001'
        }
      },
      options: {
        companyName: 'Empresa Teste',
        companyAddress: 'Rua Teste, 123',
        companyPhone: '(11) 1234-5678',
        companyCNPJ: '12.345.678/0001-90'
      }
    }

    const command = PrinterService.generateTimeRecordCommand(testData)

    // Tentar imprimir
    await PrinterService.print(command)

    return NextResponse.json({
      success: true,
      message: 'Teste de impressão enviado com sucesso',
      command: command.length + ' bytes enviados'
    })
  } catch (error) {
    console.error('Erro no teste de impressora:', error)
    return NextResponse.json(
      { error: 'Erro no teste: ' + (error as Error).message },
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

    // Verificar se o usuário tem permissão
    if (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER') {
      return NextResponse.json(
        { error: 'Sem permissão para listar impressoras' },
        { status: 403 }
      )
    }

    // Listar impressoras disponíveis
    const printers = await PrinterService.listAvailablePrinters()

    return NextResponse.json({
      printers,
      total: printers.length
    })
  } catch (error) {
    console.error('Erro ao listar impressoras:', error)
    return NextResponse.json(
      { error: 'Erro ao listar impressoras: ' + (error as Error).message },
      { status: 500 }
    )
  }
}

