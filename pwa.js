/* ============================================================================
   BARKLY · pwa.js

   El manifest.json del sitio es un archivo fijo, pero el logo lo cambia el
   colegio desde Configuración. Este módulo reconstruye el manifiesto en
   memoria con el logo y el nombre reales, y lo enchufa en la página.

   Con eso, cuando alguien instala la app, el icono que queda en su pantalla
   de inicio es el del colegio, no uno genérico.

   Dos límites del sistema operativo que conviene tener claros:

     · El icono se congela al instalar. Si el colegio cambia el logo después,
       quien ya la tenía instalada sigue viendo el anterior hasta que la
       reinstale. No hay forma de forzarlo desde la web.

     · El logo debe ser cuadrado y de 512 px o más. Si es alargado, el
       teléfono lo deforma o lo recorta. Conviene decírselo al admin en
       la propia pantalla de Configuración.

   El manifest.json de la raíz se queda como respaldo, para el momento
   anterior a que responda Supabase.
   ========================================================================== */

const RESPALDO = '/icons/icon-512.png';

function tipoDeImagen(url){
  const limpia = String(url || '').split('?')[0].toLowerCase();
  if (limpia.endsWith('.png'))  return 'image/png';
  if (limpia.endsWith('.webp')) return 'image/webp';
  if (limpia.endsWith('.svg'))  return 'image/svg+xml';
  return 'image/jpeg';
}

function variable(nombre, porDefecto){
  const v = getComputedStyle(document.documentElement).getPropertyValue(nombre).trim();
  return v || porDefecto;
}

/**
 * Reconstruye el manifiesto con la identidad del colegio.
 * Se llama desde theme.js en cuanto llega la configuración.
 */
export function aplicarIdentidadPWA(config){
  try {
    const nombre = config?.nombre_negocio || 'Talento Canes';
    const logo = config?.logo_url || RESPALDO;
    const tipo = tipoDeImagen(logo);

    // Las rutas del manifiesto deben ser absolutas: al construirlo como
    // blob, las relativas se resolverían contra blob: y no contra el sitio.
    const raiz = window.location.origin;

    const manifiesto = {
      name: `${nombre} · Barkly`,
      short_name: nombre.length > 12 ? 'Barkly' : nombre,
      description: 'Panel de gestión del colegio canino: alumnos, acudientes, tienda y cartera.',
      start_url: raiz + '/inicio.html',
      scope: raiz + '/',
      display: 'standalone',
      orientation: 'portrait',
      lang: 'es-CO',
      background_color: variable('--bg', '#F5F6F8'),
      theme_color: variable('--surface', '#FFFFFF'),
      icons: [
        { src: logo, sizes: '192x192', type: tipo, purpose: 'any' },
        { src: logo, sizes: '512x512', type: tipo, purpose: 'any' },
        { src: raiz + '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
      ],
      shortcuts: [
        { name: 'Alumnos', url: raiz + '/alumnos.html' },
        { name: 'Tienda',  url: raiz + '/tienda.html' },
        { name: 'Cartera', url: raiz + '/cartera.html' }
      ]
    };

    const blob = new Blob([JSON.stringify(manifiesto)], { type: 'application/manifest+json' });
    const url = URL.createObjectURL(blob);

    let link = document.querySelector('link[rel="manifest"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'manifest';
      document.head.appendChild(link);
    }
    // Se libera el blob anterior si esta página ya había generado uno.
    if (link.dataset.blob) URL.revokeObjectURL(link.href);
    link.href = url;
    link.dataset.blob = '1';

    // iOS no usa el manifiesto para el icono: usa apple-touch-icon.
    let apple = document.querySelector('link[rel="apple-touch-icon"]');
    if (!apple) {
      apple = document.createElement('link');
      apple.rel = 'apple-touch-icon';
      document.head.appendChild(apple);
    }
    apple.href = logo;

    let titulo = document.querySelector('meta[name="apple-mobile-web-app-title"]');
    if (!titulo) {
      titulo = document.createElement('meta');
      titulo.name = 'apple-mobile-web-app-title';
      document.head.appendChild(titulo);
    }
    titulo.content = nombre.length > 12 ? 'Barkly' : nombre;

  } catch (e) {
    // Si algo falla se queda el manifest.json fijo de la raíz, que es
    // un estado válido: la app se instala, solo que con el icono base.
    console.warn('No se pudo generar el manifiesto dinámico:', e);
  }
}
