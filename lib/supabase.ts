import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  const missing = [
    !supabaseUrl && 'NEXT_PUBLIC_SUPABASE_URL',
    !supabaseAnonKey && 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ].filter(Boolean).join(', ');

  // In development, crash loudly so the developer fixes their .env immediately.
  // In production, log a critical warning — the app will fail on first Supabase call.
  const message = `[CRITICAL] Missing required environment variable(s): ${missing}. Add them to your .env.local file.`;
  if (process.env.NODE_ENV === 'development') {
    throw new Error(message);
  }
  console.error(message);
}

export const supabase = createClient(supabaseUrl!, supabaseAnonKey!);
export default supabase;
