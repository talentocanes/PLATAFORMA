// =========================================================
// Departamentos y ciudades/municipios principales de Colombia.
// No es el listado completo de los ~1.100 municipios del país
// (DIVIPOLA) — incluye la capital de cada departamento y las
// ciudades/municipios más relevantes, suficiente para un
// selector práctico. Se puede ampliar más adelante si hace falta.
// =========================================================

export const DEPARTAMENTOS = [
  { nombre: 'Amazonas', ciudades: ['Leticia', 'Puerto Nariño', 'El Encanto', 'La Chorrera', 'La Pedrera', 'Miriti - Paraná', 'Puerto Alegría', 'Puerto Arica', 'Puerto Santander', 'Tarapacá'] },
  { nombre: 'Antioquia', ciudades: ['Medellín', 'Bello', 'Itagüí', 'Envigado', 'Apartadó', 'Turbo', 'Rionegro', 'Sabaneta', 'Caldas', 'Copacabana', 'La Estrella', 'Girardota', 'Marinilla', 'Yarumal', 'Santa Fe de Antioquia', 'Caucasia', 'Chigorodó', 'Necoclí', 'La Ceja', 'El Retiro', 'Guarne', 'El Carmen de Viboral', 'Barbosa', 'Amagá', 'Frontino', 'Andes', 'Jardín', 'Jericó', 'Santa Bárbara', 'Concordia', 'Segovia', 'Puerto Berrío', 'Yolombó', 'San Pedro de los Milagros', 'Don Matías', 'Entrerríos', 'Santa Rosa de Osos', 'Carmen de Viboral', 'Sonsón', 'Abejorral'] },
  { nombre: 'Arauca', ciudades: ['Arauca', 'Arauquita', 'Saravena', 'Tame', 'Fortul', 'Puerto Rondón', 'Cravo Norte'] },
  { nombre: 'Atlántico', ciudades: ['Barranquilla', 'Soledad', 'Malambo', 'Sabanalarga', 'Puerto Colombia', 'Galapa', 'Baranoa', 'Sabanagrande', 'Santo Tomás', 'Palmar de Varela', 'Polonuevo', 'Ponedera', 'Repelón', 'Candelaria', 'Luruaco', 'Manatí', 'Campo de la Cruz', 'Suan', 'Santa Lucía', 'Usiacurí', 'Juan de Acosta', 'Piojó', 'Tubará'] },
  { nombre: 'Bogotá D.C.', ciudades: ['Bogotá'] },
  { nombre: 'Bolívar', ciudades: ['Cartagena', 'Magangué', 'Turbaco', 'Arjona', 'El Carmen de Bolívar', 'Mompós', 'San Juan Nepomuceno', 'María la Baja', 'San Jacinto', 'Turbaná', 'Santa Rosa', 'Santa Catalina', 'Clemencia', 'San Estanislao', 'Mahates', 'San Pablo', 'Simití', 'Morales', 'Achí', 'Montecristo', 'Zambrano', 'Córdoba'] },
  { nombre: 'Boyacá', ciudades: ['Tunja', 'Duitama', 'Sogamoso', 'Chiquinquirá', 'Paipa', 'Villa de Leyva', 'Puerto Boyacá', 'Moniquirá', 'Garagoa', 'Nobsa', 'Tibasosa', 'Sotaquirá', 'Ramiriquí', 'Samacá', 'Ventaquemada', 'Villa Pinzón', 'Cómbita', 'Motavita', 'Toca', 'Tuta', 'Chíquiza', 'Turmequé', 'Miraflores', 'Otanche', 'Pauna', 'Muzo', 'Soatá', 'Guateque'] },
  { nombre: 'Caldas', ciudades: ['Manizales', 'La Dorada', 'Chinchiná', 'Villamaría', 'Riosucio', 'Anserma', 'Salamina', 'Aguadas', 'Neira', 'Palestina', 'Supía', 'Filadelfia', 'Pácora', 'Manzanares', 'Aranzazu', 'Viterbo', 'Marmato', 'Marulanda', 'Samaná', 'Victoria'] },
  { nombre: 'Caquetá', ciudades: ['Florencia', 'San Vicente del Caguán', 'Puerto Rico', 'El Doncello', 'Cartagena del Chairá', 'La Montañita', 'Milán', 'Belén de los Andaquíes', 'Curillo', 'El Paujil', 'Solano', 'Solita', 'Valparaíso', 'Albania'] },
  { nombre: 'Casanare', ciudades: ['Yopal', 'Aguazul', 'Villanueva', 'Tauramena', 'Monterrey', 'Paz de Ariporo', 'Trinidad', 'Orocué', 'Maní', 'Sabanalarga', 'Hato Corozal', 'Pore', 'Nunchía', 'San Luis de Palenque'] },
  { nombre: 'Cauca', ciudades: ['Popayán', 'Santander de Quilichao', 'Puerto Tejada', 'Piendamó', 'El Bordo', 'Patía', 'Timbío', 'Cajibío', 'Silvia', 'Miranda', 'Corinto', 'Caloto', 'Guapi', 'Bolívar', 'La Vega', 'Rosas', 'Sotará', 'Totoró', 'Toribío', 'Jambaló', 'Padilla', 'Morales', 'Suárez', 'López de Micay'] },
  { nombre: 'Cesar', ciudades: ['Valledupar', 'Aguachica', 'Codazzi', 'La Jagua de Ibirico', 'Bosconia', 'Curumaní', 'Chimichagua', 'La Paz', 'San Diego', 'Chiriguaná', 'Pailitas', 'Astrea', 'Becerril', 'El Copey', 'La Gloria', 'Pelaya', 'Manaure', 'San Alberto', 'San Martín', 'Río de Oro', 'González', 'Tamalameque'] },
  { nombre: 'Chocó', ciudades: ['Quibdó', 'Istmina', 'Condoto', 'Tadó', 'Riosucio', 'Acandí', 'Bahía Solano', 'Nuquí', 'Bojayá', 'Alto Baudó', 'Bagadó', 'Lloró', 'Certegui', 'San José del Palmar', 'Unguía', 'Juradó'] },
  { nombre: 'Córdoba', ciudades: ['Montería', 'Cereté', 'Lorica', 'Sahagún', 'Planeta Rica', 'Montelíbano', 'Tierralta', 'Ciénaga de Oro', 'San Andrés de Sotavento', 'Chinú', 'San Pelayo', 'Puerto Libertador', 'Pueblo Nuevo', 'Ayapel', 'Valencia', 'Cotorra', 'Moñitos', 'Los Córdobas', 'Momil', 'San Bernardo del Viento', 'Purísima', 'San Carlos', 'Buenavista'] },
  { nombre: 'Cundinamarca', ciudades: ['Soacha', 'Chía', 'Zipaquirá', 'Facatativá', 'Fusagasugá', 'Girardot', 'Mosquera', 'Madrid', 'Funza', 'Cajicá', 'Ubaté', 'Cota', 'Tenjo', 'Sopó', 'La Calera', 'Tabio', 'Tocancipá', 'Gachancipá', 'Sibaté', 'Subachoque', 'El Rosal', 'Bojacá', 'Guaduas', 'Villeta', 'La Vega', 'Anapoima', 'Apulo', 'Tocaima', 'Anolaima', 'La Mesa', 'San Antonio del Tequendama', 'Silvania', 'Arbeláez', 'Pandi', 'Pasca', 'Chocontá', 'Suesca', 'Cucunubá', 'Guatavita', 'Nemocón', 'Cogua', 'Zipacón', 'Nilo', 'Agua de Dios', 'Ricaurte', 'Nariño', 'Guayabetal', 'Quetame', 'Une', 'Chipaque', 'Cáqueza', 'Fómeque', 'Villapinzón'] },
  { nombre: 'Guainía', ciudades: ['Inírida', 'Barranco Minas', 'Mapiripana', 'San Felipe', 'Puerto Colombia', 'La Guadalupe', 'Cacahual', 'Pana Pana', 'Morichal'] },
  { nombre: 'Guaviare', ciudades: ['San José del Guaviare', 'Calamar', 'El Retorno', 'Miraflores'] },
  { nombre: 'Huila', ciudades: ['Neiva', 'Pitalito', 'Garzón', 'La Plata', 'Campoalegre', 'Rivera', 'Palermo', 'Aipe', 'Gigante', 'Timaná', 'Isnos', 'San Agustín', 'Suaza', 'Guadalupe', 'Algeciras', 'Baraya', 'Tello', 'Villavieja', 'Yaguará', 'Hobo', 'Íquira', 'Nátaga', 'Paicol', 'Agrado', 'Tesalia', 'Altamira', 'Elías', 'Oporapa', 'Pital', 'Saladoblanco', 'Acevedo'] },
  { nombre: 'La Guajira', ciudades: ['Riohacha', 'Maicao', 'Uribia', 'Fonseca', 'San Juan del Cesar', 'Villanueva', 'Barrancas', 'Distracción', 'El Molino', 'Hatonuevo', 'La Jagua del Pilar', 'Manaure', 'Urumita', 'Dibulla', 'Albania'] },
  { nombre: 'Magdalena', ciudades: ['Santa Marta', 'Ciénaga', 'Fundación', 'Aracataca', 'El Banco', 'Plato', 'Zona Bananera', 'Pivijay', 'Sitionuevo', 'Remolino', 'El Retén', 'Algarrobo', 'Pueblo Viejo', 'Chibolo', 'Tenerife', 'Salamina', 'Cerro de San Antonio', 'Concordia', 'Pedraza', 'Sabanas de San Ángel', 'Ariguaní', 'Nueva Granada', 'San Sebastián de Buenavista', 'San Zenón', 'Santa Ana', 'Guamal', 'Santa Bárbara de Pinto'] },
  { nombre: 'Meta', ciudades: ['Villavicencio', 'Acacías', 'Granada', 'Puerto López', 'San Martín', 'Cumaral', 'Puerto Gaitán', 'Restrepo', 'Guamal', 'Castilla la Nueva', 'El Castillo', 'Fuente de Oro', 'Puerto Lleras', 'Cubarral', 'El Dorado', 'Lejanías', 'San Carlos de Guaroa', 'Vistahermosa', 'Puerto Rico', 'Mapiripán'] },
  { nombre: 'Nariño', ciudades: ['Pasto', 'Ipiales', 'Tumaco', 'Túquerres', 'La Unión', 'Samaniego', 'Sandoná', 'Barbacoas', 'La Cruz', 'Buesaco', 'Chachagüí', 'Guaitarilla', 'Cumbal', 'Aldana', 'Consacá', 'Yacuanquer', 'Puerres', 'Córdoba', 'Potosí', 'Contadero', 'Funes', 'Gualmatán', 'Iles', 'Imués', 'Ospina', 'Sapuyes', 'Belén'] },
  { nombre: 'Norte de Santander', ciudades: ['Cúcuta', 'Ocaña', 'Pamplona', 'Villa del Rosario', 'Los Patios', 'Chinácota', 'Tibú', 'El Zulia', 'Ábrego', 'La Playa', 'Convención', 'Teorama', 'El Tarra', 'Sardinata', 'Bochalema', 'Durania', 'Herrán', 'Ragonvalia', 'Toledo', 'Pamplonita', 'Cácota', 'Salazar', 'Arboledas'] },
  { nombre: 'Putumayo', ciudades: ['Mocoa', 'Puerto Asís', 'Orito', 'Sibundoy', 'Valle del Guamuez', 'San Miguel', 'Villagarzón', 'Puerto Guzmán', 'Puerto Caicedo', 'Puerto Leguízamo', 'Colón', 'Santiago'] },
  { nombre: 'Quindío', ciudades: ['Armenia', 'Calarcá', 'Montenegro', 'La Tebaida', 'Quimbaya', 'Circasia', 'Filandia', 'Salento', 'Génova', 'Buenavista', 'Córdoba', 'Pijao'] },
  { nombre: 'Risaralda', ciudades: ['Pereira', 'Dosquebradas', 'Santa Rosa de Cabal', 'La Virginia', 'Marsella', 'Belén de Umbría', 'Guática', 'Quinchía', 'Apía', 'Santuario', 'Balboa', 'Mistrató', 'La Celia', 'Pueblo Rico'] },
  { nombre: 'San Andrés y Providencia', ciudades: ['San Andrés', 'Providencia'] },
  { nombre: 'Santander', ciudades: ['Bucaramanga', 'Floridablanca', 'Girón', 'Piedecuesta', 'Barrancabermeja', 'San Gil', 'Socorro', 'Málaga', 'Barbosa', 'Vélez', 'Lebrija', 'Rionegro', 'Los Santos', 'Zapatoca', 'Sabana de Torres', 'Puerto Wilches', 'San Vicente de Chucurí', 'Landázuri', 'Charalá', 'Cimitarra', 'Betulia', 'Suaita', 'Curití', 'Barichara', 'Confines', 'Villanueva', 'Aratoca', 'Onzaga'] },
  { nombre: 'Sucre', ciudades: ['Sincelejo', 'Corozal', 'San Marcos', 'Sampués', 'Tolú', 'San Onofre', 'Coveñas', 'Sincé', 'Galeras', 'Ovejas', 'Morroa', 'Los Palmitos', 'Buenavista', 'San Benito Abad', 'Majagual', 'Sucre', 'Guaranda', 'La Unión', 'San Pedro', 'Corozal'] },
  { nombre: 'Tolima', ciudades: ['Ibagué', 'Espinal', 'Melgar', 'Honda', 'Chaparral', 'Líbano', 'Mariquita', 'Fresno', 'Guamo', 'Purificación', 'Flandes', 'Girardot', 'Armero', 'Lérida', 'Venadillo', 'Alvarado', 'Piedras', 'Coyaima', 'Natagaima', 'Ortega', 'Rovira', 'Roncesvalles', 'San Luis', 'Suárez', 'Icononzo', 'Cunday', 'Villarrica', 'Prado'] },
  { nombre: 'Valle del Cauca', ciudades: ['Cali', 'Palmira', 'Buenaventura', 'Tuluá', 'Cartago', 'Buga', 'Yumbo', 'Jamundí', 'Candelaria', 'Florida', 'Pradera', 'Zarzal', 'Sevilla', 'Roldanillo', 'La Unión', 'Bugalagrande', 'Guacarí', 'Ginebra', 'El Cerrito', 'Andalucía', 'Caicedonia', 'Obando', 'Toro', 'Ansermanuevo', 'Argelia', 'El Águila', 'El Dovio', 'Restrepo', 'Vijes', 'Yotoco', 'Dagua', 'La Cumbre', 'Riofrío', 'Trujillo', 'Alcalá', 'Ulloa'] },
  { nombre: 'Vaupés', ciudades: ['Mitú', 'Carurú', 'Taraira', 'Papunaua', 'Yavaraté'] },
  { nombre: 'Vichada', ciudades: ['Puerto Carreño', 'La Primavera', 'Santa Rosalía', 'Cumaribo'] }
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
