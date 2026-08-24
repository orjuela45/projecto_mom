/**
 * Single source of truth for appointment statuses across the app.
 */

export const STATUSES = ['pending', 'completed', 'cancelled', 'rescheduled'] as const
export type AppointmentStatus = (typeof STATUSES)[number]

/** Labels for table/badge display (singular) */
export const statusLabels: Record<AppointmentStatus, string> = {
  pending: 'Pendiente',
  completed: 'Atendido',
  cancelled: 'Cancelado',
  rescheduled: 'Reprogramado',
}

/** Plural labels for dashboard metrics */
export const statusLabelsPlural: Record<AppointmentStatus, string> = {
  pending: 'Pendientes',
  completed: 'Atendidas',
  cancelled: 'Canceladas',
  rescheduled: 'Reprogramadas',
}

/** Tailwind classes for status badges */
export const statusBadgeColors: Record<AppointmentStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  rescheduled: 'bg-blue-100 text-blue-800',
}

/** Hex colors for charts (pie, bar) */
export const statusChartColors: Record<AppointmentStatus, string> = {
  pending: '#EAB308',
  completed: '#22C55E',
  cancelled: '#EF4444',
  rescheduled: '#3B82F6',
}
