/* ============================================================================
   BARKLY · shell-inline.js
   Script clásico y bloqueante. Va justo después de <body>, antes de layout.js.

   Reemplaza a sidebar-inline.js y absorbe la definición del menú que antes
   estaba duplicada en layout.js. Ahora vive en un solo sitio.

   Hace dos cosas:
     1. Pinta el armazón de inmediato con el perfil que quedó cacheado, para
        que no haya un instante de pantalla vacía al navegar entre páginas.
     2. Expone window.BarklyShell para que layout.js lo repinte con los datos
        confirmados por Supabase.

   El armazón es distinto según el ancho:
     · Escritorio → barra lateral con todo el menú.
     · Móvil      → barra superior con el título, y abajo cinco pestañas
                    (Inicio, tres módulos y "Más").

   Configuración por página, en el propio <script>:
     data-active="alumnos"   clave del módulo actual
     data-title="Alumnos"    título que se ve en la barra superior de móvil
   ========================================================================== */
(function () {
  'use strict';

  var script = document.currentScript;
  var ACTIVE = script ? (script.getAttribute('data-active') || '') : '';
  var TITULO = script ? (script.getAttribute('data-title') || '') : '';

  /* ---------------------------------------------------------
     Los 12 módulos. `enabled:false` = todavía sin página.
     --------------------------------------------------------- */
  var ICONOS = {
    inicio:        '<path d="M4 11.5 12 4l8 7.5"/><path d="M6 10v9a1 1 0 0 0 1 1h4v-6h2v6h4a1 1 0 0 0 1-1v-9"/>',
    trabajadores:  '<circle cx="12" cy="8" r="3.2"/><path d="M5 20c1-4 4-6 7-6s6 2 7 6"/>',
    clientes:      '<circle cx="9" cy="8" r="3.1"/><path d="M3.2 20c1-4 3.4-6 5.8-6s4.8 2 5.8 6"/><path d="M15.6 11.8l1.6 1.6 3.2-3.4"/>',
    alumnos:       '<ellipse cx="12" cy="16.2" rx="4.1" ry="3.3"/><ellipse cx="6.4" cy="9" rx="1.5" ry="1.9"/><ellipse cx="10.6" cy="6.3" rx="1.5" ry="1.9"/><ellipse cx="14.4" cy="6.3" rx="1.5" ry="1.9"/><ellipse cx="18.6" cy="9" rx="1.5" ry="1.9"/>',
    'mis-mascotas':'<ellipse cx="12" cy="16.2" rx="4.1" ry="3.3"/><ellipse cx="6.4" cy="9" rx="1.5" ry="1.9"/><ellipse cx="10.6" cy="6.3" rx="1.5" ry="1.9"/><ellipse cx="14.4" cy="6.3" rx="1.5" ry="1.9"/><ellipse cx="18.6" cy="9" rx="1.5" ry="1.9"/>',
    rutas:         '<circle cx="6" cy="6.2" r="2"/><circle cx="18" cy="17.8" r="2"/><path d="M6 8.2c0 4.6 4 3.6 6 6.4s2 3.4 6 3.4" stroke-dasharray="2.4 2.4"/>',
    servicios:     '<path d="M6.2 8h11.6l-1 12H7.2L6.2 8Z"/><path d="M9.2 8V6.2a2.8 2.8 0 0 1 5.6 0V8"/>',
    entrenamiento: '<circle cx="12" cy="12" r="8.3"/><circle cx="12" cy="12" r="4.6"/><circle cx="12" cy="12" r="1"/>',
    cartera:       '<path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/>',
    inventario:    '<path d="M21 8 12 3 3 8l9 5 9-5Z"/><path d="M3 8v9l9 5 9-5V8"/><path d="M12 13v9"/>',
    tareas:        '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M8 11l2.5 2.5L16 8"/>',
    mantenimiento: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.8 2.8-2-2Z"/>',
    configuracion: '<circle cx="12" cy="12" r="3"/><path d="M19.4 13.5a7.6 7.6 0 0 0 0-3l2-1.5-2-3.4-2.3 1a7.6 7.6 0 0 0-2.6-1.5L14 2h-4l-.5 2.6a7.6 7.6 0 0 0-2.6 1.5l-2.3-1-2 3.4 2 1.5a7.6 7.6 0 0 0 0 3l-2 1.5 2 3.4 2.3-1a7.6 7.6 0 0 0 2.6 1.5L10 22h4l.5-2.6a7.6 7.6 0 0 0 2.6-1.5l2.3 1 2-3.4Z"/>',
    mas:           '<circle cx="5" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="19" cy="12" r="1.7"/>',
    apariencia:    '<circle cx="12" cy="12" r="4.2"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'
  };

  var GRUPOS = [
    { label:'General', items:[
      { key:'inicio', label:'Inicio', href:'inicio.html', enabled:true }
    ]},
    { label:'Comunidad', items:[
      { key:'trabajadores', label:'Trabajadores', href:'trabajadores.html', enabled:true },
      { key:'clientes',     label:'Acudientes',   href:'clientes.html',     enabled:true },
      { key:'alumnos',      label:'Alumnos',      href:'alumnos.html',      enabled:true, roles:['admin','trabajador'] },
      { key:'mis-mascotas', label:'Mis mascotas', href:'mis-mascotas.html', enabled:true, roles:['cliente'] }
    ]},
    { label:'Operación', items:[
      { key:'rutas',         label:'Rutas',         href:'rutas.html',  enabled:true },
      { key:'servicios',     label:'Tienda',        href:'tienda.html', enabled:true },
      { key:'entrenamiento', label:'Entrenamiento', href:null,          enabled:false }
    ]},
    { label:'Gestión', items:[
      { key:'cartera',       label:'Cartera',       href:'cartera.html', enabled:true },
      { key:'inventario',    label:'Inventario',    href:null,           enabled:false },
      { key:'tareas',        label:'Tareas',        href:null,           enabled:false },
      { key:'mantenimiento', label:'Mantenimiento', href:null,           enabled:false }
    ]},
    { label:'Sistema', items:[
      { key:'configuracion', label:'Configuración', href:'configuracion.html', enabled:true }
    ]}
  ];

  /* Orden en que compiten los módulos por las tres ranuras del medio
     de la barra inferior. Inicio siempre va primero y "Más" siempre
     último, así que aquí solo se listan los del medio.
     Es distinto por rol a propósito: para el conductor, Rutas es lo
     que abre todo el día; para el administrador, Rutas se consulta
     de vez en cuando y Tienda trae las solicitudes de compra. */
  var PRIORIDAD_TABS = {
    admin:      ['alumnos', 'servicios', 'cartera'],
    cliente:    ['mis-mascotas', 'servicios', 'cartera'],
    trabajador: ['alumnos', 'rutas', 'servicios', 'cartera', 'clientes', 'trabajadores']
  };

  var ETIQUETAS_ROL = { admin:'Administrador', trabajador:'Trabajador', cliente:'Acudiente' };
  var SIEMPRE = ['inicio', 'configuracion'];
  var MODULOS_CLIENTE = ['inicio', 'servicios', 'cartera', 'configuracion', 'mis-mascotas'];

  /* Contadores pendientes, por clave de módulo. layout.js los llena
     cuando confirma los datos; aquí solo se pintan. */
  var badges = {};

  /* ---------------------------------------------------------
     Ayudas
     --------------------------------------------------------- */
  function esc(t){
    return String(t == null ? '' : t).replace(/[&<>"]/g, function(c){
      return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c];
    });
  }

  function iniciales(nombre){
    var partes = String(nombre || '?').trim().split(/\s+/).filter(Boolean);
    if (!partes.length) return '?';
    return partes.slice(0, 2).map(function(p){ return p[0].toUpperCase(); }).join('');
  }

  function svg(key, extra){
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"' +
           (extra || '') + '>' + (ICONOS[key] || '') + '</svg>';
  }

  function leerCache(clave, porDefecto){
    try { return localStorage.getItem(clave) || porDefecto; }
    catch (e) { return porDefecto; }
  }

  function perfilCache(){
    try { return JSON.parse(localStorage.getItem('tc_perfil_cache') || 'null'); }
    catch (e) { return null; }
  }

  function modulosCache(){
    try { return JSON.parse(localStorage.getItem('tc_modulos_trabajador') || '[]'); }
    catch (e) { return []; }
  }

  function configCache(){
    return {
      nombre_negocio: leerCache('tc_nombre_negocio', 'Talento Canes'),
      logo_url: leerCache('tc_logo_url', ''),
      etiqueta_cliente: leerCache('tc_etiqueta_cliente', 'Acudiente'),
      etiqueta_cliente_plural: leerCache('tc_etiqueta_cliente_plural', 'Acudientes')
    };
  }

  /* Nombre del módulo, respetando la terminología configurable. */
  function etiqueta(item, config){
    if (item.key === 'clientes') return config.etiqueta_cliente_plural || item.label;
    return item.label;
  }

  /* Módulos que esta persona puede abrir, ya aplanados y filtrados. */
  function modulosVisibles(perfil, permitidos, config){
    var lista = [];
    GRUPOS.forEach(function(g){
      g.items.forEach(function(it){
        if (it.roles && it.roles.indexOf(perfil.role) === -1) return;
        if (permitidos && SIEMPRE.indexOf(it.key) === -1 && permitidos.indexOf(it.key) === -1) return;
        lista.push({ grupo:g.label, item:it, label:etiqueta(it, config) });
      });
    });
    return lista;
  }

  /* ---------------------------------------------------------
     Barra lateral (escritorio)
     --------------------------------------------------------- */
  function pintarSidebar(perfil, permitidos, config){
    var el = document.getElementById('sidebar');
    if (!el) return;

    var visibles = modulosVisibles(perfil, permitidos, config);
    var html = '';

    html += '<div class="brand">' +
              (config.logo_url
                ? '<img class="brand-logo" src="' + esc(config.logo_url) + '" alt="">'
                : '<div class="brand-logo" style="background:var(--acento);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px">' +
                  esc(iniciales(config.nombre_negocio)) + '</div>') +
              '<div class="brand-text">' +
                '<div class="name">' + esc(config.nombre_negocio) + '</div>' +
                '<div class="sub">Barkly</div>' +
              '</div>' +
            '</div>';

    html += '<nav class="nav-groups">';
    var grupoActual = null;
    visibles.forEach(function(v){
      if (v.grupo !== grupoActual) {
        grupoActual = v.grupo;
        html += '<div class="nav-label">' + esc(v.grupo) + '</div>';
      }
      var it = v.item;
      var clases = 'nav-item' + (it.key === ACTIVE ? ' active' : (it.enabled ? '' : ' disabled'));
      var tag = it.enabled ? 'a' : 'div';
      var href = it.enabled ? ' href="' + it.href + '"' : '';
      var cuenta = badges[it.key] ? '<span class="count" style="margin-left:auto">' + badges[it.key] + '</span>' : '';
      var proximo = it.enabled ? '' : '<span class="tag">Próx.</span>';
      html += '<' + tag + ' class="' + clases + '"' + href + '>' +
                svg(it.key) + '<span>' + esc(v.label) + '</span>' + cuenta + proximo +
              '</' + tag + '>';
    });
    html += '</nav>';

    html += '<div class="sidebar-footer">' +
              '<div class="role-card">' +
                '<div class="avatar-ring"><div class="avatar">' + esc(iniciales(perfil.full_name || perfil.username)) + '</div></div>' +
                '<div class="who">' +
                  '<div class="n">' + esc(perfil.full_name || perfil.username) + '</div>' +
                  '<div class="r">' + esc(perfil.role === 'cliente'
                      ? (config.etiqueta_cliente || 'Acudiente')
                      : (ETIQUETAS_ROL[perfil.role] || perfil.role)) + '</div>' +
                '</div>' +
              '</div>' +
              modoSelector(true) +
              '<button id="logoutBtn" class="logout-link">Cerrar sesión</button>' +
            '</div>';

    el.innerHTML = html;
  }

  /* Selector de apariencia. En la barra lateral no cabe el texto, así
     que van solo los tres iconos; en la hoja de "Más" sí caben. */
  function modoSelector(soloIconos){
    // Solo dos modos, y el predeterminado es claro.
    var guardado = leerCache('tc_modo', 'light');
    var modo = (guardado === 'dark') ? 'dark' : 'light';
    var opciones = [
      ['light', 'Claro',  '<circle cx="12" cy="12" r="4.2"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'],
      ['dark',  'Oscuro', '<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z"/>']
    ];

    var botones = opciones.map(function(o){
      var activo = modo === o[0];
      return '<button type="button" data-modo="' + o[0] + '" aria-pressed="' + activo + '"' +
             ' title="' + o[1] + '" aria-label="Apariencia: ' + o[1] + '">' +
             (soloIconos
               ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">' + o[2] + '</svg>'
               : o[1]) +
             '</button>';
    }).join('');

    if (soloIconos) {
      return '<div class="modo-row">' +
               '<span class="modo-label">Apariencia</span>' +
               '<div class="segmented segmented-iconos">' + botones + '</div>' +
             '</div>';
    }
    return '<div class="segmented">' + botones + '</div>';
  }

  /* ---------------------------------------------------------
     Barra superior (móvil)
     --------------------------------------------------------- */
  function pintarAppbar(perfil, config){
    var el = document.getElementById('appbar');
    if (!el) return;

    var titulo = TITULO || (function(){
      var encontrado = null;
      GRUPOS.forEach(function(g){
        g.items.forEach(function(it){ if (it.key === ACTIVE) encontrado = etiqueta(it, config); });
      });
      return encontrado || config.nombre_negocio;
    })();

    el.innerHTML =
      (config.logo_url
        ? '<img class="appbar-logo" src="' + esc(config.logo_url) + '" alt="">'
        : '<div class="appbar-logo" style="background:var(--acento);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:12px">' +
          esc(iniciales(config.nombre_negocio)) + '</div>') +
      '<div class="appbar-title">' + esc(titulo) + '</div>' +
      '<div id="appbarAcciones" style="display:flex"></div>';
  }

  /* ---------------------------------------------------------
     Barra de pestañas (móvil)
     Inicio · tres módulos por prioridad · Más
     --------------------------------------------------------- */
  function tabsDe(perfil, permitidos, config){
    var visibles = modulosVisibles(perfil, permitidos, config);
    var porClave = {};
    visibles.forEach(function(v){ porClave[v.item.key] = v; });

    var tabs = [];
    if (porClave['inicio']) tabs.push(porClave['inicio']);

    var prioridad = PRIORIDAD_TABS[perfil.role] || PRIORIDAD_TABS.trabajador;
    prioridad.forEach(function(k){
      if (tabs.length >= 4) return;
      if (porClave[k] && porClave[k].item.enabled && k !== 'inicio') tabs.push(porClave[k]);
    });

    return tabs;
  }

  function pintarTabbar(perfil, permitidos, config){
    var el = document.getElementById('tabbar');
    if (!el) return;

    var tabs = tabsDe(perfil, permitidos, config);
    var clavesEnBarra = tabs.map(function(t){ return t.item.key; });

    // Si un módulo escondido tiene pendientes, el aviso sube a "Más":
    // esconder un módulo no puede significar esconder sus avisos.
    var hayPendienteOculto = Object.keys(badges).some(function(k){
      return badges[k] > 0 && clavesEnBarra.indexOf(k) === -1;
    });

    var html = '<div class="tabbar-inner">';
    tabs.forEach(function(t){
      var it = t.item;
      var activo = it.key === ACTIVE ? ' active' : '';
      var punto = badges[it.key] ? '<span class="dot-alert"></span>' : '';
      html += '<a class="tab' + activo + '" href="' + it.href + '">' +
                svg(it.key) + '<span>' + esc(t.label) + '</span>' + punto +
              '</a>';
    });
    html += '<button class="tab" id="tabMas" type="button">' + svg('mas') + '<span>Más</span>' +
            (hayPendienteOculto ? '<span class="dot-alert"></span>' : '') + '</button>';
    html += '</div>';

    el.innerHTML = html;
  }

  /* ---------------------------------------------------------
     Hoja "Más"
     Es un lanzador, no una pantalla: sube sobre lo que estabas
     viendo y se cierra deslizando. Contiene lo que no cupo en la
     barra, más la cuenta, la apariencia y cerrar sesión.
     --------------------------------------------------------- */
  function pintarHojaMas(perfil, permitidos, config){
    var el = document.getElementById('sheetMas');
    if (!el) return;

    var enBarra = tabsDe(perfil, permitidos, config).map(function(t){ return t.item.key; });
    var restantes = modulosVisibles(perfil, permitidos, config).filter(function(v){
      // Los que están en "Próx." no se muestran en móvil: cuatro filas
      // muertas en un lanzador son ruido, no información.
      return v.item.enabled && enBarra.indexOf(v.item.key) === -1;
    });

    var html = '';

    html += '<div class="dialog-grip"></div>';
    html += '<div class="dialog-body" style="padding-top:8px">';

    html += '<a class="list-row" href="configuracion.html#mi-cuenta" style="border-radius:var(--r-md);background:var(--surface-2);border-bottom:none;margin-bottom:var(--s-4);color:inherit">' +
              '<div class="avatar" style="background:var(--acento)">' + esc(iniciales(perfil.full_name || perfil.username)) + '</div>' +
              '<div class="list-main">' +
                '<div class="list-title">' + esc(perfil.full_name || perfil.username) + '</div>' +
                '<div class="list-meta">' + esc(perfil.role === 'cliente'
                    ? (config.etiqueta_cliente || 'Acudiente')
                    : (ETIQUETAS_ROL[perfil.role] || perfil.role)) + '</div>' +
              '</div>' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:17px;height:17px;color:var(--text-3)"><path d="m9 6 6 6-6 6"/></svg>' +
            '</a>';

    var grupoActual = null;
    restantes.forEach(function(v){
      if (v.grupo !== grupoActual) {
        grupoActual = v.grupo;
        html += '<div style="font-size:var(--t-xs);font-weight:600;color:var(--text-3);margin:var(--s-4) 0 4px">' + esc(v.grupo) + '</div>';
      }
      var cuenta = badges[v.item.key] ? '<span class="count">' + badges[v.item.key] + '</span>' : '';
      html += '<a class="action-item" href="' + v.item.href + '" style="color:inherit">' +
                svg(v.item.key) + '<span style="flex:1">' + esc(v.label) + '</span>' + cuenta +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:17px;height:17px;color:var(--text-3)"><path d="m9 6 6 6-6 6"/></svg>' +
              '</a>';
    });

    html += '<div class="action-item" style="border-top:1px solid var(--border); margin-top:var(--s-3)">' +
              svg('apariencia') + '<span style="flex:1">Apariencia</span>' +
              modoSelector(false) +
            '</div>';

    html += '</div>';
    html += '<div class="dialog-foot"><button class="logout-link" id="logoutBtnMas">Cerrar sesión</button></div>';

    // Si la hoja está abierta cuando llegan los contadores, repintarla
    // no debe cerrarla: se conserva el estado de apertura.
    var abierta = el.classList.contains('open');
    el.className = 'dialog action-sheet' + (abierta ? ' open' : '');
    el.innerHTML = html;
  }

  /* ---------------------------------------------------------
     Contenedores.
     El armazón se crea a sí mismo, así este script puede ir de
     primero dentro de <body> y pintar antes de que el navegador
     termine de leer la página. Si va al final, entre página y
     página se ve un parpadeo sin menú.
     Las páginas solo necesitan tener su <main>.
     --------------------------------------------------------- */
  function asegurarContenedores(){
    const piezas = [
      ['sidebar',  'aside',  'sidebar'],
      ['appbar',   'header', 'appbar'],
      ['tabbar',   'nav',    'tabbar'],
      ['scrim',    'div',    'scrim'],
      ['sheetMas', 'div',    'dialog']
    ];
    piezas.forEach(function(p){
      if (document.getElementById(p[0])) return;
      var el = document.createElement(p[1]);
      el.id = p[0];
      el.className = p[2];
      document.body.appendChild(el);
    });

    if (!document.getElementById('cargando')) {
      var carga = document.createElement('div');
      carga.id = 'cargando';
      carga.className = 'cargando-overlay';
      carga.innerHTML = '<div class="spinner"></div>';
      document.body.appendChild(carga);
    }
  }

  /* ---------------------------------------------------------
     Indicador de carga entre páginas.

     Cubre solo el contenido: la barra lateral, la superior y las
     pestañas quedan por encima y nítidas, para que se siga viendo
     dónde estás mientras carga.

     Detalle importante: aquí cada navegación es una página nueva, y
     el navegador empieza a descargarla de inmediato. Si se muestra el
     indicador y se deja seguir el clic, no da tiempo a pintarse y no
     se ve nada. Por eso se detiene el clic, se pinta, y se navega en
     el siguiente fotograma.
     --------------------------------------------------------- */
  function mostrarCarga(){
    var el = document.getElementById('cargando');
    if (el) el.classList.add('on');
  }

  function ocultarCarga(){
    var el = document.getElementById('cargando');
    if (el) el.classList.remove('on');
  }

  function navegarCon(url){
    mostrarCarga();
    // Un fotograma para que el indicador llegue a pintarse, y otro
    // margen mínimo para que la animación arranque antes de la descarga.
    requestAnimationFrame(function(){
      setTimeout(function(){ window.location.href = url; }, 40);
    });
  }

  document.addEventListener('click', function(e){
    // Solo navegaciones normales dentro del sitio: ni pestaña nueva,
    // ni anclas, ni descargas, ni clics con Ctrl o Cmd.
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var enlace = e.target.closest ? e.target.closest('a[href]') : null;
    if (!enlace) return;
    if (enlace.target && enlace.target !== '_self') return;
    if (enlace.hasAttribute('download')) return;
    var href = enlace.getAttribute('href');
    if (!href || href.charAt(0) === '#' || href.indexOf('javascript:') === 0) return;
    if (enlace.origin && enlace.origin !== window.location.origin) return;
    if (enlace.pathname === window.location.pathname && enlace.search === window.location.search) return;

    e.preventDefault();
    navegarCon(enlace.href);
  });

  // Al volver con el botón atrás la página puede restaurarse tal cual
  // estaba, con el indicador encendido: hay que apagarlo.
  window.addEventListener('pageshow', ocultarCarga);

  /* ---------------------------------------------------------
     API pública
     --------------------------------------------------------- */
  var estadoActual = null;

  function pintarTodo(perfil, permitidos, config){
    if (!perfil) return;
    estadoActual = { perfil: perfil, permitidos: permitidos, config: config };
    asegurarContenedores();
    pintarSidebar(perfil, permitidos, config);
    pintarAppbar(perfil, config);
    pintarTabbar(perfil, permitidos, config);
    pintarHojaMas(perfil, permitidos, config);
  }

  window.BarklyShell = {
    ACTIVE: ACTIVE,
    GRUPOS: GRUPOS,
    SIEMPRE: SIEMPRE,
    MODULOS_CLIENTE: MODULOS_CLIENTE,
    etiqueta: etiqueta,
    iniciales: iniciales,

    pintar: pintarTodo,

    /* Las páginas que navegan desde código llaman a esto para que el
       indicador también aparezca ahí. */
    navegar: navegarCon,
    cargando: mostrarCarga,
    finCarga: ocultarCarga,

    /* Perfil, permisos y configuración con los que se pintó el armazón.
       Las páginas lo reutilizan en vez de volver a consultarlos. */
    estado: function(){ return estadoActual; },

    /* Módulos que esta persona puede abrir de verdad (con página propia). */
    disponibles: function(){
      if (!estadoActual) return [];
      return modulosVisibles(estadoActual.perfil, estadoActual.permitidos, estadoActual.config)
        .filter(function(v){ return v.item.enabled; })
        .map(function(v){
          return { key:v.item.key, label:v.label, href:v.item.href, grupo:v.grupo,
                   icono:svg(v.item.key), badge:badges[v.item.key] || 0 };
        });
    },

    /* layout.js llama a esto cuando ya sabe cuántos pendientes hay.
       Repintar es barato y evita que el número aparezca de golpe. */
    setBadges: function(nuevos, perfil, permitidos, config){
      badges = nuevos || {};
      pintarTodo(perfil, permitidos, config);
    },

    /* Los módulos asignables a un trabajador (todos menos los que
       siempre están disponibles y menos Rutas, que se concede al
       añadir a alguien como conductor). */
    modulosAsignables: function(config){
      var salida = [];
      GRUPOS.forEach(function(g){
        g.items.forEach(function(it){
          if (SIEMPRE.indexOf(it.key) !== -1) return;
          if (it.key === 'rutas') return;
          if (it.roles && it.roles.indexOf('trabajador') === -1) return;
          salida.push({ key: it.key, label: etiqueta(it, config || configCache()) });
        });
      });
      return salida;
    }
  };

  /* ---------------------------------------------------------
     Primer pintado, con lo último que se sabe.
     Se reemplaza en cuanto Supabase confirma.
     --------------------------------------------------------- */
  var cache = perfilCache();
  if (cache) {
    var permitidos = null;
    if (cache.role === 'trabajador') permitidos = modulosCache();
    else if (cache.role === 'cliente') permitidos = MODULOS_CLIENTE;
    pintarTodo(cache, permitidos, configCache());
  }
})();
