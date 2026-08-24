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
  onConfirmFollowup: () => void
  onSkipFollowup: () => void
}

export function FollowupPromptDialog({ open, onOpenChange, onConfirmFollowup, onSkipFollowup }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Crear seguimiento</DialogTitle>
          <DialogDescription>
            ¿Desea crear citas de seguimiento sin fecha para este paciente?
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onSkipFollowup}>
            No, solo completar
          </Button>
          <Button onClick={onConfirmFollowup}>
            Sí, crear seguimiento
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
