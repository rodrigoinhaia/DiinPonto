import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export interface CreateUserData {
  name: string
  email: string
  password: string
  role?: Role
  employeeId: string
  barcode: string
  departmentId?: string
  managerId?: string
}

export interface UpdateUserData {
  name?: string
  email?: string
  password?: string
  role?: Role
  employeeId?: string
  barcode?: string
  departmentId?: string
  managerId?: string
}

export async function createUser(data: CreateUserData) {
  const hashedPassword = await bcrypt.hash(data.password, 10)

  return prisma.user.create({
    data: {
      ...data,
      password: hashedPassword,
    },
    include: {
      department: true,
      manager: true,
      teamMembers: true,
      workSchedule: true,
    },
  })
}

export async function updateUser(id: string, data: UpdateUserData) {
  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10)
  }

  return prisma.user.update({
    where: { id },
    data,
    include: {
      department: true,
      manager: true,
      teamMembers: true,
      workSchedule: true,
    },
  })
}

export async function deleteUser(id: string) {
  return prisma.user.delete({
    where: { id },
  })
}

export async function getUser(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: {
      department: true,
      manager: true,
      teamMembers: true,
      workSchedule: true,
    },
  })
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    include: {
      department: true,
      manager: true,
      teamMembers: true,
      workSchedule: true,
    },
  })
}

export async function getUserByBarcode(barcode: string) {
  return prisma.user.findUnique({
    where: { barcode },
    include: {
      department: true,
      manager: true,
      teamMembers: true,
      workSchedule: true,
    },
  })
}

export async function getAllUsers() {
  return prisma.user.findMany({
    include: {
      department: true,
      manager: true,
      teamMembers: true,
      workSchedule: true,
    },
  })
}

export async function getDepartmentUsers(departmentId: string) {
  return prisma.user.findMany({
    where: { departmentId },
    include: {
      department: true,
      manager: true,
      teamMembers: true,
      workSchedule: true,
    },
  })
}

export async function getTeamMembers(managerId: string) {
  return prisma.user.findMany({
    where: { managerId },
    include: {
      department: true,
      manager: true,
      teamMembers: true,
      workSchedule: true,
    },
  })
}

export async function validatePassword(user: any, password: string) {
  return bcrypt.compare(password, user.password)
}

export async function changePassword(userId: string, newPassword: string) {
  const hashedPassword = await bcrypt.hash(newPassword, 10)

  return prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  })
} 