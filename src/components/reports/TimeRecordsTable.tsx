'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { DateRange } from '@/types/date-range'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'
import { Button } from '../ui/button'
import { DownloadIcon } from '@radix-ui/react-icons'

interface TimeRecord {
  id: string
  user: {
    name: string
    employeeId: string
  }
  type: 'ENTRY' | 'EXIT'
  timestamp: string
  location?: {
    latitude: number
    longitude: number
  }
  device: string
}

interface TimeRecordsTableProps {
  dateRange: DateRange
}

export function TimeRecordsTable({ dateRange }: TimeRecordsTableProps) {
  const [records, setRecords] = useState<TimeRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (dateRange.from && dateRange.to) {
      fetchRecords()
    }
  }, [dateRange])

  const fetchRecords = async () => {
    if (!dateRange.from || !dateRange.to) return

    try {
      const response = await fetch(
        `/api/time-record/reports?from=${dateRange.from.toISOString()}&to=${dateRange.to.toISOString()}`
      )
      if (!response.ok) throw new Error('Erro ao buscar registros')
      const data = await response.json()
      setRecords(data)
    } catch (error) {
      console.error('Erro ao buscar registros:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    if (!dateRange.from || !dateRange.to) return

    try {
      const response = await fetch(
        `/api/time-record/reports/export?from=${dateRange.from.toISOString()}&to=${dateRange.to.toISOString()}`
      )
      if (!response.ok) throw new Error('Erro ao exportar registros')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `registros-${format(dateRange.from, 'dd-MM-yyyy')}-${format(
        dateRange.to,
        'dd-MM-yyyy'
      )}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Erro ao exportar registros:', error)
    }
  }

  if (loading) {
    return <div>Carregando...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleExport}>
          <DownloadIcon className="mr-2 h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Funcionário</TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Data/Hora</TableHead>
              <TableHead>Dispositivo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{record.user.name}</TableCell>
                <TableCell>{record.user.employeeId}</TableCell>
                <TableCell>
                  {record.type === 'ENTRY' ? 'Entrada' : 'Saída'}
                </TableCell>
                <TableCell>
                  {format(new Date(record.timestamp), 'dd/MM/yyyy HH:mm:ss', {
                    locale: ptBR,
                  })}
                </TableCell>
                <TableCell>{record.device}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 