import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { checkPermission } from '@/lib/permissions'
import { hash } from 'bcryptjs'

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
      'user'
    )
    if (!hasPermission) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    const body = await req.json()
    const { name, email, password, pin, role, employeeId, departmentId, barcode } = body

    if (!name || !email || !role || !employeeId) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    if (pin && !/^\d{6}$/.test(pin)) {
      return new NextResponse('PIN deve conter exatamente 6 dígitos numéricos.', { status: 400 })
    }

    const updateData: any = {
      name,
      email,
      role,
      employeeId,
      departmentId: departmentId || null,
      barcode: barcode || employeeId,
    }

    if (password) {
      updateData.password = await hash(password, 10)
    }
    if (pin) {
      updateData.pin = await hash(pin, 10)
    }

    const user = await prisma.user.update({
      where: {
        id: params.id,
      },
      data: updateData,
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error updating user:', error)
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
      'user'
    )
    if (!hasPermission) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    await prisma.user.delete({
      where: {
        id: params.id,
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting user:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 