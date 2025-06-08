import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
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

    // Verificar se o usuário tem permissão
    if (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER') {
      return NextResponse.json(
        { error: 'Sem permissão para listar leitores' },
        { status: 403 }
      )
    }

    // Retornar informações sobre leitores suportados
    const supportedReaders = [
      {
        type: 'camera',
        name: 'Câmera do dispositivo',
        description: 'Usa a câmera para ler códigos de barras',
        requirements: ['Câmera', 'HTTPS']
      },
      {
        type: 'usb',
        name: 'Leitor USB/HID',
        description: 'Leitores USB que emulam teclado',
        requirements: ['WebHID API', 'Navegador compatível']
      },
      {
        type: 'serial',
        name: 'Leitor Serial',
        description: 'Leitores conectados via porta serial',
        requirements: ['Web Serial API', 'Navegador compatível']
      }
    ]

    return NextResponse.json({
      supportedReaders,
      browserSupport: {
        webHID: typeof navigator !== 'undefined' && 'hid' in navigator,
        webSerial: typeof navigator !== 'undefined' && 'serial' in navigator,
        mediaDevices: typeof navigator !== 'undefined' && 'mediaDevices' in navigator
      }
    })
  } catch (error) {
    console.error('Erro ao listar leitores:', error)
    return NextResponse.json(
      { error: 'Erro ao listar leitores: ' + (error as Error).message },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
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
        { error: 'Sem permissão para testar leitores' },
        { status: 403 }
      )
    }

    const { type, vendorId, productId, baudRate } = await request.json()

    if (!type) {
      return NextResponse.json(
        { error: 'Tipo de leitor é obrigatório' },
        { status: 400 }
      )
    }

    // Validar tipo
    if (!['camera', 'usb', 'serial'].includes(type)) {
      return NextResponse.json(
        { error: 'Tipo de leitor inválido' },
        { status: 400 }
      )
    }

    // Retornar instruções para teste
    const testInstructions = {
      camera: 'Aponte a câmera para um código de barras. O teste será realizado no frontend.',
      usb: 'Conecte o leitor USB e escaneie um código de barras. O teste será realizado no frontend.',
      serial: 'Conecte o leitor serial e escaneie um código de barras. O teste será realizado no frontend.'
    }

    return NextResponse.json({
      success: true,
      message: 'Configuração de teste preparada',
      instructions: testInstructions[type as keyof typeof testInstructions],
      config: {
        type,
        vendorId,
        productId,
        baudRate
      }
    })
  } catch (error) {
    console.error('Erro no teste de leitor:', error)
    return NextResponse.json(
      { error: 'Erro no teste: ' + (error as Error).message },
      { status: 500 }
    )
  }
}

