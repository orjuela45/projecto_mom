'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Location } from '@/types/database'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const locationSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  address: z.string().optional(),
})

type FormData = z.infer<typeof locationSchema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  location: Location | null
  onSuccess: (location: Location) => void
}

export function LocationForm({ open, onOpenChange, location, onSuccess }: Props) {
  const supabase = createClient()
  const isEditing = !!location
  
  const form = useForm<FormData>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      name: '',
      address: '',
    },
  })

  useEffect(() => {
    if (open) {
      if (location) {
        form.reset({
          name: location.name,
          address: location.address || '',
        })
      } else {
        form.reset({
          name: '',
          address: '',
        })
      }
    }
  }, [open, location, form])

  async function onSubmit(data: FormData) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (isEditing) {
      const { data: updated, error } = await supabase
        .from('locations')
        .update({
          name: data.name,
          address: data.address || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', location.id)
        .select()
        .single()
      
      if (error) {
        toast.error('Error al actualizar ubicación')
      } else if (updated) {
        onSuccess(updated)
      }
    } else {
      const { data: created, error } = await supabase
        .from('locations')
        .insert({
          name: data.name,
          address: data.address || null,
          created_by: user.id,
        })
        .select()
        .single()
      
      if (error) {
        toast.error('Error al crear ubicación')
      } else if (created) {
        onSuccess(created)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Ubicación' : 'Nueva Ubicación'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Consultorio Principal" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección</FormLabel>
                  <FormControl>
                    <Input placeholder="Dirección completa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {isEditing ? 'Guardar Cambios' : 'Crear Ubicación'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
