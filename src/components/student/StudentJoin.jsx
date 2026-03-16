import React from 'react';
import { CuteOwlLogo } from '../common/CuteOwlLogo';
import { AVATARS } from '../../utils/constants';

export const StudentJoin = ({ 
  studentPin, 
  setStudentPin, 
  player, 
  setPlayer, 
  handleJoin 
}) => {
  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-white p-6">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 md:p-12 rounded-[2rem] shadow-2xl text-center max-w-md w-full reveal-on-scroll opacity-100 scale-100 transition-all duration-500">
        <CuteOwlLogo className="w-24 h-24 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]" />
        <h2 className="text-3xl font-bold mb-8">Unirse a ebvg-hoot</h2>
        
        <input 
          type="text" 
          placeholder="PIN (6 dígitos)"
          value={studentPin}
          onChange={(e) => setStudentPin(e.target.value.replace(/\D/g, ''))}
          maxLength={6}
          className="w-full text-center text-3xl font-bold bg-white/5 border-2 border-white/20 rounded-2xl py-4 mb-6 focus:outline-none focus:border-blue-400 transition-colors uppercase"
        />
        
        <input 
          type="text" 
          placeholder="Tu Nombre"
          value={player.name}
          onChange={(e) => setPlayer({...player, name: e.target.value})}
          className="w-full text-center text-xl bg-white/5 border-2 border-white/20 rounded-2xl py-4 mb-8 focus:outline-none focus:border-cyan-500 transition-colors"
        />

        <div className="mb-8">
          <p className="text-gray-400 mb-4 font-medium">Elige tu Avatar</p>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
            {AVATARS.map(emoji => (
              <button
                key={emoji}
                onClick={() => setPlayer({...player, avatar: emoji})}
                className={`text-3xl p-2 rounded-xl transition-all active:scale-90 cursor-pointer ${
                  player.avatar === emoji 
                  ? 'bg-blue-500/50 border border-blue-400 scale-110 shadow-[0_0_15px_rgba(59,130,246,0.5)]' 
                  : 'bg-black/20 border border-transparent hover:bg-white/10'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={handleJoin}
          className="w-full py-4 bg-white text-black rounded-2xl text-xl font-bold hover:bg-gray-200 active:scale-95 transition-all duration-300 cursor-pointer"
        >
          Entrar
        </button>
      </div>
    </div>
  );
};