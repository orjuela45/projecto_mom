'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { RefreshCw, Plus, Clock, CalendarDays } from 'lucide-react'

interface CitasTabsProps {
  unassignedContent: React.ReactNode
  scheduledContent: React.ReactNode
}

export default function CitasTabs({ unassignedContent, scheduledContent }: CitasTabsProps) {
  const [activeTab, setActiveTab] = useState<'unassigned' | 'scheduled'>('scheduled')
  const router = useRouter()

  function handleRefresh() {
    router.refresh()
  }

  function handleNewAppointment() {
    window.dispatchEvent(new CustomEvent('open-new-appointment'))
  }

  return (
    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'unassigned' | 'scheduled')} className="space-y-6">
      {/* Header: Tabs + Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <TabsList className="h-auto p-1 bg-muted/50">
          <TabsTrigger
            value="scheduled"
            className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <CalendarDays className="h-4 w-4" />
            <span>Con Fecha</span>
          </TabsTrigger>
          <TabsTrigger
            value="unassigned"
            className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Clock className="h-4 w-4" />
            <span>Sin Asignar</span>
          </TabsTrigger>
        </TabsList>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="gap-2"
            title="Recargar citas"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Recargar</span>
          </Button>
          <Button onClick={handleNewAppointment} className="gap-2 flex-1 sm:flex-none">
            <Plus className="h-4 w-4" />
            <span>Nueva Cita</span>
          </Button>
        </div>
      </div>

      {/* Tab Content */}
      <TabsContent value="scheduled" className="mt-0">
        {scheduledContent}
      </TabsContent>

      <TabsContent value="unassigned" className="mt-0">
        {unassignedContent}
      </TabsContent>
    </Tabs>
  )
}
