import { Metadata } from 'next'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { PermissionGuard } from '@/components/auth/PermissionGuard'
import { ReportsDashboard } from '@/components/reports/ReportsDashboard'

export const metadata: Metadata = {
  title: 'Relatórios - DiinPonto',
  description: 'Dashboard de relatórios e estatísticas',
}

export default function ReportsPage() {
  return (
    <AuthGuard>
      <PermissionGuard action="read" resource="timeRecord">
        <div className="container mx-auto py-6">
          <h1 className="mb-8 text-3xl font-bold text-gray-900">Relatórios</h1>
          <ReportsDashboard />
        </div>
      </PermissionGuard>
    </AuthGuard>
  )
} 