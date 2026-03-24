// Raj Luxmi — Supabase Client (Next.js compatible)
// Re-exports the browser client for backward compatibility across the codebase
export { createClient } from '@/lib/supabase/client';

import { createClient } from '@/lib/supabase/client';
import type { Database } from './types';
import { SupabaseClient } from '@supabase/supabase-js';

// Lazy singleton — created once on first use (browser only)
let _supabase: SupabaseClient<Database> | null = null;

export const supabase: SupabaseClient<Database> = new Proxy({} as SupabaseClient<Database>, {
  get(_target, prop) {
    if (!_supabase) {
      _supabase = createClient();
    }
    return (_supabase as any)[prop];
  },
});