'use client'

import { useEffect } from 'react'
import { AppointmentForm } from './appointment-form'
import { StatusConfirmDialog } from './status-confirm-dialog'
import { FollowupPromptDialog } from './followup-prompt-dialog'
import { SpecialtySelectDialog } from './specialty-select-dialog'
import { AppointmentWithRelations, PatientSelect, SpecialtySelect, LocationSelect } from './types'
import { STATUSES, statusLabels, statusBadgeColors } from '@/lib/constants'
import { useAppointmentFilters } from '@/hooks/use-appointment-filters'
import { useAppointmentActions } from '@/hooks/use-appointment-actions'
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
import { MoreHorizontal, Pencil, CheckCircle, XCircle, Filter, X, Calendar, User, Stethoscope, MapPin, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  initialAppointments: AppointmentWithRelations[]
  patients: PatientSelect[]
  specialties: SpecialtySelect[]
  locations: LocationSelect[]
  tab: 'unassigned' | 'scheduled'
}

function toDateString(value: unknown): string {
  if (!value) return ''
  if (value instanceof Date) return value.toISOString().split('T')[0]
  return String(value)
}

function getDayOfWeek(dateString: string | Date | null): string {
  if (!dateString) return '-'
  const str = toDateString(dateString)
  const [year, month, dayNum] = str.split('-').map(Number)
  if (!year || !month || !dayNum) return '-'
  const date = new Date(year, month - 1, dayNum)
  const dayName = date.toLocaleDateString('es-CO', { weekday: 'long' })
  return dayName.charAt(0).toUpperCase() + dayName.slice(1)
}

function formatDate(dateString: string | Date | null): string {
  if (!dateString) return ''
  const str = toDateString(dateString)
  const parts = str.split('-')
  if (parts.length !== 3) return str
  const [year, month, day] = parts
  return `${day}/${month}/${year}`
}

function formatTime(startTime: string | null, endTime?: string | null): string {
  if (!startTime) return ''
  const str = String(startTime)
  const start = str.substring(0, 5)
  if (endTime) {
    return `${start} - ${String(endTime).substring(0, 5)}`
  }
  return start
}

export function AppointmentTable({ initialAppointments, patients, specialties, locations }: Props) {
  const filters = useAppointmentFilters(initialAppointments)
  const actions = useAppointmentActions({ patients, specialties, locations, setAppointments: filters.setAppointments })

  // Re-sync when the server component re-fetches
  useEffect(() => {
    filters.setAppointments(initialAppointments)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialAppointments])

  // Listen for external "open new appointment" event from parent tabs
  useEffect(() => {
    const handler = () => actions.openForm()
    window.addEventListener('open-new-appointment', handler)
    return () => window.removeEventListener('open-new-appointment', handler)
  }, [actions])

  return (
    <div className="space-y-4">
      {/* Mobile: toggle filters */}
      <Button
        variant="outline"
        onClick={() => filters.setShowFilters(!filters.showFilters)}
        className="md:hidden w-full"
      >
        <Filter className="mr-2 h-4 w-4" />
        {filters.showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
        {filters.activeFiltersCount > 0 && (
          <Badge className="ml-2">{filters.activeFiltersCount}</Badge>
        )}
      </Button>

      {/* Filters panel */}
      <div className={cn(
        "bg-card border rounded-xl shadow-sm",
        filters.showFilters ? "block" : "hidden md:block"
      )}>
        {/* Filters header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Filtros</h3>
            {filters.activeFiltersCount > 0 && (
              <Badge variant="default" className="ml-2">
                {filters.activeFiltersCount} {filters.activeFiltersCount === 1 ? 'activo' : 'activos'}
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={filters.handleClearFilters}
            disabled={filters.activeFiltersCount === 0}
            className="text-xs"
          >
            <X className="mr-1 h-4 w-4" />
            Limpiar todo
          </Button>
        </div>

        {/* Filters body */}
        <div className="p-6 space-y-6">
          {/* Quick date ranges */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <label className="text-sm font-medium text-foreground">Rango de fechas</label>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {(['week', 'next-week', '7days', 'month'] as const).map(range => (
                <Button
                  key={range}
                  variant={filters.filterQuickRange === range ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => filters.handleQuickRangeSelect(range)}
                  className="h-9"
                >
                  {{ 'week': 'Esta semana', 'next-week': 'Próxima semana', '7days': 'Últimos 7 días', 'month': 'Este mes' }[range]}
                </Button>
              ))}
            </div>
            
            {/* Custom date range */}
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-1 block">Desde</label>
                <Input
                  type="date"
                  value={filters.filterDateRange?.start || ''}
                  onChange={(e) => filters.setFilterDateRange(prev => ({ ...prev!, start: e.target.value, end: prev?.end || '' }))}
                  className="h-10"
                />
              </div>
              <div className="hidden md:flex items-end pb-3">
                <span className="text-muted-foreground font-medium">→</span>
              </div>
              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-1 block">Hasta</label>
                <Input
                  type="date"
                  value={filters.filterDateRange?.end || ''}
                  onChange={(e) => filters.setFilterDateRange(prev => ({ ...prev!, start: prev?.start || '', end: e.target.value }))}
                  className="h-10"
                />
              </div>
              {filters.filterDateRange && (
                <div className="flex items-end">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={filters.handleClearDateRange} 
                    className="h-10 w-10"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t" />

          {/* Other filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Patient */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <label className="text-sm font-medium text-foreground">Paciente</label>
              </div>
              <Combobox
                options={[{ value: '', label: 'Todos los pacientes' }, ...patients.map(p => ({ value: p.id, label: p.name }))]}
                value={filters.filterPatientId || ''}
                onChange={filters.setFilterPatientId}
                placeholder="Seleccionar paciente"
                searchPlaceholder="Buscar paciente..."
                emptyMessage="No se encontró el paciente"
              />
            </div>

            {/* Specialty */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-muted-foreground" />
                <label className="text-sm font-medium text-foreground">Especialidad</label>
              </div>
              <Combobox
                options={[{ value: '', label: 'Todas las especialidades' }, ...specialties.map(s => ({ value: s.id, label: s.name }))]}
                value={filters.filterSpecialtyId || ''}
                onChange={filters.setFilterSpecialtyId}
                placeholder="Seleccionar especialidad"
                searchPlaceholder="Buscar especialidad..."
                emptyMessage="No se encontró la especialidad"
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <label className="text-sm font-medium text-foreground">Lugar</label>
              </div>
              <Combobox
                options={[{ value: '', label: 'Todos los lugares' }, ...locations.map(l => ({ value: l.id, label: l.name }))]}
                value={filters.filterLocationId || ''}
                onChange={filters.setFilterLocationId}
                placeholder="Seleccionar lugar"
                searchPlaceholder="Buscar lugar..."
                emptyMessage="No se encontró el lugar"
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <label className="text-sm font-medium text-foreground">Estado</label>
              </div>
              <Select value={filters.filterStatus || ''} onValueChange={filters.setFilterStatus}>
                <SelectTrigger className="h-10">
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
      </div>

      {/* Table or empty state */}
      {filters.filteredAppointments.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {filters.activeFiltersCount > 0 ? 'No hay citas con estos filtros' : 'No hay citas registradas'}
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
              {filters.filteredAppointments.map((appt) => (
                <TableRow key={appt.id} className={!appt.date ? 'bg-muted/30' : ''}>
                  <TableCell>
                    {appt.date ? formatDate(appt.date) : (
                      <Badge variant="secondary">Sin fecha</Badge>
                    )}
                  </TableCell>
                  <TableCell>{getDayOfWeek(appt.date)}</TableCell>
                  <TableCell>{formatTime(appt.appointment_time, appt.departure_time)}</TableCell>
                  <TableCell className="font-medium">{appt.patients?.name || '-'}</TableCell>
                  <TableCell>{appt.specialties?.name || '-'}</TableCell>
                  <TableCell>
                    <div>
                      <span className="font-medium">{appt.locations?.name || '-'}</span>
                      {appt.locations?.address && (
                        <p className="text-xs text-muted-foreground">{appt.locations.address}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusBadgeColors[appt.status as keyof typeof statusBadgeColors]}>
                      {statusLabels[appt.status as keyof typeof statusLabels]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => actions.openForm(appt)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label="Cambiar estado">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => actions.handleStatusClick('completed', appt)}>
                            <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                            Marcar como atendida
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => actions.handleStatusClick('cancelled', appt)}>
                            <XCircle className="mr-2 h-4 w-4 text-red-600" />
                            Cancelar cita
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

      {/* Form dialog */}
      <AppointmentForm
        open={actions.isFormOpen}
        onOpenChange={actions.setIsFormOpen}
        appointment={actions.editingAppointment}
        patients={patients}
        specialties={specialties}
        locations={locations}
        onSuccess={actions.handleFormSuccess}
      />

      {/* Status confirmation dialog */}
      <StatusConfirmDialog
        open={!!actions.statusingAppointment && !!actions.statusAction}
        onOpenChange={(open) => { if (!open) { actions.setStatusingAppointment(null); actions.setStatusAction(null) } }}
        action={actions.statusAction}
        onConfirm={() => actions.handleStatusChange(actions.statusAction!)}
      />

      {/* Follow-up prompt dialog */}
      <FollowupPromptDialog
        open={actions.showFollowupModal}
        onOpenChange={(open) => { if (!open) actions.handleFollowupCancel() }}
        onConfirmFollowup={actions.handleFollowupConfirm}
        onSkipFollowup={() => {
          actions.setShowFollowupModal(false)
          // Complete without follow-up
          actions.handleStatusChange('completed')
        }}
      />

      {/* Specialty select dialog */}
      <SpecialtySelectDialog
        open={actions.showSpecialtySelectModal}
        onOpenChange={(open) => { if (!open) actions.handleSpecialtySelectCancel() }}
        specialties={specialties}
        selectedSpecialties={actions.selectedSpecialties}
        onToggleSpecialty={actions.handleSpecialtyToggle}
        onConfirm={actions.handleCompleteWithFollowup}
      />
    </div>
  )
}
