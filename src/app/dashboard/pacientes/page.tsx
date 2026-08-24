import PatientList from '@/components/patients/patient-list'

export const dynamic = 'force-dynamic'

export default function PacientesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Pacientes</h1>
        <p className="text-sm md:text-base text-muted-foreground mt-1">
          Gestiona la información de los pacientes
        </p>
      </div>
      <PatientList />
    </div>
  )
}
