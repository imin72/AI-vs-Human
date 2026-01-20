import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingViewProps {
  text: string;
}

export const LoadingView: React.FC<LoadingViewProps> = ({ text }) => {
  return (
    <div className="glass-panel p-12 rounded-3xl text-center space-y-6 flex flex-col items-center justify-center min-h-[400px]">
      <div className="relative">
        <div className="absolute inset-0 bg-cyan-500 blur-xl opacity-20 rounded-full"></div>
        <Loader2 size={64} className="text-cyan-400 animate-spin relative z-10" />
      </div>
      <h3 className="text-xl font-bold animate-pulse">{text}</h3>
      <div className="flex gap-1">
        <div className="w-2 h-2 bg-rose-500 rounded-full animate-bounce delay-0"></div>
        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-100"></div>
        <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce delay-200"></div>
      </div>
    </div>
  );
};
