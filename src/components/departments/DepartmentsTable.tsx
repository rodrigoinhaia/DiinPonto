'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { Pencil, Trash2 } from 'lucide-react'

interface Department {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

export function DepartmentsTable() {
  const { toast } = useToast()
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)

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
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este departamento?')) return

    try {
      const response = await fetch(`/api/departments/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Erro ao excluir departamento')

      toast({
        title: 'Sucesso!',
        description: 'Departamento excluído com sucesso.',
      })

      fetchDepartments()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro!',
        description: 'Erro ao excluir departamento',
      })
    }
  }

  useState(() => {
    fetchDepartments()
  }, [])

  if (loading) {
    return <div>Carregando...</div>
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Criado em</TableHead>
            <TableHead>Atualizado em</TableHead>
            <TableHead className="w-[100px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {departments.map((department) => (
            <TableRow key={department.id}>
              <TableCell>{department.name}</TableCell>
              <TableCell>
                {new Date(department.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {new Date(department.updatedAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      // TODO: Implementar edição
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(department.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 