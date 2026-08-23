import React, { useState, useEffect } from 'react';

export default function MobileShell({ children }) {
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-50 to-champagne-100 flex items-center justify-center p-0 md:p-6 overflow-x-hidden">
      {/* Ambient background particles for desktop */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden hidden md:block">
        <div className="absolute top-10 left-10 w-72 h-72 bg-pink-300/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-champagne-300/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-1/2 left-1/4 w-60 h-60 bg-purple-200/30 rounded-full blur-2xl"></div>
      </div>

      {/* Mobile Shell Container */}
      <div className="mobile-app-shell flex flex-col justify-between relative bg-white/95">
        {/* iOS style status bar */}
        <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md px-6 pt-3 pb-2 flex items-center justify-between text-xs font-semibold text-slate-700 select-none border-b border-rose-100/60">
          <span>{time || '18:30'}</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] bg-blush-100 text-blush-700 px-2 py-0.5 rounded-full font-medium">💖 C'est une fille</span>
            <div className="w-4 h-2.5 border border-slate-600 rounded-sm p-0.5 flex items-center">
              <div className="w-full h-full bg-slate-700 rounded-2xs"></div>
            </div>
          </div>
        </div>

        {/* Dynamic content scroll area */}
        <main className="flex-1 pb-24 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
