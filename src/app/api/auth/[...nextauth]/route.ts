import NextAuth from 'next-auth'
import { authOptions } from '@/lib/next-auth'
import { getUserByEmail, validatePassword } from '@/lib/services/user'
import { Role } from '@prisma/client'

declare module 'next-auth' {
  interface User {
    id: string
    name: string
    email: string
    role: Role
    employeeId: string
    department?: {
      id: string
      name: string
    }
  }

  interface Session {
    user: User
  }
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST } 