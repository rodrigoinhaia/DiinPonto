import { prisma } from './prisma'

type Action = 'create' | 'read' | 'update' | 'delete' | 'manage'
type Resource = 'user' | 'department' | 'timeRecord' | 'correction' | 'workSchedule'

export async function checkPermission(
  userId: string,
  action: Action,
  resource: Resource
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  })

  if (!user) return false

  // Administradores têm todas as permissões
  if (user.role === 'ADMIN') return true

  // Gestores têm permissões limitadas
  if (user.role === 'MANAGER') {
    // Gestores podem gerenciar departamentos e usuários
    if (resource === 'department' || resource === 'user') {
      return true
    }
    // Gestores podem gerenciar registros de ponto e correções
    if (resource === 'timeRecord' || resource === 'correction') {
      return true
    }
  }

  // Funcionários têm permissões básicas
  if (user.role === 'EMPLOYEE') {
    // Funcionários podem ler seus próprios registros
    if (action === 'read' && (resource === 'timeRecord' || resource === 'correction')) {
      return true
    }
    // Funcionários podem criar correções
    if (action === 'create' && resource === 'correction') {
      return true
    }
  }

  return false
} 