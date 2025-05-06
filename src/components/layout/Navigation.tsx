'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { usePermissions } from '@/lib/hooks/usePermissions'

export function Navigation() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const {
    canManageUser,
    canManageDepartment,
    canManageWorkSchedule,
    canApproveCorrections,
  } = usePermissions()

  const isActive = (path: string) =>
    pathname === path ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700'

  return (
    <nav className="bg-gray-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/" className="text-xl font-bold text-white">
                DiinPonto
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link
                  href="/time-record"
                  className={`rounded-md px-3 py-2 text-sm font-medium ${isActive(
                    '/time-record'
                  )}`}
                >
                  Registro de Ponto
                </Link>

                {canManageUser() && (
                  <Link
                    href="/users"
                    className={`rounded-md px-3 py-2 text-sm font-medium ${isActive('/users')}`}
                  >
                    Usuários
                  </Link>
                )}

                {canManageDepartment() && (
                  <Link
                    href="/departments"
                    className={`rounded-md px-3 py-2 text-sm font-medium ${isActive(
                      '/departments'
                    )}`}
                  >
                    Departamentos
                  </Link>
                )}

                {canManageWorkSchedule() && (
                  <Link
                    href="/schedules"
                    className={`rounded-md px-3 py-2 text-sm font-medium ${isActive(
                      '/schedules'
                    )}`}
                  >
                    Horários
                  </Link>
                )}

                {canApproveCorrections() && (
                  <Link
                    href="/corrections"
                    className={`rounded-md px-3 py-2 text-sm font-medium ${isActive(
                      '/corrections'
                    )}`}
                  >
                    Correções
                  </Link>
                )}
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              {session ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-300">{session.user.name}</span>
                  <Button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    variant="ghost"
                    className="text-gray-300 hover:bg-gray-700"
                  >
                    Sair
                  </Button>
                </div>
              ) : (
                <Link href="/login">
                  <Button variant="ghost" className="text-gray-300 hover:bg-gray-700">
                    Entrar
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
} 