import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Button } from '../components/Button';
import { QuizQuestion } from '../types';

interface QuizViewProps {
  t: any;
  questions: QuizQuestion[];
  currentIndex: number;
  selectedOption: string | null;
  topicLabel: string;
  onSelectOption: (opt: string) => void;
  onConfirm: () => void;
}

export const QuizView: React.FC<QuizViewProps> = ({ 
  t, 
  questions, 
  currentIndex, 
  selectedOption, 
  topicLabel, 
  onSelectOption, 
  onConfirm 
}) => {
  const question = questions[currentIndex];

  return (
    <div className="glass-panel p-6 md:p-8 rounded-3xl space-y-6 animate-fade-in w-full max-w-2xl">
      <div className="flex justify-between items-center text-sm text-slate-400 uppercase tracking-wider">
        <span className="bg-slate-800 px-3 py-1 rounded-full text-xs font-bold border border-slate-700">
            {topicLabel}
        </span>
        <span>{currentIndex + 1} / {questions.length}</span>
      </div>

      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-rose-500 to-cyan-500 transition-all duration-500 ease-out"
          style={{ width: `${((currentIndex) / questions.length) * 100}%` }}
        ></div>
      </div>

      <div className="min-h-[100px] flex flex-col justify-center py-4">
        <h3 className="text-xl md:text-2xl font-bold leading-relaxed text-white">
          {question.question}
        </h3>
        {question.context && (
          <p className="text-slate-400 text-sm mt-3 flex items-start gap-2">
              <span className="text-cyan-500 font-bold">{t.label_info}:</span> {question.context}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {question.options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => onSelectOption(option)}
            className={`p-4 rounded-xl text-left transition-all duration-200 border relative group ${
              selectedOption === option
                ? 'bg-cyan-600 border-cyan-400 text-white shadow-[0_0_20px_rgba(8,145,178,0.4)]'
                : 'bg-slate-800/40 border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-500'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] ${
                selectedOption === option ? 'border-white bg-white text-cyan-600' : 'border-slate-600 text-slate-500'
              }`}>
                {['A','B','C','D'][idx]}
              </div>
              <span className="font-medium text-sm md:text-base">{option}</span>
            </div>
          </button>
        ))}
      </div>

      <Button 
        onClick={onConfirm} 
        disabled={!selectedOption}
        fullWidth
        className="mt-4"
      >
        {currentIndex === questions.length - 1 ? t.btn_finish : t.btn_next} <ChevronRight size={18} />
      </Button>
    </div>
  );
};