'use client'

import { useEffect, useState } from 'react'
import { Clock } from '@/components/time-record/Clock'
import { TimeRecordButton } from '@/components/time-record/TimeRecordButton'
import { TimeRecordStatus } from '@/components/time-record/TimeRecordStatus'
import { TimeRecordsTable } from '@/components/time-record/TimeRecordsTable'
import { useGeolocation } from '@/lib/hooks/useGeolocation'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

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

export function TimeRecordPage() {
  const [lastRecord, setLastRecord] = useState<TimeRecord | null>(null)
  const [todayRecords, setTodayRecords] = useState<TimeRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { location, error: locationError, loading: locationLoading, retry: retryLocation } = useGeolocation()

  useEffect(() => {
    fetchRecords()
  }, [])

  const fetchRecords = async () => {
    try {
      const [lastRecordResponse, todayRecordsResponse] = await Promise.all([
        fetch('/api/time-record'),
        fetch('/api/time-record/today')
      ])

      if (!lastRecordResponse.ok || !todayRecordsResponse.ok) {
        throw new Error('Erro ao buscar registros')
      }

      const [lastRecordData, todayRecordsData] = await Promise.all([
        lastRecordResponse.json(),
        todayRecordsResponse.json()
      ])

      setLastRecord(lastRecordData)
      setTodayRecords(todayRecordsData)
    } catch (error) {
      console.error('Erro ao buscar registros:', error)
    }
  }

  const handleRecord = async (type: 'ENTRY' | 'EXIT') => {
    setLoading(true)
    setError(null)

    try {
      if (locationError) {
        throw new Error(locationError)
      }

      const response = await fetch('/api/time-record', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          location: location
            ? {
                latitude: location.latitude,
                longitude: location.longitude,
              }
            : undefined,
          device: 'web',
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao registrar ponto')
      }

      await fetchRecords()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao registrar ponto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Clock className="mb-8" />
        
        {locationError && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription className="flex items-center justify-between">
              <span>{locationError}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={retryLocation}
                className="ml-4"
              >
                Tentar novamente
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <TimeRecordStatus lastRecord={lastRecord} />
        
        <div className="mt-8 flex justify-center gap-4">
          <TimeRecordButton
            type="ENTRY"
            onClick={() => handleRecord('ENTRY')}
            disabled={loading || locationLoading || !!locationError}
          />
          <TimeRecordButton
            type="EXIT"
            onClick={() => handleRecord('EXIT')}
            disabled={loading || locationLoading || !!locationError}
          />
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Registros de Hoje</h2>
          <TimeRecordsTable records={todayRecords} />
        </div>
      </div>
    </div>
  )
} 