import React, { useCallback, useRef } from 'react';

interface MorseKeyProps {
  onDown: (type: 'dot' | 'dash') => void;
  onUp: () => void;
  disabled: boolean;
}

export const MorseKey: React.FC<MorseKeyProps> = ({ onDown, onUp, disabled }) => {
  // Prevent context menu on long press
  const handleContextMenu = (e: React.MouseEvent) => e.preventDefault();

  return (
    <div className="grid grid-cols-2 gap-4 w-full h-48 sm:h-64 mb-6 select-none">
      <button
        disabled={disabled}
        onMouseDown={() => onDown('dot')}
        onMouseUp={onUp}
        onMouseLeave={onUp}
        onTouchStart={(e) => { e.preventDefault(); onDown('dot'); }}
        onTouchEnd={(e) => { e.preventDefault(); onUp(); }}
        onContextMenu={handleContextMenu}
        className={`
            group relative overflow-hidden rounded-3xl
            glass-panel border-white/10
            transition-all duration-100 active:scale-95 active:brightness-125
            disabled:opacity-50 disabled:cursor-not-allowed
            flex flex-col items-center justify-center
        `}
      >
        <div className="absolute inset-0 bg-scienceBlue/10 opacity-0 group-active:opacity-100 transition-opacity duration-100"></div>
        <div className="w-8 h-8 rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)] mb-2"></div>
        <span className="text-sm font-semibold text-white/60 tracking-widest">DOT</span>
      </button>

      <button
        disabled={disabled}
        onMouseDown={() => onDown('dash')}
        onMouseUp={onUp}
        onMouseLeave={onUp}
        onTouchStart={(e) => { e.preventDefault(); onDown('dash'); }}
        onTouchEnd={(e) => { e.preventDefault(); onUp(); }}
        onContextMenu={handleContextMenu}
        className={`
            group relative overflow-hidden rounded-3xl
            glass-panel border-white/10
            transition-all duration-100 active:scale-95 active:brightness-125
            disabled:opacity-50 disabled:cursor-not-allowed
            flex flex-col items-center justify-center
        `}
      >
         <div className="absolute inset-0 bg-scienceBlue/10 opacity-0 group-active:opacity-100 transition-opacity duration-100"></div>
        <div className="w-16 h-4 rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)] mb-2"></div>
        <span className="text-sm font-semibold text-white/60 tracking-widest">DASH</span>
      </button>
    </div>
  );
};