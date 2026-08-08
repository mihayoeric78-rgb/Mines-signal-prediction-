import React, { useEffect } from 'react';

interface ToastProps {
  message: string | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4500);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pt-4 relative z-20">
      <div className="w-full p-4 bg-[#0b1329] border border-cyan-500/35 rounded-2xl flex items-center gap-3 shadow-2xl transition-all duration-300 transform scale-100 opacity-100 text-xs sm:text-sm font-semibold text-cyan-200 font-sans leading-relaxed">
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
        </span>
        <span className="flex-1">{message}</span>
      </div>
    </div>
  );
};
