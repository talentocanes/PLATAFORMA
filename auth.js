import { supabase, usernameToEmail } from './supabaseClient.js?v=8';

// ---------------------------------------------------------
// Iniciar sesión con usuario y contraseña
// ---------------------------------------------------------
export async function iniciarSesion(identificador, password) {
  // Si ya es un correo real (como el del administrador), se usa tal cual.
  // Si es un username (trabajadores/clientes invitados), se traduce al
  // correo sintético interno.
  const email = identificador.includes('@')
    ? identificador.trim().toLowerCase()
    : usernameToEmail(identificador);

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    console.error('Error en signInWithPassword:', error);
    if (error.message?.toLowerCase().includes('invalid login credentials')) {
      throw new Error('Usuario o contraseña incorrectos.');
    }
    throw new Error('No se pudo conectar con Supabase: ' + error.message);
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, username, full_name, role, status, requiere_cambio_password')
    .eq('id', data.user.id)
    .single();

  if (profileError || !profile) {
    console.error('Error al leer profiles:', profileError);
    await supabase.auth.signOut();
    const detalle = profileError ? ` (${profileError.message})` : '';
    throw new Error('No se encontró un perfil asociado a esta cuenta.' + detalle);
  }

  if (profile.status === 'pending') {
    await supabase.auth.signOut();
    throw new Error('Tu cuenta está pendiente de aprobación del administrador.');
  }

  if (profile.status === 'denied') {
    await supabase.auth.signOut();
    throw new Error('Tu solicitud de acceso fue rechazada.');
  }

  return profile;
}

// ---------------------------------------------------------
// Cerrar sesión
// ---------------------------------------------------------
export async function cerrarSesion() {
  await supabase.auth.signOut();
  window.location.href = 'index.html';
}

// ---------------------------------------------------------
// Obtener el perfil de la sesión activa (o null si no hay)
// ---------------------------------------------------------
export async function obtenerPerfilActual() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, full_name, role, status, requiere_cambio_password')
    .eq('id', session.user.id)
    .single();

  return profile || null;
}

// ---------------------------------------------------------
// Guardia de página: redirige a index.html si no hay sesión
// aprobada, o a inicio.html si el rol no está permitido.
// Si la sesión sigue "viva" en el navegador pero el admin borró
// la cuenta, la cierra antes de redirigir — evita el bucle
// infinito entre el login y las páginas protegidas.
// Úsala al inicio de cada página protegida:
//   const perfil = await protegerPagina({ rolesPermitidos: ['admin'] });
// ---------------------------------------------------------
export async function protegerPagina({ rolesPermitidos = null } = {}) {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    window.location.href = 'index.html';
    return null;
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, username, full_name, role, status, requiere_cambio_password')
    .eq('id', session.user.id)
    .single();

  if (error || !profile || profile.status !== 'approved') {
    // Sesión inválida (perfil borrado, denegado o pendiente):
    // se cierra por completo antes de mandar al login, para que
    // no quede un token viejo causando redirecciones en bucle.
    await supabase.auth.signOut();
    window.location.href = 'index.html';
    return null;
  }

  if (rolesPermitidos && !rolesPermitidos.includes(profile.role)) {
    window.location.href = 'inicio.html';
    return null;
  }

  return profile;
}
