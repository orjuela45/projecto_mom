'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Paciente } from '@/types/database'
import { createClient } from '@/lib/supabase/client'
import { PacienteForm } from './paciente-form'
import { PacienteDialog } from './paciente-dialog'
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
import { Plus, Search, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  initialPacientes: Paciente[]
}

export function PacienteTable({ initialPacientes }: Props) {
  const [pacientes, setPacientes] = useState(initialPacientes)
  const [search, setSearch] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingPaciente, setEditingPaciente] = useState<Paciente | null>(null)
  const [deletingPaciente, setDeletingPaciente] = useState<Paciente | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const filteredPacientes = pacientes.filter(p => 
    p.nombre.toLowerCase().includes(search.toLowerCase())
  )

  function handleEdit(paciente: Paciente) {
    setEditingPaciente(paciente)
    setIsFormOpen(true)
  }

  async function handleDelete() {
    if (!deletingPaciente) return
    
    const { error } = await supabase
      .from('pacientes')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', deletingPaciente.id)
    
    if (error) {
      toast.error('Error al eliminar paciente')
    } else {
      setPacientes(prev => prev.filter(p => p.id !== deletingPaciente.id))
      toast.success('Paciente eliminado')
    }
    setDeletingPaciente(null)
  }

  function handleFormSuccess(newPaciente: Paciente) {
    setIsFormOpen(false)
    setEditingPaciente(null)
    if (editingPaciente) {
      setPacientes(prev => prev.map(p => p.id === newPaciente.id ? newPaciente : p))
      toast.success('Paciente actualizado')
    } else {
      setPacientes(prev => [...prev, newPaciente].sort((a, b) => a.nombre.localeCompare(b.nombre)))
      toast.success('Paciente creado')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar paciente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button onClick={() => { setEditingPaciente(null); setIsFormOpen(true) }}>
          <Plus className="mr-2 h-4 w-4" />
          Agregar Paciente
        </Button>
      </div>

      {filteredPacientes.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          {search ? 'No se encontraron pacientes' : 'No hay pacientes registrados'}
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Historia Clínica</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Fecha de Creación</TableHead>
                <TableHead className="w-32">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPacientes.map((paciente) => (
                <TableRow key={paciente.id}>
                  <TableCell className="font-medium">{paciente.nombre}</TableCell>
                  <TableCell>{paciente.historia_clinica || '-'}</TableCell>
                  <TableCell>{paciente.telefono || '-'}</TableCell>
                  <TableCell>
                    {new Date(paciente.created_at).toLocaleDateString('es-CO')}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(paciente)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeletingPaciente(paciente)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <PacienteForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        paciente={editingPaciente}
        onSuccess={handleFormSuccess}
      />

      <PacienteDialog
        open={!!deletingPaciente}
        onOpenChange={(open) => !open && setDeletingPaciente(null)}
        onConfirm={handleDelete}
        title="Eliminar Paciente"
        description={`¿Estás seguro de eliminar a ${deletingPaciente?.nombre}? Esta acción no se puede deshacer.`}
      />
    </div>
  )
}
