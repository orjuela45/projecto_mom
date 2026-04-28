import { createClient } from '@/lib/supabase/server'
import { LocationTable } from './location-table'

export default async function LocationList() {
  const supabase = await createClient()
  
  const { data: locations } = await supabase
    .from('locations')
    .select('*')
    .is('deleted_at', null)
    .order('name')
  
  return <LocationTable initialLocations={locations || []} />
}
