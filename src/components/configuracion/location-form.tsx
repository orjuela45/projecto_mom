'use client'

import { useState } from 'react'
import { Location } from '@/types/database'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface Props {
  location: Location | null
  onSuccess: (location: Location, isNew: boolean) => void
  onCancel?: () => void
}

export function LocationForm({ location, onSuccess, onCancel }: Props) {
  const [name, setName] = useState(location?.name || '')
  const [address, setAddress] = useState(location?.address || '')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('El nombre es requerido')
      return
    }
    setLoading(true)
    
    if (location) {
      const { data, error } = await supabase
        .from('locations')
        .update({ name, address: address || null, updated_at: new Date().toISOString() })
        .eq('id', location.id)
        .select()
        .single()
      if (error) toast.error('Error al actualizar')
      else if (data) onSuccess(data, false)
    } else {
      const { data, error } = await supabase
        .from('locations')
        .insert({ name, address: address || null })
        .select()
        .single()
      if (error) toast.error('Error al crear')
      else if (data) onSuccess(data, true)
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-end flex-wrap">
      <div className="flex-1 min-w-[200px]">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre del lugar"
          autoFocus
        />
      </div>
      <div className="flex-1 min-w-[200px]">
        <Input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Dirección (opcional)"
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? 'Guardando...' : location ? 'Actualizar' : 'Agregar'}
      </Button>
      {onCancel && (
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      )}
    </form>
  )
}
