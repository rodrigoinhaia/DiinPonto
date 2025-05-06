'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function UnauthenticatedPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center">
      <div className="w-full max-w-md text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-900">
          Acesso Restrito
        </h1>
        <p className="mb-8 text-lg text-gray-600">
          Você precisa fazer login para acessar esta página.
        </p>
        <div className="space-x-4">
          <Link href="/login">
            <Button size="lg" variant="default">
              Fazer Login
            </Button>
          </Link>
          <Link href="/register">
            <Button size="lg" variant="outline">
              Criar Conta
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
} 