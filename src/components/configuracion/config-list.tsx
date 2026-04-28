import { createClient } from '@/lib/supabase/server'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SpecialtyForm } from './specialty-form'
import { SpecialtyTable } from './specialty-table'
import { LocationForm } from './location-form'
import { LocationTable } from './location-table'

export default async function ConfigList() {
  const supabase = await createClient()
  
  const { data: specialties } = await supabase
    .from('specialties')
    .select('*')
    .is('deleted_at', null)
    .order('name')
  
  const { data: locations } = await supabase
    .from('locations')
    .select('*')
    .is('deleted_at', null)
    .order('name')
  
  return (
    <Tabs defaultValue="specialties" className="w-full">
      <TabsList>
        <TabsTrigger value="specialties">Especialidades</TabsTrigger>
        <TabsTrigger value="locations">Lugares</TabsTrigger>
      </TabsList>
      <TabsContent value="specialties" className="space-y-4">
        <SpecialtyForm onSuccess={() => {}} />
        <SpecialtyTable initialSpecialties={specialties || []} />
      </TabsContent>
      <TabsContent value="locations" className="space-y-4">
        <LocationForm onSuccess={() => {}} />
        <LocationTable initialLocations={locations || []} />
      </TabsContent>
    </Tabs>
  )
}
