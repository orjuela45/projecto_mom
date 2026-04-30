'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Calendar,
  Home,
  Settings,
  Users,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useState } from 'react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Pacientes', href: '/dashboard/pacientes', icon: Users },
  { name: 'Citas', href: '/dashboard/citas', icon: Calendar },
  { name: 'Configuración', href: '/dashboard/configuracion', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      <button
        onClick={() => setIsMobileOpen(true)}
        className="md:hidden fixed top-3 left-3 z-50 p-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-colors shadow-lg"
      >
        <Menu className="h-6 w-6" />
      </button>

      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 ease-in-out md:translate-x-0 md:relative md:z-auto',
          'bg-slate-900 w-64 flex flex-col',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-800">
          <Link href="/dashboard" className="hover:bg-slate-800/50 transition-colors">
            <h1 className="text-xl font-bold text-white cursor-pointer">MomCitas</h1>
          </Link>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                )}
                onClick={() => setIsMobileOpen(false)}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-2 border-t border-slate-800">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center px-3 py-2 text-sm font-medium text-slate-400 rounded-md hover:bg-slate-800 hover:text-white transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Cerrar Sesión
          </button>
        </div>
      </div>
    </>
  )
}
