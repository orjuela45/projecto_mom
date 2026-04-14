'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  console.error(error)

  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <h2 className="text-2xl font-bold text-slate-900 mb-4">
        ¡Algo salió mal!
      </h2>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Intentar de nuevo
      </button>
    </div>
  )
}
