'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { AppointmentWithRelations, PatientSelect, SpecialtySelect, LocationSelect } from './types'
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
import { Combobox } from '@/components/ui/combobox'
import { toast } from 'sonner'

const appointmentSchema = z.object({
  date: z.string().min(1, 'La fecha es requerida'),
  appointment_time: z.string().min(1, 'La hora es requerida'),
  departure_time: z.string().optional(),
  patient_id: z.string().min(1, 'Selecciona un paciente'),
  specialty_id: z.string().min(1, 'Selecciona una especialidad'),
  location_id: z.string().optional(),
  companion: z.string().optional(),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof appointmentSchema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  appointment: AppointmentWithRelations | null
  patients: PatientSelect[]
  specialties: SpecialtySelect[]
  locations: LocationSelect[]
  onSuccess: (appointment: AppointmentWithRelations) => void
}

export function AppointmentForm({ open, onOpenChange, appointment, patients, specialties, locations, onSuccess }: Props) {
  const supabase = createClient()
  const isEditing = !!appointment
  
  const form = useForm<FormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      date: '',
      appointment_time: '',
      departure_time: '',
      patient_id: '',
      specialty_id: '',
      location_id: '',
      companion: '',
      notes: '',
    },
  })

  useEffect(() => {
    if (open) {
      if (appointment) {
        form.reset({
          date: appointment.date,
          appointment_time: appointment.appointment_time,
          departure_time: appointment.departure_time || '',
          patient_id: appointment.patient_id,
          specialty_id: appointment.specialty_id,
          location_id: appointment.locations?.id || '',
          companion: appointment.companion || '',
          notes: appointment.notes || '',
        })
      } else {
        form.reset({
          date: new Date().toISOString().split('T')[0],
          appointment_time: '',
          departure_time: '',
          patient_id: '',
          specialty_id: '',
          location_id: '',
          companion: '',
          notes: '',
        })
      }
    }
  }, [open, appointment, form])

  async function onSubmit(data: FormData) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const appointmentData = {
      date: data.date,
      appointment_time: data.appointment_time,
      departure_time: data.departure_time || null,
      patient_id: data.patient_id,
      specialty_id: data.specialty_id,
      location_id: data.location_id || null,
      companion: data.companion || null,
      notes: data.notes || null,
      status: isEditing ? undefined : 'pending',
      updated_at: new Date().toISOString(),
    }

    if (isEditing) {
      const { data: updated, error } = await supabase
        .from('appointments')
        .update(appointmentData)
        .eq('id', appointment.id)
        .select(`
          *,
          patients (id, name),
          specialties (id, name),
          locations (id, name)
        `)
        .single()
      
      if (error) {
        toast.error('Error al actualizar cita')
      } else if (updated) {
        onSuccess(updated as AppointmentWithRelations)
      }
    } else {
      const { data: created, error } = await supabase
        .from('appointments')
        .insert({
          ...appointmentData,
          created_by: user.id,
        })
        .select(`
          *,
          patients (id, name),
          specialties (id, name),
          locations (id, name)
        `)
        .single()
      
      if (error) {
        toast.error('Error al crear cita')
      } else if (created) {
        onSuccess(created as AppointmentWithRelations)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Cita' : 'Nueva Cita'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="appointment_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora de Cita *</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="departure_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora de Salida</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lugar</FormLabel>
                    <FormControl>
                      <Combobox
                        options={locations.map(l => ({ value: l.id, label: l.name }))}
                        value={field.value || ''}
                        onChange={(value) => field.onChange(value || null)}
                        placeholder="Seleccionar lugar"
                        searchPlaceholder="Buscar lugar..."
                        emptyMessage="No se encontró el lugar"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="patient_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Paciente *</FormLabel>
                  <FormControl>
                    <Combobox
                      options={patients.map(p => ({ value: p.id, label: p.name }))}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Seleccionar paciente"
                      searchPlaceholder="Buscar por nombre..."
                      emptyMessage="No se encontró el paciente"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="specialty_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Especialidad *</FormLabel>
                  <FormControl>
                    <Combobox
                      options={specialties.map(s => ({ value: s.id, label: s.name }))}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Seleccionar especialidad"
                      searchPlaceholder="Buscar especialidad..."
                      emptyMessage="No se encontró la especialidad"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="companion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Acompañante</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre del acompañante" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observaciones</FormLabel>
                  <FormControl>
                    <textarea {...field} className="border rounded px-3 py-2 w-full min-h-[80px]" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {isEditing ? 'Guardar Cambios' : 'Crear Cita'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
