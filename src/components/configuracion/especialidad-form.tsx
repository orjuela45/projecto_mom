'use client'

import { useState } from 'react'
import { Especialidad } from '@/types/database'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface Props {
  especialidad: Especialidad | null
  onSuccess: (especialidad: Especialidad, isNew: boolean) => void
  onCancel?: () => void
}

export function EspecialidadForm({ especialidad, onSuccess, onCancel }: Props) {
  const [nombre, setNombre] = useState(especialidad?.nombre || '')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nombre.trim()) {
      toast.error('El nombre es requerido')
      return
    }
    setLoading(true)
    
    if (especialidad) {
      const { data, error } = await supabase
        .from('especialidades')
        .update({ nombre, updated_at: new Date().toISOString() })
        .eq('id', especialidad.id)
        .select()
        .single()
      if (error) toast.error('Error al actualizar')
      else if (data) onSuccess(data, false)
    } else {
      const { data, error } = await supabase
        .from('especialidades')
        .insert({ nombre })
        .select()
        .single()
      if (error) toast.error('Error al crear')
      else if (data) onSuccess(data, true)
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-end">
      <div className="flex-1">
        <Input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre de la especialidad"
          autoFocus
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? 'Guardando...' : especialidad ? 'Actualizar' : 'Agregar'}
      </Button>
      {onCancel && (
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      )}
    </form>
  )
}
