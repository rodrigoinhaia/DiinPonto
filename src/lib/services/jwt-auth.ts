import { PrismaClient, Role } from '@prisma/client'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

/**
 * Serviço de autenticação JWT para APIs e aplicações mobile
 * Este arquivo é responsável pela autenticação via tokens JWT
 * e não depende do NextAuth
 */

export interface LoginData {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  employeeId: string
  barcode: string
  departmentId?: string
}

export async function login({ email, password }: LoginData) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      department: true
    }
  })

  if (!user) {
    throw new Error('Usuário não encontrado')
  }

  const isPasswordValid = await bcrypt.compare(password, user.password)

  if (!isPasswordValid) {
    throw new Error('Senha inválida')
  }

  const token = jwt.sign(
    { 
      userId: user.id,
      email: user.email,
      role: user.role 
    },
    process.env.JWT_SECRET!,
    { expiresIn: Number(process.env.JWT_EXPIRATION) || '1d' }
  )

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      employeeId: user.employeeId,
      department: user.department,
    },
  }
}

export async function register(data: RegisterData) {
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email: data.email },
        { employeeId: data.employeeId },
        { barcode: data.barcode },
      ],
    },
  })

  if (existingUser) {
    throw new Error('Usuário já existe')
  }

  const hashedPassword = await bcrypt.hash(data.password, 10)

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      employeeId: data.employeeId,
      barcode: data.barcode,
      departmentId: data.departmentId,
      role: Role.EMPLOYEE
    },
    include: {
      department: true
    }
  })

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    employeeId: user.employeeId,
    department: user.department,
  }
}

export async function validateToken(token: string) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string
      email: string
      role: Role
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        department: true
      }
    })

    if (!user) {
      throw new Error('Usuário não encontrado')
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    }
  } catch (error) {
    throw new Error('Token inválido')
  }
} 