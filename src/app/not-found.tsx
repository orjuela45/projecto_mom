import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-slate-900 mb-2">404</h1>
      <h2 className="text-xl text-slate-600 mb-4">Página no encontrada</h2>
      <Link href="/dashboard" className="text-blue-600 hover:underline">
        Volver al Dashboard
      </Link>
    </div>
  )
}
