import PatientList from '@/components/patients/patient-list'
import { BackButton } from '@/components/back-button'

export default function PacientesPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between pb-4">
        <h1 className="text-3xl font-bold text-slate-900">Pacientes</h1>
        <BackButton />
      </div>
      <PatientList />
    </div>
  )
}
