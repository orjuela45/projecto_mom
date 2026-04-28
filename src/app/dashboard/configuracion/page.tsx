import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import SpecialtyList from '@/components/configuracion/specialty-list'
import LocationList from '@/components/configuracion/location-list'

export default function ConfiguracionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configuración</h1>
        <p className="text-slate-500">Gestiona especialidades y ubicaciones</p>
      </div>

      <Tabs defaultValue="specialties" className="space-y-4">
        <TabsList>
          <TabsTrigger value="specialties">Especialidades</TabsTrigger>
          <TabsTrigger value="locations">Ubicaciones</TabsTrigger>
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
      </Tabs>
    </div>
  )
}
