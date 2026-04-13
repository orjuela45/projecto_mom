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
      especialidades: {
        Row: {
          id: string
          nombre: string
          created_by: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          nombre: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          nombre?: string
          created_by?: string | null
          updated_at?: string
          deleted_at?: string | null
        }
      }
      lugares: {
        Row: {
          id: string
          nombre: string
          direccion: string | null
          created_by: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          nombre: string
          direccion?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          nombre?: string
          direccion?: string | null
          updated_at?: string
          deleted_at?: string | null
        }
      }
      pacientes: {
        Row: {
          id: string
          nombre: string
          historia_clinica: string | null
          telefono: string | null
          created_by: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          nombre: string
          historia_clinica?: string | null
          telefono?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          nombre?: string
          historia_clinica?: string | null
          telefono?: string | null
          updated_at?: string
          deleted_at?: string | null
        }
      }
      citas: {
        Row: {
          id: string
          fecha: string
          hora_cita: string
          hora_salida: string | null
          paciente_id: string
          especialidad_id: string
          lugar_id: string | null
          acompanante: string | null
          estado: string
          historia_clinica: string | null
          observaciones: string | null
          created_by: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          fecha: string
          hora_cita: string
          hora_salida?: string | null
          paciente_id: string
          especialidad_id: string
          lugar_id?: string | null
          acompanante?: string | null
          estado?: string
          historia_clinica?: string | null
          observaciones?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          fecha?: string
          hora_cita?: string
          hora_salida?: string | null
          paciente_id?: string
          especialidad_id?: string
          lugar_id?: string | null
          acompanante?: string | null
          estado?: string
          historia_clinica?: string | null
          observaciones?: string | null
          updated_at?: string
          deleted_at?: string | null
        }
      }
    }
  }
}
