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

interface LateRecord {
  date: string
  userId: string
  userName: string
  departmentName: string
  timestamp: string
  delayMinutes: number
}

interface LateRecordsData {
  date: string
  totalLates: number
  averageDelay: number
  records: LateRecord[]
}

export function LateRecordsReport({ dateRange }: { dateRange: DateRange }) {
  const [data, setData] = useState<LateRecordsData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (dateRange.from && dateRange.to) {
      fetchData()
    }
  }, [dateRange])

  const fetchData = async () => {
    try {
      const response = await fetch(
        `/api/reports/late-records?from=${dateRange.from.toISOString()}&to=${dateRange.to.toISOString()}`
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

  const totalLates = data.reduce((sum, record) => sum + record.totalLates, 0)
  const averageDelay = data.reduce((sum, record) => sum + record.averageDelay, 0) / data.length

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total de Atrasos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalLates}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Atraso Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{averageDelay.toFixed(1)} min</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Atrasos</CardTitle>
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
                  dataKey="totalLates"
                  fill="#8884d8"
                  name="Total de Atrasos"
                />
                <Bar
                  yAxisId="right"
                  dataKey="averageDelay"
                  fill="#82ca9d"
                  name="Atraso Médio (min)"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detalhamento de Atrasos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left p-2">Data</th>
                  <th className="text-left p-2">Funcionário</th>
                  <th className="text-left p-2">Departamento</th>
                  <th className="text-left p-2">Horário</th>
                  <th className="text-left p-2">Atraso</th>
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
                        {format(new Date(record.timestamp), 'HH:mm', {
                          locale: ptBR,
                        })}
                      </td>
                      <td className="p-2">{record.delayMinutes} min</td>
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