import React from 'react'

interface TimeRecordStatusProps {
  lastRecord?: {
    type: 'ENTRY' | 'EXIT'
    timestamp: Date
  }
}

export function TimeRecordStatus({ lastRecord }: TimeRecordStatusProps) {
  if (!lastRecord) {
    return (
      <div className="text-center p-4 bg-gray-100 rounded-lg">
        <p className="text-gray-600">Nenhum registro encontrado hoje</p>
      </div>
    )
  }

  const isEntry = lastRecord.type === 'ENTRY'
  const statusColor = isEntry ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
  const statusText = isEntry ? 'Entrada' : 'Saída'
  const time = new Date(lastRecord.timestamp).toLocaleTimeString('pt-BR')

  return (
    <div className={`text-center p-4 rounded-lg ${statusColor}`}>
      <p className="font-semibold">Último registro: {statusText}</p>
      <p className="text-sm">Horário: {time}</p>
    </div>
  )
} 