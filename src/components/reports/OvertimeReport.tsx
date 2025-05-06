'use client'

import { useEffect, useState } from 'react'
import { DateRange } from '@/types/date-range'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface OvertimeRecord {
  date: string
  userId: string
  userName: string
  departmentName: string
  startTime: string
  endTime: string
  overtimeHours: number
}

interface OvertimeData {
  date: string
  totalOvertime: number
  averageOvertime: number
  records: OvertimeRecord[]
}

export function OvertimeReport({ dateRange }: { dateRange: DateRange }) {
  const [data, setData] = useState<OvertimeData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (dateRange.from && dateRange.to) {
      fetchData()
    }
  }, [dateRange])

  const fetchData = async () => {
    try {
      const response = await fetch(
        `/api/reports/overtime?from=${dateRange.from.toISOString()}&to=${dateRange.to.toISOString()}`
      )
      if (!response.ok) throw new Error('Erro ao buscar dados')
      const data = await response.json()
      setData(data)
    } catch (error) {
      console.error('Erro ao buscar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Carregando...</div>
  }

  const totalOvertime = data.reduce((sum, record) => sum + record.totalOvertime, 0)
  const averageOvertime = data.reduce((sum, record) => sum + record.averageOvertime, 0) / data.length

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total de Horas Extras</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalOvertime.toFixed(1)}h</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Média de Horas Extras</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{averageOvertime.toFixed(1)}h</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Horas Extras</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date: string) =>
                    format(new Date(date), 'dd/MM', { locale: ptBR })
                  }
                />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip
                  labelFormatter={(label: string | number) =>
                    format(new Date(label.toString()), 'dd/MM/yyyy', { locale: ptBR })
                  }
                />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="totalOvertime"
                  fill="#8884d8"
                  name="Total de Horas Extras"
                />
                <Bar
                  yAxisId="right"
                  dataKey="averageOvertime"
                  fill="#82ca9d"
                  name="Média de Horas Extras"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detalhamento de Horas Extras</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left p-2">Data</th>
                  <th className="text-left p-2">Funcionário</th>
                  <th className="text-left p-2">Departamento</th>
                  <th className="text-left p-2">Início</th>
                  <th className="text-left p-2">Fim</th>
                  <th className="text-left p-2">Horas Extras</th>
                </tr>
              </thead>
              <tbody>
                {data.flatMap((day) =>
                  day.records.map((record) => (
                    <tr key={`${record.date}-${record.userId}`}>
                      <td className="p-2">
                        {format(new Date(record.date), 'dd/MM/yyyy', {
                          locale: ptBR,
                        })}
                      </td>
                      <td className="p-2">{record.userName}</td>
                      <td className="p-2">{record.departmentName}</td>
                      <td className="p-2">
                        {format(new Date(record.startTime), 'HH:mm', {
                          locale: ptBR,
                        })}
                      </td>
                      <td className="p-2">
                        {format(new Date(record.endTime), 'HH:mm', {
                          locale: ptBR,
                        })}
                      </td>
                      <td className="p-2">{record.overtimeHours.toFixed(1)}h</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 