interface TimeRecordButtonProps {
  type: 'ENTRY' | 'EXIT'
  onClick: () => void
  disabled?: boolean
}

export function TimeRecordButton({ type, onClick, disabled }: TimeRecordButtonProps) {
  const isEntry = type === 'ENTRY'
  const text = isEntry ? 'Entrada' : 'Saída'
  const bgColor = isEntry ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full py-3 px-4 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
        disabled
          ? 'bg-gray-400 cursor-not-allowed'
          : bgColor
      }`}
    >
      {text}
    </button>
  )
} 