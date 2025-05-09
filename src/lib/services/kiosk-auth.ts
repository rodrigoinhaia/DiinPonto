import { PrismaClient } from '@prisma/client'
import { compare } from 'bcryptjs'

const prisma = new PrismaClient()

interface KioskAuthResult {
  success: boolean
  user?: {
    id: string
    name: string
    employeeId: string
    department?: {
      id: string
      name: string
    }
  }
  message: string
}

export async function authenticateByPin(
  pin: string,
  ip?: string,
  userAgent?: string
): Promise<KioskAuthResult> {
  try {
    // Busca usuário pelo PIN
    const user = await prisma.user.findFirst({
      where: {
        pin: {
          not: null
        }
      },
      include: {
        department: true
      }
    })

    if (!user) {
      await logAuthAttempt(null, 'PIN', false, ip, userAgent, 'Usuário não encontrado')
      return {
        success: false,
        message: 'PIN inválido'
      }
    }

    // Verifica o PIN
    const isValidPin = await compare(pin, user.pin)
    if (!isValidPin) {
      await logAuthAttempt(user.id, 'PIN', false, ip, userAgent, 'PIN incorreto')
      return {
        success: false,
        message: 'PIN incorreto'
      }
    }

    // Registra tentativa bem-sucedida
    await logAuthAttempt(user.id, 'PIN', true, ip, userAgent)

    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        employeeId: user.employeeId,
        department: user.department ? {
          id: user.department.id,
          name: user.department.name
        } : undefined
      },
      message: 'Autenticação bem-sucedida'
    }
  } catch (error) {
    console.error('Erro na autenticação por PIN:', error)
    return {
      success: false,
      message: 'Erro ao autenticar'
    }
  }
}

export async function authenticateByBarcode(
  barcode: string,
  ip?: string,
  userAgent?: string
): Promise<KioskAuthResult> {
  try {
    // Busca usuário pelo barcode
    const user = await prisma.user.findUnique({
      where: {
        barcode
      },
      include: {
        department: true
      }
    })

    if (!user) {
      await logAuthAttempt(null, 'BARCODE', false, ip, userAgent, 'Crachá não encontrado')
      return {
        success: false,
        message: 'Crachá não encontrado'
      }
    }

    // Registra tentativa bem-sucedida
    await logAuthAttempt(user.id, 'BARCODE', true, ip, userAgent)

    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        employeeId: user.employeeId,
        department: user.department ? {
          id: user.department.id,
          name: user.department.name
        } : undefined
      },
      message: 'Autenticação bem-sucedida'
    }
  } catch (error) {
    console.error('Erro na autenticação por barcode:', error)
    return {
      success: false,
      message: 'Erro ao autenticar'
    }
  }
}

async function logAuthAttempt(
  userId: string | null,
  method: 'PIN' | 'BARCODE',
  success: boolean,
  ip?: string,
  userAgent?: string,
  message?: string
) {
  try {
    await prisma.kioskAuthLog.create({
      data: {
        userId,
        method,
        success,
        ip,
        userAgent,
        message
      }
    })
  } catch (error) {
    console.error('Erro ao registrar log de autenticação:', error)
  }
}

export async function getRecentAuthAttempts(userId: string, minutes: number = 5) {
  const timeAgo = new Date(Date.now() - minutes * 60 * 1000)
  
  return prisma.kioskAuthLog.findMany({
    where: {
      userId,
      attemptAt: {
        gte: timeAgo
      }
    },
    orderBy: {
      attemptAt: 'desc'
    }
  })
}

export async function isUserBlocked(userId: string, maxAttempts: number = 5, minutes: number = 5): Promise<boolean> {
  const attempts = await getRecentAuthAttempts(userId, minutes)
  const failedAttempts = attempts.filter(attempt => !attempt.success)
  
  return failedAttempts.length >= maxAttempts
} 