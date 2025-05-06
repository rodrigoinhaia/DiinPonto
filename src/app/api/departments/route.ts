import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { checkPermission } from '@/lib/permissions'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const departments = await prisma.department.findMany({
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json(departments)
  } catch (error) {
    console.error('Error fetching departments:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function POST(req: Request) {
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

    const department = await prisma.department.create({
      data: {
        name,
      },
    })

    return NextResponse.json(department)
  } catch (error) {
    console.error('Error creating department:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 