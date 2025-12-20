
import { createClient } from '@supabase/supabase-js';

/**
 * Note: These environment variables must be provided in the hosting environment.
 * Using fallback strings to prevent the 'supabaseUrl is required' crash during initialization.
 */
const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
