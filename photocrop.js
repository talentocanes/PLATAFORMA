// =========================================================
// Recortador de fotos con vista circular, arrastrable y con zoom.
// Uso:
//   import { abrirRecortador } from './photocrop.js?v=8';
//   abrirRecortador(archivo, (blobRecortado) => { ... });
//
// abrirRecortador recibe un File (de un <input type="file">) y
// devuelve, por callback, un Blob JPEG ya recortado en cuadrado
// (el círculo se logra mostrando ese cuadrado dentro de un
// contenedor con border-radius:50% en el resto de la app).
// =========================================================

let estilosInyectados = false;
function inyectarEstilos(){
  if (estilosInyectados) return;
  estilosInyectados = true;
  const style = document.createElement('style');
  style.textContent = `
    .pc-overlay{
      position:fixed; inset:0; z-index:400; background:rgba(2,6,14,0.85);
      display:flex; align-items:center; justify-content:center; padding:20px;
    }
    .pc-card{
      width:100%; max-width:360px; background:var(--navy-panel); border:1px solid var(--line-strong);
      border-radius:18px; padding:24px; font-family:'Inter',sans-serif;
    }
    .pc-card h3{ font-family:'Space Grotesk',sans-serif; font-size:16px; color:var(--white); margin-bottom:4px; }
    .pc-card p{ font-size:12px; color:var(--mist-dim); margin-bottom:16px; }
    .pc-stage{
      position:relative; width:280px; height:280px; margin:0 auto 16px;
      border-radius:50%; overflow:hidden; background:#000;
      cursor:grab; touch-action:none;
      box-shadow:0 0 0 3px var(--line-strong), 0 12px 30px rgba(0,0,0,0.5);
    }
    .pc-stage:active{ cursor:grabbing; }
    .pc-stage img{ position:absolute; top:0; left:0; user-select:none; -webkit-user-drag:none; pointer-events:none; }
    .pc-zoom-row{ display:flex; align-items:center; gap:10px; margin-bottom:18px; }
    .pc-zoom-row svg{ width:16px; height:16px; color:var(--mist-dim); flex-shrink:0; }
    .pc-zoom-row input[type="range"]{ flex:1; accent-color:var(--blue-bright); }
    .pc-actions{ display:flex; gap:10px; }
    .pc-btn{ flex:1; padding:11px; border-radius:10px; font-size:13.5px; font-weight:600; cursor:pointer; border:none; }
    .pc-btn.pc-apply{ background:linear-gradient(90deg, var(--blue-deep), var(--blue-bright)); color:var(--white); }
    .pc-btn.pc-cancel{ background:none; border:1px solid var(--line); color:var(--mist); }
  `;
  document.head.appendChild(style);
}

export function abrirRecortador(file, onListo){
  inyectarEstilos();

  const overlay = document.createElement('div');
  overlay.className = 'pc-overlay';
  overlay.innerHTML = `
    <div class="pc-card">
      <h3>Ajusta la foto</h3>
      <p>Arrastra para mover, usa el control para acercar o alejar.</p>
      <div class="pc-stage" id="pcStage">
        <img id="pcImg" alt="Foto a recortar">
      </div>
      <div class="pc-zoom-row">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M8 11h6"/></svg>
        <input type="range" id="pcZoom" min="100" max="300" value="100">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M8 11h6M11 8v6"/></svg>
      </div>
      <div class="pc-actions">
        <button type="button" class="pc-btn pc-cancel" id="pcCancel">Cancelar</button>
        <button type="button" class="pc-btn pc-apply" id="pcApply">Usar esta foto</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  const stage = overlay.querySelector('#pcStage');
  const img = overlay.querySelector('#pcImg');
  const zoomInput = overlay.querySelector('#pcZoom');
  const STAGE_SIZE = 280;

  let imgNaturalW = 0, imgNaturalH = 0;
  let baseScale = 1;    // escala mínima para cubrir el círculo
  let zoom = 1;          // multiplicador adicional (1 = min, 3 = max)
  let offsetX = 0, offsetY = 0; // posición actual (esquina sup-izq de la imagen) en px del stage
  let arrastrando = false;
  let inicioX = 0, inicioY = 0, inicioOffX = 0, inicioOffY = 0;

  const objectUrl = URL.createObjectURL(file);
  img.src = objectUrl;

  img.onload = () => {
    imgNaturalW = img.naturalWidth;
    imgNaturalH = img.naturalHeight;
    baseScale = STAGE_SIZE / Math.min(imgNaturalW, imgNaturalH);
    centrar();
    aplicarTransform();
  };

  function centrar(){
    const w = imgNaturalW * baseScale * zoom;
    const h = imgNaturalH * baseScale * zoom;
    offsetX = (STAGE_SIZE - w) / 2;
    offsetY = (STAGE_SIZE - h) / 2;
  }

  function limitarOffset(){
    const w = imgNaturalW * baseScale * zoom;
    const h = imgNaturalH * baseScale * zoom;
    offsetX = Math.min(0, Math.max(STAGE_SIZE - w, offsetX));
    offsetY = Math.min(0, Math.max(STAGE_SIZE - h, offsetY));
  }

  function aplicarTransform(){
    const w = imgNaturalW * baseScale * zoom;
    const h = imgNaturalH * baseScale * zoom;
    img.style.width = w + 'px';
    img.style.height = h + 'px';
    img.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
  }

  zoomInput.addEventListener('input', () => {
    const nuevoZoom = zoomInput.value / 100;
    // mantener el centro del círculo fijo al hacer zoom
    const cx = STAGE_SIZE / 2, cy = STAGE_SIZE / 2;
    const relX = (cx - offsetX) / zoom;
    const relY = (cy - offsetY) / zoom;
    zoom = nuevoZoom;
    offsetX = cx - relX * zoom;
    offsetY = cy - relY * zoom;
    limitarOffset();
    aplicarTransform();
  });

  function posicionPuntero(e){
    if (e.touches && e.touches[0]) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    return { x: e.clientX, y: e.clientY };
  }

  function empezarArrastre(e){
    arrastrando = true;
    const p = posicionPuntero(e);
    inicioX = p.x; inicioY = p.y;
    inicioOffX = offsetX; inicioOffY = offsetY;
  }
  function moverArrastre(e){
    if (!arrastrando) return;
    e.preventDefault();
    const p = posicionPuntero(e);
    offsetX = inicioOffX + (p.x - inicioX);
    offsetY = inicioOffY + (p.y - inicioY);
    limitarOffset();
    aplicarTransform();
  }
  function terminarArrastre(){ arrastrando = false; }

  stage.addEventListener('mousedown', empezarArrastre);
  window.addEventListener('mousemove', moverArrastre);
  window.addEventListener('mouseup', terminarArrastre);
  stage.addEventListener('touchstart', empezarArrastre, { passive: true });
  window.addEventListener('touchmove', moverArrastre, { passive: false });
  window.addEventListener('touchend', terminarArrastre);

  function cerrar(){
    URL.revokeObjectURL(objectUrl);
    window.removeEventListener('mousemove', moverArrastre);
    window.removeEventListener('mouseup', terminarArrastre);
    window.removeEventListener('touchmove', moverArrastre);
    window.removeEventListener('touchend', terminarArrastre);
    overlay.remove();
  }

  overlay.querySelector('#pcCancel').addEventListener('click', cerrar);

  overlay.querySelector('#pcApply').addEventListener('click', () => {
    const SALIDA = 480; // resolución del recorte final
    const canvas = document.createElement('canvas');
    canvas.width = SALIDA;
    canvas.height = SALIDA;
    const ctx = canvas.getContext('2d');

    const factor = SALIDA / STAGE_SIZE;
    const w = imgNaturalW * baseScale * zoom * factor;
    const h = imgNaturalH * baseScale * zoom * factor;
    const dx = offsetX * factor;
    const dy = offsetY * factor;

    ctx.drawImage(img, dx, dy, w, h);

    canvas.toBlob((blob) => {
      cerrar();
      if (blob) onListo(blob);
    }, 'image/jpeg', 0.9);
  });
}
