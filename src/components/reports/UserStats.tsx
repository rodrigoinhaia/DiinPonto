'use client'

import { useEffect, useState } from 'react'
import { DateRange } from '@/types/date-range'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface UserData {
  name: string
  employeeId: string
  records: {
    date: string
    entries: number
    exits: number
    lateEntries: number
    overtimeHours: number
  }[]
}

interface PieLabelProps {
  name: string
  percent: number
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

export function UserStats({ dateRange }: { dateRange: DateRange }) {
  const [data, setData] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (dateRange.from && dateRange.to) {
      fetchData()
    }
  }, [dateRange])

  const fetchData = async () => {
    try {
      const response = await fetch(
        `/api/reports/users?from=${dateRange.from.toISOString()}&to=${dateRange.to.toISOString()}`
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

  return (
    <div className="space-y-4">
      {data.map((user) => {
        // Calcula totais para o gráfico de pizza
        const totalEntries = user.records.reduce((sum, record) => sum + record.entries, 0)
        const totalExits = user.records.reduce((sum, record) => sum + record.exits, 0)
        const totalLateEntries = user.records.reduce((sum, record) => sum + record.lateEntries, 0)
        const totalOvertimeHours = user.records.reduce((sum, record) => sum + record.overtimeHours, 0)

        const pieData = [
          { name: 'Entradas', value: totalEntries },
          { name: 'Saídas', value: totalExits },
          { name: 'Atrasos', value: totalLateEntries },
          { name: 'Horas Extras', value: totalOvertimeHours },
        ]

        return (
          <div key={user.employeeId} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{user.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={user.records}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="date"
                          tickFormatter={(date: string) =>
                            format(new Date(date), 'dd/MM', { locale: ptBR })
                          }
                        />
                        <YAxis />
                        <Tooltip
                          labelFormatter={(label: string | number) =>
                            format(new Date(label.toString()), 'dd/MM/yyyy', { locale: ptBR })
                          }
                        />
                        <Line
                          type="monotone"
                          dataKey="entries"
                          stroke="#8884d8"
                          name="Entradas"
                        />
                        <Line
                          type="monotone"
                          dataKey="exits"
                          stroke="#82ca9d"
                          name="Saídas"
                        />
                        <Line
                          type="monotone"
                          dataKey="lateEntries"
                          stroke="#ff7300"
                          name="Atrasos"
                        />
                        <Line
                          type="monotone"
                          dataKey="overtimeHours"
                          stroke="#ff0000"
                          name="Horas Extras"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }: PieLabelProps) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      })}
    </div>
  )
} 