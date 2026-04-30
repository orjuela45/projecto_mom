'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Appointment } from '@/types/database'
import { getAppointmentsByStatus } from '@/lib/dashboard-metrics'

interface StatusPieChartProps {
  appointments: Appointment[]
}

export function StatusPieChart({ appointments }: StatusPieChartProps) {
  const data = getAppointmentsByStatus(appointments)

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Citas por estado</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500 text-center py-8">No hay datos suficientes</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Citas por estado</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string, props: any) => [
                  `${value} citas`,
                  props.payload.name
                ]}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => <span className="text-slate-700">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
