'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Eps } from '@/types/database'
import { EpsForm } from './eps-form'
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
  initialEps: Eps[]
}

export function EpsTable({ initialEps }: Props) {
  const [eps, setEps] = useState(initialEps)
  const [search, setSearch] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingEps, setEditingEps] = useState<Eps | null>(null)
  const [deletingEps, setDeletingEps] = useState<Eps | null>(null)
  const supabase = createClient()

  const filteredEps = eps.filter(e => 
    e.name.toLowerCase().includes(search.toLowerCase())
  )

  function handleEdit(epsItem: Eps) {
    setEditingEps(epsItem)
    setIsFormOpen(true)
  }

  async function handleDelete() {
    if (!deletingEps) return
    
    const { error } = await supabase
      .from('eps')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', deletingEps.id)
    
    if (error) {
      toast.error('Error al eliminar EPS')
    } else {
      setEps(prev => prev.filter(e => e.id !== deletingEps.id))
      toast.success('EPS eliminada')
    }
    setDeletingEps(null)
  }

  function handleFormSuccess(newEps: Eps) {
    setIsFormOpen(false)
    setEditingEps(null)
    if (editingEps) {
      setEps(prev => prev.map(e => e.id === newEps.id ? newEps : e))
      toast.success('EPS actualizada')
    } else {
      setEps(prev => [...prev, newEps].sort((a, b) => a.name.localeCompare(b.name)))
      toast.success('EPS creada')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar EPS..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button onClick={() => { setEditingEps(null); setIsFormOpen(true) }}>
          <Plus className="mr-2 h-4 w-4" />
          Agregar EPS
        </Button>
      </div>

      {filteredEps.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          {search ? 'No se encontraron EPS' : 'No hay EPS registradas'}
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
              {filteredEps.map((epsItem) => (
                <TableRow key={epsItem.id}>
                  <TableCell className="font-medium">{epsItem.name}</TableCell>
                  <TableCell>
                    {new Date(epsItem.created_at).toLocaleDateString('es-CO')}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(epsItem)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeletingEps(epsItem)}>
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

      <EpsForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        eps={editingEps}
        onSuccess={handleFormSuccess}
      />

      <PatientDialog
        open={!!deletingEps}
        onOpenChange={(open) => !open && setDeletingEps(null)}
        onConfirm={handleDelete}
        title="Eliminar EPS"
        description={`¿Estás seguro de eliminar "${deletingEps?.name}"? Esta acción no se puede deshacer.`}
      />
    </div>
  )
}
