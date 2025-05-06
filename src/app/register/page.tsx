import { Metadata } from 'next'
import Link from 'next/link'
import { RegisterForm } from '@/components/auth/RegisterForm'

export const metadata: Metadata = {
  title: 'Registro - DiinPonto',
  description: 'Registre-se no DiinPonto',
}

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <div className="text-center">
          <h1 className="mb-8 text-3xl font-bold text-gray-900">DiinPonto</h1>
          <RegisterForm />
        </div>
      </div>
    </div>
  )
} 