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
} from 'recharts'

interface DepartmentData {
  name: string
  totalRecords: number
  lateRecords: number
  overtimeHours: number
}

export function DepartmentStats({ dateRange }: { dateRange: DateRange }) {
  const [data, setData] = useState<DepartmentData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (dateRange.from && dateRange.to) {
      fetchData()
    }
  }, [dateRange])

  const fetchData = async () => {
    try {
      const response = await fetch(
        `/api/reports/departments?from=${dateRange.from.toISOString()}&to=${dateRange.to.toISOString()}`
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Registros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.reduce((acc, curr) => acc + curr.totalRecords, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atrasos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.reduce((acc, curr) => acc + curr.lateRecords, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Horas Extras</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.reduce((acc, curr) => acc + curr.overtimeHours, 0)}h
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registros por Departamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="totalRecords" fill="#8884d8" name="Total" />
                <Bar dataKey="lateRecords" fill="#ff7300" name="Atrasos" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 