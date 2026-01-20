import React from 'react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[url('https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center relative">
      <div className="absolute inset-0 bg-slate-950/90 z-0"></div>
      <div className="relative z-10 w-full max-w-2xl">
        <header className="mb-8 text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tighter text-white mb-2">
            COGNITO <span className="text-cyan-400 text-xl md:text-3xl font-light">PROTOCOL</span>
          </h1>
          <div className="h-1 w-24 bg-gradient-to-r from-cyan-500 to-rose-500 mx-auto rounded-full"></div>
        </header>
        <main className="w-full">
          {children}
        </main>
      </div>
    </div>
  );
};