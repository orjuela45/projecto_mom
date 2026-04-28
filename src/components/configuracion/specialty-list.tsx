import { createClient } from '@/lib/supabase/server'
import { SpecialtyTable } from './specialty-table'

export default async function SpecialtyList() {
  const supabase = await createClient()
  
  const { data: specialties } = await supabase
    .from('specialties')
    .select('*')
    .is('deleted_at', null)
    .order('name')
  
  return <SpecialtyTable initialSpecialties={specialties || []} />
}
