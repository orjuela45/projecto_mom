import { createClient } from '@/lib/db-server'
import { AppointmentTable } from './appointment-table'

export default async function AppointmentList({ tab }: { tab: 'unassigned' | 'scheduled' }) {
  const supabase = await createClient()
  
  // Shared lookups — same regardless of tab
  const [patientsResult, specialtiesResult, locationsResult] = await Promise.all([
    supabase.from('patients').select('id, name').is('deleted_at', null).order('name'),
    supabase.from('specialties').select('id, name').is('deleted_at', null).order('name'),
    supabase.from('locations').select('id, name, address').is('deleted_at', null).order('name'),
  ])

  let appointmentsQuery = supabase
    .from('appointments')
    .select('*, patients(id, name), specialties(id, name), locations(id, name, address)')
    .is('deleted_at', null)

  if (tab === 'unassigned') {
    // Sin Asignar: date IS NULL — sort by creation (newest first)
    appointmentsQuery = appointmentsQuery.is('date', null).order('created_at', { ascending: false })
  } else {
    // Con Fecha: date IS NOT NULL — sort by date (soonest first)
    appointmentsQuery = appointmentsQuery.not('date', 'is', null).order('date', { ascending: true })
  }

  const { data: appointments } = await appointmentsQuery

  return (
    <AppointmentTable
      initialAppointments={appointments || []}
      patients={patientsResult.data || []}
      specialties={specialtiesResult.data || []}
      locations={locationsResult.data || []}
      tab={tab}
    />
  )
}
