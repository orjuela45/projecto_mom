import { createClient } from '@/lib/supabase/server'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EspecialidadForm } from './especialidad-form'
import { EspecialidadTable } from './especialidad-table'
import { LugarForm } from './lugar-form'
import { LugarTable } from './lugar-table'

export default async function ConfigList() {
  const supabase = await createClient()
  
  const { data: especialidades } = await supabase
    .from('especialidades')
    .select('*')
    .is('deleted_at', null)
    .order('nombre')
  
  const { data: lugares } = await supabase
    .from('lugares')
    .select('*')
    .is('deleted_at', null)
    .order('nombre')
  
  return (
    <Tabs defaultValue="especialidades" className="w-full">
      <TabsList>
        <TabsTrigger value="especialidades">Especialidades</TabsTrigger>
        <TabsTrigger value="lugares">Lugares</TabsTrigger>
      </TabsList>
      <TabsContent value="especialidades" className="space-y-4">
        <EspecialidadForm onSuccess={() => {}} />
        <EspecialidadTable initialEspecialidades={especialidades || []} />
      </TabsContent>
      <TabsContent value="lugares" className="space-y-4">
        <LugarForm onSuccess={() => {}} />
        <LugarTable initialLugares={lugares || []} />
      </TabsContent>
    </Tabs>
  )
}
