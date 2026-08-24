'use client'

import { useState } from 'react'
import { Stethoscope, MapPin, Building2 } from 'lucide-react'
import { createClient } from '@/lib/db-client'
import { ConfigSidebar } from '@/components/configuracion/config-sidebar'
import { DataTable, Column } from '@/components/ui/data-table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Specialty, Location, Eps } from '@/types/database'
import { SpecialtyForm } from '@/components/configuracion/specialty-form'
import { LocationForm } from '@/components/configuracion/location-form'
import { EpsForm } from '@/components/configuracion/eps-form'
import { toast } from 'sonner'

interface Props {
  initialSpecialties: Specialty[]
  initialLocations: Location[]
  initialEps: Eps[]
}

const sections = [
  { id: 'specialties', label: 'Especialidades', icon: Stethoscope },
  { id: 'locations', label: 'Ubicaciones', icon: MapPin },
  { id: 'eps', label: 'EPS', icon: Building2 },
]

export function ConfigClient({ initialSpecialties, initialLocations, initialEps }: Props) {
  const [activeSection, setActiveSection] = useState(sections[0]?.id || 'specialties')
  const [specialties, setSpecialties] = useState(initialSpecialties)
  const [locations, setLocations] = useState(initialLocations)
  const [eps, setEps] = useState(initialEps)

  // Forms state
  const [specialtyFormOpen, setSpecialtyFormOpen] = useState(false)
  const [editingSpecialty, setEditingSpecialty] = useState<Specialty | null>(null)
  const [locationFormOpen, setLocationFormOpen] = useState(false)
  const [editingLocation, setLocation] = useState<Location | null>(null)
  const [epsFormOpen, setEpsFormOpen] = useState(false)
  const [editingEps, setEditingEps] = useState<Eps | null>(null)

  const supabase = createClient()

  // Specialty handlers
  async function handleDeleteSpecialty(item: Specialty) {
    const { error } = await supabase
      .from('specialties')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', item.id)

    if (error) {
      toast.error('Error al eliminar especialidad')
    } else {
      setSpecialties(prev => prev.filter(s => s.id !== item.id))
      toast.success('Especialidad eliminada')
    }
  }

  function handleSpecialtySuccess(newSpecialty: Specialty) {
    setSpecialtyFormOpen(false)
    setEditingSpecialty(null)
    if (editingSpecialty) {
      setSpecialties(prev => prev.map(s => s.id === newSpecialty.id ? newSpecialty : s))
      toast.success('Especialidad actualizada')
    } else {
      setSpecialties(prev => [...prev, newSpecialty].sort((a, b) => a.name.localeCompare(b.name)))
      toast.success('Especialidad creada')
    }
  }

  // Location handlers
  async function handleDeleteLocation(item: Location) {
    const { error } = await supabase
      .from('locations')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', item.id)

    if (error) {
      toast.error('Error al eliminar ubicación')
    } else {
      setLocations(prev => prev.filter(l => l.id !== item.id))
      toast.success('Ubicación eliminada')
    }
  }

  function handleLocationSuccess(newLocation: Location) {
    setLocationFormOpen(false)
    setLocation(null)
    if (editingLocation) {
      setLocations(prev => prev.map(l => l.id === newLocation.id ? newLocation : l))
      toast.success('Ubicación actualizada')
    } else {
      setLocations(prev => [...prev, newLocation].sort((a, b) => a.name.localeCompare(b.name)))
      toast.success('Ubicación creada')
    }
  }

  // EPS handlers
  async function handleDeleteEps(item: Eps) {
    const { error } = await supabase
      .from('eps')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', item.id)

    if (error) {
      toast.error('Error al eliminar EPS')
    } else {
      setEps(prev => prev.filter(e => e.id !== item.id))
      toast.success('EPS eliminada')
    }
  }

  function handleEpsSuccess(newEps: Eps) {
    setEpsFormOpen(false)
    setEditingEps(null)
    if (editingEps) {
      setEps(prev => prev.map(e => e.id === newEps.id ? newEps : e))
      toast.success('EPS actualizada')
    } else {
      setEps(prev => [...prev, newEps].sort((a, b) => a.name.localeCompare(b.name)))
      toast.success('EPS creada')
    }
  }

  // Column definitions
  const specialtyColumns: Column<Specialty>[] = [
    { key: 'name', header: 'Nombre', className: 'font-medium' },
    {
      key: 'created_at',
      header: 'Creado',
      render: (item) => new Date(item.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }),
    },
  ]

  const locationColumns: Column<Location>[] = [
    { key: 'name', header: 'Nombre', className: 'font-medium' },
    { key: 'address', header: 'Dirección', render: (item) => item.address || '-' },
    {
      key: 'created_at',
      header: 'Creado',
      render: (item) => new Date(item.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }),
    },
  ]

  const epsColumns: Column<Eps>[] = [
    { key: 'name', header: 'Nombre', className: 'font-medium' },
    {
      key: 'created_at',
      header: 'Creado',
      render: (item) => new Date(item.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }),
    },
  ]

  // Update section counts
  const sectionsWithCounts = sections.map(s => ({
    ...s,
    count: s.id === 'specialties' ? specialties.length
         : s.id === 'locations' ? locations.length
         : eps.length,
  }))

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Sidebar */}
      <ConfigSidebar
        sections={sectionsWithCounts}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Specialties Section */}
        {activeSection === 'specialties' && (
          <Card>
            <CardHeader>
              <CardTitle>Especialidades Médicas</CardTitle>
              <CardDescription>
                Gestiona las especialidades disponibles para las citas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                data={specialties}
                columns={specialtyColumns}
                searchKey="name"
                searchPlaceholder="Buscar especialidad..."
                addButtonText="Agregar Especialidad"
                emptyMessage="Agrega tu primera especialidad médica"
                onAdd={() => { setEditingSpecialty(null); setSpecialtyFormOpen(true) }}
                onEdit={(item) => { setEditingSpecialty(item); setSpecialtyFormOpen(true) }}
                onDelete={handleDeleteSpecialty}
                deleteConfirmTitle="Eliminar Especialidad"
              />
            </CardContent>
          </Card>
        )}

        {/* Locations Section */}
        {activeSection === 'locations' && (
          <Card>
            <CardHeader>
              <CardTitle>Ubicaciones</CardTitle>
              <CardDescription>
                Gestiona los lugares donde se atienden las citas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                data={locations}
                columns={locationColumns}
                searchKey="name"
                searchPlaceholder="Buscar ubicación..."
                addButtonText="Agregar Ubicación"
                emptyMessage="Agrega tu primera ubicación"
                onAdd={() => { setLocation(null); setLocationFormOpen(true) }}
                onEdit={(item) => { setLocation(item); setLocationFormOpen(true) }}
                onDelete={handleDeleteLocation}
                deleteConfirmTitle="Eliminar Ubicación"
              />
            </CardContent>
          </Card>
        )}

        {/* EPS Section */}
        {activeSection === 'eps' && (
          <Card>
            <CardHeader>
              <CardTitle>EPS</CardTitle>
              <CardDescription>
                Gestiona las entidades promotoras de salud
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                data={eps}
                columns={epsColumns}
                searchKey="name"
                searchPlaceholder="Buscar EPS..."
                addButtonText="Agregar EPS"
                emptyMessage="Agrega tu primera EPS"
                onAdd={() => { setEditingEps(null); setEpsFormOpen(true) }}
                onEdit={(item) => { setEditingEps(item); setEpsFormOpen(true) }}
                onDelete={handleDeleteEps}
                deleteConfirmTitle="Eliminar EPS"
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Forms */}
      <SpecialtyForm
        open={specialtyFormOpen}
        onOpenChange={setSpecialtyFormOpen}
        specialty={editingSpecialty}
        onSuccess={handleSpecialtySuccess}
      />
      <LocationForm
        open={locationFormOpen}
        onOpenChange={setLocationFormOpen}
        location={editingLocation}
        onSuccess={handleLocationSuccess}
      />
      <EpsForm
        open={epsFormOpen}
        onOpenChange={setEpsFormOpen}
        eps={editingEps}
        onSuccess={handleEpsSuccess}
      />
    </div>
  )
}
