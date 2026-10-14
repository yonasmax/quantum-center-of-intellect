// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// Hardcoded because Vercel env vars kept getting corrupted.
// TODO: Move back to env vars once Vercel env config is verified.
const SUPABASE_URL = 'https://lookscjdmgoumfxjzzpy.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_ahqlznWQ4URCLL5zXmc6Kg_yJKi8WHE';

console.log('[supabase] Initializing with URL:', SUPABASE_URL);
console.log('[supabase] Key starts with:', SUPABASE_ANON_KEY.substring(0, 15));

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('[supabase] Missing config!');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);