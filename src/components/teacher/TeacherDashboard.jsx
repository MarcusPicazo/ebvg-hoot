import React, { useState } from 'react';
import { 
  Search, PlusCircle, Trash2, ArrowRight, 
  Calculator, FlaskConical, Landmark, Globe, BookHeart, CheckCircle, BookOpen 
} from 'lucide-react';

// Helper de iconos integrado directamente para evitar errores de importación
const getSubjectIcon = (subject) => {
  switch (subject) {
    case 'Matemáticas': return <Calculator className="text-white w-6 h-6" />;
    case 'Ciencias': return <FlaskConical className="text-white w-6 h-6" />;
    case 'Historia': return <Landmark className="text-white w-6 h-6" />;
    case 'Geografía': return <Globe className="text-white w-6 h-6" />;
    case 'Literatura': return <BookHeart className="text-white w-6 h-6" />;
    case 'Otro': return <CheckCircle className="text-white w-6 h-6" />;
    default: return <BookOpen className="text-white w-6 h-6" />;
  }
};

export const TeacherDashboard = ({ customQuizzes, dbQuizzes, handleHostQuiz, handleDeleteKahoot, goTo }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Todas');

  const tabs = ['Todas', 'Matemáticas', 'Ciencias', 'Historia', 'Geografía', 'Literatura', 'Otro'];
  const allQuizzes = [...(customQuizzes || []), ...(dbQuizzes || [])];

  /**
   * Normalizes strings by removing diacritics (accents) for robust searching.
   */
  const removeAccents = (str) => {
    if (!str) return '';
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };

  // Search logic: Filters by exact tab and fuzzy/accent-insensitive text
  const filteredQuizzes = allQuizzes.filter(q => {
    const matchTab = activeTab === 'Todas' || q.subject === activeTab;
    const safeTitle = removeAccents(q.title).toLowerCase();
    const safeSearch = removeAccents(searchQuery).toLowerCase();
    const matchSearch = safeTitle.includes(safeSearch);
    
    return matchTab && matchSearch;
  });

  return (
    <div className="relative z-10 min-h-screen text-white p-6 md:p-12 flex flex-col">
      <div className="max-w-7xl mx-auto w-full flex-1">
        <header className="flex flex-col md:flex-row justify-between items-center md:items-end mb-12 gap-6 transition-all duration-700">
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-bold mb-2">Dashboard del Maestro</h1>
            <p className="text-gray-400">Mostrando {filteredQuizzes.length} ebvg-hoots listos para jugar.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-center">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar temas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-2xl py-3 pl-12 pr-4 text-white backdrop-blur-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
              />
            </div>
            <button
              onClick={() => goTo('CREATE_KAHOOT')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold rounded-2xl transition-all shadow-lg active:scale-95 whitespace-nowrap cursor-pointer"
            >
              <PlusCircle className="w-5 h-5" /> Crear ebvg-hoot
            </button>
          </div>
        </header>

        <div className="flex overflow-x-auto pt-4 pb-6 px-2 mb-8 gap-3 custom-tabs-scrollbar transition-all duration-700 delay-100 items-center">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`mx-1 px-6 py-2 rounded-full whitespace-nowrap font-medium transition-all active:scale-95 cursor-pointer ${
                activeTab === tab
                  ? 'bg-pink-500 text-white shadow-[0_0_15px_rgba(236,72,153,0.7)]'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz, i) => (
            <div
              key={quiz.id}
              onClick={() => handleHostQuiz(quiz)}
              className={`group bg-white/5 backdrop-blur-md border ${
                quiz.isCustom ? 'border-cyan-500/50' : 'border-white/10'
              } rounded-3xl p-6 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between`}
            >
              <div>
                <div className="flex justify-between items-start">
                  <div className={`w-12 h-12 rounded-xl mb-4 ${quiz.color || 'bg-indigo-500'} shadow-lg flex items-center justify-center`}>
                    {getSubjectIcon(quiz.subject)}
                  </div>
                  {quiz.isCustom && (
                    <button
                      onClick={(e) => handleDeleteKahoot(e, quiz)}
                      className="text-gray-500 hover:text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-colors cursor-pointer"
                      title="Eliminar este ebvg-hoot"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
                <h3 className="text-2xl font-bold mb-2 text-white group-hover:text-pink-300 transition-colors">{quiz.title}</h3>
                <div className="flex gap-2 mb-4">
                  <span className="inline-block px-3 py-1 bg-white/10 rounded-lg text-sm text-gray-300">{quiz.subject}</span>
                  {quiz.isCustom && <span className="inline-block px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-lg text-sm font-medium border border-cyan-500/30">Comunidad</span>}
                </div>
              </div>
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/10">
                <span className="text-gray-400 text-sm">{quiz.questions.length} Preguntas</span>
                <button className="flex items-center gap-2 text-cyan-400 font-bold group-hover:translate-x-1 transition-transform cursor-pointer">
                  Proyectar <ArrowRight className="w-4 h-4"/>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};