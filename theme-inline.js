// Este script NO es un módulo — se ejecuta de forma bloqueante,
// antes de que la página pinte nada, para aplicar la última paleta
// guardada en este navegador y evitar el "flash" del azul por defecto
// mientras se espera la respuesta de Supabase. theme.js luego confirma
// (o corrige) esta paleta contra la base de datos.
(function () {
  var PALETAS = {
    'azul-original': { navyDeep:'#050d1a', navyPanel:'#0b1a30', navyPanel2:'#0f2340', blueDeep:'#0d47a1', blueMid:'#1976d2', blueBright:'#29b6f6', blueGlow:'#4fc3f7' },
    'esmeralda':     { navyDeep:'#04120d', navyPanel:'#0b241c', navyPanel2:'#0f2f24', blueDeep:'#0d5c3a', blueMid:'#12855a', blueBright:'#2ecc94', blueGlow:'#5fe0b0' },
    'purpura':       { navyDeep:'#0d0518', navyPanel:'#1a0f2c', navyPanel2:'#22143a', blueDeep:'#4a0d8f', blueMid:'#7024b8', blueBright:'#b374ff', blueGlow:'#d0a3ff' },
    'vino':          { navyDeep:'#150507', navyPanel:'#26090d', navyPanel2:'#320d13', blueDeep:'#7a0d1f', blueMid:'#a8172f', blueBright:'#ff5c72', blueGlow:'#ff8fa0' },
    'ambar':         { navyDeep:'#160e04', navyPanel:'#281a09', navyPanel2:'#34220c', blueDeep:'#8a4b0d', blueMid:'#c26a12', blueBright:'#ffab29', blueGlow:'#ffcb7a' },
    'cian':          { navyDeep:'#041315', navyPanel:'#0b2528', navyPanel2:'#0f3033', blueDeep:'#0d5f6b', blueMid:'#128a9c', blueBright:'#29d6f0', blueGlow:'#7ce8f7' },
    'grafito':       { navyDeep:'#0a0b0d', navyPanel:'#16181c', navyPanel2:'#1d2025', blueDeep:'#3a3f47', blueMid:'#5c636e', blueBright:'#9aa4b2', blueGlow:'#c7cfd9' },
    'bronce':        { navyDeep:'#120d04', navyPanel:'#241b09', navyPanel2:'#302510', blueDeep:'#6b4b0d', blueMid:'#9c7212', blueBright:'#d6a929', blueGlow:'#f0cf7c' }
  };

  try {
    var key = localStorage.getItem('tc_paleta') || 'azul-original';
    var p = PALETAS[key] || PALETAS['azul-original'];
    var root = document.documentElement.style;
    root.setProperty('--navy-deep', p.navyDeep);
    root.setProperty('--navy-panel', p.navyPanel);
    root.setProperty('--navy-panel-2', p.navyPanel2);
    root.setProperty('--blue-deep', p.blueDeep);
    root.setProperty('--blue-mid', p.blueMid);
    root.setProperty('--blue-bright', p.blueBright);
    root.setProperty('--blue-glow', p.blueGlow);
  } catch (e) { /* localStorage no disponible: se queda con la paleta por defecto */ }
})();
