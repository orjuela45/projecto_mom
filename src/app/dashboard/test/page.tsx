import { createClient } from '@/lib/supabase/server'

export default async function TestPage() {
  const supabase = await createClient()
  
  // Test 1: Check auth
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  // Test 2: Check patients query
  const { data: patients, error: patientsError } = await supabase
    .from('patients')
    .select('*')
    .limit(1)
  
  // Test 3: Check appointments query
  const { data: appointments, error: appointmentsError } = await supabase
    .from('appointments')
    .select('*')
    .limit(1)
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test de Conexión</h1>
      
      <div className="space-y-4">
        <div className="p-4 border rounded-lg">
          <h2 className="font-semibold">1. Auth User</h2>
          <pre className="bg-slate-100 p-2 rounded text-xs mt-2 overflow-auto">
            {JSON.stringify({ user: user?.email, error: authError?.message }, null, 2)}
          </pre>
        </div>
        
        <div className="p-4 border rounded-lg">
          <h2 className="font-semibold">2. Patients Query</h2>
          <pre className="bg-slate-100 p-2 rounded text-xs mt-2 overflow-auto">
            {JSON.stringify({ count: patients?.length, error: patientsError?.message }, null, 2)}
          </pre>
        </div>
        
        <div className="p-4 border rounded-lg">
          <h2 className="font-semibold">3. Appointments Query</h2>
          <pre className="bg-slate-100 p-2 rounded text-xs mt-2 overflow-auto">
            {JSON.stringify({ count: appointments?.length, error: appointmentsError?.message }, null, 2)}
          </pre>
        </div>
      </div>
      
      <div className="mt-6">
        <a href="/dashboard" className="text-blue-600 hover:underline">
          Ir al Dashboard →
        </a>
      </div>
    </div>
  )
}
