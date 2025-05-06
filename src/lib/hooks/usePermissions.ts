import { useSession } from 'next-auth/react'
import {
  hasPermission,
  canManageUser,
  canManageDepartment,
  canManageWorkSchedule,
  canApproveCorrections,
  canCreateTimeRecord,
  canViewTimeRecords,
  canCreateCorrection,
  canViewCorrections,
} from '../services/permissions'
import { Role } from '@prisma/client'

export function usePermissions() {
  const { data: session } = useSession()
  const role = session?.user?.role as Role

  return {
    hasPermission: (action: string, resource: string) =>
      hasPermission(role, action, resource),
    canManageUser: () => canManageUser(role),
    canManageDepartment: () => canManageDepartment(role),
    canManageWorkSchedule: () => canManageWorkSchedule(role),
    canApproveCorrections: () => canApproveCorrections(role),
    canCreateTimeRecord: () => canCreateTimeRecord(role),
    canViewTimeRecords: () => canViewTimeRecords(role),
    canCreateCorrection: () => canCreateCorrection(role),
    canViewCorrections: () => canViewCorrections(role),
  }
} 