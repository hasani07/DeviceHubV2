import { createClient } from '@supabase/supabase-js';

// Dipakai di komponen client ('use client'). Tunduk sama RLS,
// jadi aman walau kode ini kebaca orang lain di browser.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
