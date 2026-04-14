import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MomCitas - Sistema de Citas Médicas',
  description: 'Sistema de gestión de citas médicas',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  )
}
