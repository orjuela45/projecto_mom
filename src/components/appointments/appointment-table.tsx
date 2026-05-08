'use client'

import { useState } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Combobox } from '@/components/ui/combobox'
import { Plus, MoreHorizontal, Pencil, CheckCircle, XCircle, RefreshCw, Filter, X } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Props {
  initialAppointments: AppointmentWithRelations[]
  patients: PatientSelect[]
  specialties: SpecialtySelect[]
  locations: LocationSelect[]
  tab: 'unassigned' | 'scheduled'
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

function getDayOfWeek(dateString: string): string {
  const [year, month, dayNum] = dateString.split('T')[0].split('-').map(Number)
  const date = new Date(year, month - 1, dayNum)
  const dayName = date.toLocaleDateString('es-CO', { weekday: 'long' })
  return dayName.charAt(0).toUpperCase() + dayName.slice(1)
}

function formatDate(dateString: string): string {
  if (!dateString) return ''
  const [year, month, day] = dateString.split('T')[0].split('-')
  return `${day}/${month}/${year}`
}

function formatTime(startTime: string, endTime?: string | null): string {
  if (!startTime) return ''
  if (endTime) {
    const endTimeOnly = endTime.split('T')[1]?.substring(0, 5) || endTime
    return `${startTime} - ${endTimeOnly}`
  }
  return startTime
}

type QuickRange = 'week' | 'next-week' | '7days' | 'month' | null

interface DateRange {
  start: string
  end: string
}

function getDateRange(rangeType: string): DateRange {
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  
  switch (rangeType) {
    case 'week': {
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - now.getDay())
      const endOfWeek = new Date(startOfWeek.getTime() + 6 * 24 * 60 * 60 * 1000)
      return {
        start: startOfWeek.toISOString().split('T')[0],
        end: endOfWeek.toISOString().split('T')[0]
      }
    }
    case 'next-week': {
      const startOfNextWeek = new Date(now)
      startOfNextWeek.setDate(now.getDate() - now.getDay() + 7)
      const endOfNextWeek = new Date(startOfNextWeek.getTime() + 6 * 24 * 60 * 60 * 1000)
      return {
        start: startOfNextWeek.toISOString().split('T')[0],
        end: endOfNextWeek.toISOString().split('T')[0]
      }
    }
    case '7days': {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      return {
        start: sevenDaysAgo.toISOString().split('T')[0],
        end: today
      }
    }
    case 'month': {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      return {
        start: startOfMonth.toISOString().split('T')[0],
        end: endOfMonth.toISOString().split('T')[0]
      }
    }
    default:
      return { start: '', end: '' }
  }
}

export function AppointmentTable({ initialAppointments, patients, specialties, locations, tab }: Props) {
  const [appointments, setAppointments] = useState(initialAppointments)
  const [filterDateRange, setFilterDateRange] = useState<DateRange | null>(null)
  const [filterQuickRange, setFilterQuickRange] = useState<QuickRange>(null)
  const [filterPatientId, setFilterPatientId] = useState<string | null>('')
  const [filterSpecialtyId, setFilterSpecialtyId] = useState<string | null>('')
  const [filterLocationId, setFilterLocationId] = useState<string | null>('')
  const [filterStatus, setFilterStatus] = useState<string | null>('')
  const [showFilters, setShowFilters] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<AppointmentWithRelations | null>(null)
  const [statusingAppointment, setStatusingAppointment] = useState<AppointmentWithRelations | null>(null)
  const [statusAction, setStatusAction] = useState<'completed' | 'cancelled' | null>(null)
  const [showFollowupModal, setShowFollowupModal] = useState(false)
  const [showSpecialtySelectModal, setShowSpecialtySelectModal] = useState(false)
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([])
  const [appointmentToComplete, setAppointmentToComplete] = useState<AppointmentWithRelations | null>(null)
  const supabase = createClient()

  const sortedAppointments = [...appointments].sort((a, b) => {
    // Si no tienen fecha, van al principio (para tab Sin Asignar)
    if (!a.date && !b.date) return 0
    if (!a.date) return -1
    if (!b.date) return 1
    
    // Si ambas tienen fecha, ordenar por fecha + hora
    const dateCompare = a.date.localeCompare(b.date)
    if (dateCompare !== 0) return dateCompare
    
    return a.appointment_time.localeCompare(b.appointment_time)
  })

  const filteredAppointments = sortedAppointments.filter(appt => {
    if (filterDateRange?.start && appt.date < filterDateRange.start) return false
    if (filterDateRange?.end && appt.date > filterDateRange.end) return false
    if (filterPatientId && appt.patient_id !== filterPatientId) return false
    if (filterSpecialtyId && appt.specialty_id !== filterSpecialtyId) return false
    if (filterLocationId && appt.location_id !== filterLocationId) return false
    if (filterStatus && appt.status !== filterStatus) return false
    return true
  })

  const activeFiltersCount = [
    filterDateRange,
    filterPatientId,
    filterSpecialtyId,
    filterLocationId,
    filterStatus
  ].filter(v => v !== null && v !== '').length

  function handleQuickRangeSelect(rangeType: QuickRange) {
    setFilterQuickRange(rangeType)
    if (rangeType) {
      const range = getDateRange(rangeType)
      setFilterDateRange(range)
    } else {
      setFilterDateRange(null)
    }
  }

  function handleClearFilters() {
    setFilterDateRange(null)
    setFilterQuickRange(null)
    setFilterPatientId(null)
    setFilterSpecialtyId(null)
    setFilterLocationId(null)
    setFilterStatus(null)
  }

  function handleClearDateRange() {
    setFilterDateRange(null)
    setFilterQuickRange(null)
  }

  function handleStatusClick(action: 'completed' | 'cancelled', appointment: AppointmentWithRelations) {
    if (action === 'completed') {
      setAppointmentToComplete(appointment)
      setShowFollowupModal(true)
    } else {
      setStatusingAppointment(appointment)
      setStatusAction('cancelled')
    }
  }

  function handleFollowupConfirm() {
    setShowFollowupModal(false)
    setShowSpecialtySelectModal(true)
  }

  function handleFollowupCancel() {
    setShowFollowupModal(false)
    setAppointmentToComplete(null)
  }

  function handleSpecialtyToggle(specialtyId: string) {
    setSelectedSpecialties(prev => 
      prev.includes(specialtyId) 
        ? prev.filter(id => id !== specialtyId)
        : [...prev, specialtyId]
    )
  }

  async function handleCompleteWithFollowup() {
    if (!appointmentToComplete || selectedSpecialties.length === 0) return
    
    for (const specialtyId of selectedSpecialties) {
      const { error } = await supabase.from('appointments').insert({
        patient_id: appointmentToComplete.patient_id,
        specialty_id: specialtyId,
        date: null,
        location_id: null,
        appointment_time: null,
        status: 'pending',
        created_by: appointmentToComplete.created_by,
      })
      
      if (error) {
        toast.error('Error al crear cita de seguimiento')
        return
      }
    }
    
    const { error } = await supabase
      .from('appointments')
      .update({ status: 'completed', updated_at: new Date().toISOString() })
      .eq('id', appointmentToComplete.id)
    
    if (error) {
      toast.error('Error al actualizar cita')
    } else {
      setAppointments(prev => prev.filter(a => a.id !== appointmentToComplete.id))
      toast.success('Cita completada y seguimiento creado')
    }
    
    setShowSpecialtySelectModal(false)
    setSelectedSpecialties([])
    setAppointmentToComplete(null)
  }

  function handleSpecialtySelectCancel() {
    setShowSpecialtySelectModal(false)
    setSelectedSpecialties([])
    setAppointmentToComplete(null)
  }

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
        <Button 
          variant="outline" 
          onClick={() => setShowFilters(!showFilters)}
          className="md:hidden w-full"
        >
          <Filter className="mr-2 h-4 w-4" />
          {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
          {activeFiltersCount > 0 && (
            <Badge className="ml-2">{activeFiltersCount}</Badge>
          )}
        </Button>

        <Button onClick={() => { setEditingAppointment(null); setIsFormOpen(true) }} className="w-full md:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Nueva Cita
        </Button>
      </div>

      <div className={cn(
        "space-y-4 p-4 bg-slate-50 rounded-lg border",
        showFilters ? "block" : "hidden md:block"
      )}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h3 className="text-sm font-semibold text-slate-700">Filtros avanzados</h3>
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {activeFiltersCount} {activeFiltersCount === 1 ? 'filtro' : 'filtros'} activos
              </Badge>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClearFilters}
              disabled={activeFiltersCount === 0}
              className="h-7 text-xs"
            >
              <X className="mr-1 h-3 w-3" />
              Limpiar filtros
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-600">Rango de fechas</label>
            <div className="space-y-2">
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={filterQuickRange === 'week' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleQuickRangeSelect('week')}
                  className="h-7 text-xs flex-1"
                >
                  Esta semana
                </Button>
                <Button
                  variant={filterQuickRange === 'next-week' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleQuickRangeSelect('next-week')}
                  className="h-7 text-xs flex-1"
                >
                  Próxima semana
                </Button>
                <Button
                  variant={filterQuickRange === '7days' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleQuickRangeSelect('7days')}
                  className="h-7 text-xs flex-1"
                >
                  Últimos 7 días
                </Button>
                <Button
                  variant={filterQuickRange === 'month' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleQuickRangeSelect('month')}
                  className="h-7 text-xs flex-1"
                >
                  Este mes
                </Button>
              </div>
              <div className="flex gap-2 items-center">
                <Input
                  type="date"
                  value={filterDateRange?.start || ''}
                  onChange={(e) => setFilterDateRange(prev => ({ ...prev!, start: e.target.value, end: prev?.end || '' }))}
                  className="h-8 text-xs flex-1"
                  placeholder="Inicio"
                />
                <span className="text-slate-400">-</span>
                <Input
                  type="date"
                  value={filterDateRange?.end || ''}
                  onChange={(e) => setFilterDateRange(prev => ({ ...prev!, start: prev?.start || '', end: e.target.value }))}
                  className="h-8 text-xs flex-1"
                  placeholder="Fin"
                />
                {filterDateRange && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClearDateRange}
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-600">Paciente</label>
            <Combobox
              options={[{ value: '', label: 'Todos los pacientes' }, ...patients.map(p => ({ value: p.id, label: p.name }))]}
              value={filterPatientId || ''}
              onChange={setFilterPatientId}
              placeholder="Todos los pacientes"
              searchPlaceholder="Buscar paciente..."
              emptyMessage="No se encontró el paciente"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-600">Especialidad</label>
            <Combobox
              options={[{ value: '', label: 'Todas las especialidades' }, ...specialties.map(s => ({ value: s.id, label: s.name }))]}
              value={filterSpecialtyId || ''}
              onChange={setFilterSpecialtyId}
              placeholder="Todas las especialidades"
              searchPlaceholder="Buscar especialidad..."
              emptyMessage="No se encontró la especialidad"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-600">Lugar</label>
            <Combobox
              options={[{ value: '', label: 'Todos los lugares' }, ...locations.map(l => ({ value: l.id, label: l.name }))]}
              value={filterLocationId || ''}
              onChange={setFilterLocationId}
              placeholder="Todos los lugares"
              searchPlaceholder="Buscar lugar..."
              emptyMessage="No se encontró el lugar"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-600">Estado</label>
            <Select value={filterStatus || ''} onValueChange={setFilterStatus}>
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los estados</SelectItem>
                {STATUSES.map(status => (
                  <SelectItem key={status} value={status}>
                    {statusLabels[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {filteredAppointments.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          {activeFiltersCount > 0 ? 'No hay citas con estos filtros' : 'No hay citas registradas'}
        </div>
      ) : (
        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">Fecha Agendada</TableHead>
                <TableHead className="whitespace-nowrap">Día</TableHead>
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
                <TableRow key={appt.id} className={!appt.date ? 'bg-yellow-50' : ''}>
                  <TableCell>
                    {appt.date ? formatDate(appt.date) : (
                      <Badge variant="secondary">Sin fecha</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {appt.date ? getDayOfWeek(appt.date) : '-'}
                  </TableCell>
                  <TableCell>
                    {formatTime(appt.appointment_time, appt.departure_time)}
                  </TableCell>
                  <TableCell className="font-medium">{appt.patients?.name || '-'}</TableCell>
                  <TableCell>{appt.specialties?.name || '-'}</TableCell>
                  <TableCell>
                    <div>
                      <span className="font-medium">{appt.locations?.name || '-'}</span>
                      {appt.locations?.address && (
                        <p className="text-xs text-slate-500">{appt.locations.address}</p>
                      )}
                    </div>
                  </TableCell>
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
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label="Abrir menú">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleStatusClick('completed', appt)}>
                            <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                            Marcar como atendida
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusClick('cancelled', appt)}>
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

      {showFollowupModal && appointmentToComplete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">
              Crear seguimiento
            </h3>
            <p className="text-slate-600 mb-4">
              ¿Desea crear citas de seguimiento sin fecha para este paciente?
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleFollowupCancel}>
                No, solo completar
              </Button>
              <Button onClick={handleFollowupConfirm}>
                Sí, crear seguimiento
              </Button>
            </div>
          </div>
        </div>
      )}

      {showSpecialtySelectModal && appointmentToComplete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-2">
              Seleccionar especialidades para seguimiento
            </h3>
            <p className="text-slate-600 mb-4">
              Seleccione al menos una especialidad para crear las citas de seguimiento:
            </p>
            <div className="space-y-2 mb-4">
              {specialties.map(specialty => (
                <label 
                  key={specialty.id} 
                  className="flex items-center gap-2 p-2 rounded hover:bg-slate-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedSpecialties.includes(specialty.id)}
                    onChange={() => handleSpecialtyToggle(specialty.id)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm">{specialty.name}</span>
                </label>
              ))}
            </div>
            {selectedSpecialties.length === 0 && (
              <p className="text-red-600 text-sm mb-4">
                Debe seleccionar al menos una especialidad
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleSpecialtySelectCancel}>
                Cancelar
              </Button>
              <Button 
                onClick={handleCompleteWithFollowup}
                disabled={selectedSpecialties.length === 0}
              >
                Confirmar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
