'use client'

import { useState } from 'react'
import { Cita, Paciente, Especialidad, Lugar } from '@/types/database'
import { createClient } from '@/lib/supabase/client'
import { CitaForm } from './cita-form'
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

interface CitaWithRelations extends Cita {
  pacientes: { id: string; nombre: string } | null
  especialidades: { id: string; nombre: string } | null
  lugares: { id: string; nombre: string } | null
}

interface Props {
  initialCitas: CitaWithRelations[]
  pacientes: Paciente[]
  especialidades: Especialidad[]
  lugares: Lugar[]
}

const ESTADOS = ['pendiente', 'atendido', 'cancelado', 'reprogramado']

const estadoColors: Record<string, string> = {
  pendiente: 'bg-yellow-100 text-yellow-800',
  atendido: 'bg-green-100 text-green-800',
  cancelado: 'bg-red-100 text-red-800',
  reprogramado: 'bg-blue-100 text-blue-800',
}

export function CitaTable({ initialCitas, pacientes, especialidades, lugares }: Props) {
  const [citas, setCitas] = useState(initialCitas)
  const [filterFecha, setFilterFecha] = useState('')
  const [filterEstado, setFilterEstado] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCita, setEditingCita] = useState<CitaWithRelations | null>(null)
  const [statusingCita, setStatusingCita] = useState<CitaWithRelations | null>(null)
  const [statusAction, setStatusAction] = useState<'atendido' | 'cancelado' | null>(null)
  const supabase = createClient()

  const filteredCitas = citas.filter(cita => {
    if (filterFecha && cita.fecha !== filterFecha) return false
    if (filterEstado && cita.estado !== filterEstado) return false
    return true
  })

  async function handleStatusChange(accion: 'atendido' | 'cancelado') {
    if (!statusingCita) return
    
    const { error } = await supabase
      .from('citas')
      .update({ estado: accion, updated_at: new Date().toISOString() })
      .eq('id', statusingCita.id)
    
    if (error) {
      toast.error('Error al cambiar estado')
    } else {
      setCitas(prev => prev.map(c => c.id === statusingCita.id ? { ...c, estado: accion } : c))
      toast.success(`Cita marcada como ${accion}`)
    }
    setStatusingCita(null)
  }

  function handleFormSuccess(updatedCita: CitaWithRelations) {
    setIsFormOpen(false)
    setEditingCita(null)
    if (editingCita) {
      setCitas(prev => prev.map(c => c.id === updatedCita.id ? updatedCita : c))
      toast.success('Cita actualizada')
    } else {
      setCitas(prev => [updatedCita, ...prev].sort((a, b) => b.fecha.localeCompare(a.fecha)))
      toast.success('Cita creada')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div className="flex gap-2 items-center flex-wrap">
          <div className="relative">
            <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="date"
              value={filterFecha}
              onChange={(e) => setFilterFecha(e.target.value)}
              className="pl-8 w-40"
            />
          </div>
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
          >
            <option value="">Todos los estados</option>
            {ESTADOS.map(e => (
              <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>
            ))}
          </select>
        </div>
        <Button onClick={() => { setEditingCita(null); setIsFormOpen(true) }}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Cita
        </Button>
      </div>

      {filteredCitas.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          {filterFecha || filterEstado ? 'No hay citas con esos filtros' : 'No hay citas registradas'}
        </div>
      ) : (
        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Hora</TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead>Especialidad</TableHead>
                <TableHead>Lugar</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-24">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCitas.map((cita) => (
                <TableRow key={cita.id}>
                  <TableCell>{new Date(cita.fecha).toLocaleDateString('es-CO')}</TableCell>
                  <TableCell>{cita.hora_cita}</TableCell>
                  <TableCell className="font-medium">{cita.pacientes?.nombre || '-'}</TableCell>
                  <TableCell>{cita.especialidades?.nombre || '-'}</TableCell>
                  <TableCell>{cita.lugares?.nombre || '-'}</TableCell>
                  <TableCell>
                    <Badge className={estadoColors[cita.estado]}>
                      {cita.estado.charAt(0).toUpperCase() + cita.estado.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => { setEditingCita(cita); setIsFormOpen(true) }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setStatusingCita(cita); setStatusAction('atendido') }}>
                            <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                            Marcar como atendida
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setStatusingCita(cita); setStatusAction('cancelado') }}>
                            <XCircle className="mr-2 h-4 w-4 text-red-600" />
                            Cancelar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setEditingCita(cita); setIsFormOpen(true) }}>
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

      <CitaForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        cita={editingCita}
        pacientes={pacientes}
        especialidades={especialidades}
        lugares={lugares}
        onSuccess={handleFormSuccess}
      />

      {statusingCita && statusAction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">
              Confirmar cambio de estado
            </h3>
            <p className="text-slate-600 mb-4">
              ¿Marcar esta cita como {statusAction}?
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setStatusingCita(null); setStatusAction(null) }}>
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
