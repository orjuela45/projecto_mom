import { Appointment } from '@/types/database'

export interface AppointmentWithRelations extends Appointment {
  patients: { id: string; name: string } | null
  specialties: { id: string; name: string } | null
  locations: { id: string; name: string } | null
}

export interface PatientSelect {
  id: string
  name: string
}

export interface SpecialtySelect {
  id: string
  name: string
}

export interface LocationSelect {
  id: string
  name: string
  address?: string | null
}
