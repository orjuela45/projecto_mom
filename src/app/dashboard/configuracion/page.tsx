import { createClient } from '@/lib/db-server'
import { ConfigClient } from './config-client'

export const dynamic = 'force-dynamic'

export default async function ConfiguracionPage() {
  const supabase = await createClient()

  const [specialtiesResult, locationsResult, epsResult] = await Promise.all([
    supabase.from('specialties').select('*').is('deleted_at', null).order('name'),
    supabase.from('locations').select('*').is('deleted_at', null).order('name'),
    supabase.from('eps').select('*').is('deleted_at', null).order('name'),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Configuración</h1>
        <p className="text-sm md:text-base text-muted-foreground mt-1">
          Gestiona especialidades, ubicaciones y entidades de salud
        </p>
      </div>

      <ConfigClient
        initialSpecialties={specialtiesResult.data || []}
        initialLocations={locationsResult.data || []}
        initialEps={epsResult.data || []}
      />
    </div>
  )
}
