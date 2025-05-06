'use client'

import { useState, useEffect } from 'react'
import { Role } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'

interface Department {
  id: string
  name: string
}

interface UserFormProps {
  onSuccess: () => void
  initialData?: {
    id: string
    name: string
    email: string
    role: Role
    employeeId: string
    departmentId?: string
  }
}

export function UserForm({ onSuccess, initialData }: UserFormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [departments, setDepartments] = useState<Department[]>([])
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    email: initialData?.email || '',
    password: '',
    pin: '',
    role: initialData?.role || 'EMPLOYEE',
    employeeId: initialData?.employeeId || '',
    departmentId: initialData?.departmentId || '',
  })

  useEffect(() => {
    fetchDepartments()
  }, [])

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/departments')
      if (!response.ok) throw new Error('Erro ao buscar departamentos')
      const data = await response.json()
      setDepartments(data)
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro!',
        description: 'Erro ao carregar departamentos',
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = initialData
        ? `/api/users/${initialData.id}`
        : '/api/users'
      const method = initialData ? 'PUT' : 'POST'

      // Se estiver editando e não houver nova senha, remova do payload
      const payload = { ...formData } as Partial<typeof formData>
      if (initialData && !payload.password) {
        delete payload.password
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao salvar usuário')
      }

      toast({
        title: 'Sucesso!',
        description: initialData
          ? 'Usuário atualizado com sucesso.'
          : 'Usuário criado com sucesso.',
      })

      setFormData({
        name: '',
        email: '',
        password: '',
        pin: '',
        role: 'EMPLOYEE',
        employeeId: '',
        departmentId: '',
      })
      onSuccess()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro!',
        description: error instanceof Error ? error.message : 'Erro ao salvar usuário',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement> | { name: string; value: string }
  ) => {
    if ('target' in e) {
      const { name, value } = e.target
      setFormData((prev) => ({ ...prev, [name]: value }))
    } else {
      const { name, value } = e
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">
            {initialData ? 'Nova Senha (opcional)' : 'Senha'}
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required={!initialData}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="pin">PIN (6 dígitos)</Label>
          <Input
            id="pin"
            name="pin"
            type="password"
            pattern="\d{6}"
            maxLength={6}
            minLength={6}
            value={formData.pin}
            onChange={handleChange}
            required={!initialData}
            autoComplete="off"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="employeeId">ID do Funcionário</Label>
          <Input
            id="employeeId"
            name="employeeId"
            value={formData.employeeId}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Cargo</Label>
          <Select
            name="role"
            value={formData.role}
            onValueChange={(value) => handleChange({ name: 'role', value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um cargo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ADMIN">Administrador</SelectItem>
              <SelectItem value="MANAGER">Gestor</SelectItem>
              <SelectItem value="EMPLOYEE">Funcionário</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="departmentId">Departamento</Label>
          <Select
            name="departmentId"
            value={formData.departmentId}
            onValueChange={(value) => handleChange({ name: 'departmentId', value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um departamento" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((department) => (
                <SelectItem key={department.id} value={department.id}>
                  {department.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button type="submit" disabled={loading}>
        {loading
          ? initialData
            ? 'Salvando...'
            : 'Criando...'
          : initialData
          ? 'Salvar'
          : 'Criar Usuário'}
      </Button>
    </form>
  )
} 