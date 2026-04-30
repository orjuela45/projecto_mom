'use client'

import { useState } from 'react'
import { Appointment } from '@/types/database'
import { createClient } from '@/lib/supabase/client'
import { AppointmentForm } from './appointment-form'
import { AppointmentWithRelations, PatientSelect, SpecialtySelect, LocationSelect } from './types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Plus, Calendar, MoreHorizontal, Pencil, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  initialAppointments: AppointmentWithRelations[]
  patients: PatientSelect[]
  specialties: SpecialtySelect[]
  locations: LocationSelect[]
}

const STATUSES = ['pending', 'completed', 'cancelled', 'rescheduled']

const statusLabels: Record<string, string> = {
  pending: 'Pendiente',
  completed: 'Atendido',
  cancelled: 'Cancelado',
  rescheduled: 'Reprogramado',
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  rescheduled: 'bg-blue-100 text-blue-800',
}

export function AppointmentTable({ initialAppointments, patients, specialties, locations }: Props) {
  const [appointments, setAppointments] = useState(initialAppointments)
  const [filterDate, setFilterDate] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<AppointmentWithRelations | null>(null)
  const [statusingAppointment, setStatusingAppointment] = useState<AppointmentWithRelations | null>(null)
  const [statusAction, setStatusAction] = useState<'completed' | 'cancelled' | null>(null)
  const supabase = createClient()

  const filteredAppointments = appointments.filter(appt => {
    if (filterDate && appt.date !== filterDate) return false
    if (filterStatus && appt.status !== filterStatus) return false
    return true
  })

  async function handleStatusChange(action: 'completed' | 'cancelled') {
    if (!statusingAppointment) return
    
    const { error } = await supabase
      .from('appointments')
      .update({ status: action, updated_at: new Date().toISOString() })
      .eq('id', statusingAppointment.id)
    
    if (error) {
      toast.error('Error al cambiar estado')
    } else {
      setAppointments(prev => prev.map(a => a.id === statusingAppointment.id ? { ...a, status: action } : a))
      toast.success(`Cita marcada como ${statusLabels[action]}`)
    }
    setStatusingAppointment(null)
  }

  function handleFormSuccess(updatedAppointment: AppointmentWithRelations) {
    setIsFormOpen(false)
    setEditingAppointment(null)
    if (editingAppointment) {
      setAppointments(prev => prev.map(a => a.id === updatedAppointment.id ? updatedAppointment : a))
      toast.success('Cita actualizada')
    } else {
      setAppointments(prev => [updatedAppointment, ...prev].sort((a, b) => b.date.localeCompare(a.date)))
      toast.success('Cita creada')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-col md:flex-row gap-2 items-center w-full md:w-auto">
          <div className="relative w-full md:w-40">
            <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="pl-8 w-full"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border rounded px-3 py-2 text-sm w-full md:w-auto"
          >
            <option value="">Todos los estados</option>
            {STATUSES.map(s => (
              <option key={s} value={s}>{statusLabels[s]}</option>
            ))}
          </select>
        </div>
        <Button onClick={() => { setEditingAppointment(null); setIsFormOpen(true) }} className="w-full md:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Nueva Cita
        </Button>
      </div>

      {filteredAppointments.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          {filterDate || filterStatus ? 'No hay citas con esos filtros' : 'No hay citas registradas'}
        </div>
      ) : (
        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">Fecha</TableHead>
                <TableHead className="whitespace-nowrap">Hora</TableHead>
                <TableHead className="whitespace-nowrap">Paciente</TableHead>
                <TableHead className="whitespace-nowrap">Especialidad</TableHead>
                <TableHead className="whitespace-nowrap">Lugar</TableHead>
                <TableHead className="whitespace-nowrap">Estado</TableHead>
                <TableHead className="w-24 whitespace-nowrap">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAppointments.map((appt) => (
                <TableRow key={appt.id}>
                  <TableCell>{new Date(appt.date).toLocaleDateString('es-CO')}</TableCell>
                  <TableCell>{appt.appointment_time}</TableCell>
                  <TableCell className="font-medium">{appt.patients?.name || '-'}</TableCell>
                  <TableCell>{appt.specialties?.name || '-'}</TableCell>
                  <TableCell>{appt.locations?.name || '-'}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[appt.status]}>
                      {statusLabels[appt.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => { setEditingAppointment(appt); setIsFormOpen(true) }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setStatusingAppointment(appt); setStatusAction('completed') }}>
                            <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                            Marcar como atendida
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setStatusingAppointment(appt); setStatusAction('cancelled') }}>
                            <XCircle className="mr-2 h-4 w-4 text-red-600" />
                            Cancelar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setEditingAppointment(appt); setIsFormOpen(true) }}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Reprogramar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AppointmentForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        appointment={editingAppointment}
        patients={patients}
        specialties={specialties}
        locations={locations}
        onSuccess={handleFormSuccess}
      />

      {statusingAppointment && statusAction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">
              Confirmar cambio de estado
            </h3>
            <p className="text-slate-600 mb-4">
              ¿{statusAction === 'completed' ? 'Marcar esta cita como atendida' : 'Cancelar esta cita'}?
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setStatusingAppointment(null); setStatusAction(null) }}>
                Cancelar
              </Button>
              <Button onClick={() => handleStatusChange(statusAction)}>
                Confirmar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
