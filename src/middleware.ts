import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { Role } from '@prisma/client'

const publicRoutes = ['/login', '/register', '/unauthorized', '/unauthenticated']
const adminRoutes = ['/admin', '/users', '/departments']
const managerRoutes = ['/manager', '/corrections']

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const { pathname } = request.nextUrl

  // Allow public routes
  if (publicRoutes.includes(pathname)) {
    if (token) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return NextResponse.next()
  }

  // Check authentication
  if (!token) {
    return NextResponse.redirect(new URL('/unauthenticated', request.url))
  }

  const role = token.role as Role

  // Check admin routes
  if (adminRoutes.some((route) => pathname.startsWith(route))) {
    if (role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
  }

  // Check manager routes
  if (managerRoutes.some((route) => pathname.startsWith(route))) {
    if (role !== 'ADMIN' && role !== 'MANAGER') {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 