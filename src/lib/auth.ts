// Simple local auth - no Supabase, no JWT, no cookies
// For a local tool, we use a default user

const DEFAULT_USER = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'admin@momcitas.com',
}

export function getUser() {
  return DEFAULT_USER
}

export function isAuthenticated() {
  return true
}
