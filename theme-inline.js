/* ============================================================================
   BARKLY · theme-inline.js
   Script clásico y bloqueante. Va en el <head> de cada página, ANTES de
   cualquier hoja de estilo o módulo.

   Su único trabajo es poner los atributos data-paleta y data-theme en
   <html> antes del primer pintado, leyendo lo último que se guardó.
   Sin esto, la página aparece un instante en claro y con la paleta por
   defecto, y luego salta — es el parpadeo que ya arreglamos una vez y
   que volvería con el modo oscuro.

   Solo hay dos modos, claro y oscuro, y el predeterminado es claro.
   Las cuentas que quedaron guardadas en el antiguo 'auto' pasan a claro.

   No importa nada ni depende de nada: si falla, la app arranca en claro
   con la paleta azul, que es un estado válido.
   ========================================================================== */
(function () {
  var html = document.documentElement;

  var paleta = 'azul-original';
  var modo = 'light';

  try {
    paleta = localStorage.getItem('tc_paleta') || paleta;
    var guardado = localStorage.getItem('tc_modo');
    if (guardado === 'light' || guardado === 'dark') modo = guardado;
  } catch (e) { /* navegación privada o almacenamiento bloqueado */ }

  html.setAttribute('data-paleta', paleta);
  html.setAttribute('data-theme', modo);
})();
