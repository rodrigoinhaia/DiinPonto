import { Button } from '@/components/ui/button'
import { Clock, Coffee, ArrowRight, LogOut } from 'lucide-react'

interface KioskButtonsProps {
  onRecord: (type: 'ENTRY' | 'PAUSE' | 'RETURN' | 'EXIT') => void
  disabled?: boolean
}

export function KioskButtons({ onRecord, disabled }: KioskButtonsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
      <Button
        size="lg"
        className="h-24 text-lg font-semibold bg-green-600 hover:bg-green-700"
        onClick={() => onRecord('ENTRY')}
        disabled={disabled}
      >
        <Clock className="w-6 h-6 mr-2" />
        Entrada
      </Button>

      <Button
        size="lg"
        className="h-24 text-lg font-semibold bg-yellow-600 hover:bg-yellow-700"
        onClick={() => onRecord('PAUSE')}
        disabled={disabled}
      >
        <Coffee className="w-6 h-6 mr-2" />
        Pausa
      </Button>

      <Button
        size="lg"
        className="h-24 text-lg font-semibold bg-blue-600 hover:bg-blue-700"
        onClick={() => onRecord('RETURN')}
        disabled={disabled}
      >
        <ArrowRight className="w-6 h-6 mr-2" />
        Retorno
      </Button>

      <Button
        size="lg"
        className="h-24 text-lg font-semibold bg-red-600 hover:bg-red-700"
        onClick={() => onRecord('EXIT')}
        disabled={disabled}
      >
        <LogOut className="w-6 h-6 mr-2" />
        Saída
      </Button>
    </div>
  )
} 