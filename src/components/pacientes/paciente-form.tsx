'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Paciente } from '@/types/database'
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

const pacienteSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  historia_clinica: z.string().optional(),
  telefono: z.string().optional(),
})

type FormData = z.infer<typeof pacienteSchema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  paciente: Paciente | null
  onSuccess: (paciente: Paciente) => void
}

export function PacienteForm({ open, onOpenChange, paciente, onSuccess }: Props) {
  const supabase = createClient()
  const isEditing = !!paciente
  
  const form = useForm<FormData>({
    resolver: zodResolver(pacienteSchema),
    defaultValues: {
      nombre: '',
      historia_clinica: '',
      telefono: '',
    },
  })

  useEffect(() => {
    if (open) {
      if (paciente) {
        form.reset({
          nombre: paciente.nombre,
          historia_clinica: paciente.historia_clinica || '',
          telefono: paciente.telefono || '',
        })
      } else {
        form.reset({
          nombre: '',
          historia_clinica: '',
          telefono: '',
        })
      }
    }
  }, [open, paciente, form])

  async function onSubmit(data: FormData) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (isEditing) {
      const { data: updated, error } = await supabase
        .from('pacientes')
        .update({
          nombre: data.nombre,
          historia_clinica: data.historia_clinica || null,
          telefono: data.telefono || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', paciente.id)
        .select()
        .single()
      
      if (error) {
        toast.error('Error al actualizar paciente')
      } else if (updated) {
        onSuccess(updated)
      }
    } else {
      const { data: created, error } = await supabase
        .from('pacientes')
        .insert({
          nombre: data.nombre,
          historia_clinica: data.historia_clinica || null,
          telefono: data.telefono || null,
          created_by: user.id,
        })
        .select()
        .single()
      
      if (error) {
        toast.error('Error al crear paciente')
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
            {isEditing ? 'Editar Paciente' : 'Nuevo Paciente'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="historia_clinica"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Historia Clínica</FormLabel>
                  <FormControl>
                    <Input placeholder="Número de historia clínica" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="telefono"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono</FormLabel>
                  <FormControl>
                    <Input placeholder="Teléfono de contacto" {...field} />
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
                {isEditing ? 'Guardar Cambios' : 'Crear Paciente'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
