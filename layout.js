import { protegerPagina, cerrarSesion } from './auth.js?v=9';
import { supabase } from './supabaseClient.js?v=9';
import { cargarConfiguracionNegocio } from './theme.js?v=9';

// Claves que SIEMPRE están disponibles para cualquier trabajador,
// sin importar sus permisos asignados.
const CLAVES_SIEMPRE_DISPONIBLES = ['inicio', 'configuracion'];

// Módulos habilitados para el rol Cliente (fijo para todos los
// clientes, a diferencia de los trabajadores que se configuran
// individualmente desde "Funciones" en Editar trabajador).
const CLAVES_CLIENTE = ['inicio', 'servicios', 'cartera', 'configuracion', 'mis-mascotas'];

// ---------------------------------------------------------
// Definición de las 12 opciones definitivas del menú.
// enabled:true = ya tiene página propia y es clicable.
// enabled:false = se muestra deshabilitada con etiqueta "Próx."
// ---------------------------------------------------------
const NAV_GROUPS = [
  {
    label: 'General',
    items: [
      { key:'inicio', label:'Inicio', href:'inicio.html', enabled:true,
        icon:'<path d="M4 11.5 12 4l8 7.5"/><path d="M6 10v9a1 1 0 0 0 1 1h4v-6h2v6h4a1 1 0 0 0 1-1v-9"/>' }
    ]
  },
  {
    label: 'Comunidad',
    items: [
      { key:'trabajadores', label:'Trabajadores', href:'trabajadores.html', enabled:true,
        icon:'<circle cx="12" cy="8" r="3.2"/><path d="M5 20c1-4 4-6 7-6s6 2 7 6"/>' },
      { key:'clientes', label:'Acudientes', href:'clientes.html', enabled:true,
        icon:'<circle cx="9" cy="8" r="3.1"/><path d="M3.2 20c1-4 3.4-6 5.8-6s4.8 2 5.8 6"/><path d="M15.6 11.8l1.6 1.6 3.2-3.4"/>' },
      { key:'alumnos', label:'Alumnos', href:'alumnos.html', enabled:true, rolesVisibles:['admin','trabajador'],
        icon:'<ellipse cx="12" cy="16.2" rx="4.1" ry="3.3"/><ellipse cx="6.4" cy="9" rx="1.5" ry="1.9"/><ellipse cx="10.6" cy="6.3" rx="1.5" ry="1.9"/><ellipse cx="14.4" cy="6.3" rx="1.5" ry="1.9"/><ellipse cx="18.6" cy="9" rx="1.5" ry="1.9"/>' },
      { key:'mis-mascotas', label:'Mis mascotas', href:'mis-mascotas.html', enabled:true, rolesVisibles:['cliente'],
        icon:'<ellipse cx="12" cy="16.2" rx="4.1" ry="3.3"/><ellipse cx="6.4" cy="9" rx="1.5" ry="1.9"/><ellipse cx="10.6" cy="6.3" rx="1.5" ry="1.9"/><ellipse cx="14.4" cy="6.3" rx="1.5" ry="1.9"/><ellipse cx="18.6" cy="9" rx="1.5" ry="1.9"/>' }
    ]
  },
  {
    label: 'Operación',
    items: [
      { key:'rutas', label:'Rutas', href:'rutas.html', enabled:true,
        icon:'<circle cx="6" cy="6.2" r="2"/><circle cx="18" cy="17.8" r="2"/><path d="M6 8.2c0 4.6 4 3.6 6 6.4s2 3.4 6 3.4" stroke-dasharray="2.4 2.4"/>' },
      { key:'servicios', label:'Servicios', href:null, enabled:false,
        icon:'<path d="M6.2 8h11.6l-1 12H7.2L6.2 8Z"/><path d="M9.2 8V6.2a2.8 2.8 0 0 1 5.6 0V8"/>' },
      { key:'entrenamiento', label:'Entrenamiento', href:null, enabled:false,
        icon:'<circle cx="12" cy="12" r="8.3"/><circle cx="12" cy="12" r="4.6"/><circle cx="12" cy="12" r="1"/>' }
    ]
  },
  {
    label: 'Gestión',
    items: [
      { key:'cartera', label:'Cartera', href:null, enabled:false,
        icon:'<path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/>' },
      { key:'inventario', label:'Inventario', href:null, enabled:false,
        icon:'<path d="M21 8 12 3 3 8l9 5 9-5Z"/><path d="M3 8v9l9 5 9-5V8"/><path d="M12 13v9"/>' },
      { key:'tareas', label:'Tareas', href:null, enabled:false,
        icon:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M8 11l2.5 2.5L16 8"/>' },
      { key:'mantenimiento', label:'Mantenimiento', href:null, enabled:false,
        icon:'<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.8 2.8-2-2Z"/>' }
    ]
  },
  {
    label: 'Sistema',
    items: [
      { key:'configuracion', label:'Configuración', href:'configuracion.html', enabled:true,
        icon:'<circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3 1a7 7 0 0 0-2-1.2L14 3h-4l-.6 2.7a7 7 0 0 0-2 1.2l-2.3-1-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.3-1c.6.5 1.3.9 2 1.2L10 21h4l.6-2.7a7 7 0 0 0 2-1.2l2.3 1 2-3.4-2-1.5c.1-.4.1-.8.1-1.2Z"/>' }
    ]
  }
];

const ROLE_LABELS = { admin: 'Administrador', trabajador: 'Trabajador', cliente: 'Acudiente' };

let configuracionActual = null;

// Permite a una página (como configuracion.html) leer la configuración
// del negocio que initLayout ya cargó, sin hacer otra consulta.
export function obtenerConfiguracionActual(){
  return configuracionActual;
}

// ---------------------------------------------------------
// Caché en localStorage del último perfil y permisos conocidos,
// para poder pintar el sidebar de inmediato en la siguiente carga
// de página, sin esperar a que Supabase confirme la sesión otra
// vez. Es solo para la primera pintura ("esqueleto"): siempre se
// reemplaza por los datos reales apenas responde Supabase.
// ---------------------------------------------------------
function guardarPerfilCache(profile){
  try {
    localStorage.setItem('tc_perfil_cache', JSON.stringify({
      id: profile.id, role: profile.role,
      full_name: profile.full_name, username: profile.username
    }));
  } catch (e) { /* ignorar */ }
}

function leerPerfilCache(){
  try {
    const raw = localStorage.getItem('tc_perfil_cache');
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}

function guardarModulosCache(modulos){
  try { localStorage.setItem('tc_modulos_trabajador', JSON.stringify(modulos || [])); }
  catch (e) { /* ignorar */ }
}

function leerModulosCache(){
  try {
    const raw = localStorage.getItem('tc_modulos_trabajador');
    return raw ? JSON.parse(raw) : [];
  } catch (e) { return []; }
}

function leerConfigCacheParaEsqueleto(){
  try {
    return {
      nombre_negocio: localStorage.getItem('tc_nombre_negocio') || 'Talento Canes',
      logo_url: localStorage.getItem('tc_logo_url') || '',
      etiqueta_cliente: localStorage.getItem('tc_etiqueta_cliente') || 'Acudiente',
      etiqueta_cliente_plural: localStorage.getItem('tc_etiqueta_cliente_plural') || 'Acudientes'
    };
  } catch (e) { return null; }
}

// ---------------------------------------------------------
// Módulos asignables (todos menos Inicio y Configuración,
// que siempre están disponibles). Se usa en el panel de
// "Funciones" dentro de Editar trabajador.
// ---------------------------------------------------------
export function obtenerModulosAsignables(config){
  return NAV_GROUPS
    .flatMap(group => group.items)
    .filter(item => !CLAVES_SIEMPRE_DISPONIBLES.includes(item.key))
    .filter(item => item.key !== 'rutas') // se maneja aparte: solo se activa al añadir como conductor
    .filter(item => !item.rolesVisibles || item.rolesVisibles.includes('trabajador'))
    .map(item => ({
      key: item.key,
      label: item.key === 'clientes' ? (config?.etiqueta_cliente_plural || item.label) : item.label
    }));
}

function iniciales(nombre){
  return (nombre || '?').trim().split(/\s+/).slice(0,2).map(p => p[0]?.toUpperCase() || '').join('');
}

function renderNavItem(item, activeKey, config){
  const activeClass = item.key === activeKey ? 'active' : (item.enabled ? '' : 'disabled');
  const tag = item.enabled ? 'a' : 'div';
  const href = item.enabled ? ` href="${item.href}"` : '';
  const tagHtml = item.enabled ? '' : '<span class="tag">Próx.</span>';
  const label = item.key === 'clientes' ? (config?.etiqueta_cliente_plural || item.label) : item.label;
  return `
    <${tag} class="nav-item ${activeClass}"${href}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">${item.icon}</svg>
      ${label}
      ${tagHtml}
    </${tag}>`;
}

function renderSidebarHTML(activeKey, profile, modulosPermitidos, config){
  let todosLosItems = NAV_GROUPS.flatMap(group => group.items)
    .filter(item => !item.rolesVisibles || item.rolesVisibles.includes(profile.role));

  // Si es trabajador, se filtran por completo los módulos que el
  // admin no le haya habilitado (no se muestran en gris: desaparecen).
  if (modulosPermitidos) {
    todosLosItems = todosLosItems.filter(item =>
      CLAVES_SIEMPRE_DISPONIBLES.includes(item.key) || modulosPermitidos.includes(item.key)
    );
  }

  const itemsHtml = todosLosItems.map(item => renderNavItem(item, activeKey, config)).join('');
  const nombreNegocio = config?.nombre_negocio || 'Talento Canes';
  const logoSrc = config?.logo_url || 'logo.png';

  return `
    <div class="brand">
      <img src="${logoSrc}" alt="${nombreNegocio}" class="brand-logo">
      <div class="brand-text">
        <div class="name">${nombreNegocio}</div>
        <div class="sub">Barkly · Panel</div>
      </div>
    </div>

    <nav class="nav-groups">${itemsHtml}</nav>

    <div class="sidebar-footer">
      <div class="role-card">
        <div class="avatar-ring"><div class="avatar">${iniciales(profile.full_name || profile.username)}</div></div>
        <div class="who">
          <div class="n">${profile.full_name || profile.username}</div>
          <div class="r">${profile.role === 'cliente' ? (config?.etiqueta_cliente || 'Acudiente') : (ROLE_LABELS[profile.role] || profile.role)}</div>
        </div>
      </div>
      <button id="logoutBtn" class="logout-link">Cerrar sesión</button>
    </div>`;
}

// ---------------------------------------------------------
// Inicializa el layout completo de una página protegida:
// valida sesión/rol, pinta el sidebar, y conecta el
// comportamiento móvil (menú hamburguesa) + reloj.
// ---------------------------------------------------------
export async function initLayout({ activeKey, rolesPermitidos = null } = {}){
  // Pintura inmediata con lo último conocido (evita el sidebar en
  // blanco mientras se confirma la sesión con Supabase). Se sobrescribe
  // más abajo apenas se confirman los datos reales.
  const sidebarEl = document.getElementById('sidebar');
  const perfilCache = leerPerfilCache();
  if (perfilCache) {
    let modulosEsqueleto = null;
    if (perfilCache.role === 'trabajador') modulosEsqueleto = leerModulosCache();
    else if (perfilCache.role === 'cliente') modulosEsqueleto = CLAVES_CLIENTE;
    sidebarEl.innerHTML = renderSidebarHTML(activeKey, perfilCache, modulosEsqueleto, leerConfigCacheParaEsqueleto());
  }

  const profile = await protegerPagina({ rolesPermitidos });
  if (!profile) return null;
  guardarPerfilCache(profile);

  // Nombre, logo y paleta de colores del negocio (aplica en toda la app)
  const config = await cargarConfiguracionNegocio();
  configuracionActual = config;

  // Los trabajadores solo ven/acceden a los módulos que el admin les
  // haya habilitado (más Inicio y Configuración, siempre disponibles).
  // Los clientes ven un conjunto fijo: Inicio, Servicios, Cartera y
  // Configuración.
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
    modulosPermitidos = CLAVES_CLIENTE;
  }

  if (modulosPermitidos) {
    const tieneAcceso = CLAVES_SIEMPRE_DISPONIBLES.includes(activeKey) || modulosPermitidos.includes(activeKey);
    if (!tieneAcceso) {
      window.location.href = 'inicio.html';
      return null;
    }
  }

  // Los clientes deben completar su configuración inicial antes de
  // usar cualquier parte del panel (independientemente de si su
  // cuenta se creó por invitación o de forma manual).
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

  // Los trabajadores también deben completar su configuración
  // inicial (correo, y si aplica, cambio de contraseña temporal)
  // antes de usar el resto del panel — sin importar si su cuenta
  // se creó por invitación o de forma manual.
  if (profile.role === 'trabajador' && !trabajadorPerfilCompleto) {
    window.location.href = 'configuracion-inicial-trabajador.html';
    return null;
  }

  const sidebar = sidebarEl;
  sidebar.innerHTML = renderSidebarHTML(activeKey, profile, modulosPermitidos, config);

  document.getElementById('logoutBtn').addEventListener('click', cerrarSesion);

  const overlay = document.getElementById('sidebarOverlay');
  const menuToggle = document.getElementById('menuToggle');

  function openMenu(){ sidebar.classList.add('open'); overlay.classList.add('active'); }
  function closeMenu(){ sidebar.classList.remove('open'); overlay.classList.remove('active'); }

  menuToggle?.addEventListener('click', () => {
    sidebar.classList.contains('open') ? closeMenu() : openMenu();
  });
  overlay?.addEventListener('click', closeMenu);
  sidebar.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => { if (window.innerWidth <= 1024) closeMenu(); });
  });
  window.addEventListener('resize', () => { if (window.innerWidth > 1024) closeMenu(); });

  const clockEl = document.getElementById('clock');
  if (clockEl){
    const pad = n => n.toString().padStart(2,'0');
    const tick = () => {
      const d = new Date();
      clockEl.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    };
    setInterval(tick, 1000); tick();
  }

  return profile;
}
