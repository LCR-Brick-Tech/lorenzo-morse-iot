import React, { useEffect, useState } from 'react';
import { UserProfile, MorseMessage } from '../types';
import { Activity, Radio } from 'lucide-react';

interface VisualizerProps {
  currentMessage: MorseMessage | null;
  localTyping: string;
  isReceiving: boolean;
  currentUser: UserProfile | null;
}

export const Visualizer: React.FC<VisualizerProps> = ({ currentMessage, localTyping, isReceiving, currentUser }) => {
  const [displayText, setDisplayText] = useState('');
  const [displayMorse, setDisplayMorse] = useState('');

  useEffect(() => {
    // If we are typing locally, show that immediately
    if (localTyping) {
      setDisplayMorse(localTyping);
      setDisplayText("Transmitting...");
    } 
    // If we are receiving a message and it's not ours (or echo is handled elsewhere), show it
    else if (currentMessage) {
        // Simple visual decay logic could go here, but for now strictly show last message
        // If the message is very recent (< 5 seconds)
        const now = Date.now();
        if (now - currentMessage.timestamp < 10000) {
           setDisplayMorse(currentMessage.morse);
           setDisplayText(currentMessage.text || "Deciphering...");
        } else {
            setDisplayMorse("---");
            setDisplayText("Standby");
        }
    } else {
        setDisplayMorse("---");
        setDisplayText("Channel Clear");
    }
  }, [currentMessage, localTyping]);

  return (
    <div className="w-full mb-6">
      <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group">
        
        {/* Status Indicator */}
        <div className="absolute top-4 right-4 flex items-center space-x-2">
            {isReceiving && !localTyping && (
                <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-scienceBlue opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-scienceBlue"></span>
                </span>
            )}
            <span className="text-xs uppercase tracking-widest text-white/40 font-semibold">
                {localTyping ? 'TX' : isReceiving ? 'RX' : 'IDLE'}
            </span>
        </div>

        <div className="flex flex-col items-center justify-center space-y-4 py-4">
            {/* Main Morse Display */}
            <div className={`text-4xl sm:text-6xl font-mono font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 transition-all duration-300 ${localTyping ? 'scale-110' : 'scale-100'}`}>
                {displayMorse || "..."}
            </div>
            
            {/* Translated Text */}
            <div className="text-lg text-scienceBlue font-medium tracking-wide h-6">
                {displayText}
            </div>

            {/* Metadata */}
            {currentMessage && !localTyping && (Date.now() - currentMessage.timestamp < 10000) && (
                <div className="flex items-center space-x-2 mt-4 text-xs text-white/50 bg-white/5 px-3 py-1 rounded-full">
                    <Radio size={12} />
                    <span>{currentMessage.senderName} ({currentMessage.senderId.slice(0,4)})</span>
                </div>
            )}
        </div>
        
        {/* Decorative Waveform Background */}
        <div className="absolute bottom-0 left-0 w-full h-1/3 opacity-10 pointer-events-none">
             <div className="w-full h-full bg-gradient-to-t from-scienceBlue to-transparent"></div>
        </div>
      </div>
    </div>
  );
};