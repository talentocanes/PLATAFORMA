import { protegerPagina, cerrarSesion } from './auth.js?v=13';
import { supabase } from './supabaseClient.js?v=13';
import { cargarConfiguracionNegocio, aplicarModo } from './theme.js?v=13';

/* ============================================================================
   BARKLY · layout.js

   La definición del menú ya NO vive aquí: está en shell-inline.js, que se
   carga antes y pinta el armazón al instante con lo que quedó cacheado.
   Este archivo confirma la sesión con Supabase, resuelve permisos, repinta
   con los datos reales y conecta el comportamiento.
   ========================================================================== */

let configuracionActual = null;

export function obtenerConfiguracionActual(){
  return configuracionActual;
}

/* Se mantiene el nombre porque trabajadores.html ya lo importa. */
export function obtenerModulosAsignables(config){
  return window.BarklyShell.modulosAsignables(config || configuracionActual);
}

function guardarPerfilCache(profile){
  try {
    localStorage.setItem('tc_perfil_cache', JSON.stringify({
      id: profile.id, role: profile.role,
      full_name: profile.full_name, username: profile.username
    }));
  } catch (e) { /* ignorar */ }
}

function guardarModulosCache(modulos){
  try { localStorage.setItem('tc_modulos_trabajador', JSON.stringify(modulos || [])); }
  catch (e) { /* ignorar */ }
}

/* ---------------------------------------------------------
   Contadores de pendientes.
   Cada consulta pide solo el número, no las filas. Van dentro
   de try/catch porque un trabajador sin permiso sobre una
   tabla debe quedarse sin ese contador, no sin armazón.
   --------------------------------------------------------- */
async function contarPendientes(profile, permitidos){
  const badges = {};
  const puede = clave => !permitidos || permitidos.includes(clave);

  const cuenta = async (tabla, filtros) => {
    try {
      let q = supabase.from(tabla).select('id', { count: 'exact', head: true });
      filtros.forEach(([col, val]) => { q = q.eq(col, val); });
      const { count } = await q;
      return count || 0;
    } catch (e) { return 0; }
  };

  if (profile.role === 'cliente') {
    // Lo que el acudiente tiene por pagar.
    badges.cartera = await cuenta('compras', [
      ['cliente_id', profile.id], ['estado_aprobacion', 'aprobado'], ['estado_pago', 'pendiente']
    ]);
  } else {
    if (puede('servicios')) {
      badges.servicios = await cuenta('compras', [['estado_aprobacion', 'pendiente']]);
    }
    if (puede('alumnos')) {
      badges.alumnos = await cuenta('alumnos', [['status', 'pending']]);
    }
    if (profile.role === 'admin') {
      // Solicitudes de acceso esperando aprobación.
      badges.clientes     = await cuenta('profiles', [['role', 'cliente'], ['status', 'pending']]);
      badges.trabajadores = await cuenta('profiles', [['role', 'trabajador'], ['status', 'pending']]);
    }
  }

  Object.keys(badges).forEach(k => { if (!badges[k]) delete badges[k]; });
  return badges;
}

/* ---------------------------------------------------------
   Comportamiento del armazón
   --------------------------------------------------------- */
function conectarArmazon(){
  const scrim = document.getElementById('scrim');
  const hoja = document.getElementById('sheetMas');

  const cerrarHoja = () => {
    hoja?.classList.remove('open');
    scrim?.classList.remove('open');
    document.body.style.overflow = '';
  };

  document.getElementById('tabMas')?.addEventListener('click', () => {
    hoja?.classList.add('open');
    scrim?.classList.add('open');
    document.body.style.overflow = 'hidden';
  });

  scrim?.addEventListener('click', () => {
    document.querySelectorAll('.dialog.open').forEach(d => d.classList.remove('open'));
    scrim.classList.remove('open');
    document.body.style.overflow = '';
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') cerrarHoja();
  });

  document.getElementById('logoutBtn')?.addEventListener('click', cerrarSesion);
  document.getElementById('logoutBtnMas')?.addEventListener('click', cerrarSesion);

  // Apariencia: la elige cada usuario, no el colegio.
  document.getElementById('segModo')?.addEventListener('click', e => {
    const btn = e.target.closest('button[data-modo]');
    if (!btn) return;
    aplicarModo(btn.dataset.modo);
    btn.parentElement.querySelectorAll('button').forEach(b => {
      b.setAttribute('aria-pressed', String(b === btn));
    });
  });

  const clockEl = document.getElementById('clock');
  if (clockEl) {
    const pad = n => String(n).padStart(2, '0');
    const tick = () => {
      const d = new Date();
      clockEl.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    };
    setInterval(tick, 1000);
    tick();
  }
}

/* ---------------------------------------------------------
   Punto de entrada de cada página protegida
   --------------------------------------------------------- */
export async function initLayout({ activeKey, rolesPermitidos = null } = {}){
  const profile = await protegerPagina({ rolesPermitidos });
  if (!profile) return null;
  guardarPerfilCache(profile);

  const config = await cargarConfiguracionNegocio();
  configuracionActual = config;

  let modulosPermitidos = null;
  let trabajadorPerfilCompleto = true;

  if (profile.role === 'trabajador') {
    const { data, error } = await supabase
      .from('trabajador_detalle')
      .select('modulos_habilitados, perfil_completo')
      .eq('id', profile.id)
      .single();

    if (error) console.error('Error al leer permisos del trabajador:', error);
    modulosPermitidos = data?.modulos_habilitados || [];
    trabajadorPerfilCompleto = !!data?.perfil_completo;
    guardarModulosCache(modulosPermitidos);
  } else if (profile.role === 'cliente') {
    modulosPermitidos = window.BarklyShell.MODULOS_CLIENTE;
  }

  if (modulosPermitidos) {
    const tieneAcceso = window.BarklyShell.SIEMPRE.includes(activeKey) ||
                        modulosPermitidos.includes(activeKey);
    if (!tieneAcceso) {
      window.location.href = 'inicio.html';
      return null;
    }
  }

  // Configuración inicial obligatoria antes de usar el resto del panel.
  if (profile.role === 'cliente') {
    const { data, error } = await supabase
      .from('cliente_detalle')
      .select('perfil_completo')
      .eq('id', profile.id)
      .single();

    if (error) console.error('Error al leer el estado del perfil del cliente:', error);
    if (!data?.perfil_completo) {
      window.location.href = 'configuracion-inicial-cliente.html';
      return null;
    }
  }

  if (profile.role === 'trabajador' && !trabajadorPerfilCompleto) {
    window.location.href = 'configuracion-inicial-trabajador.html';
    return null;
  }

  // Repintado con los datos confirmados.
  window.BarklyShell.pintar(profile, modulosPermitidos, config || {});
  conectarArmazon();

  // Los contadores llegan después: el armazón no espera por ellos.
  contarPendientes(profile, modulosPermitidos).then(badges => {
    if (!Object.keys(badges).length) return;
    window.BarklyShell.setBadges(badges, profile, modulosPermitidos, config || {});
    conectarArmazon();
  });

  return profile;
}
