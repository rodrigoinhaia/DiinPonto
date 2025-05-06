import React from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Navigation } from '@/components/layout/Navigation'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DiinPonto',
  description: 'Sistema de registro de ponto',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <Providers>
          <Navigation />
          <main className="min-h-[calc(100vh-4rem)] bg-gray-100 p-4">
            {children}
          </main>
          <Toaster />
        </Providers>
      </body>
    </html>
  )
} 