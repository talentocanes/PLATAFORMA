// =========================================================
// Departamentos y ciudades/municipios principales de Colombia.
// No es el listado completo de los ~1.100 municipios del país
// (DIVIPOLA) — incluye la capital de cada departamento y las
// ciudades/municipios más relevantes, suficiente para un
// selector práctico. Se puede ampliar más adelante si hace falta.
// =========================================================

export const DEPARTAMENTOS = [
  { nombre: 'Amazonas', ciudades: ['Leticia', 'Puerto Nariño'] },
  { nombre: 'Antioquia', ciudades: ['Medellín', 'Bello', 'Itagüí', 'Envigado', 'Apartadó', 'Turbo', 'Rionegro', 'Sabaneta', 'Caldas', 'Copacabana', 'La Estrella', 'Girardota', 'Marinilla', 'Yarumal', 'Santa Fe de Antioquia'] },
  { nombre: 'Arauca', ciudades: ['Arauca', 'Arauquita', 'Saravena', 'Tame'] },
  { nombre: 'Atlántico', ciudades: ['Barranquilla', 'Soledad', 'Malambo', 'Sabanalarga', 'Puerto Colombia', 'Galapa'] },
  { nombre: 'Bogotá D.C.', ciudades: ['Bogotá'] },
  { nombre: 'Bolívar', ciudades: ['Cartagena', 'Magangué', 'Turbaco', 'Arjona', 'El Carmen de Bolívar'] },
  { nombre: 'Boyacá', ciudades: ['Tunja', 'Duitama', 'Sogamoso', 'Chiquinquirá', 'Paipa', 'Villa de Leyva'] },
  { nombre: 'Caldas', ciudades: ['Manizales', 'La Dorada', 'Chinchiná', 'Villamaría', 'Riosucio'] },
  { nombre: 'Caquetá', ciudades: ['Florencia', 'San Vicente del Caguán', 'Puerto Rico'] },
  { nombre: 'Casanare', ciudades: ['Yopal', 'Aguazul', 'Villanueva', 'Tauramena'] },
  { nombre: 'Cauca', ciudades: ['Popayán', 'Santander de Quilichao', 'Puerto Tejada', 'Piendamó', 'El Bordo'] },
  { nombre: 'Cesar', ciudades: ['Valledupar', 'Aguachica', 'Codazzi', 'La Jagua de Ibirico'] },
  { nombre: 'Chocó', ciudades: ['Quibdó', 'Istmina', 'Condoto', 'Tadó'] },
  { nombre: 'Córdoba', ciudades: ['Montería', 'Cereté', 'Lorica', 'Sahagún', 'Planeta Rica'] },
  { nombre: 'Cundinamarca', ciudades: ['Soacha', 'Chía', 'Zipaquirá', 'Facatativá', 'Fusagasugá', 'Girardot', 'Mosquera', 'Madrid', 'Funza', 'Cajicá', 'Ubaté'] },
  { nombre: 'Guainía', ciudades: ['Inírida'] },
  { nombre: 'Guaviare', ciudades: ['San José del Guaviare'] },
  { nombre: 'Huila', ciudades: ['Neiva', 'Pitalito', 'Garzón', 'La Plata', 'Campoalegre'] },
  { nombre: 'La Guajira', ciudades: ['Riohacha', 'Maicao', 'Uribia', 'Fonseca', 'San Juan del Cesar'] },
  { nombre: 'Magdalena', ciudades: ['Santa Marta', 'Ciénaga', 'Fundación', 'Aracataca', 'El Banco'] },
  { nombre: 'Meta', ciudades: ['Villavicencio', 'Acacías', 'Granada', 'Puerto López'] },
  { nombre: 'Nariño', ciudades: ['Pasto', 'Ipiales', 'Tumaco', 'Túquerres', 'La Unión'] },
  { nombre: 'Norte de Santander', ciudades: ['Cúcuta', 'Ocaña', 'Pamplona', 'Villa del Rosario', 'Los Patios'] },
  { nombre: 'Putumayo', ciudades: ['Mocoa', 'Puerto Asís', 'Orito', 'Sibundoy'] },
  { nombre: 'Quindío', ciudades: ['Armenia', 'Calarcá', 'Montenegro', 'La Tebaida', 'Quimbaya'] },
  { nombre: 'Risaralda', ciudades: ['Pereira', 'Dosquebradas', 'Santa Rosa de Cabal', 'La Virginia'] },
  { nombre: 'San Andrés y Providencia', ciudades: ['San Andrés', 'Providencia'] },
  { nombre: 'Santander', ciudades: ['Bucaramanga', 'Floridablanca', 'Girón', 'Piedecuesta', 'Barrancabermeja', 'San Gil'] },
  { nombre: 'Sucre', ciudades: ['Sincelejo', 'Corozal', 'San Marcos', 'Sampués'] },
  { nombre: 'Tolima', ciudades: ['Ibagué', 'Espinal', 'Melgar', 'Honda', 'Chaparral'] },
  { nombre: 'Valle del Cauca', ciudades: ['Cali', 'Palmira', 'Buenaventura', 'Tuluá', 'Cartago', 'Buga', 'Yumbo', 'Jamundí'] },
  { nombre: 'Vaupés', ciudades: ['Mitú'] },
  { nombre: 'Vichada', ciudades: ['Puerto Carreño'] }
];

// ---------------------------------------------------------
// Llena un <select> con los 33 departamentos.
// ---------------------------------------------------------
export function poblarDepartamentos(selectEl, valorSeleccionado){
  selectEl.innerHTML = '<option value="">Selecciona un departamento</option>' +
    DEPARTAMENTOS.map(d => `<option value="${d.nombre}">${d.nombre}</option>`).join('');
  if (valorSeleccionado) selectEl.value = valorSeleccionado;
}

// ---------------------------------------------------------
// Llena un <select> con las ciudades del departamento indicado.
// Si el departamento no existe en la lista, deja el select vacío
// con un mensaje neutro (por si alguna vez llega un dato viejo).
// ---------------------------------------------------------
export function poblarCiudades(selectEl, nombreDepartamento, valorSeleccionado){
  const depto = DEPARTAMENTOS.find(d => d.nombre === nombreDepartamento);
  if (!depto) {
    selectEl.innerHTML = '<option value="">Selecciona primero un departamento</option>';
    return;
  }
  selectEl.innerHTML = '<option value="">Selecciona una ciudad</option>' +
    depto.ciudades.map(c => `<option value="${c}">${c}</option>`).join('');
  if (valorSeleccionado) selectEl.value = valorSeleccionado;
}
