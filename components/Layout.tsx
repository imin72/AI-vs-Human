
import React from 'react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative min-h-screen w-full flex flex-col bg-slate-950 text-slate-100 selection:bg-cyan-500/30">
      {/* Background Layer - Fixed position to prevent layout shifts */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 transition-opacity duration-1000"
          style={{ 
            backgroundImage: `url('https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=2000&auto=format&fit=crop')`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950/80 to-slate-950" />
      </div>

      {/* Content Layer */}
      <div className="relative z-10 flex-grow flex flex-col items-center p-4 md:p-8 overflow-y-auto">
        <div className="w-full max-w-2xl flex flex-col items-center">
          <header className="mt-8 mb-12 w-full flex flex-col items-center animate-fade-in select-none">
            <div className="relative flex items-center justify-center gap-4 md:gap-8">
              
              {/* HUMAN */}
              <div className="group relative">
                <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-200 to-slate-400 drop-shadow-lg tracking-tighter transition-transform group-hover:-translate-y-1 duration-500">
                  HUMAN
                </h1>
                <div className="absolute -bottom-2 w-full h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent opacity-80 shadow-[0_0_10px_rgba(244,63,94,0.5)]"></div>
              </div>

              {/* VS Badge */}
              <div className="relative z-10">
                <div className="absolute inset-0 bg-rose-500 blur-lg opacity-20 animate-pulse"></div>
                <div className="bg-slate-900 border border-slate-700 text-slate-300 text-sm md:text-xl font-black italic px-3 py-2 rounded-xl shadow-2xl transform -skew-x-12 hover:skew-x-0 hover:scale-110 hover:text-white hover:border-rose-500 transition-all duration-300 cursor-default">
                   <span className="block transform skew-x-12">VS</span>
                </div>
              </div>

              {/* AI */}
              <div className="group relative">
                <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-cyan-300 to-blue-500 drop-shadow-[0_0_15px_rgba(6,182,212,0.5)] tracking-widest font-mono transition-transform group-hover:-translate-y-1 duration-500">
                  AI
                </h1>
                <div className="absolute -top-3 -right-3 w-2 h-2 md:w-3 md:h-3 bg-cyan-400 rounded-full animate-ping opacity-75"></div>
                <div className="absolute -bottom-2 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-80 shadow-[0_0_10px_rgba(6,182,212,0.5)]"></div>
              </div>

            </div>

            {/* Subtitle / Decoration */}
            <div className="mt-6 flex items-center gap-3 opacity-60">
              <div className="h-px w-8 md:w-16 bg-gradient-to-r from-transparent to-slate-500"></div>
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.4em] text-slate-400">
                Cognito Protocol
              </span>
              <div className="h-px w-8 md:w-16 bg-gradient-to-l from-transparent to-slate-500"></div>
            </div>
          </header>
          
          <main className="w-full flex justify-center">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};
