import { createClient } from '@/lib/supabase/server'
import { AppointmentTable } from './appointment-table'

export default async function AppointmentList() {
  const supabase = await createClient()
  
  const { data: appointments } = await supabase
    .from('appointments')
    .select(`
      *,
      patients (id, name),
      specialties (id, name),
      locations (id, name, address)
    `)
    .is('deleted_at', null)
    .order('date', { ascending: false })
  
  const { data: patients } = await supabase
    .from('patients')
    .select('id, name')
    .is('deleted_at', null)
    .order('name')
  
  const { data: specialties } = await supabase
    .from('specialties')
    .select('id, name')
    .is('deleted_at', null)
    .order('name')
  
  const { data: locations } = await supabase
    .from('locations')
    .select('id, name, address')
    .is('deleted_at', null)
    .order('name')

  return (
    <AppointmentTable 
      initialAppointments={appointments || []}
      patients={patients || []}
      specialties={specialties || []}
      locations={locations || []}
    />
  )
}
