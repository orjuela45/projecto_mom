import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BackButton } from '@/components/back-button'
import SpecialtyList from '@/components/configuracion/specialty-list'
import LocationList from '@/components/configuracion/location-list'
import EpsList from '@/components/configuracion/eps-list'

export default function ConfiguracionPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Configuración</h1>
          <p className="text-sm md:text-base text-slate-500">Gestiona especialidades y ubicaciones</p>
        </div>
        <BackButton />
      </div>

      <Tabs defaultValue="specialties" className="space-y-4">
        <TabsList className="w-full md:w-auto">
          <TabsTrigger value="specialties" className="flex-1 md:flex-none">Especialidades</TabsTrigger>
          <TabsTrigger value="locations" className="flex-1 md:flex-none">Ubicaciones</TabsTrigger>
          <TabsTrigger value="eps" className="flex-1 md:flex-none">EPS</TabsTrigger>
        </TabsList>

        <TabsContent value="specialties" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Especialidades Médicas</CardTitle>
              <CardDescription>
                Gestiona las especialidades disponibles para las citas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SpecialtyList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="locations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ubicaciones</CardTitle>
              <CardDescription>
                Gestiona los lugares donde se atienden las citas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LocationList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="eps" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>EPS</CardTitle>
              <CardDescription>
                Gestiona las entidades promotoras de salud
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EpsList />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
