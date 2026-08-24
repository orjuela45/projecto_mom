import { useState, useMemo } from 'react'
import { AppointmentWithRelations } from '@/components/appointments/types'

type QuickRange = 'week' | 'next-week' | '7days' | 'month' | null

interface DateRange {
  start: string
  end: string
}

const MS_PER_DAY = 24 * 60 * 60 * 1000

function getDateRange(rangeType: string): DateRange {
  const now = new Date()
  const today = now.toISOString().split('T')[0]

  switch (rangeType) {
    case 'week': {
      const start = new Date(now)
      start.setDate(now.getDate() - now.getDay())
      const end = new Date(start.getTime() + 6 * MS_PER_DAY)
      return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] }
    }
    case 'next-week': {
      const start = new Date(now)
      start.setDate(now.getDate() - now.getDay() + 7)
      const end = new Date(start.getTime() + 6 * MS_PER_DAY)
      return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] }
    }
    case '7days': {
      const start = new Date(now.getTime() - 7 * MS_PER_DAY)
      return { start: start.toISOString().split('T')[0], end: today }
    }
    case 'month': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1)
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] }
    }
    default:
      return { start: '', end: '' }
  }
}

export function useAppointmentFilters(initialAppointments: AppointmentWithRelations[]) {
  const [appointments, setAppointments] = useState(initialAppointments)
  const [filterDateRange, setFilterDateRange] = useState<DateRange | null>(null)
  const [filterQuickRange, setFilterQuickRange] = useState<QuickRange>(null)
  const [filterPatientId, setFilterPatientId] = useState<string | null>('')
  const [filterSpecialtyId, setFilterSpecialtyId] = useState<string | null>('')
  const [filterLocationId, setFilterLocationId] = useState<string | null>('')
  const [filterStatus, setFilterStatus] = useState<string | null>('')
  const [showFilters, setShowFilters] = useState(false)

  const sortedAppointments = useMemo(() => {
    return [...appointments].sort((a, b) => {
      const aDate = a.date ? String(a.date) : ''
      const bDate = b.date ? String(b.date) : ''
      if (!aDate && !bDate) return 0
      if (!aDate) return -1
      if (!bDate) return 1
      const dateCompare = aDate.localeCompare(bDate)
      if (dateCompare !== 0) return dateCompare
      return (a.appointment_time ? String(a.appointment_time) : '').localeCompare(
        b.appointment_time ? String(b.appointment_time) : ''
      )
    })
  }, [appointments])

  const filteredAppointments = useMemo(() => {
    return sortedAppointments.filter(appt => {
      const apptDate = appt.date ? String(appt.date) : ''
      if (filterDateRange?.start && apptDate && apptDate < filterDateRange.start) return false
      if (filterDateRange?.end && apptDate && apptDate > filterDateRange.end) return false
      if (filterPatientId && appt.patient_id !== filterPatientId) return false
      if (filterSpecialtyId && appt.specialty_id !== filterSpecialtyId) return false
      if (filterLocationId && appt.location_id !== filterLocationId) return false
      if (filterStatus && appt.status !== filterStatus) return false
      return true
    })
  }, [sortedAppointments, filterDateRange, filterPatientId, filterSpecialtyId, filterLocationId, filterStatus])

  const activeFiltersCount = [
    filterDateRange,
    filterPatientId,
    filterSpecialtyId,
    filterLocationId,
    filterStatus,
  ].filter(v => v !== null && v !== '').length

  function handleQuickRangeSelect(rangeType: QuickRange) {
    setFilterQuickRange(rangeType)
    if (rangeType) {
      setFilterDateRange(getDateRange(rangeType))
    } else {
      setFilterDateRange(null)
    }
  }

  function handleClearFilters() {
    setFilterDateRange(null)
    setFilterQuickRange(null)
    setFilterPatientId(null)
    setFilterSpecialtyId(null)
    setFilterLocationId(null)
    setFilterStatus(null)
  }

  function handleClearDateRange() {
    setFilterDateRange(null)
    setFilterQuickRange(null)
  }

  return {
    appointments,
    setAppointments,
    filterDateRange,
    setFilterDateRange,
    filterQuickRange,
    filterPatientId,
    setFilterPatientId,
    filterSpecialtyId,
    setFilterSpecialtyId,
    filterLocationId,
    setFilterLocationId,
    filterStatus,
    setFilterStatus,
    showFilters,
    setShowFilters,
    filteredAppointments,
    activeFiltersCount,
    handleQuickRangeSelect,
    handleClearFilters,
    handleClearDateRange,
  }
}
