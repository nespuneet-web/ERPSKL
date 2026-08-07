import { createClient } from '@supabase/supabase-js';

// Read Supabase credentials from environment or runtime localStorage config
const getSupabaseCredentials = () => {
  const url = import.meta.env.VITE_SUPABASE_URL || localStorage.getItem('school_erp_supabase_url') || '';
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('school_erp_supabase_key') || '';
  return { url, key };
};

const { url, key } = getSupabaseCredentials();

export const isSupabaseConfigured = Boolean(url && key && url.startsWith('http'));

export const supabase = isSupabaseConfigured
  ? createClient(url, key)
  : null;

/**
 * Save runtime Supabase credentials into localStorage for custom live connection
 */
export function saveSupabaseConfig(url: string, key: string) {
  localStorage.setItem('school_erp_supabase_url', url.trim());
  localStorage.setItem('school_erp_supabase_key', key.trim());
  window.location.reload();
}

/**
 * Clear saved credentials
 */
export function clearSupabaseConfig() {
  localStorage.removeItem('school_erp_supabase_url');
  localStorage.removeItem('school_erp_supabase_key');
  window.location.reload();
}

/**
 * Test connectivity to the Supabase endpoint
 */
export async function testSupabaseConnection(): Promise<{ success: boolean; message: string }> {
  const { url, key } = getSupabaseCredentials();
  if (!url || !key) {
    return {
      success: false,
      message: 'Supabase URL or Anon Key is missing. Please enter your credentials.'
    };
  }

  try {
    const tempClient = createClient(url, key);
    // Simple light request to check health/schema
    const { error } = await tempClient.from('students').select('count', { count: 'exact', head: true });
    
    if (error && error.code === 'PGRST116') {
      // Table does not exist yet, but connection is valid
      return {
        success: true,
        message: 'Connected to Supabase project! (Tables not yet created - run the SQL script below).'
      };
    } else if (error && error.message.includes('FetchError')) {
      return {
        success: false,
        message: 'Network error connecting to Supabase URL. Check your URL.'
      };
    } else if (error) {
      return {
        success: true,
        message: `Connected to Supabase! Status: ${error.message}`
      };
    }

    return {
      success: true,
      message: '⚡ Successfully connected to Supabase Database & verified tables!'
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Connection failed: ${err.message || 'Unknown error'}`
    };
  }
}
