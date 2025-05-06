'use client'

import { UsersTable } from '@/components/users/UsersTable'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { PermissionGuard } from '@/components/auth/PermissionGuard'

export default function UsersPage() {
  return (
    <AuthGuard>
      <PermissionGuard action="manage" resource="user">
        <div className="container mx-auto py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Usuários</h1>
          </div>

          <UsersTable />
        </div>
      </PermissionGuard>
    </AuthGuard>
  )
} 