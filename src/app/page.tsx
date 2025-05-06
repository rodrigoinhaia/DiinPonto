'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  const { data: session } = useSession()

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center">
      <div className="w-full max-w-2xl text-center">
        <h1 className="mb-8 text-4xl font-bold text-gray-900">
          Bem-vindo ao DiinPonto
        </h1>
        <p className="mb-8 text-lg text-gray-600">
          Sistema completo de registro de ponto com suporte web e modo quiosque.
        </p>

        {session ? (
          <div className="space-y-4">
            <p className="text-lg text-gray-600">
              Olá, {session.user.name}! Você está logado como {session.user.role}.
            </p>
            <Link href="/time-record">
              <Button size="lg">Ir para Registro de Ponto</Button>
            </Link>
          </div>
        ) : (
          <div className="space-x-4">
            <Link href="/login">
              <Button variant="default" size="lg">
                Entrar
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="outline" size="lg">
                Registrar
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
} 