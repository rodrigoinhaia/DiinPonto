'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'

interface DepartmentFormProps {
  onSuccess: () => void
  initialData?: {
    id: string
    name: string
  }
}

export function DepartmentForm({ onSuccess, initialData }: DepartmentFormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = initialData
        ? `/api/departments/${initialData.id}`
        : '/api/departments'
      const method = initialData ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao salvar departamento')
      }

      toast({
        title: 'Sucesso!',
        description: initialData
          ? 'Departamento atualizado com sucesso.'
          : 'Departamento criado com sucesso.',
      })

      setFormData({ name: '' })
      onSuccess()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro!',
        description: error instanceof Error ? error.message : 'Erro ao salvar departamento',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={(e) => setFormData({ name: e.target.value })}
          required
        />
      </div>

      <Button type="submit" disabled={loading}>
        {loading
          ? initialData
            ? 'Salvando...'
            : 'Criando...'
          : initialData
          ? 'Salvar'
          : 'Criar Departamento'}
      </Button>
    </form>
  )
} 