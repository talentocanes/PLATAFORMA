// =========================================================
// Normaliza texto tipo "nombre propio": la primera letra de cada
// palabra en mayúscula, el resto en minúscula. Sin importar cómo
// lo haya escrito la persona (TODO MAYÚSCULAS, todo minúsculas,
// mezclado), siempre queda igual.
//
//   capitalizarPalabras('HOLA')      -> 'Hola'
//   capitalizarPalabras('juan pérez') -> 'Juan Pérez'
//   capitalizarPalabras('  ana   ')   -> 'Ana'
// =========================================================
export function capitalizarPalabras(texto){
  if (!texto) return texto;
  return texto
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .split(' ')
    .map(palabra => palabra ? palabra.charAt(0).toUpperCase() + palabra.slice(1) : palabra)
    .join(' ');
}
