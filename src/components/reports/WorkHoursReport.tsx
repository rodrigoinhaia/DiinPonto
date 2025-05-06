'use client'

import { useEffect, useState } from 'react'
import { DateRange } from '@/types/date-range'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { format, differenceInHours, differenceInMinutes } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface WorkHoursData {
  date: string
  totalHours: number
  regularHours: number
  overtimeHours: number
  breakHours: number
}

export function WorkHoursReport({ dateRange }: { dateRange: DateRange }) {
  const [data, setData] = useState<WorkHoursData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (dateRange.from && dateRange.to) {
      fetchData()
    }
  }, [dateRange])

  const fetchData = async () => {
    try {
      const response = await fetch(
        `/api/reports/work-hours?from=${dateRange.from!.toISOString()}&to=${dateRange.to!.toISOString()}`
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

  const totalHours = data.reduce((sum, record) => sum + record.totalHours, 0)
  const totalRegularHours = data.reduce((sum, record) => sum + record.regularHours, 0)
  const totalOvertimeHours = data.reduce((sum, record) => sum + record.overtimeHours, 0)
  const totalBreakHours = data.reduce((sum, record) => sum + record.breakHours, 0)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total de Horas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalHours.toFixed(1)}h</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Horas Regulares</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalRegularHours.toFixed(1)}h</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Horas Extras</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalOvertimeHours.toFixed(1)}h</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Horas de Intervalo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalBreakHours.toFixed(1)}h</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Horas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
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
                <Area
                  type="monotone"
                  dataKey="regularHours"
                  stackId="1"
                  stroke="#8884d8"
                  fill="#8884d8"
                  name="Horas Regulares"
                />
                <Area
                  type="monotone"
                  dataKey="overtimeHours"
                  stackId="1"
                  stroke="#82ca9d"
                  fill="#82ca9d"
                  name="Horas Extras"
                />
                <Area
                  type="monotone"
                  dataKey="breakHours"
                  stackId="1"
                  stroke="#ffc658"
                  fill="#ffc658"
                  name="Intervalos"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 