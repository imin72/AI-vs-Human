
import React from 'react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">
      {/* 
        Background Layer
        Using fixed and inset-0 to cover the whole viewport.
        Ensuring it sits at the very back.
      */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat scale-105"
          style={{ 
            backgroundImage: `url('https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=2000&auto=format&fit=crop')`,
            backgroundColor: '#020617' // Fallback color
          }}
        />
        
        {/* Dark Overlay for readability and contrast */}
        <div className="absolute inset-0 w-full h-full bg-slate-950/70 backdrop-blur-[2px]" />
        
        {/* Additional decorative gradient to ensure no white gaps */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/30 to-slate-950" />
      </div>

      {/* 
        Content Layer
        Position relative and z-10 to stay above the fixed background.
      */}
      <div className="relative z-10 min-h-screen w-full flex flex-col items-center justify-center p-4">
        <div className="relative w-full max-w-2xl py-8">
          <header className="mb-8 text-center animate-fade-in">
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tighter text-white mb-2 drop-shadow-2xl">
              COGNITO <span className="text-cyan-400 text-xl md:text-3xl font-light">PROTOCOL</span>
            </h1>
            <div className="h-1 w-24 bg-gradient-to-r from-cyan-500 to-rose-500 mx-auto rounded-full shadow-lg shadow-cyan-500/50"></div>
          </header>
          <main className="w-full">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};
