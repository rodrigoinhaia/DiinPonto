import React from 'react'

interface TimeRecordButtonProps {
  type: 'ENTRY' | 'EXIT'
  onClick: () => void
  disabled?: boolean
}

export function TimeRecordButton({ type, onClick, disabled }: TimeRecordButtonProps) {
  const isEntry = type === 'ENTRY'
  const buttonText = isEntry ? 'Registrar Entrada' : 'Registrar Saída'
  const buttonColor = isEntry ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${buttonColor}
        text-white
        font-bold
        py-4
        px-8
        rounded-lg
        text-lg
        transition-colors
        disabled:opacity-50
        disabled:cursor-not-allowed
        shadow-lg
        hover:shadow-xl
        transform
        hover:scale-105
        active:scale-95
      `}
    >
      {buttonText}
    </button>
  )
} 