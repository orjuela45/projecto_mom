'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Eps } from '@/types/database'
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

const epsSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
})

type FormData = z.infer<typeof epsSchema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  eps: Eps | null
  onSuccess: (eps: Eps) => void
}

export function EpsForm({ open, onOpenChange, eps, onSuccess }: Props) {
  const supabase = createClient()
  const isEditing = !!eps
  
  const form = useForm<FormData>({
    resolver: zodResolver(epsSchema),
    defaultValues: {
      name: '',
    },
  })

  useEffect(() => {
    if (open) {
      if (eps) {
        form.reset({
          name: eps.name,
        })
      } else {
        form.reset({
          name: '',
        })
      }
    }
  }, [open, eps, form])

  async function onSubmit(data: FormData) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (isEditing) {
      const { data: updated, error } = await supabase
        .from('eps')
        .update({
          name: data.name,
          updated_at: new Date().toISOString(),
        })
        .eq('id', eps.id)
        .select()
        .single()
      
      if (error) {
        toast.error('Error al actualizar EPS')
      } else if (updated) {
        onSuccess(updated)
      }
    } else {
      const { data: created, error } = await supabase
        .from('eps')
        .insert({
          name: data.name,
          created_by: user.id,
        })
        .select()
        .single()
      
      if (error) {
        toast.error('Error al crear EPS')
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
            {isEditing ? 'Editar EPS' : 'Nueva EPS'}
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
                    <Input placeholder="Ej: Sanitas" {...field} />
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
                {isEditing ? 'Guardar Cambios' : 'Crear EPS'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
