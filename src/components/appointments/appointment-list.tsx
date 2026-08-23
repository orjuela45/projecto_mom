import { createClient } from '@/lib/db-server'
import { AppointmentTable } from './appointment-table'

export default async function AppointmentList({ tab }: { tab: 'unassigned' | 'scheduled' }) {
  const supabase = await createClient()
  
  let query = supabase
    .from('appointments')
    .select('*, patients(id, name), specialties(id, name), locations(id, name, address)')
    .is('deleted_at', null)
  
  if (tab === 'unassigned') {
    // Sin Asignar: date = NULL (sin importar el estado)
    query = query.is('date', null)
    // Ordenar por creación (más recientes primero)
    const { data: appointments } = await query.order('created_at', { ascending: false })
    
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
        tab={tab}
      />
    )
  } else {
    // Con Fecha: date != NULL (sin importar el estado)
    query = query.not('date', 'is', null)
    // Ordenar por fecha (más próximas primero)
    const { data: appointments } = await query.order('date', { ascending: true })
    
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
        tab={tab}
      />
    )
  }
}
