import React from 'react';
import { Users } from 'lucide-react';

export const HostingScreen = ({ hostPin, playersList, selectedQuiz, handleStart }) => {
  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-white p-6">
      <div className="bg-white/10 backdrop-blur-2xl border border-white/20 p-12 rounded-[3rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] text-center max-w-2xl w-full reveal-on-scroll opacity-100 scale-100 transition-all duration-700">
        <h2 className="text-3xl text-gray-300 font-medium mb-4">
          Únete en <span className="text-white font-bold">ebvg-hoot.com</span>
        </h2>
        <p className="text-xl text-gray-400 mb-8">con el PIN de juego:</p>
        
        <div className="text-8xl md:text-9xl font-black tracking-widest mb-12 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-cyan-400 drop-shadow-2xl">
          {hostPin}
        </div>

        <div className="flex justify-between items-center bg-black/30 rounded-2xl p-6 mb-8 border border-white/5">
          <div className="flex items-center gap-4">
            <Users className={`w-8 h-8 ${playersList.length >= 50 ? 'text-red-400' : 'text-cyan-400'}`} />
            <span className={`text-3xl font-bold ${playersList.length >= 50 ? 'text-red-400' : ''}`}>
              {playersList.length}/50
            </span>
            <span className="text-gray-400">Jugadores</span>
          </div>
          <div className="text-left">
            <p className="text-sm text-gray-400">Quiz actual:</p>
            <p className="font-bold text-lg">{selectedQuiz?.title}</p>
          </div>
        </div>

        <button 
          onClick={handleStart}
          disabled={playersList.length === 0}
          className={`w-full py-5 rounded-2xl text-2xl font-bold transition-all duration-300 cursor-pointer ${
            playersList.length === 0 
            ? 'bg-gray-600 cursor-not-allowed opacity-50' 
            : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(6,182,212,0.5)]'
          }`}
        >
          {playersList.length === 0 ? 'Esperando Jugadores...' : '¡Empezar Juego!'}
        </button>
      </div>
    </div>
  );
};