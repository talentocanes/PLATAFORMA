import { supabase } from './supabaseClient.js?v=9';

// ---------------------------------------------------------
// 8 paletas de color. La primera ("azul-original") es el tono
// azul oscuro que ya caracteriza a la plataforma — es la que
// se usa por defecto.
// ---------------------------------------------------------
export const PALETAS = [
  {
    key: 'azul-original',
    label: 'Zafiro Nocturno',
    colors: {
      navyDeep:'#050d1a', navyPanel:'#0b1a30', navyPanel2:'#0f2340',
      blueDeep:'#0d47a1', blueMid:'#1976d2', blueBright:'#29b6f6', blueGlow:'#4fc3f7'
    }
  },
  {
    key: 'esmeralda',
    label: 'Esmeralda Nocturno',
    colors: {
      navyDeep:'#04120d', navyPanel:'#0b241c', navyPanel2:'#0f2f24',
      blueDeep:'#0d5c3a', blueMid:'#12855a', blueBright:'#2ecc94', blueGlow:'#5fe0b0'
    }
  },
  {
    key: 'purpura',
    label: 'Púrpura Real',
    colors: {
      navyDeep:'#0d0518', navyPanel:'#1a0f2c', navyPanel2:'#22143a',
      blueDeep:'#4a0d8f', blueMid:'#7024b8', blueBright:'#b374ff', blueGlow:'#d0a3ff'
    }
  },
  {
    key: 'vino',
    label: 'Vino Tinto',
    colors: {
      navyDeep:'#150507', navyPanel:'#26090d', navyPanel2:'#320d13',
      blueDeep:'#7a0d1f', blueMid:'#a8172f', blueBright:'#ff5c72', blueGlow:'#ff8fa0'
    }
  },
  {
    key: 'ambar',
    label: 'Ámbar Cálido',
    colors: {
      navyDeep:'#160e04', navyPanel:'#281a09', navyPanel2:'#34220c',
      blueDeep:'#8a4b0d', blueMid:'#c26a12', blueBright:'#ffab29', blueGlow:'#ffcb7a'
    }
  },
  {
    key: 'cian',
    label: 'Cian Profundo',
    colors: {
      navyDeep:'#041315', navyPanel:'#0b2528', navyPanel2:'#0f3033',
      blueDeep:'#0d5f6b', blueMid:'#128a9c', blueBright:'#29d6f0', blueGlow:'#7ce8f7'
    }
  },
  {
    key: 'grafito',
    label: 'Grafito Monocromo',
    colors: {
      navyDeep:'#0a0b0d', navyPanel:'#16181c', navyPanel2:'#1d2025',
      blueDeep:'#3a3f47', blueMid:'#5c636e', blueBright:'#9aa4b2', blueGlow:'#c7cfd9'
    }
  },
  {
    key: 'bronce',
    label: 'Bronce Elegante',
    colors: {
      navyDeep:'#120d04', navyPanel:'#241b09', navyPanel2:'#302510',
      blueDeep:'#6b4b0d', blueMid:'#9c7212', blueBright:'#d6a929', blueGlow:'#f0cf7c'
    }
  }
];

// ---------------------------------------------------------
// Aplica una paleta (por su key) a las variables CSS globales.
// Si la key no existe, cae en la paleta original por defecto.
// ---------------------------------------------------------
export function aplicarPaleta(key){
  const paleta = PALETAS.find(p => p.key === key) || PALETAS[0];
  const root = document.documentElement.style;
  root.setProperty('--navy-deep', paleta.colors.navyDeep);
  root.setProperty('--navy-panel', paleta.colors.navyPanel);
  root.setProperty('--navy-panel-2', paleta.colors.navyPanel2);
  root.setProperty('--blue-deep', paleta.colors.blueDeep);
  root.setProperty('--blue-mid', paleta.colors.blueMid);
  root.setProperty('--blue-bright', paleta.colors.blueBright);
  root.setProperty('--blue-glow', paleta.colors.blueGlow);

  // Se guarda localmente para que theme-inline.js pueda aplicarla de
  // inmediato en la próxima carga, sin esperar la respuesta de Supabase.
  try { localStorage.setItem('tc_paleta', paleta.key); } catch (e) { /* ignorar */ }
}

// ---------------------------------------------------------
// Carga la fila única de configuración del negocio y aplica
// su paleta. Devuelve la fila completa (o null si falló).
// ---------------------------------------------------------
export async function cargarConfiguracionNegocio(){
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

  // Se cachean localmente los textos que se muestran de inmediato al
  // cargar cualquier página (nombre, logo, terminología), para que un
  // pequeño script bloqueante los aplique antes de esperar esta misma
  // consulta la próxima vez — evita el "flash" del valor por defecto.
  try {
    localStorage.setItem('tc_nombre_negocio', data.nombre_negocio || 'Talento Canes');
    localStorage.setItem('tc_logo_url', data.logo_url || '');
    localStorage.setItem('tc_etiqueta_cliente', data.etiqueta_cliente || 'Acudiente');
    localStorage.setItem('tc_etiqueta_cliente_plural', data.etiqueta_cliente_plural || 'Acudientes');
  } catch (e) { /* ignorar */ }

  return data;
}
