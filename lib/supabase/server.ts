import { createClient } from '@supabase/supabase-js';

// PENTING: file ini cuma boleh diimport di app/api/** (server-side).
// JANGAN pernah diimport di komponen client - service role key bisa
// bypass semua RLS dan baca/tulis data siapa aja.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
