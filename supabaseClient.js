// =========================================================
// Configuración de conexión a Supabase
// Reemplaza estos dos valores con los de tu proyecto:
// Dashboard > Project Settings > API
// =========================================================
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://fyfigitwigwjzorbyxvj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5ZmlnaXR3aWd3anpvcmJ5eHZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2MTg1MjIsImV4cCI6MjEwMTE5NDUyMn0.AR5DZCbdhROZ9Lth6n5fewMB-ZArAgAdtIKWL0CejYs';

// ---------------------------------------------------------
// "Mantener sesión iniciada": la preferencia (sí/no) se guarda en
// localStorage bajo 'tc_remember'. Con base en ella se elige el
// almacén real donde vive la sesión:
//   - localStorage  → sobrevive a cerrar el navegador
//   - sessionStorage → se borra al cerrar la pestaña/navegador
// Por defecto (primera visita, sin preferencia guardada) se recuerda.
// ---------------------------------------------------------
function crearClienteSupabase(){
  const seRecuerda = localStorage.getItem('tc_remember') !== 'false';
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      storage: seRecuerda ? window.localStorage : window.sessionStorage,
      persistSession: true,
      autoRefreshToken: true
    }
  });
}

// "let" (no "const"): los exports de un módulo ES son enlaces vivos,
// así que si este valor se reasigna más abajo, cualquier archivo que
// ya haya hecho "import { supabase }" ve automáticamente el cliente
// nuevo, sin necesidad de recargar la página.
export let supabase = crearClienteSupabase();

// Llamar ANTES de iniciar sesión, según el estado del checkbox
// "Mantener sesión iniciada" en la pantalla de login. Recrea el
// cliente al instante para que ESE MISMO inicio de sesión ya use
// el almacén correcto (evita que quede "un paso atrás").
export function definirRecordarSesion(recordar){
  localStorage.setItem('tc_remember', recordar ? 'true' : 'false');
  supabase = crearClienteSupabase();
}

// Supabase Auth exige un correo. Como el login real es por
// usuario y contraseña, cada username se traduce internamente
// a un correo "sintético" bajo este dominio propio.
const EMAIL_DOMAIN = '@talentocanes.app';

export function usernameToEmail(username) {
  return username.trim().toLowerCase().replace(/\s+/g, '.') + EMAIL_DOMAIN;
}
