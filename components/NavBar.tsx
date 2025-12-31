import React from 'react';
import { UserProfile } from '../types.ts';
import { Signal, Wifi, LogOut, Settings } from 'lucide-react';

interface NavBarProps {
  user: UserProfile | null;
  latency: number;
  onLogout: () => void;
  onProfileClick: () => void;
}

export const NavBar: React.FC<NavBarProps> = ({ user, latency, onLogout, onProfileClick }) => {
  const signalColor = latency < 100 ? 'text-green-500' : latency < 300 ? 'text-yellow-500' : 'text-red-500';

  return (
    <nav className="glass-panel sticky top-0 z-50 px-4 py-3 flex justify-between items-center rounded-b-2xl mb-4 transform-gpu">
      <div className="flex items-center space-x-3">
        <div className="relative">
          <div className="absolute inset-0 bg-scienceBlue blur-md opacity-50 rounded-full"></div>
          <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-scienceBlue to-blue-400 flex items-center justify-center text-white font-bold text-xs">
            MH
          </div>
        </div>
        <span className="font-semibold text-white tracking-tight hidden sm:block">Morse Hub</span>
      </div>

      <div className="flex items-center space-x-4">
        {/* Signal Monitor */}
        <div className="flex items-center space-x-1 text-xs font-mono bg-black/20 px-2 py-1 rounded-lg border border-white/5">
          <Signal size={14} className={signalColor} />
          <span className="text-gray-400">{latency}ms</span>
        </div>

        {user && (
          <div className="flex items-center space-x-3">
            <button 
              onClick={onProfileClick}
              className="flex items-center space-x-2 hover:bg-white/10 p-1 rounded-full transition-all duration-300"
            >
              <img 
                src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}&background=0066CC&color=fff`} 
                alt="Profile" 
                className="w-8 h-8 rounded-full border border-white/20 object-cover"
              />
            </button>
            <button 
              onClick={onLogout}
              className="text-white/60 hover:text-white transition-colors"
            >
              <LogOut size={18} />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};