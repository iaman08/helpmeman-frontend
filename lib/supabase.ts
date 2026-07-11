import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dmiuttyiwevpbocbhvfh.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseAnonKey) {
  console.warn(
    'Warning: NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined in frontend environment variables. Please add it to your .env file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey || 'placeholder-supabase-anon-key-please-configure-in-env');
export default supabase;
