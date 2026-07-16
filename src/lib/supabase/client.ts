import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    'https://pjqvsupsshffrsiyemvs.supabase.co',
    'sb_publishable_UfpG8E6CKtwXZGniqkyWCg_mPdXM0bH'
  )
}
