import { BackButton } from '@/components/back-button'
import CitasTabs from './citas-tabs'
import AppointmentList from '@/components/appointments/appointment-list'

export const dynamic = 'force-dynamic'

export default function CitasPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Citas</h1>
        <BackButton />
      </div>

      <CitasTabs
        unassignedContent={<AppointmentList tab="unassigned" />}
        scheduledContent={<AppointmentList tab="scheduled" />}
      />
    </div>
  )
}
