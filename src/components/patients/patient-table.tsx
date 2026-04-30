'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Patient } from '@/types/database'
import { createClient } from '@/lib/supabase/client'
import { PatientForm } from './patient-form'
import { PatientDialog } from './patient-dialog'
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
  initialPatients: Patient[]
}

export function PatientTable({ initialPatients }: Props) {
  const [patients, setPatients] = useState(initialPatients)
  const [search, setSearch] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null)
  const [deletingPatient, setDeletingPatient] = useState<Patient | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  function handleEdit(patient: Patient) {
    setEditingPatient(patient)
    setIsFormOpen(true)
  }

  async function handleDelete() {
    if (!deletingPatient) return
    
    const { error } = await supabase
      .from('patients')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', deletingPatient.id)
    
    if (error) {
      toast.error('Error al eliminar paciente')
    } else {
      setPatients(prev => prev.filter(p => p.id !== deletingPatient.id))
      toast.success('Paciente eliminado')
    }
    setDeletingPatient(null)
  }

  function handleFormSuccess(newPatient: Patient) {
    setIsFormOpen(false)
    setEditingPatient(null)
    if (editingPatient) {
      setPatients(prev => prev.map(p => p.id === newPatient.id ? newPatient : p))
      toast.success('Paciente actualizado')
    } else {
      setPatients(prev => [...prev, newPatient].sort((a, b) => a.name.localeCompare(b.name)))
      toast.success('Paciente creado')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar paciente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button onClick={() => { setEditingPatient(null); setIsFormOpen(true) }} className="w-full md:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Agregar Paciente
        </Button>
      </div>

      {filteredPatients.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          {search ? 'No se encontraron pacientes' : 'No hay pacientes registrados'}
        </div>
      ) : (
        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">Nombre</TableHead>
                <TableHead className="whitespace-nowrap">Historia Clínica</TableHead>
                <TableHead className="whitespace-nowrap">Teléfono</TableHead>
                <TableHead className="whitespace-nowrap">Fecha de Creación</TableHead>
                <TableHead className="w-32 whitespace-nowrap">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">{patient.name}</TableCell>
                  <TableCell>{patient.medical_record || '-'}</TableCell>
                  <TableCell>{patient.phone || '-'}</TableCell>
                  <TableCell>
                    {new Date(patient.created_at).toLocaleDateString('es-CO')}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(patient)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeletingPatient(patient)}>
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

      <PatientForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        patient={editingPatient}
        onSuccess={handleFormSuccess}
      />

      <PatientDialog
        open={!!deletingPatient}
        onOpenChange={(open) => !open && setDeletingPatient(null)}
        onConfirm={handleDelete}
        title="Eliminar Paciente"
        description={`¿Estás seguro de eliminar a ${deletingPatient?.name}? Esta acción no se puede deshacer.`}
      />
    </div>
  )
}
