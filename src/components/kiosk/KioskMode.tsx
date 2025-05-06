'use client'

import { useEffect, useState } from 'react'
import { useGeolocation } from '@/lib/hooks/useGeolocation'
import { Clock } from '@/components/time-record/Clock'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

interface TimeRecord {
  id: string
  type: 'ENTRY' | 'EXIT'
  timestamp: string
  user: {
    name: string
    employeeId: string
  }
}

export function KioskMode() {
  const [barcode, setBarcode] = useState('')
  const [lastRecord, setLastRecord] = useState<TimeRecord | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { location, error: locationError, loading: locationLoading, retry: retryLocation } = useGeolocation()

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        handleBarcodeSubmit()
      } else {
        setBarcode(prev => prev + event.key)
      }
    }

    window.addEventListener('keypress', handleKeyPress)
    return () => window.removeEventListener('keypress', handleKeyPress)
  }, [barcode])

  const handleBarcodeSubmit = async () => {
    if (!barcode) return

    setLoading(true)
    setError(null)

    try {
      if (locationError) {
        throw new Error(locationError)
      }

      const response = await fetch('/api/time-record/kiosk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          barcode,
          location: location
            ? {
                latitude: location.latitude,
                longitude: location.longitude,
              }
            : undefined,
          device: 'kiosk',
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao registrar ponto')
      }

      const data = await response.json()
      setLastRecord(data)
      setBarcode('')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao registrar ponto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
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

        {lastRecord && (
          <div className="mb-8 p-4 bg-green-50 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800">
              Ponto registrado com sucesso!
            </h3>
            <p className="text-green-700">
              {lastRecord.user.name} ({lastRecord.user.employeeId})
            </p>
            <p className="text-green-700">
              {lastRecord.type === 'ENTRY' ? 'Entrada' : 'Saída'} às{' '}
              {new Date(lastRecord.timestamp).toLocaleTimeString('pt-BR')}
            </p>
          </div>
        )}

        <div className="text-center">
          <p className="text-lg font-medium text-gray-700 mb-2">
            {barcode ? 'Código: ' + barcode : 'Aguardando leitura do código...'}
          </p>
          {loading && <p className="text-gray-500">Processando...</p>}
        </div>
      </div>
    </div>
  )
} 