import React from 'react';
import { Image as ImageIcon } from 'lucide-react';

export const ImageRenderer = ({ src, alt }) => {
  if (!src) return null;

  if (src.startsWith('http')) {
    return (
      <img 
        src={src} 
        alt={alt} 
        className="w-full max-h-56 object-contain rounded-2xl mx-auto mb-6 shadow-2xl border border-white/10 bg-black/30" 
        onError={(e) => e.target.style.display = 'none'} 
      />
    );
  } 
  
  if (src.startsWith('[Image of')) {
    return (
      <div className="w-full max-w-lg mx-auto h-48 bg-gradient-to-br from-cyan-900/40 to-pink-900/40 border border-dashed border-white/20 rounded-2xl flex items-center justify-center mb-6 shadow-lg backdrop-blur-sm">
        <div className="text-center">
          <ImageIcon className="w-8 h-8 mx-auto text-gray-400 mb-2 opacity-50" />
          <span className="text-cyan-300 font-mono text-sm tracking-wide">{src}</span>
        </div>
      </div>
    );
  }
  return null;
};