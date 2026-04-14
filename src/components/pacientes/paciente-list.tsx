import { createClient } from '@/lib/supabase/server'
import { PacienteTable } from './paciente-table'

export default async function PacienteList() {
  const supabase = await createClient()
  
  const { data: pacientes } = await supabase
    .from('pacientes')
    .select('*')
    .is('deleted_at', null)
    .order('nombre')
  
  return <PacienteTable initialPacientes={pacientes || []} />
}
