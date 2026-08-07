import { createClient } from '@supabase/supabase-js';

// Default Supabase credentials provided by user
const DEFAULT_SUPABASE_URL = 'https://sxsuebbwgeqkqyxfqvnt.supabase.co';
const DEFAULT_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4c3VlYmJ3Z2Vxa3F5eGZxdm50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYxMDIyOTQsImV4cCI6MjEwMTY3ODI5NH0.chVdylAVAhZ11qv5N1U-waU81Z1Vt0WBlrYLeWV1j64';

function cleanSupabaseUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  let url = rawUrl.trim();
  // Strip trailing /rest/v1 or /rest/v1/ if user pasted REST endpoint URL
  url = url.replace(/\/rest\/v1\/?$/, '');
  if (url.endsWith('/')) {
    url = url.slice(0, -1);
  }
  return url;
}

// Read Supabase credentials from environment, localStorage, or fallback to default provided
export const getSupabaseCredentials = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const localUrl = localStorage.getItem('school_erp_supabase_url');
  const localKey = localStorage.getItem('school_erp_supabase_key');

  const rawUrl = envUrl || localUrl || DEFAULT_SUPABASE_URL;
  const key = (envKey || localKey || DEFAULT_SUPABASE_KEY).trim();
  const url = cleanSupabaseUrl(rawUrl);

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
export function saveSupabaseConfig(rawUrl: string, rawKey: string) {
  const cleanUrl = cleanSupabaseUrl(rawUrl);
  localStorage.setItem('school_erp_supabase_url', cleanUrl);
  localStorage.setItem('school_erp_supabase_key', rawKey.trim());
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
export async function testSupabaseConnection(): Promise<{ success: boolean; message: string; dbConnected?: boolean }> {
  const { url, key } = getSupabaseCredentials();
  if (!url || !key) {
    return {
      success: false,
      message: 'Supabase URL or Anon Key is missing. Please enter your credentials.'
    };
  }

  try {
    const tempClient = createClient(url, key);
    // Simple light request to check connection health
    const { error } = await tempClient.from('students').select('count', { count: 'exact', head: true });
    
    if (error && (error.code === 'PGRST116' || error.message?.includes('relation "public.students" does not exist'))) {
      // Endpoint is active & reachable, but public schema tables haven't been created yet
      return {
        success: true,
        dbConnected: true,
        message: '🟢 Supabase API Connected! (Database connected - run 1-Click SQL Script in Hub to build tables).'
      };
    } else if (error && error.message?.includes('FetchError')) {
      return {
        success: false,
        message: 'Network error connecting to Supabase URL. Check project status.'
      };
    } else if (error && (error.code === 'PGRST301' || error.message?.includes('JWT'))) {
      return {
        success: false,
        message: 'Authentication failed. Please verify your Anon Key.'
      };
    } else if (error) {
      return {
        success: true,
        dbConnected: true,
        message: `🟢 Connected to Supabase Project (${url})! Status: ${error.message}`
      };
    }

    return {
      success: true,
      dbConnected: true,
      message: '🟢⚡ Live Supabase Database Connected & Verified!'
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Connection test failed: ${err.message || 'Unknown error'}`
    };
  }
}

