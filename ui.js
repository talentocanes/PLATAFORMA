/* ============================================================================
   BARKLY · ui.js
   Utilidades compartidas de interfaz. Nada de acceso a datos aquí.

   Existe porque formatearMiles, escapar y el cálculo de iniciales estaban
   copiados en media docena de páginas, con pequeñas diferencias entre
   copias. Una sola versión evita que sigan divergiendo.
   ========================================================================== */


/* ---------------------------------------------------------
   RETRATOS
   Cuando un alumno o una persona no tiene foto, el monograma
   toma un color derivado de su nombre. Es determinista: el
   mismo nombre da siempre el mismo color, en cualquier
   pantalla y en cualquier sesión.

   Los tonos están elegidos para contrastar con texto blanco y
   para NO parecerse a ningún acento de las paletas: así el
   color de un perro nunca se confunde con el de una acción.
   --------------------------------------------------------- */
const TONOS = [
  '#3A5BA8', '#2F6E4E', '#B4532A', '#7A4293',
  '#1F6F7A', '#9A3B5C', '#5E6B24', '#8A5A17'
];

export function colorDeNombre(nombre){
  const texto = String(nombre || '?');
  let h = 0;
  for (let i = 0; i < texto.length; i++) {
    h = (h * 31 + texto.charCodeAt(i)) >>> 0;
  }
  return TONOS[h % TONOS.length];
}

export function iniciales(nombre){
  const partes = String(nombre || '?').trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return '?';
  return partes.slice(0, 2).map(p => p[0].toUpperCase()).join('');
}

/**
 * Devuelve el HTML de un retrato listo para insertar.
 * @param {string}  nombre  Nombre de la persona o mascota
 * @param {string?} fotoUrl Foto, si la hay
 * @param {string}  tam     '', 'sm', 'lg' o 'xl'
 */
export function htmlAvatar(nombre, fotoUrl, tam = ''){
  const clase = tam ? `avatar avatar-${tam}` : 'avatar';
  if (fotoUrl) {
    return `<div class="${clase}"><img src="${escapar(fotoUrl)}" alt="${escapar(nombre)}"></div>`;
  }
  return `<div class="${clase}" style="background:${colorDeNombre(nombre)}">${escapar(iniciales(nombre))}</div>`;
}


/* ---------------------------------------------------------
   TEXTO
   --------------------------------------------------------- */
export function escapar(texto){
  return String(texto ?? '').replace(/[&<>"']/g, c => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
  }[c]));
}


/* ---------------------------------------------------------
   DINERO
   Formato de miles en vivo mientras se escribe, y su inverso
   para recuperar el número limpio antes de guardar.
   --------------------------------------------------------- */
export function pesos(valor){
  return '$ ' + Number(valor || 0).toLocaleString('es-CO');
}

export function formatearMiles(valor){
  const digitos = String(valor ?? '').replace(/\D/g, '');
  return digitos ? Number(digitos).toLocaleString('es-CO') : '';
}

export function quitarFormatoMiles(valor){
  return String(valor ?? '').replace(/\D/g, '');
}

/** Conecta un input para que se formatee solo mientras se escribe. */
export function conectarCampoMoneda(input){
  if (!input) return;
  input.addEventListener('input', e => {
    e.target.value = formatearMiles(e.target.value);
  });
}


/* ---------------------------------------------------------
   FECHAS
   --------------------------------------------------------- */
export function fechaCorta(iso){
  if (!iso) return '—';
  const d = String(iso).length <= 10 ? new Date(iso + 'T00:00:00') : new Date(iso);
  return d.toLocaleDateString('es-CO', { day:'2-digit', month:'short', year:'numeric' });
}

export function fechaHora(iso){
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('es-CO', { day:'2-digit', month:'short', year:'numeric' }) +
         ', ' + d.toLocaleTimeString('es-CO', { hour:'2-digit', minute:'2-digit' });
}

export function edadTexto(fechaNacimiento){
  if (!fechaNacimiento) return null;
  const nac = new Date(fechaNacimiento + 'T00:00:00');
  const hoy = new Date();
  let meses = (hoy.getFullYear() - nac.getFullYear()) * 12 + (hoy.getMonth() - nac.getMonth());
  if (hoy.getDate() < nac.getDate()) meses--;
  if (meses < 0) return null;
  const anios = Math.floor(meses / 12);
  const resto = meses % 12;
  if (anios === 0) return `${resto} ${resto === 1 ? 'mes' : 'meses'}`;
  if (resto === 0) return `${anios} ${anios === 1 ? 'año' : 'años'}`;
  return `${anios} ${anios === 1 ? 'año' : 'años'} y ${resto} ${resto === 1 ? 'mes' : 'meses'}`;
}


/* ---------------------------------------------------------
   DIÁLOGOS
   En escritorio se ven centrados; en móvil suben como hoja
   desde abajo. Es el mismo marcado: lo resuelve panel.css.
   --------------------------------------------------------- */
export function abrirDialogo(id){
  const d = document.getElementById(id);
  if (!d) return;
  document.getElementById('scrim')?.classList.add('open');
  d.classList.add('open');
  // El bloqueo del fondo lo aplica el armazón al detectar el diálogo
  // abierto, así hay un solo mecanismo y no se pisan entre sí.
}

export function cerrarDialogo(id){
  const d = document.getElementById(id);
  if (d) d.classList.remove('open');
  if (!document.querySelector('.dialog.open')) {
    document.getElementById('scrim')?.classList.remove('open');
  }
}

/** Cierra al tocar fuera y con la tecla Escape. */
export function conectarCierreDialogos(){
  document.getElementById('scrim')?.addEventListener('click', () => {
    document.querySelectorAll('.dialog.open').forEach(d => d.classList.remove('open'));
    document.getElementById('scrim').classList.remove('open');
  });
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    const abierto = document.querySelector('.dialog.open');
    if (abierto) cerrarDialogo(abierto.id);
  });
}
