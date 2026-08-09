// Este script NO es un módulo — se ejecuta de forma bloqueante,
// apenas el navegador llega a esta línea del HTML (justo después del
// <aside id="sidebar">), sin esperar a que termine de parsear el
// resto de la página. Por eso pinta el sidebar mucho antes de que
// layout.js (que sí es un módulo y se ejecuta al final) llegue a
// correr. Usa solo lo que ya está guardado en localStorage de una
// visita anterior; layout.js siempre repinta después con los datos
// reales confirmados por Supabase.
(function () {
  try {
    var CLAVES_SIEMPRE_DISPONIBLES = ['inicio', 'configuracion'];
    var CLAVES_CLIENTE = ['inicio', 'servicios', 'cartera', 'configuracion', 'mis-mascotas'];

    var NAV_ITEMS = [
      { key:'inicio', label:'Inicio', href:'inicio.html', enabled:true,
        icon:'<path d="M4 11.5 12 4l8 7.5"/><path d="M6 10v9a1 1 0 0 0 1 1h4v-6h2v6h4a1 1 0 0 0 1-1v-9"/>' },
      { key:'trabajadores', label:'Trabajadores', href:'trabajadores.html', enabled:true,
        icon:'<circle cx="12" cy="8" r="3.2"/><path d="M5 20c1-4 4-6 7-6s6 2 7 6"/>' },
      { key:'clientes', label:'Acudientes', href:'clientes.html', enabled:true,
        icon:'<circle cx="9" cy="8" r="3.1"/><path d="M3.2 20c1-4 3.4-6 5.8-6s4.8 2 5.8 6"/><path d="M15.6 11.8l1.6 1.6 3.2-3.4"/>' },
      { key:'alumnos', label:'Alumnos', href:'alumnos.html', enabled:true, rolesVisibles:['admin','trabajador'],
        icon:'<ellipse cx="12" cy="16.2" rx="4.1" ry="3.3"/><ellipse cx="6.4" cy="9" rx="1.5" ry="1.9"/><ellipse cx="10.6" cy="6.3" rx="1.5" ry="1.9"/><ellipse cx="14.4" cy="6.3" rx="1.5" ry="1.9"/><ellipse cx="18.6" cy="9" rx="1.5" ry="1.9"/>' },
      { key:'mis-mascotas', label:'Mis mascotas', href:'mis-mascotas.html', enabled:true, rolesVisibles:['cliente'],
        icon:'<ellipse cx="12" cy="16.2" rx="4.1" ry="3.3"/><ellipse cx="6.4" cy="9" rx="1.5" ry="1.9"/><ellipse cx="10.6" cy="6.3" rx="1.5" ry="1.9"/><ellipse cx="14.4" cy="6.3" rx="1.5" ry="1.9"/><ellipse cx="18.6" cy="9" rx="1.5" ry="1.9"/>' },
      { key:'rutas', label:'Rutas', href:null, enabled:false,
        icon:'<circle cx="6" cy="6.2" r="2"/><circle cx="18" cy="17.8" r="2"/><path d="M6 8.2c0 4.6 4 3.6 6 6.4s2 3.4 6 3.4" stroke-dasharray="2.4 2.4"/>' },
      { key:'servicios', label:'Servicios', href:null, enabled:false,
        icon:'<path d="M6.2 8h11.6l-1 12H7.2L6.2 8Z"/><path d="M9.2 8V6.2a2.8 2.8 0 0 1 5.6 0V8"/>' },
      { key:'entrenamiento', label:'Entrenamiento', href:null, enabled:false,
        icon:'<circle cx="12" cy="12" r="8.3"/><circle cx="12" cy="12" r="4.6"/><circle cx="12" cy="12" r="1"/>' },
      { key:'cartera', label:'Cartera', href:null, enabled:false,
        icon:'<path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/>' },
      { key:'inventario', label:'Inventario', href:null, enabled:false,
        icon:'<path d="M21 8 12 3 3 8l9 5 9-5Z"/><path d="M3 8v9l9 5 9-5V8"/><path d="M12 13v9"/>' },
      { key:'tareas', label:'Tareas', href:null, enabled:false,
        icon:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M8 11l2.5 2.5L16 8"/>' },
      { key:'mantenimiento', label:'Mantenimiento', href:null, enabled:false,
        icon:'<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.8 2.8-2-2Z"/>' },
      { key:'configuracion', label:'Configuración', href:'configuracion.html', enabled:true,
        icon:'<circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3 1a7 7 0 0 0-2-1.2L14 3h-4l-.6 2.7a7 7 0 0 0-2 1.2l-2.3-1-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.3-1c.6.5 1.3.9 2 1.2L10 21h4l.6-2.7a7 7 0 0 0 2-1.2l2.3 1 2-3.4-2-1.5c.1-.4.1-.8.1-1.2Z"/>' }
    ];

    var perfilRaw = localStorage.getItem('tc_perfil_cache');
    if (!perfilRaw) return; // sin nada guardado todavía: layout.js lo pintará cuando responda Supabase
    var perfil = JSON.parse(perfilRaw);

    var modulosPermitidos = null;
    if (perfil.role === 'trabajador') {
      var modulosRaw = localStorage.getItem('tc_modulos_trabajador');
      modulosPermitidos = modulosRaw ? JSON.parse(modulosRaw) : [];
    } else if (perfil.role === 'cliente') {
      modulosPermitidos = CLAVES_CLIENTE;
    }

    var items = NAV_ITEMS.filter(function (it) {
      return !it.rolesVisibles || it.rolesVisibles.indexOf(perfil.role) !== -1;
    });
    if (modulosPermitidos) {
      items = items.filter(function (it) {
        return CLAVES_SIEMPRE_DISPONIBLES.indexOf(it.key) !== -1 || modulosPermitidos.indexOf(it.key) !== -1;
      });
    }

    var etiquetaCliente = localStorage.getItem('tc_etiqueta_cliente') || 'Acudiente';
    var etiquetaClientePlural = localStorage.getItem('tc_etiqueta_cliente_plural') || 'Acudientes';
    var nombreNegocio = localStorage.getItem('tc_nombre_negocio') || 'Talento Canes';
    var logoUrl = localStorage.getItem('tc_logo_url') || 'logo.png';

    var scriptTag = document.currentScript;
    var activeKey = scriptTag ? (scriptTag.getAttribute('data-active') || '') : '';

    function iniciales(nombre) {
      nombre = nombre || '?';
      var partes = nombre.trim().split(/\s+/).slice(0, 2);
      var out = '';
      for (var i = 0; i < partes.length; i++) {
        if (partes[i][0]) out += partes[i][0].toUpperCase();
      }
      return out;
    }

    var itemsHtml = items.map(function (item) {
      var label = item.key === 'clientes' ? etiquetaClientePlural : item.label;
      var activeClass = item.key === activeKey ? 'active' : (item.enabled ? '' : 'disabled');
      var tag = item.enabled ? 'a' : 'div';
      var href = item.enabled ? ' href="' + item.href + '"' : '';
      var tagHtml = item.enabled ? '' : '<span class="tag">Próx.</span>';
      return '<' + tag + ' class="nav-item ' + activeClass + '"' + href + '>' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">' + item.icon + '</svg>' +
        label + tagHtml + '</' + tag + '>';
    }).join('');

    var roleLabels = { admin: 'Administrador', trabajador: 'Trabajador' };
    var roleLabel = perfil.role === 'cliente' ? etiquetaCliente : (roleLabels[perfil.role] || perfil.role);
    var nombreMostrado = perfil.full_name || perfil.username || '';

    var sidebar = document.getElementById('sidebar');
    if (sidebar) {
      sidebar.innerHTML =
        '<div class="brand"><img src="' + logoUrl + '" alt="' + nombreNegocio + '" class="brand-logo">' +
        '<div class="brand-text"><div class="name">' + nombreNegocio + '</div><div class="sub">Barkly · Panel</div></div></div>' +
        '<nav class="nav-groups">' + itemsHtml + '</nav>' +
        '<div class="sidebar-footer"><div class="role-card">' +
        '<div class="avatar-ring"><div class="avatar">' + iniciales(nombreMostrado) + '</div></div>' +
        '<div class="who"><div class="n">' + nombreMostrado + '</div><div class="r">' + roleLabel + '</div></div></div>' +
        '<button id="logoutBtn" class="logout-link">Cerrar sesión</button></div>';
    }
  } catch (e) { /* si algo falla, layout.js lo corrige igual apenas responda Supabase */ }
})();
