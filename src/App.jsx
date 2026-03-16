/**
 * @file App.jsx
 * @description Plataforma interactiva de aprendizaje multijugador (ebvg-hoot).
 * @author Marcus Escalona
 * @role Systems Engineer / Front-End Developer
 * @institution Escuela Berta von Glumer (EBVG)
 * @date 2026
 * @copyright © 2026 Marcus Escalona. Todos los derechos reservados.
 */

import React, { useState, useEffect } from 'react';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { Home, Users, Presentation } from 'lucide-react';
import { db, appId } from './config/firebase';

import { useAuth } from './hooks/useAuth';
import { useKahoots } from './hooks/useKahoots';
import { useGameLogic } from './hooks/useGameLogic';
import { useScrollReveal } from './hooks/useScrollReveal';
import { DB_QUIZZES } from './utils/constants';

import { ThreeBackground } from './components/common/ThreeBackground';
import { Modal } from './components/common/Modal';
import { CuteOwlLogo } from './components/common/CuteOwlLogo';

import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { CreateKahoot } from './components/teacher/CreateKahoot';
import { StudentJoin } from './components/student/StudentJoin';
import { StudentLobby } from './components/student/StudentLobby';
import { HostingScreen } from './components/game/HostingScreen';
import { GameView } from './components/game/GameView';

export default function App() {
  const { user } = useAuth();
  const { customQuizzes, saveKahoot, deleteKahoot } = useKahoots(user);
  
  const [view, setView] = useState('LANDING');
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [hostPin, setHostPin] = useState('');
  const [studentPin, setStudentPin] = useState('');
  const [player, setPlayer] = useState({ name: '', avatar: '' });
  const [modalConfig, setModalConfig] = useState(null);

  const { gameState, playersList } = useGameLogic(hostPin);
  
  useScrollReveal([view]);

  // Syncs active quiz data for the student client
  useEffect(() => {
    if (gameState?.quizId && !selectedQuiz) {
      const allQuizzes = [...(customQuizzes || []), ...(DB_QUIZZES || [])];
      const foundQuiz = allQuizzes.find(q => q.id === gameState.quizId || q.dbId === gameState.quizId);
      if (foundQuiz) setSelectedQuiz(foundQuiz);
    }
  }, [gameState?.quizId, selectedQuiz, customQuizzes]);

  // Route guards for active sessions (Kicks students gracefully)
  useEffect(() => {
    if (view === 'STUDENT_LOBBY' && gameState?.status === 'question_active') {
      goTo('STUDENT_GAME');
    }
    if ((view === 'STUDENT_LOBBY' || view === 'STUDENT_GAME') && gameState?.status === 'finished') {
      showAlert("¡Esta sesión ha sido cerrada por el maestro! Gracias por participar, por favor vuelve al inicio.");
      goTo('LANDING');
    }
  }, [gameState, view, hostPin]);

  // Handles closing the tab or reloading if you are the host
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (user && hostPin && (view === 'HOSTING' || view === 'HOST_GAME')) {
        const gameRef = doc(db, 'artifacts', appId, 'public', 'data', 'partidas_activas', hostPin);
        updateDoc(gameRef, { status: 'finished' }).catch(() => {});
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [user, hostPin, view]);

  const showAlert = (message, onConfirm = null, isConfirm = false) => {
    setModalConfig({ message, onConfirm, isConfirm });
  };

  /**
   * Central navigation. Automatically shuts down the room if the host exits.
   */
  const goTo = async (newView) => {
    if (user && hostPin && (view === 'HOSTING' || view === 'HOST_GAME') && (newView === 'LANDING' || newView === 'TEACHER_DASH')) {
      try {
        const gameRef = doc(db, 'artifacts', appId, 'public', 'data', 'partidas_activas', hostPin);
        await updateDoc(gameRef, { status: 'finished' });
      } catch (e) {
        console.error("Error al cerrar la sala:", e);
      }
    }

    if (newView === 'LANDING' || newView === 'TEACHER_DASH') {
      setHostPin('');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setView(newView);
  };

  const handleHostQuiz = async (quiz) => {
    if (!user || !db) return showAlert("Conectando con la base de datos...");
    const newPin = Math.floor(100000 + Math.random() * 900000).toString();
    setSelectedQuiz(quiz);
    setHostPin(newPin);
    try {
      const gameRef = doc(db, 'artifacts', appId, 'public', 'data', 'partidas_activas', newPin);
      await setDoc(gameRef, {
        pin: newPin, quizId: quiz.id || quiz.dbId, quizTitle: quiz.title, hostId: user.uid,
        status: 'waiting', currentQuestionIndex: 0, questionStartTime: 0, players: {}, createdAt: Date.now()
      });
      goTo('HOSTING');
    } catch (e) {
      console.error(e);
      showAlert("Ocurrió un error al crear la sala.");
    }
  };

  const handleStartHostGame = async () => {
    try {
      const gameRef = doc(db, 'artifacts', appId, 'public', 'data', 'partidas_activas', hostPin);
      await updateDoc(gameRef, { status: 'question_active', currentQuestionIndex: 0, questionStartTime: Date.now() });
      goTo('HOST_GAME');
    } catch (e) {
      console.error(e);
      showAlert("Error al iniciar el juego.");
    }
  };

  const handleSaveKahoot = async (newQuizData) => {
    await saveKahoot(newQuizData);
    showAlert('¡ebvg-hoot guardado exitosamente!');
    goTo('TEACHER_DASH');
  };

  const handleDeleteKahoot = (e, quiz) => {
    e.stopPropagation();
    showAlert("¿Estás seguro de eliminar este ebvg-hoot?", async () => {
      await deleteKahoot(quiz);
      showAlert("¡Eliminado!");
    }, true);
  };

  const handleStudentJoin = async () => {
    if(studentPin.length !== 6) return showAlert('Ingresa un PIN válido de 6 números.');
    if(!player.name || !player.avatar) return showAlert('Ingresa tu nombre y elige un avatar.');
    if (!user || !db) return showAlert('Conectando a la base de datos...');
    
    try {
      const gameRef = doc(db, 'artifacts', appId, 'public', 'data', 'partidas_activas', studentPin);
      const gameSnap = await getDoc(gameRef);

      if (gameSnap.exists()) {
        const gameData = gameSnap.data();
        if (gameData.status !== 'waiting') return showAlert('Esta partida ya ha comenzado o finalizado.');
        if (Object.keys(gameData.players || {}).length >= 50) return showAlert('La sala ha alcanzado el límite de 50 jugadores.');
        
        await updateDoc(gameRef, {
          [`players.${user.uid}`]: { id: user.uid, name: player.name, avatar: player.avatar, score: 0, joinedAt: Date.now() }
        });
        setHostPin(studentPin); 
        goTo('STUDENT_LOBBY');
      } else {
        showAlert('No se encontró ninguna sala activa con ese PIN.');
      }
    } catch (e) {
      console.error(e);
      showAlert("Error al intentar unirse a la sala.");
    }
  };

  const renderLandingView = () => (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-white pt-10 pb-20 overflow-x-hidden">
      <div className="text-center max-w-5xl mx-auto px-6 mb-24 flex flex-col items-center justify-center w-full">
        <div className="inline-block p-6 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl mb-8 transition-all duration-700">
          <CuteOwlLogo className="w-36 h-36 mx-auto mb-6 drop-shadow-[0_0_20px_rgba(255,255,255,0.25)]" />
          <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 pb-4">
            ebvg-hoot
          </h1>
        </div>
        <p className="text-xl md:text-2xl text-gray-300 font-light mb-12 max-w-2xl transition-all duration-700 delay-100">
          La plataforma educativa del futuro. Exclusiva para la comunidad EBVG y creada por el Teacher Escalona. Crea, proyecta y juega en un entorno inmersivo.
        </p>
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center w-full max-w-lg transition-all duration-700 delay-200">
          <button onClick={() => goTo('STUDENT_JOIN')} className="w-full group relative px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-xl font-bold hover:bg-white/20 transition-all duration-300 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_50px_rgba(0,242,254,0.4)] overflow-hidden cursor-pointer flex items-center justify-center gap-3">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-20 transition-opacity" />
            <Users className="w-6 h-6 relative z-10"/> <span className="relative z-10">Soy Alumno</span>
          </button>
          <button onClick={() => goTo('TEACHER_DASH')} className="w-full group relative px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl text-xl font-bold hover:from-pink-400 hover:to-purple-500 transition-all duration-300 active:scale-95 shadow-[0_0_30px_rgba(236,72,153,0.3)] hover:shadow-[0_0_50px_rgba(236,72,153,0.6)] cursor-pointer flex items-center justify-center gap-3">
            <Presentation className="w-6 h-6 relative z-10"/> <span className="relative z-10">Soy Maestro</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="font-sans min-h-screen bg-transparent overflow-hidden selection:bg-pink-500 selection:text-white">
      <ThreeBackground />
      <Modal config={modalConfig} setConfig={setModalConfig} />
      {view === 'LANDING' && renderLandingView()}
      {view === 'TEACHER_DASH' && <TeacherDashboard customQuizzes={customQuizzes} dbQuizzes={DB_QUIZZES} handleHostQuiz={handleHostQuiz} handleDeleteKahoot={handleDeleteKahoot} goTo={goTo} />}
      {view === 'CREATE_KAHOOT' && <CreateKahoot onSave={handleSaveKahoot} showAlert={showAlert} goTo={goTo} />}
      {view === 'HOSTING' && <HostingScreen hostPin={hostPin} playersList={playersList} selectedQuiz={selectedQuiz} handleStart={handleStartHostGame} />}
      {view === 'STUDENT_JOIN' && <StudentJoin studentPin={studentPin} setStudentPin={setStudentPin} player={player} setPlayer={setPlayer} handleJoin={handleStudentJoin} />}
      {view === 'STUDENT_LOBBY' && <StudentLobby player={player} studentPin={hostPin} />}
      
      {view === 'HOST_GAME' && <GameView role="HOST" gameState={gameState} selectedQuiz={selectedQuiz} playersList={playersList} hostPin={hostPin} goTo={goTo} />}
      {view === 'STUDENT_GAME' && <GameView role="STUDENT" gameState={gameState} selectedQuiz={selectedQuiz} playersList={playersList} hostPin={hostPin} user={user} player={player} />}

      <div className="fixed bottom-6 right-6 z-50">
        {view !== 'LANDING' && (
          <button onClick={() => goTo('LANDING')} className="group flex items-center gap-3 bg-gradient-to-r from-blue-600/60 to-purple-600/60 backdrop-blur-xl border border-white/20 text-white px-6 py-3 rounded-full font-bold shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.7)] hover:bg-white/10 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer">
            <Home className="w-5 h-5 group-hover:-translate-y-1 transition-transform" /> <span className="hidden sm:inline">Volver al Inicio</span>
          </button>
        )}
      </div>
    </div>
  );
}