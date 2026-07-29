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
        fetch: async (url, options) => {
          try {
            return await fetch(url, options);
          } catch (err: any) {
            // Intercept network/auth fetch errors gracefully to prevent unhandled promise rejections
            console.warn('Supabase network connection notice:', err?.message || err);
            return new Response(
              JSON.stringify({ error: 'network_error', message: err?.message || 'Failed to fetch' }),
              { status: 503, headers: { 'Content-Type': 'application/json' } }
            );
          }
        },
      },
    }
  );
