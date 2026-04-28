import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  // Simple test - just check if we can fetch
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600">Error: No user found</h1>
        <p className="mt-4 text-slate-600">
          No estás autenticado. <a href="/login" className="text-blue-600 hover:underline">Volver al login</a>
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="pb-4">
        <h1 className="text-4xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-2 text-lg">
          Conectado como: {user.email}
        </p>
      </div>

      {/* Simple Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow p-8 border border-slate-200">
          <h3 className="font-semibold text-slate-900">Estado</h3>
          <p className="text-green-600 mt-2">✓ Autenticado correctamente</p>
        </div>

        <div className="bg-white rounded-lg shadow p-8 border border-slate-200">
          <h3 className="font-semibold text-slate-900">Usuario</h3>
          <p className="text-slate-600 mt-2">{user.email}</p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="space-y-4">
        <a href="/dashboard/pacientes" className="block p-6 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
          <h3 className="font-medium text-blue-900">Pacientes →</h3>
        </a>
        <a href="/dashboard/citas" className="block p-6 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
          <h3 className="font-medium text-green-900">Citas →</h3>
        </a>
        <a href="/dashboard/citas" className="block p-6 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
          <h3 className="font-medium text-green-900">Citas →</h3>
        </a>
      </div>
    </div>
  )
}
