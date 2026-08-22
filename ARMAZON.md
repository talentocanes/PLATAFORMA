# Armazón Barkly · qué debe tener cada página

Plantilla a la que hay que llevar las páginas del panel a medida que se
migran. Mientras una página no se migre, sigue funcionando con la capa de
compatibilidad de `panel.css`, pero **no tendrá barra inferior en móvil**.

## Estructura mínima

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <title>Talento Canes · Alumnos</title>

  <!-- PWA -->
  <link rel="manifest" href="/manifest.json">
  <link rel="apple-touch-icon" href="/icons/icon-192.png">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="default">
  <meta name="apple-mobile-web-app-title" content="Barkly">

  <!-- Tipografía: una sola familia -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">

  <!-- Paleta y modo ANTES de la hoja de estilos: sin esto hay parpadeo -->
  <script src="theme-inline.js?v=14"></script>
  <link rel="stylesheet" href="panel.css?v=14">
</head>
<body>

  <!-- De primero: el armazón se pinta antes de que termine de leerse
       la página, y crea él mismo el sidebar, la appbar, la tabbar y
       la hoja de "Más". La página solo aporta su <main>. -->
  <script src="shell-inline.js?v=14" data-active="alumnos" data-title="Alumnos"></script>

  <main>
    <div class="page-head">
      <div>
        <h1>Alumnos</h1>
        <div class="sub">24 activos · 2 esperando aprobación</div>
      </div>
      <button class="btn btn-primary" id="btnAdd">Añadir alumno</button>
    </div>

    <!-- contenido -->
  </main>

  <script type="module">
    import { initLayout, obtenerConfiguracionActual } from './layout.js?v=14';
    import { supabase } from './supabaseClient.js?v=14';
    import { htmlAvatar, pesos, fechaCorta, abrirDialogo, cerrarDialogo } from './ui.js?v=14';

    const profile = await initLayout({ activeKey: 'alumnos' });
    if (!profile) return;
    // …
  </script>
</body>
</html>
```

## Puntos que se saltan con facilidad

**`viewport-fit=cover`** en el viewport. Sin eso, `env(safe-area-inset-bottom)`
devuelve cero y la barra inferior queda pisada por el gesto de inicio del iPhone.

**`shell-inline.js` va de primero dentro de `<body>`.** Si se deja al final,
el armazón se pinta cuando ya se leyó toda la página y se ve un parpadeo sin
menú al pasar de una página a otra.

**No hace falta escribir el marcado del armazón.** Nada de `<aside id="sidebar">`,
`<nav id="tabbar">` ni `<div id="sheetMas">`: los crea el propio script. Si la
página ya los tiene (por ser una migración parcial), los reutiliza.

**`data-active` usa la clave interna del módulo**, no el nombre visible:
`servicios` y no `tienda`, `clientes` y no `acudientes`.

**`data-title`** es lo que se lee en la barra superior de móvil. Si se omite,
se usa el nombre del módulo. En fichas individuales conviene ponerlo a mano
(el nombre del alumno, por ejemplo).

**Ya no hace falta `#menuToggle` ni `.sidebar-overlay`.** El menú lateral
deslizable desaparece: en móvil se navega con las pestañas.

**El `.topbar` con migas y reloj se oculta en móvil** por CSS. Al migrar cada
página conviene reemplazarlo por `.page-head`, que es el patrón nuevo.

## Diálogos

El mismo marcado se ve centrado en escritorio y como hoja desde abajo en móvil:

```html
<div class="dialog" id="dlgEditar">
  <div class="dialog-grip"></div>
  <div class="dialog-head">
    <h2>Editar alumno</h2>
    <div class="sub">Los cambios se ven de inmediato en su ficha.</div>
  </div>
  <div class="dialog-body">
    <!-- campos -->
  </div>
  <div class="dialog-foot">
    <button class="btn btn-secondary" onclick="…">Cancelar</button>
    <button class="btn btn-primary">Guardar cambios</button>
  </div>
</div>
```

Se abre con `abrirDialogo('dlgEditar')` y se cierra con `cerrarDialogo('dlgEditar')`,
ambos de `ui.js`. El `#scrim` es uno solo por página y lo comparten todos.

## Iconos de la PWA

Faltan por generar, a partir del logo, en `/icons/`:

- `icon-192.png` — 192×192
- `icon-512.png` — 512×512
- `icon-maskable-512.png` — 512×512, con el logo dentro del 80% central
  (Android recorta en círculo o en cuadrado redondeado según el teléfono;
  si el logo llega al borde, se corta)
