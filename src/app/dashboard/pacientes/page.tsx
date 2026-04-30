import PatientList from '@/components/patients/patient-list'
import { BackButton } from '@/components/back-button'

export default function PacientesPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Pacientes</h1>
        <BackButton />
      </div>
      <PatientList />
    </div>
  )
}
