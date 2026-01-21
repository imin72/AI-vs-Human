
import React, { useMemo } from 'react';
import { UserCircle2, ChevronRight, ChevronLeft, Flag } from 'lucide-react';
import { Button } from '../components/Button';
import { UserProfile, Language } from '../types';

interface ProfileViewProps {
  t: any;
  userProfile: UserProfile;
  language: Language;
  onUpdate: (profile: Partial<UserProfile>) => void;
  onSubmit: () => void;
  onBack: () => void;
  backLabel: string;
}

const getFlagEmoji = (nat: string) => {
  switch (nat) {
    case 'South Korea': return '🇰🇷';
    case 'USA': return '🇺🇸';
    case 'Japan': return '🇯🇵';
    case 'Spain': return '🇪🇸';
    case 'UK': return '🇬🇧';
    case 'China': return '🇨🇳';
    case 'France': return '🇫🇷';
    default: return '🌐';
  }
};

export const ProfileView: React.FC<ProfileViewProps> = ({ t, userProfile, language, onUpdate, onSubmit, onBack, backLabel }) => {
  const isComplete = userProfile.gender && userProfile.ageGroup && userProfile.nationality;

  // 정렬된 국적 리스트 생성 (선택한 언어에 맞는 국가를 최상단으로)
  const sortedNationalities = useMemo(() => {
    const nats = Object.keys(t.nationalities);
    
    // 언어별 우선순위 맵
    const priorityMap: Record<Language, string> = {
      ko: 'South Korea',
      ja: 'Japan',
      es: 'Spain',
      en: 'USA',
      zh: 'China',
      fr: 'France'
    };

    const priorityNat = priorityMap[language];
    
    return nats.sort((a, b) => {
      if (a === priorityNat) return -1;
      if (b === priorityNat) return 1;
      if (a === 'Other') return 1; // 'Other'는 항상 마지막
      if (b === 'Other') return -1;
      return 0;
    });
  }, [t.nationalities, language]);

  return (
    <div className="glass-panel p-6 rounded-3xl space-y-6 animate-fade-in relative max-h-[85vh] overflow-y-auto custom-scrollbar">
      <button 
        onClick={onBack}
        className="absolute top-4 left-4 text-slate-400 hover:text-white text-sm flex items-center gap-1 transition-colors z-20"
      >
        <ChevronLeft size={16} /> {backLabel}
      </button>

      <div className="text-center mt-2">
        <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 text-cyan-400">
           <UserCircle2 size={24} />
        </div>
        <h2 className="text-2xl font-bold">{t.title}</h2>
        <p className="text-slate-400 text-sm mt-1">{t.desc}</p>
      </div>

      <div className="space-y-6">
        {/* Nationality Selection */}
        <div>
          <label className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-2 flex items-center gap-2">
            <Flag size={12} className="text-cyan-500" /> {t.label_nationality}
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {sortedNationalities.map(nat => (
              <button
                key={nat}
                onClick={() => onUpdate({ nationality: nat })}
                className={`py-3 px-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                  userProfile.nationality === nat
                    ? 'bg-cyan-600 border-cyan-400 text-white shadow-lg shadow-cyan-500/20'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span>{getFlagEmoji(nat)}</span>
                <span className="truncate">{t.nationalities[nat]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Gender Selection */}
        <div>
          <label className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-2 block">{t.label_gender}</label>
          <div className="grid grid-cols-3 gap-2">
            {Object.keys(t.genders).map(g => (
              <button
                key={g}
                onClick={() => onUpdate({ gender: g })}
                className={`py-3 rounded-xl text-sm font-bold border transition-all ${
                  userProfile.gender === g
                    ? 'bg-cyan-600 border-cyan-400 text-white shadow-lg shadow-cyan-500/20'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {t.genders[g]}
              </button>
            ))}
          </div>
        </div>

        {/* Age Selection */}
        <div>
          <label className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-2 block">{t.label_age}</label>
          <div className="grid grid-cols-3 gap-2">
            {Object.keys(t.ages).map(age => (
              <button
                key={age}
                onClick={() => onUpdate({ ageGroup: age })}
                className={`py-3 rounded-xl text-sm font-bold border transition-all ${
                  userProfile.ageGroup === age
                    ? 'bg-cyan-600 border-cyan-400 text-white shadow-lg shadow-cyan-500/20'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {t.ages[age]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-2 sticky bottom-0 bg-slate-900/90 backdrop-blur-md -mx-6 px-6 py-4">
        <Button onClick={onSubmit} fullWidth>
          {isComplete ? t.btn_submit : t.skip} <ChevronRight size={18} />
        </Button>
      </div>
    </div>
  );
};
