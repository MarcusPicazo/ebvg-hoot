import React, { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { Clock, ArrowRight, Trophy, CheckCircle, XCircle, Image as ImageIcon } from 'lucide-react';
import { db, appId } from '../../config/firebase';

const AnswerShapes = [
  { color: 'bg-red-500', shadow: 'shadow-[0_12px_0_#b91c1c]', activeShadow: 'active:shadow-[0_0px_0_#b91c1c]', icon: <svg viewBox="0 0 100 100" className="w-12 h-12 md:w-16 md:h-16 fill-white drop-shadow-md"><polygon points="50,10 10,90 90,90"/></svg> },
  { color: 'bg-blue-500', shadow: 'shadow-[0_12px_0_#1d4ed8]', activeShadow: 'active:shadow-[0_0px_0_#1d4ed8]', icon: <svg viewBox="0 0 100 100" className="w-12 h-12 md:w-16 md:h-16 fill-white drop-shadow-md"><circle cx="50" cy="50" r="40"/></svg> },
  { color: 'bg-yellow-500', shadow: 'shadow-[0_12px_0_#a16207]', activeShadow: 'active:shadow-[0_0px_0_#a16207]', icon: <svg viewBox="0 0 100 100" className="w-12 h-12 md:w-16 md:h-16 fill-white drop-shadow-md"><rect x="15" y="15" width="70" height="70" rx="10"/></svg> },
  { color: 'bg-green-500', shadow: 'shadow-[0_12px_0_#15803d]', activeShadow: 'active:shadow-[0_0px_0_#15803d]', icon: <svg viewBox="0 0 100 100" className="w-12 h-12 md:w-16 md:h-16 fill-white drop-shadow-md"><polygon points="50,10 90,50 50,90 10,50"/></svg> }
];

const ImageRenderer = ({ src, alt }) => {
  if (!src) return null;
  if (src.startsWith('http')) {
    return <img src={src} alt={alt} className="w-full max-h-56 object-contain rounded-2xl mx-auto mb-6 shadow-2xl border border-white/10 bg-black/30" onError={(e) => e.target.style.display = 'none'} />;
  }
  return (
    <div className="w-full max-w-lg mx-auto h-48 bg-gradient-to-br from-cyan-900/40 to-pink-900/40 border border-dashed border-white/20 rounded-2xl flex items-center justify-center mb-6 shadow-lg backdrop-blur-sm">
      <div className="text-center">
        <ImageIcon className="w-8 h-8 mx-auto text-gray-400 mb-2 opacity-50" />
        <span className="text-cyan-300 font-mono text-sm tracking-wide">{src}</span>
      </div>
    </div>
  );
};

export const GameView = ({ role, gameState, selectedQuiz, playersList, hostPin, user, player, goTo }) => {
  const [hasAnswered, setHasAnswered] = useState(false);
  const [myLastResult, setMyLastResult] = useState(null);

  // Leemos el tiempo configurado en el quiz, o aplicamos 30 segundos por defecto
  const quizTimeLimit = selectedQuiz?.timeLimit || 30;
  const [timeLeft, setTimeLeft] = useState(quizTimeLimit);

  // Temporizador Inteligente
  useEffect(() => {
    if (role === 'HOST' && gameState?.status === 'question_active') {
      setTimeLeft(quizTimeLimit); 
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleTimeUp(); // Corta automáticamente
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameState?.status, gameState?.currentQuestionIndex, role, quizTimeLimit]);

  // Reseteo para el alumno en cada pregunta
  useEffect(() => {
    if (gameState?.status === 'question_active') {
      setHasAnswered(false);
      setMyLastResult(null);
    }
  }, [gameState?.currentQuestionIndex, gameState?.status]);

  if (!gameState || !selectedQuiz) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <span className="animate-pulse text-2xl font-bold">Cargando partida...</span>
      </div>
    );
  }

  const currentIndex = gameState.currentQuestionIndex || 0;
  const currentQuestion = selectedQuiz.questions[currentIndex];
  const status = gameState.status;

  const handleTimeUp = async () => {
    if (!db || !hostPin) return;
    const gameRef = doc(db, 'artifacts', appId, 'public', 'data', 'partidas_activas', hostPin);
    await updateDoc(gameRef, { status: 'question_result' });
  };

  const handleNext = async () => {
    if (!db || !hostPin) return;
    const nextIndex = currentIndex + 1;
    const gameRef = doc(db, 'artifacts', appId, 'public', 'data', 'partidas_activas', hostPin);
    if (nextIndex < selectedQuiz.questions.length) {
      await updateDoc(gameRef, {
        status: 'question_active',
        currentQuestionIndex: nextIndex,
        questionStartTime: Date.now()
      });
    } else {
      await updateDoc(gameRef, { status: 'podium' });
    }
  };

  const handleEndGame = async () => {
    if (!db || !hostPin) return;
    const gameRef = doc(db, 'artifacts', appId, 'public', 'data', 'partidas_activas', hostPin);
    await updateDoc(gameRef, { status: 'finished' });
    goTo('TEACHER_DASH');
  };

  const handleAnswerClick = async (answerIndex) => {
    if (hasAnswered || status !== 'question_active') return;
    setHasAnswered(true);
    
    const delay = Date.now() - (gameState.questionStartTime || Date.now());
    const isCorrect = currentQuestion.correct === answerIndex;
    let earnedPoints = 0;
    
    if (isCorrect) {
      earnedPoints = Math.max(100, 1000 - Math.floor(delay / 10));
    }
    
    setMyLastResult({ isCorrect, earnedPoints });

    try {
      const gameRef = doc(db, 'artifacts', appId, 'public', 'data', 'partidas_activas', hostPin);
      const myData = gameState.players?.[user?.uid];
      const currentScore = myData?.score || 0;
      
      await updateDoc(gameRef, {
        [`players.${user.uid}.score`]: currentScore + earnedPoints,
        [`players.${user.uid}.lastAnswerCorrect`]: isCorrect
      });
    } catch (e) {
      console.error("Error saving score", e);
    }
  };

  // ==========================================
  // VISTA DEL MAESTRO (PROYECTOR)
  // ==========================================
  if (role === 'HOST') {
    if (status === 'podium') {
      const sortedPlayers = [...playersList].sort((a, b) => b.score - a.score).slice(0, 3);
      return (
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-white p-6">
          <Trophy className="w-24 h-24 text-yellow-400 mb-8 drop-shadow-[0_0_20px_rgba(250,204,21,0.5)]" />
          <h1 className="text-6xl font-black mb-16 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-600">¡Podio Final!</h1>
          
          <div className="flex items-end justify-center gap-4 md:gap-8 h-64 mb-16">
            {sortedPlayers[1] && (
              <div className="flex flex-col items-center w-24 md:w-32">
                <span className="text-4xl mb-2">{sortedPlayers[1].avatar}</span>
                <span className="font-bold truncate w-full text-center">{sortedPlayers[1].name}</span>
                <span className="text-sm text-yellow-200 mb-2">{sortedPlayers[1].score} pts</span>
                <div className="w-full h-3/5 bg-gray-300 rounded-t-xl flex items-center justify-center text-4xl font-black text-gray-500 shadow-inner border border-white/20 backdrop-blur-sm">2</div>
              </div>
            )}
            {sortedPlayers[0] && (
              <div className="flex flex-col items-center w-28 md:w-40 z-10">
                <span className="text-5xl mb-2 animate-bounce">{sortedPlayers[0].avatar}</span>
                <span className="font-bold text-xl truncate w-full text-center text-yellow-300">{sortedPlayers[0].name}</span>
                <span className="text-md font-bold text-yellow-400 mb-2">{sortedPlayers[0].score} pts</span>
                <div className="w-full h-full bg-yellow-400 rounded-t-xl flex items-center justify-center text-5xl font-black text-yellow-700 shadow-[0_0_30px_rgba(250,204,21,0.4)] border border-yellow-200">1</div>
              </div>
            )}
            {sortedPlayers[2] && (
              <div className="flex flex-col items-center w-24 md:w-32">
                <span className="text-4xl mb-2">{sortedPlayers[2].avatar}</span>
                <span className="font-bold truncate w-full text-center">{sortedPlayers[2].name}</span>
                <span className="text-sm text-yellow-200 mb-2">{sortedPlayers[2].score} pts</span>
                <div className="w-full h-2/5 bg-orange-400 rounded-t-xl flex items-center justify-center text-3xl font-black text-orange-700 shadow-inner border border-white/20 backdrop-blur-sm">3</div>
              </div>
            )}
          </div>
          <button onClick={handleEndGame} className="px-8 py-4 bg-white/10 hover:bg-white/20 rounded-2xl font-bold transition-colors shadow-lg border border-white/20">Finalizar Partida</button>
        </div>
      );
    }

    return (
      <div className="relative z-10 flex flex-col min-h-screen text-white p-6 md:p-8">
        <div className="max-w-7xl mx-auto w-full flex flex-col h-full flex-1">
          <header className="flex justify-between items-center mb-8 bg-black/30 p-4 md:px-8 rounded-2xl border border-white/10 backdrop-blur-md">
            <span className="font-bold text-xl text-pink-400">Pregunta {currentIndex + 1} de {selectedQuiz.questions.length}</span>
            <span className="font-bold text-xl text-cyan-300 tracking-wider">PIN: {hostPin}</span>
            
            {status === 'question_active' ? (
              <button onClick={handleTimeUp} className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400 px-6 py-2 rounded-xl font-bold shadow-lg transition-transform active:scale-95 cursor-pointer">
                <Clock className="w-5 h-5 animate-pulse" /> {timeLeft}s
              </button>
            ) : (
              <button onClick={handleNext} className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 px-6 py-2 rounded-xl font-bold shadow-lg transition-transform active:scale-95 cursor-pointer">
                {currentIndex + 1 === selectedQuiz.questions.length ? 'Mostrar Podio' : 'Siguiente'} <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </header>

          <div className="flex-1 flex flex-col items-center justify-center mb-8 w-full max-w-5xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-extrabold text-center px-6 md:px-12 bg-black/40 py-10 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-md mb-8 w-full leading-tight">
              {currentQuestion?.q}
            </h2>
            <div className="w-full flex justify-center">
              <ImageRenderer src={currentQuestion?.imageUrl} alt="Ilustración" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-5xl mx-auto w-full pb-6">
            {(currentQuestion?.options || []).map((opt, i) => {
              let bgClass = AnswerShapes[i].color;
              if (status === 'question_result') {
                bgClass = currentQuestion.correct === i ? AnswerShapes[i].color : 'bg-gray-600 opacity-50';
              }
              return (
                <div key={i} className={`${bgClass} flex items-center gap-6 text-2xl md:text-3xl font-bold p-6 md:p-8 rounded-2xl shadow-[0_10px_20px_rgba(0,0,0,0.3)] transition-all duration-300`}>
                  <div className="bg-black/20 p-2 rounded-xl">{AnswerShapes[i].icon}</div>
                  <span className="flex-1 text-left drop-shadow-md">{opt}</span>
                  {status === 'question_result' && currentQuestion.correct === i && (
                    <CheckCircle className="w-10 h-10 text-white opacity-80" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VISTA DEL ALUMNO (CELULAR)
  // ==========================================
  const myData = gameState.players?.[user?.uid];
  const myScore = myData?.score || 0;

  if (status === 'podium') {
    const sortedPlayers = [...playersList].sort((a, b) => b.score - a.score);
    const myRank = sortedPlayers.findIndex(p => p.id === user?.uid) + 1;
    return (
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-white p-6 text-center">
        <div className="text-8xl mb-6 animate-bounce">{player.avatar}</div>
        <h2 className="text-3xl font-bold mb-2">{player.name}</h2>
        <div className="bg-white/10 px-8 py-4 rounded-3xl backdrop-blur-md border border-white/20 mb-8">
          <p className="text-xl text-gray-300">Puntaje Final</p>
          <p className="text-5xl font-black text-cyan-400">{myScore}</p>
        </div>
        <div className="text-2xl">Terminaste en el lugar <span className="font-bold text-yellow-400">#{myRank}</span></div>
      </div>
    );
  }

  if (status === 'question_result') {
    const showCorrect = myLastResult?.isCorrect ?? myData?.lastAnswerCorrect;
    return (
      <div className={`relative z-10 flex flex-col items-center justify-center min-h-screen text-white p-6 text-center transition-colors duration-500 ${showCorrect ? 'bg-green-600' : 'bg-red-600'}`}>
        <div className="animate-in fade-in zoom-in duration-300 flex flex-col items-center">
          {showCorrect ? <CheckCircle className="w-32 h-32 text-white mb-6 drop-shadow-xl" /> : <XCircle className="w-32 h-32 text-white mb-6 drop-shadow-xl" />}
          <h1 className="text-5xl font-black mb-4 drop-shadow-md">{showCorrect ? '¡Correcto!' : 'Incorrecto'}</h1>
          {showCorrect && myLastResult?.earnedPoints > 0 && (
            <p className="text-2xl font-bold mb-8 bg-black/20 px-6 py-2 rounded-full inline-block">+{myLastResult.earnedPoints} pts</p>
          )}
          <div className="mt-8 bg-black/30 px-8 py-4 rounded-3xl border border-white/10 backdrop-blur-sm">
            <p className="text-lg opacity-80">Puntaje Total</p>
            <p className="text-4xl font-bold">{myScore}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10 flex flex-col min-h-screen text-white p-4">
      <div className="max-w-3xl mx-auto w-full flex flex-col h-full flex-1">
        <header className="flex justify-between items-center mb-6 bg-black/30 p-4 rounded-2xl border border-white/10">
          <div className="flex items-center gap-3">
            <span className="text-3xl bg-white/10 p-2 rounded-xl">{player.avatar}</span>
            <span className="font-bold text-xl tracking-wide">{player.name}</span>
          </div>
          <div className="bg-gradient-to-r from-pink-500 to-purple-500 px-6 py-2 rounded-xl text-sm font-bold shadow-lg">
            {myScore} pts
          </div>
        </header>

        {hasAnswered ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-black/40 rounded-3xl border border-white/10 backdrop-blur-md p-8 animate-in fade-in zoom-in duration-300">
            <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-12 h-12 text-gray-300 animate-pulse" />
            </div>
            <h2 className="text-3xl font-bold mb-2">¡Respuesta enviada!</h2>
            <p className="text-gray-400 text-lg">Esperando que el maestro muestre el resultado...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 flex-1 pb-4 items-stretch">
            {AnswerShapes.map((shape, i) => (
              <button
                key={i}
                onClick={() => handleAnswerClick(i)}
                className={`${shape.color} rounded-3xl ${shape.shadow} ${shape.activeShadow} active:translate-y-3 transition-all duration-150 flex items-center justify-center cursor-pointer border border-white/10 overflow-hidden relative group`}
              >
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors pointer-events-none"></div>
                <div className="transform scale-[2] md:scale-[2.5] drop-shadow-2xl">{shape.icon}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};