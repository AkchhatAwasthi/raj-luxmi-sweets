// Raj Luxmi — Supabase Browser Client (Next.js)
// Used in 'use client' components
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/integrations/supabase/types';

export const createClient = () =>
  createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
      db: { schema: 'public' },
      global: {
        headers: { 'X-Client-Info': 'rajluxmi-web-app' },
      },
    }
  );
