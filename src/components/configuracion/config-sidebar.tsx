'use client'

import { cn } from '@/lib/utils'
import { Stethoscope, MapPin, Building2 } from 'lucide-react'

export interface ConfigSection {
  id: string
  label: string
  icon: typeof Stethoscope
  count?: number
}

interface ConfigSidebarProps {
  sections: ConfigSection[]
  activeSection: string
  onSectionChange: (id: string) => void
}

const iconMap = {
  Stethoscope,
  MapPin,
  Building2,
}

export function ConfigSidebar({ sections, activeSection, onSectionChange }: ConfigSidebarProps) {
  return (
    <nav className="w-full md:w-56 flex md:flex-col gap-1">
      {sections.map((section) => {
        const Icon = section.icon
        const isActive = activeSection === section.id
        return (
          <button
            key={section.id}
            onClick={() => onSectionChange(section.id)}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all',
              'text-left w-full',
              isActive
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span className="flex-1">{section.label}</span>
            {section.count !== undefined && (
              <span
                className={cn(
                  'text-xs px-2 py-0.5 rounded-full',
                  isActive
                    ? 'bg-primary-foreground/20 text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {section.count}
              </span>
            )}
          </button>
        )
      })}
    </nav>
  )
}
