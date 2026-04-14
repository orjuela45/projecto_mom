'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Cita, Paciente, Especialidad, Lugar } from '@/types/database'
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

const citaSchema = z.object({
  fecha: z.string().min(1, 'La fecha es requerida'),
  hora_cita: z.string().min(1, 'La hora es requerida'),
  hora_salida: z.string().optional(),
  paciente_id: z.string().min(1, 'Selecciona un paciente'),
  especialidad_id: z.string().min(1, 'Selecciona una especialidad'),
  lugar_id: z.string().optional(),
  acompanante: z.string().optional(),
  observaciones: z.string().optional(),
})

type FormData = z.infer<typeof citaSchema>

interface CitaWithRelations extends Cita {
  pacientes?: { id: string; nombre: string } | null
  especialidades?: { id: string; nombre: string } | null
  lugares?: { id: string; nombre: string } | null
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  cita: CitaWithRelations | null
  pacientes: Paciente[]
  especialidades: Especialidad[]
  lugares: Lugar[]
  onSuccess: (cita: CitaWithRelations) => void
}

export function CitaForm({ open, onOpenChange, cita, pacientes, especialidades, lugares, onSuccess }: Props) {
  const supabase = createClient()
  const isEditing = !!cita
  
  const form = useForm<FormData>({
    resolver: zodResolver(citaSchema),
    defaultValues: {
      fecha: '',
      hora_cita: '',
      hora_salida: '',
      paciente_id: '',
      especialidad_id: '',
      lugar_id: '',
      acompanante: '',
      observaciones: '',
    },
  })

  useEffect(() => {
    if (open) {
      if (cita) {
        form.reset({
          fecha: cita.fecha,
          hora_cita: cita.hora_cita,
          hora_salida: cita.hora_salida || '',
          paciente_id: cita.paciente_id,
          especialidad_id: cita.especialidad_id,
          lugar_id: cita.lugares?.id || '',
          acompanante: cita.acompanante || '',
          observaciones: cita.observaciones || '',
        })
      } else {
        form.reset({
          fecha: new Date().toISOString().split('T')[0],
          hora_cita: '',
          hora_salida: '',
          paciente_id: '',
          especialidad_id: '',
          lugar_id: '',
          acompanante: '',
          observaciones: '',
        })
      }
    }
  }, [open, cita, form])

  async function onSubmit(data: FormData) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const citaData = {
      fecha: data.fecha,
      hora_cita: data.hora_cita,
      hora_salida: data.hora_salida || null,
      paciente_id: data.paciente_id,
      especialidad_id: data.especialidad_id,
      lugar_id: data.lugar_id || null,
      acompanante: data.acompanante || null,
      observaciones: data.observaciones || null,
      updated_at: new Date().toISOString(),
    }

    if (isEditing) {
      const { data: updated, error } = await supabase
        .from('citas')
        .update(citaData)
        .eq('id', cita.id)
        .select(`
          *,
          pacientes (id, nombre),
          especialidades (id, nombre),
          lugares (id, nombre)
        `)
        .single()
      
      if (error) {
        toast.error('Error al actualizar cita')
      } else if (updated) {
        onSuccess(updated as CitaWithRelations)
      }
    } else {
      const { data: created, error } = await supabase
        .from('citas')
        .insert({
          ...citaData,
          estado: 'pendiente',
          created_by: user.id,
        })
        .select(`
          *,
          pacientes (id, nombre),
          especialidades (id, nombre),
          lugares (id, nombre)
        `)
        .single()
      
      if (error) {
        toast.error('Error al crear cita')
      } else if (created) {
        onSuccess(created as CitaWithRelations)
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
                name="fecha"
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
                name="hora_cita"
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
                name="hora_salida"
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
                name="lugar_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lugar</FormLabel>
                    <FormControl>
                      <select {...field} className="border rounded px-3 py-2 w-full">
                        <option value="">Seleccionar lugar</option>
                        {lugares.map(l => (
                          <option key={l.id} value={l.id}>{l.nombre}</option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="paciente_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Paciente *</FormLabel>
                  <FormControl>
                    <select {...field} className="border rounded px-3 py-2 w-full">
                      <option value="">Seleccionar paciente</option>
                      {pacientes.map(p => (
                        <option key={p.id} value={p.id}>{p.nombre}</option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="especialidad_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Especialidad *</FormLabel>
                  <FormControl>
                    <select {...field} className="border rounded px-3 py-2 w-full">
                      <option value="">Seleccionar especialidad</option>
                      {especialidades.map(e => (
                        <option key={e.id} value={e.id}>{e.nombre}</option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="acompanante"
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
              name="observaciones"
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
