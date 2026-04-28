'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Specialty } from '@/types/database'
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

const specialtySchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
})

type FormData = z.infer<typeof specialtySchema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  specialty: Specialty | null
  onSuccess: (specialty: Specialty) => void
}

export function SpecialtyForm({ open, onOpenChange, specialty, onSuccess }: Props) {
  const supabase = createClient()
  const isEditing = !!specialty
  
  const form = useForm<FormData>({
    resolver: zodResolver(specialtySchema),
    defaultValues: {
      name: '',
    },
  })

  useEffect(() => {
    if (open) {
      if (specialty) {
        form.reset({
          name: specialty.name,
        })
      } else {
        form.reset({
          name: '',
        })
      }
    }
  }, [open, specialty, form])

  async function onSubmit(data: FormData) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (isEditing) {
      const { data: updated, error } = await supabase
        .from('specialties')
        .update({
          name: data.name,
          updated_at: new Date().toISOString(),
        })
        .eq('id', specialty.id)
        .select()
        .single()
      
      if (error) {
        toast.error('Error al actualizar especialidad')
      } else if (updated) {
        onSuccess(updated)
      }
    } else {
      const { data: created, error } = await supabase
        .from('specialties')
        .insert({
          name: data.name,
          created_by: user.id,
        })
        .select()
        .single()
      
      if (error) {
        toast.error('Error al crear especialidad')
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
            {isEditing ? 'Editar Especialidad' : 'Nueva Especialidad'}
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
                    <Input placeholder="Ej: Cardiología" {...field} />
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
                {isEditing ? 'Guardar Cambios' : 'Crear Especialidad'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
