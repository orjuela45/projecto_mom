'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  action: 'completed' | 'cancelled' | null
  onConfirm: () => void
}

const actionLabels = {
  completed: 'Marcar esta cita como atendida',
  cancelled: 'Cancelar esta cita',
}

export function StatusConfirmDialog({ open, onOpenChange, action, onConfirm }: Props) {
  if (!action) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirmar cambio de estado</DialogTitle>
          <DialogDescription>
            ¿{actionLabels[action]}?
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={onConfirm}>
            Confirmar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
