import { createClient } from '@/lib/supabase/server'
import { MetricsCards } from '@/components/dashboard/metrics-cards'
import { StatusPieChart } from '@/components/dashboard/status-pie-chart'
import { WeeklyBarChart } from '@/components/dashboard/weekly-bar-chart'
import { getTodayMetrics } from '@/lib/dashboard-metrics'

export default async function DashboardPage() {
  const supabase = await createClient()
  
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

  const { data: appointments } = await supabase
    .from('appointments')
    .select(`
      *,
      patients (id, name),
      specialties (id, name),
      locations (id, name)
    `)
    .is('deleted_at', null)

  const appointmentsList = appointments || []
  const metrics = getTodayMetrics(appointmentsList)

  const userName = user.email?.split('@')[0] || 'Usuario'

  return (
    <div className="space-y-8">
      <div className="pb-4">
        <h1 className="text-2xl md:text-4xl font-bold text-slate-900">
          Hola, {userName} 👋
        </h1>
        <p className="text-sm md:text-lg text-slate-600 mt-2">
          Aquí está el resumen de citas de MomCitas
        </p>
      </div>

      <MetricsCards metrics={metrics} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatusPieChart appointments={appointmentsList} />
        <WeeklyBarChart appointments={appointmentsList} />
      </div>
    </div>
  )
}
