import React from 'react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      {/* 
        Background Layer: z-0
        Using fixed positioning to stay in place while scrolling.
        Removed negative z-index to prevent being hidden by body background.
      */}
      <div className="fixed inset-0 w-full h-full z-0 pointer-events-none">
        {/* Image */}
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: `url('https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=2000&auto=format&fit=crop')` 
          }}
        />
        
        {/* Dark Overlay for readability */}
        <div className="absolute inset-0 w-full h-full bg-slate-950/70 backdrop-blur-[2px]" />
      </div>

      {/* 
        Content Layer: z-10 
        Explicitly placed above the background layer.
      */}
      <div className="relative z-10 min-h-screen w-full flex items-center justify-center p-4 overflow-y-auto">
        <div className="relative w-full max-w-2xl">
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
    </>
  );
};