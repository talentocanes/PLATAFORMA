// =========================================================
// Selector de fecha con calendario desplegable, estilizado para
// combinar con el resto del panel. Uso:
//
//   import { initDatePicker } from './datepicker.js?v=9';
//   initDatePicker(document.getElementById('miInput'), {
//     onChange: (isoDate) => { ... } // 'YYYY-MM-DD' o null
//   });
//
// El input debe ser de solo lectura (readonly) — el usuario elige
// la fecha con el calendario, nunca escribe texto libre. El valor
// ISO queda disponible en input.dataset.iso.
// =========================================================

const MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const DIAS_CORTOS = ['L','M','X','J','V','S','D'];

function formatearVisible(fecha){
  return `${fecha.getDate()} de ${MESES[fecha.getMonth()]} de ${fecha.getFullYear()}`;
}

function aISO(fecha){
  const y = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, '0');
  const d = String(fecha.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

let estilosInyectados = false;
function inyectarEstilos(){
  if (estilosInyectados) return;
  estilosInyectados = true;
  const style = document.createElement('style');
  style.textContent = `
    .dp-popup{
      position:absolute; z-index:300; width:280px;
      background:var(--navy-panel); border:1px solid var(--line-strong);
      border-radius:14px; padding:14px; box-shadow:0 18px 40px rgba(0,0,0,0.5);
      font-family:'Inter',sans-serif; display:none;
    }
    .dp-popup.open{ display:block; }
    .dp-head{ display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; }
    .dp-head .dp-title{ font-family:'Space Grotesk',sans-serif; font-size:13.5px; font-weight:600; color:var(--white); cursor:pointer; }
    .dp-nav{ display:flex; gap:4px; }
    .dp-nav button{
      width:26px; height:26px; border-radius:8px; border:1px solid var(--line);
      background:var(--navy-panel-2); color:var(--mist); cursor:pointer;
      display:flex; align-items:center; justify-content:center;
    }
    .dp-nav button:hover{ border-color:var(--line-strong); color:var(--white); }
    .dp-grid{ display:grid; grid-template-columns:repeat(7, 1fr); gap:2px; }
    .dp-dow{ font-family:'JetBrains Mono',monospace; font-size:10px; color:var(--mist-dim); text-align:center; padding:4px 0 6px; }
    .dp-day{
      aspect-ratio:1; display:flex; align-items:center; justify-content:center;
      border-radius:8px; font-size:12.5px; color:var(--mist); cursor:pointer; border:none; background:none;
    }
    .dp-day:hover{ background:color-mix(in srgb, var(--blue-bright) 12%, transparent); color:var(--white); }
    .dp-day.dp-otro-mes{ color:var(--mist-dim); opacity:.4; }
    .dp-day.dp-hoy{ box-shadow:inset 0 0 0 1px var(--line-strong); }
    .dp-day.dp-seleccionado{ background:linear-gradient(90deg, var(--blue-deep), var(--blue-bright)); color:var(--white); font-weight:600; }
    .dp-years{ display:grid; grid-template-columns:repeat(4, 1fr); gap:6px; max-height:220px; overflow-y:auto; }
    .dp-years button{
      padding:8px 0; border-radius:8px; border:1px solid var(--line); background:var(--navy-panel-2);
      color:var(--mist); font-size:12px; cursor:pointer;
    }
    .dp-years button:hover{ border-color:var(--line-strong); color:var(--white); }
    .dp-years button.dp-seleccionado{ background:linear-gradient(90deg, var(--blue-deep), var(--blue-bright)); color:var(--white); border-color:transparent; }
  `;
  document.head.appendChild(style);
}

export function initDatePicker(input, { onChange } = {}){
  inyectarEstilos();

  const popup = document.createElement('div');
  popup.className = 'dp-popup';
  document.body.appendChild(popup);

  let vista = 'dias'; // 'dias' | 'anios'
  let mesActual = new Date().getMonth();
  let anioActual = new Date().getFullYear();
  let fechaSeleccionada = input.dataset.iso ? new Date(input.dataset.iso + 'T00:00:00') : null;
  if (fechaSeleccionada) { mesActual = fechaSeleccionada.getMonth(); anioActual = fechaSeleccionada.getFullYear(); }

  function render(){
    if (vista === 'anios') {
      const inicio = anioActual - (anioActual % 12);
      let html = '<div class="dp-head"><div class="dp-title" data-accion="volver-dias">← Volver</div></div><div class="dp-years">';
      for (let y = inicio; y < inicio + 12; y++) {
        html += `<button type="button" data-accion="elegir-anio" data-anio="${y}" class="${y === anioActual ? 'dp-seleccionado' : ''}">${y}</button>`;
      }
      html += '</div>';
      popup.innerHTML = html;
      return;
    }

    const primerDia = new Date(anioActual, mesActual, 1);
    const offset = (primerDia.getDay() + 6) % 7; // lunes = 0
    const diasEnMes = new Date(anioActual, mesActual + 1, 0).getDate();
    const hoy = new Date();

    let html = `
      <div class="dp-head">
        <div class="dp-title" data-accion="ver-anios">${MESES[mesActual]} ${anioActual}</div>
        <div class="dp-nav">
          <button type="button" data-accion="mes-anterior">‹</button>
          <button type="button" data-accion="mes-siguiente">›</button>
        </div>
      </div>
      <div class="dp-grid">
        ${DIAS_CORTOS.map(d => `<div class="dp-dow">${d}</div>`).join('')}
    `;

    for (let i = 0; i < offset; i++) {
      const diaMesAnterior = new Date(anioActual, mesActual, 0).getDate() - offset + i + 1;
      html += `<button type="button" class="dp-day dp-otro-mes" disabled>${diaMesAnterior}</button>`;
    }
    for (let d = 1; d <= diasEnMes; d++) {
      const fecha = new Date(anioActual, mesActual, d);
      const esHoy = fecha.toDateString() === hoy.toDateString();
      const esSeleccionado = fechaSeleccionada && fecha.toDateString() === fechaSeleccionada.toDateString();
      html += `<button type="button" class="dp-day ${esHoy ? 'dp-hoy' : ''} ${esSeleccionado ? 'dp-seleccionado' : ''}" data-accion="elegir-dia" data-dia="${d}">${d}</button>`;
    }
    html += '</div>';
    popup.innerHTML = html;
  }

  popup.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-accion]');
    if (!btn) return;
    const accion = btn.dataset.accion;

    if (accion === 'ver-anios') { vista = 'anios'; render(); }
    else if (accion === 'volver-dias') { vista = 'dias'; render(); }
    else if (accion === 'elegir-anio') { anioActual = parseInt(btn.dataset.anio, 10); vista = 'dias'; render(); }
    else if (accion === 'mes-anterior') { mesActual--; if (mesActual < 0) { mesActual = 11; anioActual--; } render(); }
    else if (accion === 'mes-siguiente') { mesActual++; if (mesActual > 11) { mesActual = 0; anioActual++; } render(); }
    else if (accion === 'elegir-dia') {
      fechaSeleccionada = new Date(anioActual, mesActual, parseInt(btn.dataset.dia, 10));
      input.value = formatearVisible(fechaSeleccionada);
      input.dataset.iso = aISO(fechaSeleccionada);
      cerrar();
      if (onChange) onChange(input.dataset.iso);
    }
  });

  function posicionar(){
    const r = input.getBoundingClientRect();
    popup.style.top = (window.scrollY + r.bottom + 6) + 'px';
    popup.style.left = (window.scrollX + r.left) + 'px';
  }

  function abrir(){
    vista = 'dias';
    render();
    posicionar();
    popup.classList.add('open');
    document.addEventListener('click', clicFuera, true);
    window.addEventListener('resize', posicionar);
    window.addEventListener('scroll', posicionar, true);
  }

  function cerrar(){
    popup.classList.remove('open');
    document.removeEventListener('click', clicFuera, true);
    window.removeEventListener('resize', posicionar);
    window.removeEventListener('scroll', posicionar, true);
  }

  function clicFuera(e){
    if (!popup.contains(e.target) && e.target !== input) cerrar();
  }

  input.addEventListener('click', () => {
    popup.classList.contains('open') ? cerrar() : abrir();
  });

  return {
    setISO(iso){
      fechaSeleccionada = iso ? new Date(iso + 'T00:00:00') : null;
      if (fechaSeleccionada) {
        mesActual = fechaSeleccionada.getMonth();
        anioActual = fechaSeleccionada.getFullYear();
        input.value = formatearVisible(fechaSeleccionada);
        input.dataset.iso = iso;
      } else {
        input.value = '';
        delete input.dataset.iso;
      }
    },
    clear(){
      fechaSeleccionada = null;
      input.value = '';
      delete input.dataset.iso;
    }
  };
}

// Calcula la edad en un texto legible ("2 años", "8 meses", "3 semanas")
// a partir de una fecha de nacimiento en formato ISO.
export function calcularEdadTexto(iso){
  if (!iso) return null;
  const nacimiento = new Date(iso + 'T00:00:00');
  const hoy = new Date();
  if (nacimiento > hoy) return null;

  let years = hoy.getFullYear() - nacimiento.getFullYear();
  let months = hoy.getMonth() - nacimiento.getMonth();
  let days = hoy.getDate() - nacimiento.getDate();
  if (days < 0) { months--; }
  if (months < 0) { years--; months += 12; }

  if (years >= 1) return `${years} año${years !== 1 ? 's' : ''}${months > 0 ? ` y ${months} mes${months !== 1 ? 'es' : ''}` : ''}`;
  if (months >= 1) return `${months} mes${months !== 1 ? 'es' : ''}`;
  const semanas = Math.max(0, Math.floor((hoy - nacimiento) / (1000 * 60 * 60 * 24 * 7)));
  return `${semanas} semana${semanas !== 1 ? 's' : ''}`;
}
