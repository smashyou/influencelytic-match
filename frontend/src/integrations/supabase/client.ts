// Supabase client configuration
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Use environment variables with fallback to provided values
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://tdqyyxwtpzutayckaves.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkcXl5eHd0cHp1dGF5Y2thdmVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0MjM2NzQsImV4cCI6MjA1Njk5OTY3NH0.2QUhqNeaERpz7uRe-HaxVqL4zrrV0VGzHG9p5E8lJ9g";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);