'use client'

import { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Loading } from '@/components/ui/loading'

interface AuthGuardProps {
  children: ReactNode
  fallback?: ReactNode
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const router = useRouter()
  const { status } = useSession()

  if (status === 'loading') {
    return <Loading />
  }

  if (status === 'unauthenticated') {
    if (fallback) {
      return <>{fallback}</>
    }

    router.push('/unauthenticated')
    return null
  }

  return <>{children}</>
} 