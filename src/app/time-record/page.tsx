import { AuthGuard } from '@/components/auth/AuthGuard'
import { PermissionGuard } from '@/components/auth/PermissionGuard'
import { TimeRecordPage } from '@/components/time-record/TimeRecordPage'

export default function TimeRecord() {
  return (
    <AuthGuard>
      <PermissionGuard action="create" resource="timeRecord">
        <TimeRecordPage />
      </PermissionGuard>
    </AuthGuard>
  )
} 