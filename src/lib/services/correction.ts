import { PrismaClient, CorrectionStatus } from '@prisma/client'

const prisma = new PrismaClient()

export interface CreateCorrectionData {
  timeRecordId: string
  requestedById: string
  reason: string
  evidence?: string
  newTimestamp?: Date
}

export interface UpdateCorrectionData {
  status?: CorrectionStatus
  approvedById?: string
  reason?: string
  evidence?: string
  newTimestamp?: Date
}

export async function createCorrection(data: CreateCorrectionData) {
  return prisma.correctionRequest.create({
    data,
    include: {
      timeRecord: {
        include: {
          user: true,
        },
      },
      requestedBy: true,
      approvedBy: true,
    },
  })
}

export async function updateCorrection(id: string, data: UpdateCorrectionData) {
  return prisma.correctionRequest.update({
    where: { id },
    data,
    include: {
      timeRecord: {
        include: {
          user: true,
        },
      },
      requestedBy: true,
      approvedBy: true,
    },
  })
}

export async function getCorrection(id: string) {
  return prisma.correctionRequest.findUnique({
    where: { id },
    include: {
      timeRecord: {
        include: {
          user: true,
        },
      },
      requestedBy: true,
      approvedBy: true,
    },
  })
}

export async function getPendingCorrections() {
  return prisma.correctionRequest.findMany({
    where: {
      status: CorrectionStatus.PENDING,
    },
    include: {
      timeRecord: {
        include: {
          user: true,
        },
      },
      requestedBy: true,
      approvedBy: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}

export async function getUserCorrections(userId: string) {
  return prisma.correctionRequest.findMany({
    where: {
      OR: [
        { requestedById: userId },
        { approvedById: userId },
      ],
    },
    include: {
      timeRecord: {
        include: {
          user: true,
        },
      },
      requestedBy: true,
      approvedBy: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}

export async function approveCorrection(id: string, approvedById: string) {
  return prisma.correctionRequest.update({
    where: { id },
    data: {
      status: CorrectionStatus.APPROVED,
      approvedById,
    },
    include: {
      timeRecord: {
        include: {
          user: true,
        },
      },
      requestedBy: true,
      approvedBy: true,
    },
  })
}

export async function rejectCorrection(id: string, approvedById: string) {
  return prisma.correctionRequest.update({
    where: { id },
    data: {
      status: CorrectionStatus.REJECTED,
      approvedById,
    },
    include: {
      timeRecord: {
        include: {
          user: true,
        },
      },
      requestedBy: true,
      approvedBy: true,
    },
  })
} 