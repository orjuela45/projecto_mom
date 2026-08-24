import { useState } from 'react'
import { createClient } from '@/lib/db-client'
import { AppointmentWithRelations, PatientSelect, SpecialtySelect, LocationSelect } from '@/components/appointments/types'
import { statusLabels } from '@/lib/constants'
import { toast } from 'sonner'

interface Props {
  patients: PatientSelect[]
  specialties: SpecialtySelect[]
  locations: LocationSelect[]
  setAppointments: React.Dispatch<React.SetStateAction<AppointmentWithRelations[]>>
}

export function useAppointmentActions({ patients, specialties, locations, setAppointments }: Props) {
  const supabase = createClient()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<AppointmentWithRelations | null>(null)
  const [statusingAppointment, setStatusingAppointment] = useState<AppointmentWithRelations | null>(null)
  const [statusAction, setStatusAction] = useState<'completed' | 'cancelled' | null>(null)
  const [showFollowupModal, setShowFollowupModal] = useState(false)
  const [showSpecialtySelectModal, setShowSpecialtySelectModal] = useState(false)
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([])
  const [appointmentToComplete, setAppointmentToComplete] = useState<AppointmentWithRelations | null>(null)

  function openForm(appointment?: AppointmentWithRelations) {
    setEditingAppointment(appointment ?? null)
    setIsFormOpen(true)
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
    setStatusAction(null)
  }

  function handleFormSuccess(savedAppointment: AppointmentWithRelations) {
    setIsFormOpen(false)
    setEditingAppointment(null)
    const enriched: AppointmentWithRelations = {
      ...savedAppointment,
      patients: patients.find(p => p.id === savedAppointment.patient_id) ?? savedAppointment.patients ?? null,
      specialties: specialties.find(s => s.id === savedAppointment.specialty_id) ?? savedAppointment.specialties ?? null,
      locations: locations.find(l => l.id === savedAppointment.location_id) ?? savedAppointment.locations ?? null,
    }
    if (editingAppointment) {
      setAppointments(prev => prev.map(a => a.id === enriched.id ? enriched : a))
      toast.success('Cita actualizada')
    } else {
      setAppointments(prev => [enriched, ...prev].sort((a, b) => (b.date || '').localeCompare(a.date || '')))
      toast.success('Cita creada')
    }
  }

  return {
    isFormOpen,
    setIsFormOpen,
    editingAppointment,
    statusingAppointment,
    statusAction,
    setStatusAction,
    setStatusingAppointment,
    showFollowupModal,
    setShowFollowupModal,
    showSpecialtySelectModal,
    setShowSpecialtySelectModal,
    selectedSpecialties,
    appointmentToComplete,
    openForm,
    handleStatusClick,
    handleFollowupConfirm,
    handleFollowupCancel,
    handleSpecialtyToggle,
    handleCompleteWithFollowup,
    handleSpecialtySelectCancel,
    handleStatusChange,
    handleFormSuccess,
  }
}
