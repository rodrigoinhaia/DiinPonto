import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useBarcodeReader } from '@/lib/hooks/useBarcodeReader'

interface KioskAuthProps {
  onAuth: (userId: string) => void
  onError: (error: string) => void
}

export function KioskAuth({ onAuth, onError }: KioskAuthProps) {
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { barcode, isReading } = useBarcodeReader({
    onRead: handleBarcodeSubmit,
    onError: (error) => {
      setError(error)
      onError(error)
    },
  })

  const handlePinSubmit = async () => {
    if (!pin || !/^\d{6}$/.test(pin)) {
      setError('PIN deve conter exatamente 6 dígitos numéricos')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/kiosk/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method: 'PIN',
          pin,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao autenticar')
      }

      onAuth(data.user.id)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao autenticar'
      setError(message)
      onError(message)
    } finally {
      setLoading(false)
      setPin('')
    }
  }

  async function handleBarcodeSubmit(barcode: string) {
    if (!barcode) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/kiosk/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method: 'BARCODE',
          barcode,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao autenticar')
      }

      onAuth(data.user.id)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao autenticar'
      setError(message)
      onError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Tabs defaultValue="barcode" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="barcode">Crachá</TabsTrigger>
          <TabsTrigger value="pin">PIN</TabsTrigger>
        </TabsList>

        <TabsContent value="barcode">
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-lg font-medium text-gray-700 mb-2">
                {barcode ? 'Código: ' + barcode : 'Aguardando leitura do código...'}
              </p>
              {loading && <p className="text-gray-500">Processando...</p>}
              {isReading && <p className="text-gray-500">Lendo código...</p>}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="pin">
          <div className="space-y-4">
            <Input
              type="password"
              placeholder="Digite seu PIN (6 dígitos)"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              maxLength={6}
              disabled={loading}
            />
            <Button
              className="w-full"
              onClick={handlePinSubmit}
              disabled={loading || !pin}
            >
              {loading ? 'Autenticando...' : 'Entrar'}
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
} 