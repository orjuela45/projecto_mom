// Type aliases for better readability
export type Patient = Database['public']['Tables']['patients']['Row']
export type Specialty = Database['public']['Tables']['specialties']['Row']
export type Location = Database['public']['Tables']['locations']['Row']
export type Appointment = Database['public']['Tables']['appointments']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Eps = Database['public']['Tables']['eps']['Row']

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: string
          updated_at?: string
        }
      }
      specialties: {
        Row: {
          id: string
          name: string
          created_by: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          name: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          created_by?: string | null
          updated_at?: string
          deleted_at?: string | null
        }
      }
      locations: {
        Row: {
          id: string
          name: string
          address: string | null
          created_by: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          name: string
          address?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          address?: string | null
          updated_at?: string
          deleted_at?: string | null
        }
      }
      patients: {
        Row: {
          id: string
          name: string
          medical_record: string | null
          phone: string | null
          created_by: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          name: string
          medical_record?: string | null
          phone?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          medical_record?: string | null
          phone?: string | null
          updated_at?: string
          deleted_at?: string | null
        }
      }
      appointments: {
        Row: {
          id: string
          date: string
          appointment_time: string
          departure_time: string | null
          patient_id: string
          specialty_id: string
          location_id: string | null
          companion: string | null
          status: string
          medical_record: string | null
          notes: string | null
          created_by: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          date: string
          appointment_time: string
          departure_time?: string | null
          patient_id: string
          specialty_id: string
          location_id?: string | null
          companion?: string | null
          status?: string
          medical_record?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          date?: string
          appointment_time?: string
          departure_time?: string | null
          patient_id?: string
          specialty_id?: string
          location_id?: string | null
          companion?: string | null
          status?: string
          medical_record?: string | null
          notes?: string | null
          updated_at?: string
          deleted_at?: string | null
        }
      }
      eps: {
        Row: {
          id: string
          name: string
          created_by: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          name: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          created_by?: string | null
          updated_at?: string
          deleted_at?: string | null
        }
      }
    }
  }
}
