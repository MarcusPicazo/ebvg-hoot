import React from 'react';

export const Modal = ({ config, setConfig }) => {
  if (!config) return null;

  const handleConfirm = () => {
    if (config.onConfirm) config.onConfirm();
    setConfig(null);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-white/20 p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl scale-100 transition-transform animate-in zoom-in duration-200">
        <h3 className="text-xl font-bold mb-6 text-white leading-relaxed">{config.message}</h3>
        <div className="flex gap-4">
          {config.isConfirm && (
            <button 
              onClick={() => setConfig(null)} 
              className="flex-1 py-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all font-bold text-white shadow-md active:scale-95 cursor-pointer"
            >
              Cancelar
            </button>
          )}
          <button 
            onClick={handleConfirm} 
            className={`flex-1 py-3 rounded-xl transition-all font-bold text-white shadow-lg active:scale-95 cursor-pointer ${
              config.isConfirm ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30' : 'bg-cyan-500 hover:bg-cyan-600 shadow-cyan-500/30'
            }`}
          >
            {config.isConfirm ? 'Eliminar' : 'Aceptar'}
          </button>
        </div>
      </div>
    </div>
  );
};