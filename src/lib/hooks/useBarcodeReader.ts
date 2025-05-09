import { useState, useEffect, useCallback } from 'react'

interface UseBarcodeReaderOptions {
  onRead?: (barcode: string) => void
  onError?: (error: string) => void
  timeout?: number
}

export function useBarcodeReader({
  onRead,
  onError,
  timeout = 100, // Tempo máximo entre caracteres para considerar uma leitura completa
}: UseBarcodeReaderOptions = {}) {
  const [barcode, setBarcode] = useState('')
  const [lastKeyTime, setLastKeyTime] = useState(0)
  const [isReading, setIsReading] = useState(false)

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      const currentTime = Date.now()

      // Se passou muito tempo desde a última tecla, reinicia a leitura
      if (currentTime - lastKeyTime > timeout) {
        setBarcode('')
      }

      // Atualiza o tempo da última tecla
      setLastKeyTime(currentTime)

      // Se for Enter, finaliza a leitura
      if (event.key === 'Enter') {
        if (barcode) {
          onRead?.(barcode)
          setBarcode('')
        }
        return
      }

      // Ignora teclas especiais
      if (event.key.length > 1) {
        return
      }

      // Adiciona o caractere ao código
      setBarcode(prev => prev + event.key)
      setIsReading(true)
    },
    [barcode, lastKeyTime, timeout, onRead]
  )

  useEffect(() => {
    window.addEventListener('keypress', handleKeyPress)
    return () => window.removeEventListener('keypress', handleKeyPress)
  }, [handleKeyPress])

  // Limpa o código após o timeout
  useEffect(() => {
    if (!isReading) return

    const timer = setTimeout(() => {
      if (barcode) {
        onRead?.(barcode)
        setBarcode('')
      }
      setIsReading(false)
    }, timeout)

    return () => clearTimeout(timer)
  }, [barcode, isReading, timeout, onRead])

  return {
    barcode,
    isReading,
    reset: () => {
      setBarcode('')
      setIsReading(false)
    },
  }
} 