import { Role } from '@prisma/client'

export interface Permission {
  action: string
  resource: string
}

const rolePermissions: Record<Role, Permission[]> = {
  ADMIN: [
    { action: 'manage', resource: 'user' },
    { action: 'manage', resource: 'department' },
    { action: 'manage', resource: 'workSchedule' },
    { action: 'approve', resource: 'correction' },
    { action: 'create', resource: 'timeRecord' },
    { action: 'view', resource: 'timeRecord' },
    { action: 'create', resource: 'correction' },
    { action: 'view', resource: 'correction' },
  ],
  MANAGER: [
    { action: 'view', resource: 'user' },
    { action: 'view', resource: 'department' },
    { action: 'manage', resource: 'workSchedule' },
    { action: 'approve', resource: 'correction' },
    { action: 'create', resource: 'timeRecord' },
    { action: 'view', resource: 'timeRecord' },
    { action: 'create', resource: 'correction' },
    { action: 'view', resource: 'correction' },
  ],
  EMPLOYEE: [
    { action: 'create', resource: 'timeRecord' },
    { action: 'view', resource: 'timeRecord' },
    { action: 'create', resource: 'correction' },
    { action: 'view', resource: 'correction' },
  ],
}

export function hasPermission(role: Role, action: string, resource: string): boolean {
  const permissions = rolePermissions[role]
  return permissions.some(
    (permission) => permission.action === action && permission.resource === resource
  )
}

export function getRolePermissions(role: Role): Permission[] {
  return rolePermissions[role]
}

export function canManageUser(role?: Role): boolean {
  return role ? hasPermission(role, 'manage', 'user') : false
}

export function canManageDepartment(role?: Role): boolean {
  return role ? hasPermission(role, 'manage', 'department') : false
}

export function canManageWorkSchedule(role?: Role): boolean {
  return role ? hasPermission(role, 'manage', 'workSchedule') : false
}

export function canApproveCorrections(role?: Role): boolean {
  return role ? hasPermission(role, 'approve', 'correction') : false
}

export function canCreateTimeRecord(role?: Role): boolean {
  return role ? hasPermission(role, 'create', 'timeRecord') : false
}

export function canViewTimeRecords(role?: Role): boolean {
  return role ? hasPermission(role, 'view', 'timeRecord') : false
}

export function canCreateCorrection(role?: Role): boolean {
  return role ? hasPermission(role, 'create', 'correction') : false
}

export function canViewCorrections(role?: Role): boolean {
  return role ? hasPermission(role, 'view', 'correction') : false
} 