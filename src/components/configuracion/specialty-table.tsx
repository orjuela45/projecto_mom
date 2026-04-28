'use client'

import { useState } from 'react'
import { Specialty } from '@/types/database'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { SpecialtyForm } from './specialty-form'

interface Props {
  initialSpecialties: Specialty[]
}

export function SpecialtyTable({ initialSpecialties }: Props) {
  const [specialties, setSpecialties] = useState(initialSpecialties)
  const [editing, setEditing] = useState<Specialty | null>(null)
  const [showForm, setShowForm] = useState(false)
  const supabase = createClient()

  async function handleDelete(id: string) {
    const { error } = await supabase
      .from('specialties')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
    
    if (error) {
      toast.error('Error al eliminar')
    } else {
      setSpecialties(prev => prev.filter(s => s.id !== id))
      toast.success('Especialidad eliminada')
    }
  }

  function handleSuccess(updated: Specialty, isNew: boolean) {
    if (isNew) {
      setSpecialties(prev => [...prev, updated].sort((a, b) => a.name.localeCompare(b.name)))
    } else {
      setSpecialties(prev => prev.map(s => s.id === updated.id ? updated : s))
    }
    setEditing(null)
    setShowForm(false)
    toast.success(isNew ? 'Especialidad creada' : 'Especialidad actualizada')
  }

  if (specialties.length === 0 && !showForm) {
    return (
      <div className="text-center py-8 text-slate-500">
        No hay especialidades registradas
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {specialties.map(s => (
        <div key={s.id} className="flex items-center justify-between p-3 border rounded-lg">
          <span>{s.name}</span>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => { setEditing(s); setShowForm(true) }}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleDelete(s.id)}>
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </div>
      ))}
      {(showForm || editing) && (
        <SpecialtyForm 
          specialty={editing} 
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
