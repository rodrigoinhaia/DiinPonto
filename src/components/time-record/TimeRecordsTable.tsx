'use client'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface TimeRecord {
  id: string
  type: 'ENTRY' | 'EXIT'
  timestamp: string
  location?: {
    latitude: number
    longitude: number
  }
  device: string
}

interface TimeRecordsTableProps {
  records: TimeRecord[]
}

export function TimeRecordsTable({ records }: TimeRecordsTableProps) {
  if (!records.length) {
    return (
      <div className="text-center text-gray-500 py-4">
        Nenhum registro encontrado para hoje.
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tipo</TableHead>
            <TableHead>Horário</TableHead>
            <TableHead>Dispositivo</TableHead>
            <TableHead>Localização</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => (
            <TableRow key={record.id}>
              <TableCell>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    record.type === 'ENTRY'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {record.type === 'ENTRY' ? 'Entrada' : 'Saída'}
                </span>
              </TableCell>
              <TableCell>
                {format(new Date(record.timestamp), 'HH:mm:ss', {
                  locale: ptBR,
                })}
              </TableCell>
              <TableCell className="capitalize">{record.device}</TableCell>
              <TableCell>
                {record.location
                  ? `${record.location.latitude.toFixed(6)}, ${record.location.longitude.toFixed(6)}`
                  : 'Não registrada'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 