import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { checkPermission } from '@/lib/permissions'

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const hasPermission = await checkPermission(
      session.user.id,
      'manage',
      'department'
    )
    if (!hasPermission) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    const body = await req.json()
    const { name } = body

    if (!name) {
      return new NextResponse('Name is required', { status: 400 })
    }

    const department = await prisma.department.update({
      where: {
        id: params.id,
      },
      data: {
        name,
      },
    })

    return NextResponse.json(department)
  } catch (error) {
    console.error('Error updating department:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const hasPermission = await checkPermission(
      session.user.id,
      'manage',
      'department'
    )
    if (!hasPermission) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    await prisma.department.delete({
      where: {
        id: params.id,
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting department:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 