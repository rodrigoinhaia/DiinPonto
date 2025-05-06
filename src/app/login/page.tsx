import { Metadata } from 'next'
import Link from 'next/link'
import { LoginForm } from '@/components/auth/LoginForm'

export const metadata: Metadata = {
  title: 'Login - DiinPonto',
  description: 'Faça login no DiinPonto',
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <div className="text-center">
          <h1 className="mb-8 text-3xl font-bold text-gray-900">DiinPonto</h1>
          <LoginForm />
        </div>
      </div>
    </div>
  )
} 