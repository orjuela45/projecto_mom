import { PatientList } from '@/components/patients/patient-list'

export default function PacientesPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Pacientes</h1>
      <PatientList />
    </div>
  )
}
