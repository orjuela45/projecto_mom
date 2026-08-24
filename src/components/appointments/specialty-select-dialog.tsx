'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { SpecialtySelect } from './types'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  specialties: SpecialtySelect[]
  selectedSpecialties: string[]
  onToggleSpecialty: (id: string) => void
  onConfirm: () => void
}

export function SpecialtySelectDialog({
  open,
  onOpenChange,
  specialties,
  selectedSpecialties,
  onToggleSpecialty,
  onConfirm,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Seleccionar especialidades para seguimiento</DialogTitle>
          <DialogDescription>
            Seleccione al menos una especialidad para crear las citas de seguimiento.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-2">
          {specialties.map(specialty => (
            <label
              key={specialty.id}
              className="flex items-center gap-2 p-2 rounded hover:bg-muted cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedSpecialties.includes(specialty.id)}
                onChange={() => onToggleSpecialty(specialty.id)}
                className="h-4 w-4"
              />
              <span className="text-sm">{specialty.name}</span>
            </label>
          ))}
        </div>
        {selectedSpecialties.length === 0 && (
          <p className="text-destructive text-sm">
            Debe seleccionar al menos una especialidad
          </p>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            disabled={selectedSpecialties.length === 0}
          >
            Confirmar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
