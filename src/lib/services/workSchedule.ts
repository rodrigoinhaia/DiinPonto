import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface CreateWorkScheduleData {
  userId: string
  startTime: Date
  endTime: Date
  breakStart?: Date
  breakEnd?: Date
  daysOfWeek: number[]
}

export interface UpdateWorkScheduleData {
  startTime?: Date
  endTime?: Date
  breakStart?: Date
  breakEnd?: Date
  daysOfWeek?: number[]
}

export async function createWorkSchedule(data: CreateWorkScheduleData) {
  return prisma.workSchedule.create({
    data,
    include: {
      user: true,
    },
  })
}

export async function updateWorkSchedule(id: string, data: UpdateWorkScheduleData) {
  return prisma.workSchedule.update({
    where: { id },
    data,
    include: {
      user: true,
    },
  })
}

export async function getWorkSchedule(id: string) {
  return prisma.workSchedule.findUnique({
    where: { id },
    include: {
      user: true,
    },
  })
}

export async function getUserWorkSchedule(userId: string) {
  return prisma.workSchedule.findUnique({
    where: { userId },
    include: {
      user: true,
    },
  })
}

export async function deleteWorkSchedule(id: string) {
  return prisma.workSchedule.delete({
    where: { id },
  })
}

export async function getDepartmentWorkSchedules(departmentId: string) {
  const department = await prisma.department.findUnique({
    where: { id: departmentId },
    include: {
      users: {
        include: {
          workSchedule: true,
        },
      },
    },
  })

  return department?.users.map(user => user.workSchedule).filter(Boolean) || []
}

export async function validateWorkSchedule(userId: string, timestamp: Date) {
  const schedule = await getUserWorkSchedule(userId)
  if (!schedule) return false

  const dayOfWeek = timestamp.getDay()
  if (!schedule.daysOfWeek.includes(dayOfWeek)) return false

  const time = timestamp.getHours() * 60 + timestamp.getMinutes()
  const startTime = schedule.startTime.getHours() * 60 + schedule.startTime.getMinutes()
  const endTime = schedule.endTime.getHours() * 60 + schedule.endTime.getMinutes()

  if (schedule.breakStart && schedule.breakEnd) {
    const breakStart = schedule.breakStart.getHours() * 60 + schedule.breakStart.getMinutes()
    const breakEnd = schedule.breakEnd.getHours() * 60 + schedule.breakEnd.getMinutes()

    return (time >= startTime && time < breakStart) || (time > breakEnd && time <= endTime)
  }

  return time >= startTime && time <= endTime
} 