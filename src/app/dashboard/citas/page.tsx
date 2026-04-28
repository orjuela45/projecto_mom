import AppointmentList from '@/components/appointments/appointment-list'
import { BackButton } from '@/components/back-button'

export default function CitasPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between pb-4">
        <h1 className="text-3xl font-bold text-slate-900">Citas</h1>
        <BackButton />
      </div>
      <AppointmentList />
    </div>
  )
}
