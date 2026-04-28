'use client'

import { useState } from 'react'
import { Location } from '@/types/database'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { LocationForm } from './location-form'

interface Props {
  initialLocations: Location[]
}

export function LocationTable({ initialLocations }: Props) {
  const [locations, setLocations] = useState(initialLocations)
  const [editing, setEditing] = useState<Location | null>(null)
  const [showForm, setShowForm] = useState(false)
  const supabase = createClient()

  async function handleDelete(id: string) {
    const { error } = await supabase
      .from('locations')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
    
    if (error) toast.error('Error al eliminar')
    else {
      setLocations(prev => prev.filter(l => l.id !== id))
      toast.success('Lugar eliminado')
    }
  }

  function handleSuccess(updated: Location, isNew: boolean) {
    if (isNew) setLocations(prev => [...prev, updated].sort((a, b) => a.name.localeCompare(b.name)))
    else setLocations(prev => prev.map(l => l.id === updated.id ? updated : l))
    setEditing(null)
    setShowForm(false)
    toast.success(isNew ? 'Lugar creado' : 'Lugar actualizado')
  }

  if (locations.length === 0 && !showForm) {
    return (
      <div className="text-center py-8 text-slate-500">
        No hay lugares registrados
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {locations.map(l => (
        <div key={l.id} className="flex items-center justify-between p-3 border rounded-lg">
          <div>
            <div className="font-medium">{l.name}</div>
            {l.address && <div className="text-sm text-slate-500">{l.address}</div>}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => { setEditing(l); setShowForm(true) }}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleDelete(l.id)}>
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </div>
      ))}
      {(showForm || editing) && (
        <LocationForm 
          location={editing} 
          onSuccess={handleSuccess}
          onCancel={() => { setEditing(null); setShowForm(false) }}
        />
      )}
      {!showForm && (
        <Button variant="outline" onClick={() => setShowForm(true)} className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Agregar Lugar
        </Button>
      )}
    </div>
  )
}
