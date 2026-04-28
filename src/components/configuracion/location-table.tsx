'use client'

import { useState } from 'react'
import { Location } from '@/types/database'
import { createClient } from '@/lib/supabase/client'
import { LocationForm } from './location-form'
import { PatientDialog } from '@/components/patients/patient-dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  initialLocations: Location[]
}

export function LocationTable({ initialLocations }: Props) {
  const [locations, setLocations] = useState(initialLocations)
  const [search, setSearch] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingLocation, setEditingLocation] = useState<Location | null>(null)
  const [deletingLocation, setDeletingLocation] = useState<Location | null>(null)
  const supabase = createClient()

  const filteredLocations = locations.filter(l => 
    l.name.toLowerCase().includes(search.toLowerCase())
  )

  function handleEdit(location: Location) {
    setEditingLocation(location)
    setIsFormOpen(true)
  }

  async function handleDelete() {
    if (!deletingLocation) return
    
    const { error } = await supabase
      .from('locations')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', deletingLocation.id)
    
    if (error) {
      toast.error('Error al eliminar ubicación')
    } else {
      setLocations(prev => prev.filter(l => l.id !== deletingLocation.id))
      toast.success('Ubicación eliminada')
    }
    setDeletingLocation(null)
  }

  function handleFormSuccess(newLocation: Location) {
    setIsFormOpen(false)
    setEditingLocation(null)
    if (editingLocation) {
      setLocations(prev => prev.map(l => l.id === newLocation.id ? newLocation : l))
      toast.success('Ubicación actualizada')
    } else {
      setLocations(prev => [...prev, newLocation].sort((a, b) => a.name.localeCompare(b.name)))
      toast.success('Ubicación creada')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar ubicación..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button onClick={() => { setEditingLocation(null); setIsFormOpen(true) }}>
          <Plus className="mr-2 h-4 w-4" />
          Agregar Ubicación
        </Button>
      </div>

      {filteredLocations.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          {search ? 'No se encontraron ubicaciones' : 'No hay ubicaciones registradas'}
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Dirección</TableHead>
                <TableHead>Fecha de Creación</TableHead>
                <TableHead className="w-32">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLocations.map((location) => (
                <TableRow key={location.id}>
                  <TableCell className="font-medium">{location.name}</TableCell>
                  <TableCell>{location.address || '-'}</TableCell>
                  <TableCell>
                    {new Date(location.created_at).toLocaleDateString('es-CO')}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(location)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeletingLocation(location)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <LocationForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        location={editingLocation}
        onSuccess={handleFormSuccess}
      />

      <PatientDialog
        open={!!deletingLocation}
        onOpenChange={(open) => !open && setDeletingLocation(null)}
        onConfirm={handleDelete}
        title="Eliminar Ubicación"
        description={`¿Estás seguro de eliminar "${deletingLocation?.name}"? Esta acción no se puede deshacer.`}
      />
    </div>
  )
}
