import CitasTabs from './citas-tabs'
import AppointmentList from '@/components/appointments/appointment-list'

export const dynamic = 'force-dynamic'

export default function CitasPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Citas</h1>
        <p className="text-sm md:text-base text-muted-foreground mt-1">
          Gestiona y organiza las citas médicas
        </p>
      </div>

      <CitasTabs
        unassignedContent={<AppointmentList tab="unassigned" />}
        scheduledContent={<AppointmentList tab="scheduled" />}
      />
    </div>
  )
}
