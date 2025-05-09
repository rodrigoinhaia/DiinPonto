'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { Badge } from '@/components/ui/badge'
import { Check, X } from 'lucide-react'

interface CorrectionRequest {
  id: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  reason: string
  evidence?: string
  newTimestamp: string
  createdAt: string
  timeRecord: {
    id: string
    type: 'ENTRY' | 'EXIT'
    timestamp: string
    user: {
      name: string
      employeeId: string
    }
  }
  requestedBy: {
    name: string
    employeeId: string
  }
  approvedBy?: {
    name: string
    employeeId: string
  }
}

export function CorrectionRequestsList() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [requests, setRequests] = useState<CorrectionRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<string>('')

  useEffect(() => {
    fetchRequests()
  }, [status])

  async function fetchRequests() {
    try {
      const url = new URL('/api/time-record/correction', window.location.origin)
      if (status) {
        url.searchParams.append('status', status)
      }

      const response = await fetch(url)
      if (!response.ok) throw new Error('Erro ao buscar solicitações')

      const data = await response.json()
      setRequests(data)
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as solicitações.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleStatusChange(requestId: string, newStatus: 'APPROVED' | 'REJECTED') {
    try {
      const response = await fetch(`/api/time-record/correction/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) throw new Error('Erro ao atualizar status')

      toast({
        title: 'Sucesso',
        description: `Solicitação ${newStatus === 'APPROVED' ? 'aprovada' : 'rejeitada'} com sucesso.`,
      })

      fetchRequests()
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status da solicitação.',
        variant: 'destructive',
      })
    }
  }

  const isManager = session?.user?.role === 'MANAGER'

  return (
    <Card>
      <CardHeader>
        <CardTitle>Solicitações de Correção</CardTitle>
        <CardDescription>
          Gerencie as solicitações de correção de ponto
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              <SelectItem value="PENDING">Pendentes</SelectItem>
              <SelectItem value="APPROVED">Aprovados</SelectItem>
              <SelectItem value="REJECTED">Rejeitados</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Funcionário</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Data/Hora Atual</TableHead>
                <TableHead>Nova Data/Hora</TableHead>
                <TableHead>Justificativa</TableHead>
                <TableHead>Status</TableHead>
                {isManager && <TableHead>Ações</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    {request.timeRecord.user.name}
                    <br />
                    <span className="text-sm text-muted-foreground">
                      {request.timeRecord.user.employeeId}
                    </span>
                  </TableCell>
                  <TableCell>
                    {request.timeRecord.type === 'ENTRY' ? 'Entrada' : 'Saída'}
                  </TableCell>
                  <TableCell>
                    {format(new Date(request.timeRecord.timestamp), 'dd/MM/yyyy HH:mm', {
                      locale: ptBR,
                    })}
                  </TableCell>
                  <TableCell>
                    {format(new Date(request.newTimestamp), 'dd/MM/yyyy HH:mm', {
                      locale: ptBR,
                    })}
                  </TableCell>
                  <TableCell>{request.reason}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        request.status === 'APPROVED'
                          ? 'success'
                          : request.status === 'REJECTED'
                          ? 'destructive'
                          : 'default'
                      }
                    >
                      {request.status === 'PENDING'
                        ? 'Pendente'
                        : request.status === 'APPROVED'
                        ? 'Aprovado'
                        : 'Rejeitado'}
                    </Badge>
                  </TableCell>
                  {isManager && request.status === 'PENDING' && (
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleStatusChange(request.id, 'APPROVED')}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleStatusChange(request.id, 'REJECTED')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
} 