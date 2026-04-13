import { Calendar, Users, Clock } from 'lucide-react'

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-8">
        Dashboard
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-slate-500">Citas del Mes</p>
              <p className="text-2xl font-bold text-slate-900">0</p>
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
              <p className="text-2xl font-bold text-slate-900">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-slate-500">Pendientes</p>
              <p className="text-2xl font-bold text-slate-900">0</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Bienvenido al Sistema de Citas Médicas
        </h2>
        <p className="text-slate-600">
          Este es el dashboard principal. Aquí verás un resumen de tu actividad.
        </p>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4">
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
          <div className="border rounded-lg p-4">
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
    </div>
  )
}
