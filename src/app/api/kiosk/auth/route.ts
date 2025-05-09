import { NextResponse } from 'next/server'
import { authenticateByPin, authenticateByBarcode, isUserBlocked } from '@/lib/services/kiosk-auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { method, pin, barcode } = body

    if (!method || (method !== 'PIN' && method !== 'BARCODE')) {
      return NextResponse.json(
        { error: 'Método de autenticação inválido' },
        { status: 400 }
      )
    }

    // Obtém informações do cliente
    const ip = req.headers.get('x-forwarded-for') || 'unknown'
    const userAgent = req.headers.get('user-agent') || 'unknown'

    let result

    if (method === 'PIN') {
      if (!pin || !/^\d{6}$/.test(pin)) {
        return NextResponse.json(
          { error: 'PIN deve conter exatamente 6 dígitos numéricos' },
          { status: 400 }
        )
      }

      // Busca usuário pelo PIN para verificar bloqueio
      const user = await prisma.user.findFirst({
        where: {
          pin: {
            not: null
          }
        }
      })

      if (user && await isUserBlocked(user.id)) {
        return NextResponse.json(
          { error: 'Conta temporariamente bloqueada. Tente novamente em 5 minutos.' },
          { status: 429 }
        )
      }

      result = await authenticateByPin(pin, ip, userAgent)
    } else {
      if (!barcode) {
        return NextResponse.json(
          { error: 'Código de barras não fornecido' },
          { status: 400 }
        )
      }

      result = await authenticateByBarcode(barcode, ip, userAgent)
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      user: result.user,
      message: result.message
    })
  } catch (error) {
    console.error('Erro na autenticação do quiosque:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 