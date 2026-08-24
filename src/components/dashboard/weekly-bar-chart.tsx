'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Appointment } from '@/types/database'
import { getNext7DaysData } from '@/lib/dashboard-metrics'

interface WeeklyBarChartProps {
  appointments: Appointment[]
}

export function WeeklyBarChart({ appointments }: WeeklyBarChartProps) {
  const data = getNext7DaysData(appointments)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Próximos 7 días</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="day"
                tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
              />
              <YAxis
                tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                allowDecimals={false}
              />
              <Tooltip
                formatter={(value: any) => [`${value} citas`, 'Cantidad']}
                contentStyle={{
                  backgroundColor: 'var(--popover)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'var(--popover-foreground)',
                }}
              />
              <Bar
                dataKey="count"
                fill="var(--primary)"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
