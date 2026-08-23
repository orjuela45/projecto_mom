'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'

interface CitasTabsProps {
  unassignedContent: React.ReactNode
  scheduledContent: React.ReactNode
}

export default function CitasTabs({ unassignedContent, scheduledContent }: CitasTabsProps) {
  const [activeTab, setActiveTab] = useState<'unassigned' | 'scheduled'>('unassigned')
  const router = useRouter()

  function handleRefresh() {
    // Re-fetch the server components (appointments lists) without reloading the page
    router.refresh()
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <TabsList>
            <TabsTrigger value="unassigned">Sin Asignar</TabsTrigger>
            <TabsTrigger value="scheduled">Con Fecha</TabsTrigger>
          </TabsList>

          <TabsContent value="unassigned">
            {unassignedContent}
          </TabsContent>

          <TabsContent value="scheduled">
            {scheduledContent}
          </TabsContent>
        </Tabs>
      </div>
      
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="icon"
          onClick={handleRefresh}
          className="h-8 w-8"
          title="Recargar citas"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
