import React, { useState } from 'react';
import { ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import { MORSE_MAP } from '../types.ts';

export const CheatSheet: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Group by letter/number for cleaner display
  const letters = Object.entries(MORSE_MAP).filter(([_, char]) => /^[A-Z]$/.test(char)).sort((a,b) => a[1].localeCompare(b[1]));
  const numbers = Object.entries(MORSE_MAP).filter(([_, char]) => /^[0-9]$/.test(char)).sort((a,b) => a[1].localeCompare(b[1]));

  return (
    <div className="w-full mb-6">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full glass-panel py-3 px-4 rounded-xl flex items-center justify-between text-white/80 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center space-x-2">
            <BookOpen size={18} className="text-scienceBlue"/>
            <span className="font-medium text-sm">Signal Reference</span>
        </div>
        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-96 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
        <div className="glass-panel rounded-xl p-4 overflow-y-auto max-h-96 custom-scrollbar">
            <h3 className="text-xs font-bold text-white/40 uppercase mb-2">Letters</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                {letters.map(([morse, char]) => (
                    <div key={char} className="flex justify-between bg-white/5 px-3 py-2 rounded text-sm">
                        <span className="font-bold text-white">{char}</span>
                        <span className="font-mono text-scienceBlue">{morse}</span>
                    </div>
                ))}
            </div>
            
            <h3 className="text-xs font-bold text-white/40 uppercase mb-2">Numbers</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {numbers.map(([morse, char]) => (
                    <div key={char} className="flex justify-between bg-white/5 px-3 py-2 rounded text-sm">
                        <span className="font-bold text-white">{char}</span>
                        <span className="font-mono text-scienceBlue">{morse}</span>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};