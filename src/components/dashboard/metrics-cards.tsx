'use client'

import { Calendar, Clock, CheckCircle, XCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { TodayMetrics } from '@/lib/dashboard-metrics'

interface MetricsCardsProps {
  metrics: TodayMetrics
}

const cardConfig = [
  {
    label: 'Total hoy',
    icon: Calendar,
    bg: 'bg-blue-500',
    text: 'text-blue-600',
    key: 'total' as const
  },
  {
    label: 'Pendientes',
    icon: Clock,
    bg: 'bg-yellow-500',
    text: 'text-yellow-600',
    key: 'pending' as const
  },
  {
    label: 'Atendidas',
    icon: CheckCircle,
    bg: 'bg-green-500',
    text: 'text-green-600',
    key: 'completed' as const
  },
  {
    label: 'Canceladas',
    icon: XCircle,
    bg: 'bg-red-500',
    text: 'text-red-600',
    key: 'cancelled' as const
  }
]

export function MetricsCards({ metrics }: MetricsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cardConfig.map(({ label, icon: Icon, bg, text, key }) => (
        <Card key={label} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-lg ${bg}`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className={`text-3xl font-bold ${text}`}>
                  {metrics[key]}
                </p>
                <p className="text-sm text-slate-600 mt-1">{label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
