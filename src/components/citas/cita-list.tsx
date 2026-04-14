import { createClient } from '@/lib/supabase/server'
import { CitaTable } from './cita-table'

export default async function CitaList() {
  const supabase = await createClient()
  
  const { data: citas } = await supabase
    .from('citas')
    .select(`
      *,
      pacientes (id, nombre),
      especialidades (id, nombre),
      lugares (id, nombre)
    `)
    .is('deleted_at', null)
    .order('fecha', { ascending: false })
  
  const { data: pacientes } = await supabase
    .from('pacientes')
    .select('id, nombre')
    .is('deleted_at', null)
    .order('nombre')
  
  const { data: especialidades } = await supabase
    .from('especialidades')
    .select('id, nombre')
    .is('deleted_at', null)
    .order('nombre')
  
  const { data: lugares } = await supabase
    .from('lugares')
    .select('id, nombre, direccion')
    .is('deleted_at', null)
    .order('nombre')

  return (
    <CitaTable 
      initialCitas={citas || []}
      pacientes={pacientes || []}
      especialidades={especialidades || []}
      lugares={lugares || []}
    />
  )
}
