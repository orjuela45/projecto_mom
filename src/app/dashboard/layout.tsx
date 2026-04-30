import { Sidebar } from '@/components/sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-12 pt-20 md:pt-0">
          {children}
        </main>
      </div>
    </div>
  )
}
