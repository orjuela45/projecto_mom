import { Appointment } from '@/types/database'

export const STATUSES = ['pending', 'completed', 'cancelled', 'rescheduled'] as const

export const statusLabels: Record<string, string> = {
  pending: 'Pendientes',
  completed: 'Atendidas',
  cancelled: 'Canceladas',
  rescheduled: 'Reprogramadas'
}

export const statusColors: Record<string, string> = {
  pending: '#EAB308',
  completed: '#22C55E',
  cancelled: '#EF4444',
  rescheduled: '#3B82F6'
}

export interface TodayMetrics {
  total: number
  pending: number
  completed: number
  cancelled: number
}

export function getTodayMetrics(appointments: Appointment[]): TodayMetrics {
  const today = new Date().toISOString().split('T')[0]
  const todayAppointments = appointments.filter(a => a.date === today)

  return {
    total: todayAppointments.length,
    pending: todayAppointments.filter(a => a.status === 'pending').length,
    completed: todayAppointments.filter(a => a.status === 'completed').length,
    cancelled: todayAppointments.filter(a => a.status === 'cancelled').length
  }
}

export function getAppointmentsByStatus(appointments: Appointment[]) {
  return STATUSES.map(status => ({
    name: statusLabels[status],
    value: appointments.filter(a => a.status === status).length,
    color: statusColors[status]
  })).filter(item => item.value > 0)
}

export function getNext7DaysData(appointments: Appointment[]) {
  const next7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() + i)
    return date.toISOString().split('T')[0]
  })

  const dayLabels = ['Hoy', 'Mañana', 'Día 3', 'Día 4', 'Día 5', 'Día 6', 'Día 7']

  return next7Days.map((date, index) => ({
    date,
    day: dayLabels[index],
    count: appointments.filter(a => a.date === date).length
  }))
}
