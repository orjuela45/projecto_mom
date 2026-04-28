'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Patient } from '@/types/database'
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

const patientSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  medical_record: z.string().optional(),
  phone: z.string().optional(),
})

type FormData = z.infer<typeof patientSchema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  patient: Patient | null
  onSuccess: (patient: Patient) => void
}

export function PatientForm({ open, onOpenChange, patient, onSuccess }: Props) {
  const supabase = createClient()
  const isEditing = !!patient
  
  const form = useForm<FormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: '',
      medical_record: '',
      phone: '',
    },
  })

  useEffect(() => {
    if (open) {
      if (patient) {
        form.reset({
          name: patient.name,
          medical_record: patient.medical_record || '',
          phone: patient.phone || '',
        })
      } else {
        form.reset({
          name: '',
          medical_record: '',
          phone: '',
        })
      }
    }
  }, [open, patient, form])

  async function onSubmit(data: FormData) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (isEditing) {
      const { data: updated, error } = await supabase
        .from('patients')
        .update({
          name: data.name,
          medical_record: data.medical_record || null,
          phone: data.phone || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', patient.id)
        .select()
        .single()
      
      if (error) {
        toast.error('Error al actualizar paciente')
      } else if (updated) {
        onSuccess(updated)
      }
    } else {
      const { data: created, error } = await supabase
        .from('patients')
        .insert({
          name: data.name,
          medical_record: data.medical_record || null,
          phone: data.phone || null,
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
              name="name"
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
              name="medical_record"
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
              name="phone"
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
