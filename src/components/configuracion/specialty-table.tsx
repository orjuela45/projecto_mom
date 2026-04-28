'use client'

import { useState } from 'react'
import { Specialty } from '@/types/database'
import { createClient } from '@/lib/supabase/client'
import { SpecialtyForm } from './specialty-form'
import { PatientDialog } from '@/components/patients/patient-dialog'
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
  initialSpecialties: Specialty[]
}

export function SpecialtyTable({ initialSpecialties }: Props) {
  const [specialties, setSpecialties] = useState(initialSpecialties)
  const [search, setSearch] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingSpecialty, setEditingSpecialty] = useState<Specialty | null>(null)
  const [deletingSpecialty, setDeletingSpecialty] = useState<Specialty | null>(null)
  const supabase = createClient()

  const filteredSpecialties = specialties.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase())
  )

  function handleEdit(specialty: Specialty) {
    setEditingSpecialty(specialty)
    setIsFormOpen(true)
  }

  async function handleDelete() {
    if (!deletingSpecialty) return
    
    const { error } = await supabase
      .from('specialties')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', deletingSpecialty.id)
    
    if (error) {
      toast.error('Error al eliminar especialidad')
    } else {
      setSpecialties(prev => prev.filter(s => s.id !== deletingSpecialty.id))
      toast.success('Especialidad eliminada')
    }
    setDeletingSpecialty(null)
  }

  function handleFormSuccess(newSpecialty: Specialty) {
    setIsFormOpen(false)
    setEditingSpecialty(null)
    if (editingSpecialty) {
      setSpecialties(prev => prev.map(s => s.id === newSpecialty.id ? newSpecialty : s))
      toast.success('Especialidad actualizada')
    } else {
      setSpecialties(prev => [...prev, newSpecialty].sort((a, b) => a.name.localeCompare(b.name)))
      toast.success('Especialidad creada')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar especialidad..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button onClick={() => { setEditingSpecialty(null); setIsFormOpen(true) }}>
          <Plus className="mr-2 h-4 w-4" />
          Agregar Especialidad
        </Button>
      </div>

      {filteredSpecialties.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          {search ? 'No se encontraron especialidades' : 'No hay especialidades registradas'}
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Fecha de Creación</TableHead>
                <TableHead className="w-32">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSpecialties.map((specialty) => (
                <TableRow key={specialty.id}>
                  <TableCell className="font-medium">{specialty.name}</TableCell>
                  <TableCell>
                    {new Date(specialty.created_at).toLocaleDateString('es-CO')}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(specialty)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeletingSpecialty(specialty)}>
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

      <SpecialtyForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        specialty={editingSpecialty}
        onSuccess={handleFormSuccess}
      />

      <PatientDialog
        open={!!deletingSpecialty}
        onOpenChange={(open) => !open && setDeletingSpecialty(null)}
        onConfirm={handleDelete}
        title="Eliminar Especialidad"
        description={`¿Estás seguro de eliminar "${deletingSpecialty?.name}"? Esta acción no se puede deshacer.`}
      />
    </div>
  )
}
