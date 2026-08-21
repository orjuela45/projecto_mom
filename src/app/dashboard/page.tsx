import { createClient } from '@/lib/db-server'
import { MetricsCards } from '@/components/dashboard/metrics-cards'
import { StatusPieChart } from '@/components/dashboard/status-pie-chart'
import { WeeklyBarChart } from '@/components/dashboard/weekly-bar-chart'
import { getTodayMetrics } from '@/lib/dashboard-metrics'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: appointments } = await supabase
    .from('appointments')
    .select('*')
    .is('deleted_at', null)

  const appointmentsList = appointments || []
  const metrics = getTodayMetrics(appointmentsList)

  return (
    <div className="space-y-8">
      <div className="pb-4">
        <h1 className="text-2xl md:text-4xl font-bold text-slate-900">
          MomCitas 👋
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
