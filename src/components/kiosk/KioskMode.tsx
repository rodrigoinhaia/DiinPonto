'use client'

import { useState, useEffect } from 'react'
import { useGeolocation } from '@/lib/hooks/useGeolocation'
import { Clock } from '@/components/time-record/Clock'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { KioskAuth } from './KioskAuth'
import { KioskButtons } from './KioskButtons'
import { PrinterService } from '@/lib/services/printer'

interface TimeRecord {
  id: string
  type: 'ENTRY' | 'PAUSE' | 'RETURN' | 'EXIT'
  timestamp: string
  user: {
    name: string
    employeeId: string
  }
}

interface KioskModeProps {
  companyInfo: {
    companyName: string
    companyAddress: string
    companyPhone: string
    companyCNPJ: string
  }
}

export function KioskMode({ companyInfo }: KioskModeProps) {
  const [authenticated, setAuthenticated] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [lastRecord, setLastRecord] = useState<TimeRecord | null>(null)
  const { location, error: locationError, loading: locationLoading, retry: retryLocation } = useGeolocation()

  const handleAuth = (id: string) => {
    setUserId(id)
    setAuthenticated(true)
    setError(null)
  }

  const handleError = (message: string) => {
    setError(message)
    setSuccess(null)
  }

  const handleRecord = async (type: 'ENTRY' | 'PAUSE' | 'RETURN' | 'EXIT') => {
    if (!userId) return

    try {
      // Obter localização
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        })
      })

      const response = await fetch('/api/time-record/kiosk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          type,
          location: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          },
          device: {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao registrar ponto')
      }

      setLastRecord(data.record)
      setSuccess(`Ponto registrado com sucesso: ${type}`)
      setError(null)

      // Imprimir comprovante
      try {
        const printCommand = PrinterService.generateTimeRecordCommand({
          record: data.record,
          options: companyInfo,
        })
        await PrinterService.print(printCommand)
      } catch (printError) {
        console.error('Erro ao imprimir comprovante:', printError)
        // Não interrompe o fluxo se a impressão falhar
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao registrar ponto'
      setError(message)
      setSuccess(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {new Date().toLocaleTimeString('pt-BR')}
          </h1>
          <p className="text-gray-600">Registro de Ponto</p>
        </div>

        {!authenticated ? (
          <KioskAuth onAuth={handleAuth} onError={handleError} />
        ) : (
          <KioskButtons onRecord={handleRecord} />
        )}

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mt-4 bg-green-50 border-green-200">
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {lastRecord && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Último Registro</h3>
            <p className="text-gray-600">
              {new Date(lastRecord.timestamp).toLocaleString('pt-BR')} - {lastRecord.type}
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 