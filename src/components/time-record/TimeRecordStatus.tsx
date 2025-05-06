interface TimeRecord {
  id: string
  type: 'ENTRY' | 'EXIT'
  timestamp: string
}

interface TimeRecordStatusProps {
  lastRecord: TimeRecord | null
}

export function TimeRecordStatus({ lastRecord }: TimeRecordStatusProps) {
  if (!lastRecord) {
    return (
      <div className="mt-4 text-gray-600">
        Nenhum registro encontrado hoje
      </div>
    )
  }

  const isEntry = lastRecord.type === 'ENTRY'
  const timestamp = new Date(lastRecord.timestamp)
  const formattedTime = timestamp.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="mt-4">
      <div className="text-gray-600">
        Último registro:
      </div>
      <div className="text-lg font-medium text-gray-900">
        {isEntry ? 'Entrada' : 'Saída'} às {formattedTime}
      </div>
    </div>
  )
} 