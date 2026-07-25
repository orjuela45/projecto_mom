// Server-side DB client - replaces Supabase server client
import { from } from '@/lib/db'
import { getUser } from '@/lib/auth'

export async function createClient() {
  return {
    from,
    auth: {
      getUser: async () => ({ data: { user: getUser() }, error: null }),
    },
  }
}
