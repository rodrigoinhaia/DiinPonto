export function Loading() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center">
      <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-gray-900"></div>
      <p className="mt-4 text-lg font-medium text-gray-900">Carregando...</p>
    </div>
  )
} 