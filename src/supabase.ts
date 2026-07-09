import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { GardenState } from './types';

let supabaseInstance: SupabaseClient | null = null;
let initPromise: Promise<SupabaseClient | null> | null = null;

// Initialize Supabase Client dynamically by fetching configuration from server
export async function getSupabaseClient(): Promise<SupabaseClient | null> {
  if (supabaseInstance) return supabaseInstance;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      // 1. Try to fetch Supabase config from the Express API endpoint
      const res = await fetch('/api/config');
      if (res.ok) {
        const config = await res.json();
        if (config.supabaseUrl && config.supabaseAnonKey) {
          console.log('Connecting to Supabase using server configuration...');
          supabaseInstance = createClient(config.supabaseUrl, config.supabaseAnonKey);
          return supabaseInstance;
        }
      }
    } catch (err) {
      console.error('Error fetching Supabase config from server:', err);
    }

    // 2. Fallback to client-side Vite environment variables if available
    const metaEnv = (import.meta as any).env || {};
    const viteUrl = metaEnv.VITE_SUPABASE_URL;
    const viteKey = metaEnv.VITE_SUPABASE_ANON_KEY;
    if (viteUrl && viteKey) {
      console.log('Connecting to Supabase using Vite environment variables...');
      supabaseInstance = createClient(viteUrl, viteKey);
      return supabaseInstance;
    }

    console.warn('Supabase configuration is not set. Local fallback will be used.');
    return null;
  })();

  return initPromise;
}

// Check if Supabase connection is configured and live
export async function checkSupabaseConnection(): Promise<boolean> {
  const supabase = await getSupabaseClient();
  return supabase !== null;
}

// Sign up with Supabase Authentication and metadata
export async function signUpWithSupabase(email: string, name: string, password: string) {
  const supabase = await getSupabaseClient();
  if (!supabase) throw new Error('Supabase is not configured.');

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
      },
    },
  });

  if (error) throw error;

  // Supabase does not return an error for an email that is already registered
  // and confirmed (to avoid leaking which emails exist) - instead it returns a
  // user with no identities attached. Treat that as "already registered".
  if (data.user && data.user.identities && data.user.identities.length === 0) {
    throw new Error('An account with this email already exists. Please sign in instead.');
  }

  return data;
}

// Sign in with Supabase Authentication
export async function signInWithSupabase(email: string, password: string) {
  const supabase = await getSupabaseClient();
  if (!supabase) throw new Error('Supabase is not configured.');

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

// Get the currently authenticated Supabase user, if any (validates the session is real, not just cached)
export async function getCurrentSupabaseUser() {
  const supabase = await getSupabaseClient();
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Log out of Supabase
export async function signOutWithSupabase() {
  const supabase = await getSupabaseClient();
  if (supabase) {
    await supabase.auth.signOut();
  }
}

// Fetch garden state from Supabase for a given user ID or authenticated user
export async function fetchGardenState(): Promise<GardenState | null> {
  const supabase = await getSupabaseClient();
  if (!supabase) return null;

  // Get current authenticated user session
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('gardens')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error) {
    console.error('Error fetching garden state from Supabase:', error.message);
    return null;
  }

  if (data) {
    // Map database snake_case structure to types.ts camelCase structure
    return {
      isPaired: data.is_paired,
      pairedDeviceId: data.paired_device_id,
      setupCompleted: data.setup_completed,
      setupStep: data.setup_step,
      selectedPlantId: data.selected_plant_id,
      setupDate: data.setup_date,
      waterLevel: data.water_level,
      lightStatus: data.light_status,
      phStatus: data.ph_status,
    };
  }

  return null;
}

// Sync garden state to Supabase for the active user
export async function syncGardenState(state: GardenState): Promise<boolean> {
  const supabase = await getSupabaseClient();
  if (!supabase) return false;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  // Map types.ts camelCase structure to database snake_case structure
  const dbData = {
    updated_at: new Date().toISOString(),
    is_paired: state.isPaired,
    paired_device_id: state.pairedDeviceId,
    setup_completed: state.setupCompleted,
    setup_step: state.setupStep,
    selected_plant_id: state.selectedPlantId,
    setup_date: state.setupDate,
    water_level: state.waterLevel,
    light_status: state.lightStatus,
    ph_status: state.phStatus,
  };

  // Check if garden entry already exists
  const { data: existing } = await supabase
    .from('gardens')
    .select('id')
    .eq('user_id', user.id)
    .single();

  let error;
  if (existing) {
    const { error: updateError } = await supabase
      .from('gardens')
      .update(dbData)
      .eq('user_id', user.id);
    error = updateError;
  } else {
    const { error: insertError } = await supabase
      .from('gardens')
      .insert({
        user_id: user.id,
        ...dbData,
      });
    error = insertError;
  }

  if (error) {
    console.error('Error syncing garden state to Supabase:', error.message);
    return false;
  }

  return true;
}

// Fetch public profile from Supabase
export async function fetchUserProfile(): Promise<{ name: string; email: string } | null> {
  const supabase = await getSupabaseClient();
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Error fetching user profile from Supabase:', error.message);
    return null;
  }

  return { name: data.full_name, email: data.email };
}
