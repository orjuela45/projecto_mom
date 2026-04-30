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
                tick={{ fill: '#64748b', fontSize: 12 }}
              />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 12 }}
                allowDecimals={false}
              />
              <Tooltip
                formatter={(value: number, name: string, props: any) => [
                  `${value} citas`,
                  props.payload.date
                ]}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              />
              <Bar
                dataKey="count"
                fill="#3B82F6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
