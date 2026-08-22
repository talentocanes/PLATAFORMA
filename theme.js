import { supabase } from './supabaseClient.js?v=27';

// ---------------------------------------------------------
// Las 8 paletas del colegio.
//
// Los valores de color ya NO viven aquí: están en panel.css,
// bajo [data-paleta="…"]. Este archivo solo pone el atributo
// en <html> y CSS resuelve el resto. Así el modo oscuro es
// otra combinación de atributos, no otro juego de variables.
//
// Las claves son las mismas de siempre, así que no hay que
// migrar nada en configuracion_negocio; solo cambian las
// etiquetas visibles, que ya no dicen "Nocturno".
// ---------------------------------------------------------
export const PALETAS = [
  { key:'azul-original', label:'Zafiro',    muestra:'#1D63D1' },
  { key:'esmeralda',     label:'Esmeralda', muestra:'#0E8A5F' },
  { key:'purpura',       label:'Púrpura',   muestra:'#6D3BD1' },
  { key:'vino',          label:'Vino',      muestra:'#B32741' },
  { key:'ambar',         label:'Ámbar',     muestra:'#B26A00' },
  { key:'cian',          label:'Cian',      muestra:'#0A7C90' },
  { key:'grafito',       label:'Grafito',   muestra:'#3E4651' },
  { key:'bronce',        label:'Bronce',    muestra:'#8A6A16' }
];

const CLAVES = PALETAS.map(p => p.key);
export const MODOS = ['light', 'dark'];


// ---------------------------------------------------------
// PALETA — la elige el administrador y es igual para todos.
// ---------------------------------------------------------
export function aplicarPaleta(key){
  const elegida = CLAVES.includes(key) ? key : CLAVES[0];
  document.documentElement.setAttribute('data-paleta', elegida);

  // Se guarda para que theme-inline.js la aplique de inmediato en
  // la siguiente carga, sin esperar la respuesta de Supabase.
  try { localStorage.setItem('tc_paleta', elegida); } catch (e) { /* ignorar */ }

  actualizarColorBarraNavegador();
  return elegida;
}


// ---------------------------------------------------------
// MODO — lo elige cada usuario, no el colegio.
//
// Solo hay dos: claro y oscuro, y el predeterminado es claro.
// Antes existía un tercero, 'auto', que seguía al sistema
// operativo; se quitó porque obligaba a explicar un estado más y
// hacía que la plataforma arrancara en oscuro sin que nadie lo
// hubiera elegido. Quien quiera oscuro lo pone una vez y queda.
// ---------------------------------------------------------
export function modoGuardado(){
  try {
    const guardado = localStorage.getItem('tc_modo');
    // Las cuentas que quedaron en 'auto' pasan a claro.
    return MODOS.includes(guardado) ? guardado : 'light';
  } catch (e) { return 'light'; }
}

export function aplicarModo(modo){
  const elegido = MODOS.includes(modo) ? modo : 'light';
  try { localStorage.setItem('tc_modo', elegido); } catch (e) { /* ignorar */ }
  document.documentElement.setAttribute('data-theme', elegido);
  actualizarColorBarraNavegador();
  return elegido;
}

// La barra del navegador (y la de estado, con la app instalada)
// toma el color del fondo. Sin esto, en móvil queda una franja
// blanca sobre una app oscura — de lo que más delata una web.
function actualizarColorBarraNavegador(){
  const color = getComputedStyle(document.documentElement)
    .getPropertyValue('--surface').trim() || '#FFFFFF';
  let meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = 'theme-color';
    document.head.appendChild(meta);
  }
  meta.content = color;
}


// ---------------------------------------------------------
// Carga la fila única de configuración del negocio, aplica su
// paleta y devuelve la fila completa (o null si falló).
// ---------------------------------------------------------
export async function cargarConfiguracionNegocio(){
  // El modo es del usuario, así que se aplica sin esperar a la red.
  aplicarModo(modoGuardado());

  const { data, error } = await supabase
    .from('configuracion_negocio')
    .select('*')
    .eq('id', 1)
    .single();

  if (error) {
    console.error('Error al cargar configuración del negocio:', error);
    return null;
  }

  aplicarPaleta(data.paleta);

  // El icono de la app instalada sale del logo que el colegio subió en
  // Configuración. Se carga aparte y sin esperar: si pwa.js falta o
  // falla, la app tiene que seguir funcionando igual — es un extra,
  // no una pieza de la que dependa el panel.
  import('./pwa.js?v=27')
    .then(m => m.aplicarIdentidadPWA(data))
    .catch(e => console.warn('No se pudo aplicar la identidad de la app instalable:', e));

  // Textos que se pintan antes de que responda Supabase: se cachean
  // para que el script bloqueante los aplique al instante y no haya
  // parpadeo del valor por defecto.
  try {
    localStorage.setItem('tc_nombre_negocio', data.nombre_negocio || 'Talento Canes');
    localStorage.setItem('tc_logo_url', data.logo_url || '');
    localStorage.setItem('tc_etiqueta_cliente', data.etiqueta_cliente || 'Acudiente');
    localStorage.setItem('tc_etiqueta_cliente_plural', data.etiqueta_cliente_plural || 'Acudientes');
    localStorage.setItem('tc_etiqueta_descuento', data.etiqueta_descuento || 'Precio especial para ti');
  } catch (e) { /* ignorar */ }

  return data;
}
