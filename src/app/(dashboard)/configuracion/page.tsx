import { ConfigList } from '@/components/configuracion/config-list'

export default function ConfiguracionPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Configuración</h1>
      <ConfigList />
    </div>
  )
}
