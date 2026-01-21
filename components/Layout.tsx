
import React from 'react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative min-h-screen w-full flex flex-col bg-slate-950 text-slate-100 overflow-x-hidden">
      {/* Background Layer */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
          style={{ 
            backgroundImage: `url('https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=2000&auto=format&fit=crop')`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950/90 to-slate-950" />
      </div>

      {/* Content Layer */}
      <div className="relative z-10 flex-grow flex flex-col items-center p-4 md:p-8">
        <div className="w-full max-w-2xl flex flex-col items-center">
          <header className="mt-8 mb-12 text-center w-full">
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-3">
              COGNITO <span className="text-cyan-400 font-light">PROTOCOL</span>
            </h1>
            <div className="h-1.5 w-32 bg-gradient-to-r from-cyan-500 via-purple-500 to-rose-500 mx-auto rounded-full shadow-[0_0_15px_rgba(6,182,212,0.5)]"></div>
          </header>
          <main className="w-full">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};