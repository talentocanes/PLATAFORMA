/* ============================================================================
   BARKLY · theme-inline.js
   Script clásico y bloqueante. Va en el <head> de cada página, ANTES de
   cualquier hoja de estilo o módulo.

   Su único trabajo es poner los atributos data-paleta y data-theme en
   <html> antes del primer pintado, leyendo lo último que se guardó.
   Sin esto, la página aparece un instante en claro y con la paleta por
   defecto, y luego salta — es el parpadeo que ya arreglamos una vez y
   que volvería con el modo oscuro.

   No importa nada ni depende de nada: si falla, la app arranca en
   claro con la paleta azul, que es un estado válido.
   ========================================================================== */
(function () {
  var html = document.documentElement;

  var paleta = 'azul-original';
  var modo = 'auto';

  try {
    paleta = localStorage.getItem('tc_paleta') || paleta;
    modo   = localStorage.getItem('tc_modo')   || modo;
  } catch (e) { /* navegación privada o almacenamiento bloqueado */ }

  var efectivo = modo;
  if (modo !== 'light' && modo !== 'dark') {
    efectivo = window.matchMedia &&
               window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark' : 'light';
  }

  html.setAttribute('data-paleta', paleta);
  html.setAttribute('data-theme', efectivo);
})();
