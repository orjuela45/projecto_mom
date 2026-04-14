'use client'

import { useState } from 'react'
import { Especialidad } from '@/types/database'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { EspecialidadForm } from './especialidad-form'

interface Props {
  initialEspecialidades: Especialidad[]
}

export function EspecialidadTable({ initialEspecialidades }: Props) {
  const [especialidades, setEspecialidades] = useState(initialEspecialidades)
  const [editing, setEditing] = useState<Especialidad | null>(null)
  const [showForm, setShowForm] = useState(false)
  const supabase = createClient()

  async function handleDelete(id: string) {
    const { error } = await supabase
      .from('especialidades')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
    
    if (error) {
      toast.error('Error al eliminar')
    } else {
      setEspecialidades(prev => prev.filter(e => e.id !== id))
      toast.success('Especialidad eliminada')
    }
  }

  function handleSuccess(updated: Especialidad, isNew: boolean) {
    if (isNew) {
      setEspecialidades(prev => [...prev, updated].sort((a, b) => a.nombre.localeCompare(b.nombre)))
    } else {
      setEspecialidades(prev => prev.map(e => e.id === updated.id ? updated : e))
    }
    setEditing(null)
    setShowForm(false)
    toast.success(isNew ? 'Especialidad creada' : 'Especialidad actualizada')
  }

  if (especialidades.length === 0 && !showForm) {
    return (
      <div className="text-center py-8 text-slate-500">
        No hay especialidades registradas
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {especialidades.map(e => (
        <div key={e.id} className="flex items-center justify-between p-3 border rounded-lg">
          <span>{e.nombre}</span>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => { setEditing(e); setShowForm(true) }}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleDelete(e.id)}>
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </div>
      ))}
      {(showForm || editing) && (
        <EspecialidadForm 
          especialidad={editing} 
          onSuccess={handleSuccess}
          onCancel={() => { setEditing(null); setShowForm(false) }}
        />
      )}
      {!showForm && (
        <Button variant="outline" onClick={() => setShowForm(true)} className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Agregar Especialidad
        </Button>
      )}
    </div>
  )
}
