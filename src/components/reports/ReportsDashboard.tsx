'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DateRangePicker } from '@/components/reports/DateRangePicker'
import { TimeRecordsTable } from '@/components/reports/TimeRecordsTable'
import { DepartmentStats } from '@/components/reports/DepartmentStats'
import { UserStats } from '../reports/UserStats'
import { DateRange } from '@/types/date-range'

export function ReportsDashboard() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().setDate(1)), // Primeiro dia do mês
    to: new Date(), // Hoje
  })

  const handleDateRangeSelect = (range: DateRange) => {
    if (range?.from && range?.to) {
      setDateRange(range)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <DateRangePicker
          from={dateRange.from}
          to={dateRange.to}
          onSelect={handleDateRangeSelect}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Registros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,350</div>
            <p className="text-xs text-muted-foreground">
              +20.1% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atrasos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">
              -12.3% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Horas Extras</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+573</div>
            <p className="text-xs text-muted-foreground">
              +201 em relação ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Correções Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              -4 em relação ao mês anterior
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="records" className="space-y-4">
        <TabsList>
          <TabsTrigger value="records">Registros de Ponto</TabsTrigger>
          <TabsTrigger value="departments">Departamentos</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
        </TabsList>

        <TabsContent value="records" className="space-y-4">
          <TimeRecordsTable dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="departments" className="space-y-4">
          <DepartmentStats dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <UserStats dateRange={dateRange} />
        </TabsContent>
      </Tabs>
    </div>
  )
} 