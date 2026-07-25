import { createClient } from '@/lib/db-server'
import { EpsTable } from './eps-table'

export default async function EpsList() {
  const supabase = await createClient()
  
  const { data: eps } = await supabase
    .from('eps')
    .select('*')
    .is('deleted_at', null)
    .order('name')
  
  return <EpsTable initialEps={eps || []} />
}
