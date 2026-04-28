import { createClient } from '@/lib/supabase/server'
import { PatientTable } from './patient-table'

export default async function PatientList() {
  const supabase = await createClient()
  
  const { data: patients } = await supabase
    .from('patients')
    .select('*')
    .is('deleted_at', null)
    .order('name')
  
  return <PatientTable initialPatients={patients || []} />
}
