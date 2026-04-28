'use client'

import { useState } from 'react'
import { Specialty } from '@/types/database'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface Props {
  specialty: Specialty | null
  onSuccess: (specialty: Specialty, isNew: boolean) => void
  onCancel?: () => void
}

export function SpecialtyForm({ specialty, onSuccess, onCancel }: Props) {
  const [name, setName] = useState(specialty?.name || '')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('El nombre es requerido')
      return
    }
    setLoading(true)
    
    if (specialty) {
      const { data, error } = await supabase
        .from('specialties')
        .update({ name, updated_at: new Date().toISOString() })
        .eq('id', specialty.id)
        .select()
        .single()
      if (error) toast.error('Error al actualizar')
      else if (data) onSuccess(data, false)
    } else {
      const { data, error } = await supabase
        .from('specialties')
        .insert({ name })
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
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre de la especialidad"
          autoFocus
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? 'Guardando...' : specialty ? 'Actualizar' : 'Agregar'}
      </Button>
      {onCancel && (
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      )}
    </form>
  )
}
