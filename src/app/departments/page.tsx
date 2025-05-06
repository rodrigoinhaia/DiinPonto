'use client'

import { useState } from 'react'
import { DepartmentsTable } from '@/components/departments/DepartmentsTable'
import { DepartmentForm } from '@/components/departments/DepartmentForm'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { PermissionGuard } from '@/components/auth/PermissionGuard'

export default function DepartmentsPage() {
  const [open, setOpen] = useState(false)

  return (
    <AuthGuard>
      <PermissionGuard action="manage" resource="department">
        <div className="container mx-auto py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Departamentos</h1>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>Novo Departamento</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Criar Novo Departamento</DialogTitle>
                </DialogHeader>
                <DepartmentForm onSuccess={() => setOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>

          <DepartmentsTable />
        </div>
      </PermissionGuard>
    </AuthGuard>
  )
} 