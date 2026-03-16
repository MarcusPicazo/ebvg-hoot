import React, { useState } from 'react';
import { PlusCircle, Save, Plus, BookOpen, Image as ImageIcon, Loader2, UploadCloud, XCircle } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../config/firebase';

export const CreateKahoot = ({ onSave, showAlert, goTo }) => {
  const [newQuiz, setNewQuiz] = useState({ title: '', subject: 'Matemáticas', timeLimit: 30, questions: [] });
  const [uploadingIndex, setUploadingIndex] = useState(null);

  const handleSave = () => {
    if(!newQuiz.title) return showAlert('Por favor, ingresa un título para el ebvg-hoot.');
    if(newQuiz.questions.length === 0) return showAlert('Añade al menos una pregunta.');
    onSave(newQuiz);
  };

  /**
   * Handles image upload to Firebase Storage and sets the public URL
   */
  const handleImageUpload = async (e, qIndex) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      showAlert("La imagen es muy pesada (máximo 5MB).");
      return;
    }
    
    setUploadingIndex(qIndex);
    try {
      const fileExt = file.name.split('.').pop();
      const uniqueName = `img_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const imageRef = ref(storage, `ebvghoot_images/${uniqueName}`);
      
      const snapshot = await uploadBytes(imageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      const newQs = [...newQuiz.questions];
      newQs[qIndex].imageUrl = downloadURL;
      setNewQuiz({ ...newQuiz, questions: newQs });
    } catch (error) {
      console.error("Storage upload error:", error);
      showAlert("Hubo un error al subir la imagen. Verifica los permisos de Storage.");
    } finally {
      setUploadingIndex(null);
    }
  };

  return (
    <div className="relative z-10 min-h-screen text-white p-6 md:p-12">
      <div className="max-w-5xl mx-auto bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-[2rem] shadow-2xl reveal-on-scroll opacity-100 translate-y-0 transition-all duration-700">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-8 border-b border-white/10 pb-6 gap-4">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <PlusCircle className="text-cyan-400 w-8 h-8" />
            Crear nuevo ebvg-hoot
          </h1>
          <button
            onClick={handleSave}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-3 rounded-xl font-bold hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-lg"
          >
            <Save className="w-5 h-5" /> Guardar
          </button>
        </header>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-gray-400 mb-2 font-medium">Título del ebvg-hoot</label>
              <input
                type="text"
                placeholder="Ej. Examen sorpresa"
                value={newQuiz.title}
                onChange={(e) => setNewQuiz({ ...newQuiz, title: e.target.value })}
                className="w-full bg-black/30 border border-white/20 rounded-xl py-4 px-6 text-white text-xl focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-2 font-medium">Materia</label>
              <select
                value={newQuiz.subject}
                onChange={(e) => setNewQuiz({ ...newQuiz, subject: e.target.value })}
                className="w-full bg-black/30 border border-white/20 rounded-xl py-4 px-6 text-white text-lg focus:outline-none focus:border-cyan-500 transition-colors appearance-none"
              >
                <option value="Matemáticas" className="bg-gray-900">Matemáticas</option>
                <option value="Ciencias" className="bg-gray-900">Ciencias</option>
                <option value="Historia" className="bg-gray-900">Historia</option>
                <option value="Geografía" className="bg-gray-900">Geografía</option>
                <option value="Literatura" className="bg-gray-900">Literatura</option>
                <option value="Otro" className="bg-gray-900">Otro</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-400 mb-2 font-medium">Tiempo por Pregunta (seg)</label>
              <input
                type="number"
                min="5"
                max="120"
                value={newQuiz.timeLimit || 30}
                onChange={(e) => setNewQuiz({ ...newQuiz, timeLimit: Number(e.target.value) })}
                className="w-full bg-black/30 border border-white/20 rounded-xl py-4 px-6 text-white text-lg focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          <div className="pt-8 mt-8 border-t border-white/10">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
              <h2 className="text-2xl font-bold">Preguntas ({newQuiz.questions.length})</h2>
              <button
                onClick={() => setNewQuiz({
                  ...newQuiz,
                  questions: [...newQuiz.questions, { q: '', options: ['', '', '', ''], correct: 0, imageUrl: '' }]
                })}
                className="w-full sm:w-auto px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center gap-2 transition-colors font-bold cursor-pointer border border-white/10"
              >
                <Plus className="w-5 h-5" /> Añadir Pregunta
              </button>
            </div>

            {newQuiz.questions.length === 0 ? (
              <div className="text-center py-16 bg-black/20 rounded-3xl border border-white/5 border-dashed flex flex-col items-center justify-center">
                <BookOpen className="w-12 h-12 text-gray-500 mb-4 opacity-50" />
                <p className="text-xl text-gray-400 font-medium">Aún no hay preguntas. ¡Añade la primera!</p>
              </div>
            ) : (
              <div className="space-y-8">
                {newQuiz.questions.map((q, qIndex) => (
                  <div key={qIndex} className="bg-black/40 p-6 md:p-8 rounded-3xl border border-white/10 relative overflow-hidden shadow-lg">
                    <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-pink-500 to-cyan-500"></div>
                    <div className="pl-4 md:pl-6 w-full">
                      <input
                        type="text"
                        placeholder={`¿Cuál es la pregunta ${qIndex + 1}?`}
                        value={q.q}
                        onChange={(e) => {
                          const newQs = [...newQuiz.questions];
                          newQs[qIndex].q = e.target.value;
                          setNewQuiz({ ...newQuiz, questions: newQs });
                        }}
                        className="w-full bg-transparent border-b border-white/20 pb-2 mb-6 text-xl focus:outline-none focus:border-pink-500 transition-colors font-bold"
                      />

                      <div className="mb-6 bg-black/30 p-4 rounded-xl border border-dashed border-white/20">
                        <label className="flex items-center gap-2 text-sm text-gray-400 mb-2 font-medium">
                          <ImageIcon className="w-4 h-4" /> Imagen (Opcional)
                        </label>
                        <div className="flex items-center gap-2 mb-4">
                          <input
                            type="text"
                            placeholder="Pega un enlace de imagen (https://... o Base64)"
                            value={q.imageUrl}
                            onChange={(e) => {
                              const newQs = [...newQuiz.questions];
                              newQs[qIndex].imageUrl = e.target.value;
                              setNewQuiz({ ...newQuiz, questions: newQs });
                            }}
                            className="flex-1 bg-black/50 border border-white/10 rounded-lg py-3 px-4 focus:outline-none focus:border-cyan-500 transition-colors"
                          />
                          <label className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 p-3 rounded-lg cursor-pointer transition-colors border border-white/10 shrink-0">
                            {uploadingIndex === qIndex ? (
                              <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
                            ) : (
                              <UploadCloud className="w-5 h-5 text-cyan-400" />
                            )}
                            <span className="hidden sm:inline text-sm font-medium">Subir</span>
                            <input
                              type="file"
                              accept="image/png, image/jpeg, image/webp"
                              className="hidden"
                              onChange={(e) => handleImageUpload(e, qIndex)}
                              disabled={uploadingIndex === qIndex}
                            />
                          </label>
                        </div>
                        
                        {q.imageUrl && (
                          <div className="mt-2 text-center relative group inline-block w-full">
                            <span className="text-xs text-green-400 block mb-2">Vista Previa:</span>
                            <img
                              key={q.imageUrl} // <-- Esta es la clave mágica para forzar la recarga
                              src={q.imageUrl}
                              alt="Vista Previa"
                              className="max-h-40 rounded-lg border border-white/20 mx-auto object-contain bg-black/50"
                              onError={(e) => e.target.style.display = 'none'}
                            />
                            <button
                              onClick={() => {
                                const newQs = [...newQuiz.questions];
                                newQs[qIndex].imageUrl = '';
                                setNewQuiz({ ...newQuiz, questions: newQs });
                              }}
                              className="absolute top-6 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                              title="Eliminar imagen"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {['Opción A (Triángulo)', 'Opción B (Círculo)', 'Opción C (Cuadrado)', 'Opción D (Rombo)'].map((optPlaceholder, oIndex) => (
                          <div key={oIndex} className="flex items-center gap-3">
                            <input
                              type="radio"
                              name={`correct-${qIndex}`}
                              checked={q.correct === oIndex}
                              onChange={() => {
                                const newQs = [...newQuiz.questions];
                                newQs[qIndex].correct = oIndex;
                                setNewQuiz({ ...newQuiz, questions: newQs });
                              }}
                              className="w-5 h-5 accent-pink-500 cursor-pointer"
                            />
                            <input
                              type="text"
                              placeholder={optPlaceholder}
                              value={q.options[oIndex]}
                              onChange={(e) => {
                                const newQs = [...newQuiz.questions];
                                newQs[qIndex].options[oIndex] = e.target.value;
                                setNewQuiz({ ...newQuiz, questions: newQs });
                              }}
                              className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 focus:outline-none focus:border-cyan-500 transition-colors"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};