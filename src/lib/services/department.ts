import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface CreateDepartmentData {
  name: string
  description?: string
  managerId?: string
}

export interface UpdateDepartmentData {
  name?: string
  description?: string
  managerId?: string
}

export async function createDepartment(data: CreateDepartmentData) {
  return prisma.department.create({
    data,
    include: {
      manager: true,
      users: true,
    },
  })
}

export async function updateDepartment(id: string, data: UpdateDepartmentData) {
  return prisma.department.update({
    where: { id },
    data,
    include: {
      manager: true,
      users: true,
    },
  })
}

export async function deleteDepartment(id: string) {
  return prisma.department.delete({
    where: { id },
  })
}

export async function getDepartment(id: string) {
  return prisma.department.findUnique({
    where: { id },
    include: {
      manager: true,
      users: true,
    },
  })
}

export async function getAllDepartments() {
  return prisma.department.findMany({
    include: {
      manager: true,
      users: true,
    },
  })
}

export async function getDepartmentUsers(id: string) {
  return prisma.department.findUnique({
    where: { id },
    include: {
      users: true,
    },
  })
}

export async function assignManager(departmentId: string, managerId: string) {
  return prisma.department.update({
    where: { id: departmentId },
    data: {
      managerId,
    },
    include: {
      manager: true,
    },
  })
} 