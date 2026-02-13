import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let supabase: any

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey)
} else {
  // Mock Supabase client for local development
  supabase = {
    auth: {
      signUp: async () => ({ data: null, error: null }),
      signInWithPassword: async () => ({ data: null, error: null }),
      signOut: async () => ({ error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      resetPasswordForEmail: async () => ({ error: null }),
    },
    from: () => ({
      select: () => ({
        order: () => ({
          eq: () => ({
            single: () => ({
              data: null,
              error: null
            })
          })
        }),
        insert: () => ({
          select: () => ({
            data: [],
            error: null
          })
        }),
        update: () => ({
          eq: () => ({
            select: () => ({
              data: [],
              error: null
            })
          })
        }),
        delete: () => ({
          eq: () => ({
            error: null
          })
        }),
        upsert: () => ({
          select: () => ({
            data: [],
            error: null
          })
        })
      })
    })
  }
}

export { supabase }
