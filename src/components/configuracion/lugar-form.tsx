'use client'

import { useState } from 'react'
import { Lugar } from '@/types/database'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface Props {
  lugar: Lugar | null
  onSuccess: (lugar: Lugar, isNew: boolean) => void
  onCancel?: () => void
}

export function LugarForm({ lugar, onSuccess, onCancel }: Props) {
  const [nombre, setNombre] = useState(lugar?.nombre || '')
  const [direccion, setDireccion] = useState(lugar?.direccion || '')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nombre.trim()) {
      toast.error('El nombre es requerido')
      return
    }
    setLoading(true)
    
    if (lugar) {
      const { data, error } = await supabase
        .from('lugares')
        .update({ nombre, direccion: direccion || null, updated_at: new Date().toISOString() })
        .eq('id', lugar.id)
        .select()
        .single()
      if (error) toast.error('Error al actualizar')
      else if (data) onSuccess(data, false)
    } else {
      const { data, error } = await supabase
        .from('lugares')
        .insert({ nombre, direccion: direccion || null })
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
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre del lugar"
          autoFocus
        />
      </div>
      <div className="flex-1 min-w-[200px]">
        <Input
          value={direccion}
          onChange={(e) => setDireccion(e.target.value)}
          placeholder="Dirección (opcional)"
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? 'Guardando...' : lugar ? 'Actualizar' : 'Agregar'}
      </Button>
      {onCancel && (
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      )}
    </form>
  )
}
