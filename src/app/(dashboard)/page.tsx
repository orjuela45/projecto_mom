import { createClient } from '@/lib/supabase/server'
import { Calendar, Users, Clock, CheckCircle, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const now = new Date()
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
  
  const { data: citas } = await supabase
    .from('citas')
    .select('*')
    .eq('deleted_at', null)
    .gte('fecha', firstDayOfMonth)
    .lte('fecha', lastDayOfMonth)
  
  const { count: totalPacientes } = await supabase
    .from('pacientes')
    .select('*', { count: 'exact', head: true })
    .is('deleted_at', null)
  
  const citasDelMes = citas || []
  const citasPendientes = citasDelMes.filter(c => c.estado === 'pendiente').length
  const citasAtendidas = citasDelMes.filter(c => c.estado === 'atendido').length
  const citasCanceladas = citasDelMes.filter(c => c.estado === 'cancelado').length

  const monthName = now.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-slate-500">Citas del Mes</p>
              <p className="text-2xl font-bold text-slate-900">{citasDelMes.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-slate-500">Pacientes</p>
              <p className="text-2xl font-bold text-slate-900">{totalPacientes || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-slate-500">Pendientes</p>
              <p className="text-2xl font-bold text-slate-900">{citasPendientes}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-slate-500">Atendidas</p>
              <p className="text-2xl font-bold text-slate-900">{citasAtendidas}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900 capitalize">{monthName}</h2>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Resumen de Citas</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-yellow-50 rounded-lg">
            <p className="text-3xl font-bold text-yellow-600">{citasPendientes}</p>
            <p className="text-sm text-slate-600">Pendientes</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-3xl font-bold text-green-600">{citasAtendidas}</p>
            <p className="text-sm text-slate-600">Atendidas</p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg">
            <p className="text-3xl font-bold text-red-600">{citasCanceladas}</p>
            <p className="text-sm text-slate-600">Canceladas</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-medium text-slate-900 mb-2">Pacientes</h3>
          <p className="text-sm text-slate-500 mb-4">
            Gestiona el registro de tus pacientes.
          </p>
          <a
            href="/dashboard/pacientes"
            className="text-sm text-blue-600 hover:underline"
          >
            Ir a Pacientes →
          </a>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-medium text-slate-900 mb-2">Citas</h3>
          <p className="text-sm text-slate-500 mb-4">
            Agenda y administra las citas médicas.
          </p>
          <a
            href="/dashboard/citas"
            className="text-sm text-blue-600 hover:underline"
          >
            Ir a Citas →
          </a>
        </div>
      </div>
    </div>
  )
}
