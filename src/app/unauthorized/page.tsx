'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function UnauthorizedPage() {
  const router = useRouter()

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center">
      <div className="w-full max-w-md text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-900">
          Acesso Não Autorizado
        </h1>
        <p className="mb-8 text-lg text-gray-600">
          Você não tem permissão para acessar esta página.
        </p>
        <Button
          onClick={() => router.push('/')}
          size="lg"
          className="w-full"
        >
          Voltar para a Página Inicial
        </Button>
      </div>
    </div>
  )
} 