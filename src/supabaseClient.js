// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// Hardcoded — Vercel env vars kept getting corrupted.
// These values are safe to be public (publishable key is designed for browsers).
const SUPABASE_URL = 'https://lookscjdmgoumfxjzzpy.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_ahqlznWQ4URCLL5zXmc6Kg_yJKi8WHE';

console.log('[supabase] URL:', SUPABASE_URL);
console.log('[supabase] Key starts:', SUPABASE_ANON_KEY.substring(0, 15));

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);