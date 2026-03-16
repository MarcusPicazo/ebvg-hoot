// src/utils/constants.js
export const MATERIAS = {
  Matemáticas: ["Álgebra Básica", "Geometría Espacial", "Cálculo Integral", "Fracciones y Decimales", "Estadística Aplicada", "Trigonometría", "Aritmética Mental", "Probabilidad", "Lógica Matemática", "Ecuaciones Lineales", "Sumas y Restas (Primaria)", "Figuras Básicas (Primaria)", "Aprender a Multiplicar (Primaria)"],
  Ciencias: ["Biología Celular", "Química Orgánica", "Física Cuántica", "El Sistema Solar", "Anatomía Humana", "Ecología y Clima", "Genética Básica", "Botánica", "Geología Terrestre", "Zoología", "Los 5 Sentidos (Primaria)", "Estados del Agua (Primaria)", "Animales y Plantas (Primaria)"],
  Historia: ["Antigua Roma", "Antiguo Egipto", "Guerras Mundiales", "Revolución Industrial", "La Edad Media", "El Renacimiento", "Guerra Fría", "Independencias Latinas", "Imperio Inca", "Revolución Francesa", "Cristóbal Colón (Primaria)", "Los Dinosaurios (Primaria)", "Día de Muertos (Primaria)"],
  Geografía: ["Capitales del Mundo", "Ríos y Lagos", "Cadenas Montañosas", "Climas Globales", "Banderas del Mundo", "Los Continentes", "Océanos y Mares", "Demografía", "Desiertos Famosos", "Geopolítica Actual", "Los Puntos Cardinales (Primaria)", "Los Continentes Básico (Primaria)", "El Clima (Primaria)"],
  Literatura: ["Novelas Clásicas", "Poesía Romántica", "Autores Latinoamericanos", "Mitología Griega", "Teatro Shakespeariano", "Cuentos Cortos", "Ciencia Ficción", "El Romanticismo", "Premios Nobel", "Gramática Avanzada", "Cuentos Clásicos (Primaria)", "Las Vocales (Primaria)", "Adivinanzas Infantiles (Primaria)"],
  Otro: [] 
};

export const AVATARS = [
  '🦊', '🐼', '🐯', '🦁', '🐸', '🐵', '🦄', '👽', '🤖', '👻', '🦖', '🐙', 
  '🦉', '🦋', '🐢', '🐧', '🐠', '🐬', '🦥', '🦦', '🦔', '🐉', '👾', '🤡'
];

export const generarPreguntasDinámicas = (tema, imageUrl) => {
  const preguntas = [];
  for (let i = 1; i <= 20; i++) {
    let qText = "";
    let correct = i % 4; 

    if (i === 1) qText = `¿Cuál de las siguientes opciones define mejor a "${tema}"?`;
    else if (i === 2) qText = `¿En qué área principal se aplica el estudio de ${tema}?`;
    else if (i === 3) qText = `¿Cuál es una característica fundamental de ${tema}?`;
    else if (i === 4) qText = `Identifica el elemento que NO pertenece a ${tema}.`;
    else if (i === 5) qText = `Verdadero o Falso: El dominio de ${tema} requiere práctica constante.`;
    else if (i === 6) qText = `¿Quiénes son los principales beneficiados del avance en ${tema}?`;
    else if (i === 7) qText = `¿Cuál es el error más común al aprender sobre ${tema}?`;
    else if (i === 8) qText = `Selecciona el concepto que está directamente relacionado con ${tema}.`;
    else if (i === 9) qText = `¿Qué herramienta o método facilita el aprendizaje de ${tema}?`;
    else if (i === 10) qText = `¿En qué momento histórico tuvo un gran impacto ${tema}?`;
    else if (i === 11) qText = `¿Cuál es el primer paso para dominar ${tema}?`;
    else if (i === 12) qText = `Si alguien es experto en ${tema}, ¿qué habilidad posee?`;
    else if (i === 13) qText = `¿Qué sucede cuando se ignoran los principios de ${tema}?`;
    else if (i === 14) qText = `¿Cómo se evalúa correctamente el conocimiento en ${tema}?`;
    else if (i === 15) qText = `¿Cuál es el sinónimo o concepto equivalente más cercano a ${tema}?`;
    else if (i === 16) qText = `¿Qué recurso es considerado fundamental para ${tema}?`;
    else if (i === 17) qText = `¿Cuál es el nivel de dificultad general de ${tema} para principiantes?`;
    else if (i === 18) qText = `¿De qué otra disciplina se nutre principalmente ${tema}?`;
    else if (i === 19) qText = `¿Qué mito es totalmente falso respecto a ${tema}?`;
    else if (i === 20) qText = `En resumen, ¿por qué es importante estudiar ${tema}?`;
    
    let options = [
      `Opción analítica A`,
      `Concepto teórico B`,
      `Práctica común C`,
      `Ninguna de las anteriores`
    ];
    options[correct] = `Respuesta correcta sobre ${tema}`;

    preguntas.push({
      id: i,
      q: qText,
      imageUrl: (i === 1 || i === 10 || i === 20) ? imageUrl : '',
      options: options,
      correct: correct
    });
  }
  return preguntas;
};

export const generarKahoots = () => {
  const quizzes = [];
  let id = 1;
  const colors = ['bg-pink-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500'];
  let colorIdx = 0;
  
  for (const [materia, temas] of Object.entries(MATERIAS)) {
    temas.forEach((tema) => {
      let imageUrl = '';
      if (tema === "El Sistema Solar") imageUrl = "";

      quizzes.push({
        id: id++,
        title: `${tema}`,
        subject: materia,
        color: colors[colorIdx % colors.length],
        isCustom: false,
        questions: generarPreguntasDinámicas(tema, imageUrl)
      });
    });
    colorIdx++;
  }
  return quizzes;
};

export const DB_QUIZZES = generarKahoots();