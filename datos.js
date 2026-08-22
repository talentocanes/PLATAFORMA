/* ============================================================================
   BARKLY · datos.js

   Hace que volver a una pantalla ya visitada sea instantáneo.

   La idea: cuando una lista se carga, su resultado se guarda. Al volver a
   esa pantalla, se pinta de inmediato lo guardado —sin esperar al servidor
   ni mostrar indicador de carga— y en paralelo se vuelve a consultar. Si
   algo cambió, se repinta sin que se note.

   Es lo que hace que una aplicación se sienta fluida: casi siempre lo que
   guardaste sigue siendo válido, así que la espera desaparece; y cuando no
   lo es, se corrige sola en menos de un segundo.

   Se guarda en sessionStorage a propósito, no en localStorage: dura
   mientras la pestaña esté abierta y se borra al cerrarla. Así nadie
   arrastra datos de ayer, y en un equipo compartido no queda nada.

   Qué NO conviene guardar aquí: nada que deba ser exacto en el instante
   en que se lee. Los saldos y las listas están bien —se corrigen solos en
   un parpadeo—; un comprobante de pago recién subido, no.
   ========================================================================== */

const PREFIJO = 'tc_datos_';

function leer(clave){
  try {
    const bruto = sessionStorage.getItem(PREFIJO + clave);
    return bruto ? JSON.parse(bruto) : null;
  } catch (e) { return null; }
}

function guardar(clave, datos){
  try {
    sessionStorage.setItem(PREFIJO + clave, JSON.stringify(datos));
  } catch (e) { /* sin espacio o almacenamiento bloqueado: da igual */ }
}

/**
 * Pinta lo guardado, ya. Sin esperar a nada.
 *
 * Se llama al principio del script de la página, ANTES de validar la
 * sesión y de cargar la configuración. Esas dos cosas son consultas al
 * servidor, y esperarlas para pintar es lo que hace que volver a una
 * pantalla se sienta lento aunque los datos ya estuvieran guardados.
 *
 * También apaga el indicador de carga: si ya hay contenido en pantalla,
 * seguir tapándola no tiene sentido.
 *
 * @returns {boolean} true si había algo guardado y se pintó.
 */
export function pintarCache(clave, pintar){
  const guardado = leer(clave);
  if (guardado === null) return false;
  try {
    pintar(guardado);
    window.BarklyShell?.listo?.();
    return true;
  } catch (e) {
    console.warn('No se pudo pintar desde el caché:', e);
    return false;
  }
}

/* Valores pequeños que sobreviven al cierre de la pestaña: sirven para
   pintar bien desde el primer instante, antes de confirmar la sesión.
   Solo para cosas no sensibles, como si esta persona puede editar. */
export function recordar(clave, valor){
  try { localStorage.setItem('tc_pref_' + clave, JSON.stringify(valor)); }
  catch (e) { /* ignorar */ }
}

export function recordado(clave, porDefecto = null){
  try {
    const bruto = localStorage.getItem('tc_pref_' + clave);
    return bruto ? JSON.parse(bruto) : porDefecto;
  } catch (e) { return porDefecto; }
}

/**
 * Pinta lo guardado al instante (si lo hay) y luego consulta y repinta.
 *
 * @param {string}   clave    Identificador de esta consulta, único por pantalla.
 * @param {Function} consulta Función asíncrona que devuelve los datos frescos.
 * @param {Function} pintar   Función que recibe los datos y los muestra.
 * @returns {Promise<boolean>} true si se llegó a pintar algo guardado.
 */
export async function conCache(clave, consulta, pintar){
  const guardado = leer(clave);
  let pintadoDeCache = false;

  if (guardado !== null) {
    try {
      pintar(guardado);
      pintadoDeCache = true;
      // Hay contenido en pantalla: el indicador ya no pinta nada.
      window.BarklyShell?.listo?.();
    } catch (e) { console.warn('No se pudo pintar desde el caché:', e); }
  }

  const frescos = await consulta();
  if (frescos !== null && frescos !== undefined) {
    guardar(clave, frescos);
    // Si lo guardado ya era idéntico, no se repinta: evita el parpadeo
    // de las listas y no se pierde la posición del desplazamiento.
    if (JSON.stringify(frescos) !== JSON.stringify(guardado)) {
      pintar(frescos);
    }
  }

  return pintadoDeCache;
}

/**
 * Guarda un trozo de HTML ya pintado, para volver a ponerlo tal cual en
 * la siguiente visita. Es lo más rápido posible: no hay que recalcular
 * nada, solo devolverlo a su sitio.
 */
export function guardarHtml(clave, html){
  guardar(clave, html);
}

/** Borra lo guardado de una pantalla. Se usa tras crear, editar o borrar. */
export function invalidar(clave){
  try { sessionStorage.removeItem(PREFIJO + clave); } catch (e) { /* ignorar */ }
}

/** Borra todo lo guardado. Se usa al cerrar sesión. */
export function limpiarCache(){
  try {
    Object.keys(sessionStorage)
      .filter(k => k.startsWith(PREFIJO))
      .forEach(k => sessionStorage.removeItem(k));
  } catch (e) { /* ignorar */ }
}
