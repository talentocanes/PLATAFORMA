// =========================================================
// Configuración de conexión a Supabase
// Reemplaza estos dos valores con los de tu proyecto:
// Dashboard > Project Settings > API
// =========================================================
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://TU-PROYECTO.supabase.co';
const SUPABASE_ANON_KEY = 'TU-ANON-KEY-PUBLICA';

// ---------------------------------------------------------
// Adaptador de almacenamiento para "Mantener sesión iniciada".
// La preferencia (sí/no) se guarda siempre en localStorage bajo
// 'tc_remember'. Según esa preferencia, la sesión real se guarda:
//   - en localStorage (sobrevive a cerrar el navegador), o
//   - en sessionStorage (se borra al cerrar la pestaña/navegador)
// Por defecto (si nunca se ha elegido) se recuerda la sesión,
// igual que el comportamiento que ya tenía la app.
// ---------------------------------------------------------
function almacenActivo(){
  const recordar = localStorage.getItem('tc_remember');
  return recordar === 'false' ? sessionStorage : localStorage;
}

const storageAdapter = {
  getItem: (key) => almacenActivo().getItem(key),
  setItem: (key, value) => almacenActivo().setItem(key, value),
  removeItem: (key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  }
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: storageAdapter,
    persistSession: true,
    autoRefreshToken: true
  }
});

// Llamar ANTES de iniciar sesión, según el estado del checkbox
// "Mantener sesión iniciada" en la pantalla de login.
export function definirRecordarSesion(recordar){
  localStorage.setItem('tc_remember', recordar ? 'true' : 'false');
}

// Supabase Auth exige un correo. Como el login real es por
// usuario y contraseña, cada username se traduce internamente
// a un correo "sintético" bajo este dominio propio.
const EMAIL_DOMAIN = '@talentocanes.app';

export function usernameToEmail(username) {
  return username.trim().toLowerCase().replace(/\s+/g, '.') + EMAIL_DOMAIN;
}
