'use client'

import { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { usePermissions } from '@/lib/hooks/usePermissions'

interface PermissionGuardProps {
  children: ReactNode
  action: string
  resource: string
  fallback?: ReactNode
}

export function PermissionGuard({
  children,
  action,
  resource,
  fallback,
}: PermissionGuardProps) {
  const router = useRouter()
  const { hasPermission } = usePermissions()

  if (!hasPermission(action, resource)) {
    if (fallback) {
      return <>{fallback}</>
    }

    router.push('/unauthorized')
    return null
  }

  return <>{children}</>
} 