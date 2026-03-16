import React from 'react';

export const StudentLobby = ({ player, studentPin }) => {
  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-white p-6 text-center">
      <div className="reveal-on-scroll opacity-100 translate-y-0 transition-all duration-700">
        <div className="text-8xl mb-6 animate-bounce">{player.avatar}</div>
        <h2 className="text-4xl font-bold mb-2">{player.name}</h2>
        <p className="text-xl text-gray-400 mb-8">
          ¡Estás dentro de la sala <span className="text-white font-bold">{studentPin}</span>!
        </p>
        
        <div className="flex items-center justify-center gap-3 text-cyan-400">
          <div className="w-4 h-4 rounded-full bg-cyan-400 animate-ping"></div>
          <span className="text-xl font-bold">Esperando a que el maestro inicie...</span>
        </div>
      </div>
    </div>
  );
};