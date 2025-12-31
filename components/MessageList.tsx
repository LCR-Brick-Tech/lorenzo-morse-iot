import React, { useEffect, useRef } from 'react';
import { MorseMessage } from '../types';

interface MessageListProps {
  messages: MorseMessage[];
  currentUserId?: string;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, currentUserId }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto min-h-[200px] max-h-[400px] px-2 space-y-3 mb-6 relative">
      <div className="sticky top-0 w-full text-center py-2 z-10 pointer-events-none">
        <span className="bg-black/40 backdrop-blur-md text-white/40 text-[10px] px-3 py-1 rounded-full uppercase tracking-wider">
            Live Feed
        </span>
      </div>
      
      {messages.length === 0 && (
        <div className="text-center text-white/20 text-sm py-10 italic">
            No transmissions detected yet.
        </div>
      )}

      {messages.map((msg) => {
        const isMe = msg.senderId === currentUserId;
        return (
            <div key={msg.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className={`glass-panel px-4 py-3 rounded-2xl ${isMe ? 'rounded-tr-sm bg-scienceBlue/20 border-scienceBlue/30' : 'rounded-tl-sm'}`}>
                        <div className="text-xs text-scienceBlue font-mono mb-1 opacity-80">{msg.morse}</div>
                        <div className="text-sm text-white font-medium">{msg.text}</div>
                    </div>
                    <div className="flex items-center space-x-2 mt-1 px-1">
                        <span className="text-[10px] text-white/30">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        {!isMe && <span className="text-[10px] text-white/50 font-bold">{msg.senderName}</span>}
                    </div>
                </div>
            </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
};