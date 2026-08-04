
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://fyfigitwigwjzorbyxvj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5ZmlnaXR3aWd3anpvcmJ5eHZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2MTg1MjIsImV4cCI6MjEwMTE5NDUyMn0.AR5DZCbdhROZ9Lth6n5fewMB-ZArAgAdtIKWL0CejYs';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Supabase Auth exige un correo. Como el login real es por
// usuario y contraseña, cada username se traduce internamente
// a un correo "sintético" bajo este dominio propio.
const EMAIL_DOMAIN = 'talentocanes@gmail.com';

export function usernameToEmail(username) {
  return username.trim().toLowerCase().replace(/\s+/g, '.') + EMAIL_DOMAIN;
}
