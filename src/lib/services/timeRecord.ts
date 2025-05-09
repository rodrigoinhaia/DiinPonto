import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface CreateTimeRecordData {
  userId: string
  type: 'ENTRY' | 'EXIT'
  location?: {
    latitude: number
    longitude: number
  }
  device: string
}

export async function createTimeRecord(data: CreateTimeRecordData) {
  return prisma.timeRecord.create({
    data: {
      userId: data.userId,
      type: data.type,
      location: data.location,
      device: data.device,
    },
    include: {
      user: true,
    },
  })
}

export async function getLastTimeRecord(userId: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return prisma.timeRecord.findFirst({
    where: {
      userId,
      timestamp: {
        gte: today,
      },
    },
    orderBy: {
      timestamp: 'desc',
    },
    include: {
      user: true,
    },
  })
}

export async function getTodayRecords(userId: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return prisma.timeRecord.findMany({
    where: {
      userId,
      timestamp: {
        gte: today,
      },
    },
    orderBy: {
      timestamp: 'asc',
    },
  })
}

export async function getTimeRecordsByDateRange(from: Date, to: Date) {
  return prisma.timeRecord.findMany({
    where: {
      timestamp: {
        gte: from,
        lte: to,
      },
    },
    orderBy: {
      timestamp: 'desc',
    },
    include: {
      user: {
        select: {
          name: true,
          employeeId: true,
        },
      },
    },
  })
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id }
  })
}

export async function getUserByBarcode(barcode: string) {
  return prisma.user.findUnique({
    where: { barcode }
  })
} 