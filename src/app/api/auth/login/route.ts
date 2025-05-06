import { NextResponse } from 'next/server'
import { login } from '@/lib/services/jwt-auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    const result = await login({ email, password })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Erro no login:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro no login' },
      { status: 401 }
    )
  }
} 