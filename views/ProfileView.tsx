
import React, { useMemo } from 'react';
import { UserCircle2, ChevronRight, ChevronLeft, Flag, Globe, Home } from 'lucide-react';
import { Button } from '../components/Button';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { UserProfile, Language } from '../types';

interface ProfileViewProps {
  t: any;
  userProfile: UserProfile;
  language: Language;
  setLanguage: (lang: Language) => void;
  onUpdate: (profile: Partial<UserProfile>) => void;
  onSubmit: () => void;
  onBack: () => void;
  onHome: () => void;
  backLabel: string;
}

// ISO 3166-1 alpha-2 code based flag generation
const getFlagEmoji = (countryCode: string) => {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char =>  127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

// Priority countries based on selected language
const PRIORITY_COUNTRIES: Record<Language, string[]> = {
  en: ['US', 'GB', 'CA'],
  ko: ['KR', 'US', 'JP'],
  ja: ['JP', 'US', 'TW'],
  zh: ['CN', 'US', 'SG'],
  es: ['ES', 'MX', 'AR'],
  fr: ['FR', 'CA', 'BE'],
};

// Common list of countries
const COMMON_COUNTRIES = [
  "AF", "AL", "DZ", "AR", "AU", "AT", "BD", "BE", "BR", "KH", "CA", "CL", "CN", "CO", "HR", "CZ", "DK", "EG",
  "FI", "FR", "DE", "GR", "HK", "HU", "IS", "IN", "ID", "IR", "IE", "IL", "IT", "JP", "KR", "MY", "MX", "MA", "NL",
  "NZ", "NO", "PK", "PE", "PH", "PL", "PT", "RO", "RU", "SA", "SG", "ZA", "ES", "SE", "CH", "TW", "TH",
  "TR", "UA", "AE", "GB", "US", "UY", "VN"
].sort();

export const ProfileView: React.FC<ProfileViewProps> = ({ t, userProfile, language, setLanguage, onUpdate, onSubmit, onBack, onHome, backLabel }) => {
  const isComplete = userProfile.gender && userProfile.ageGroup && userProfile.nationality;

  const regionNames = useMemo(() => {
    try {
      return new Intl.DisplayNames([language], { type: 'region' });
    } catch (e) {
      return { of: (code: string) => code }; 
    }
  }, [language]);

  const priorityList = PRIORITY_COUNTRIES[language];
  const dropdownList = useMemo(() => {
    return COMMON_COUNTRIES.filter(code => !priorityList.includes(code));
  }, [priorityList]);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdate({ nationality: e.target.value });
  };

  const btnStyle = "text-white bg-slate-800/80 backdrop-blur-md p-2 rounded-full hover:bg-slate-700 transition-all border border-white/10 shadow-lg";

  return (
    <div className="w-full h-full relative flex flex-col animate-fade-in">
      {/* Top Navigation Bar */}
      <div className="flex justify-between items-center mb-3 shrink-0 z-20">
         <button onClick={onBack} className={btnStyle} aria-label={backLabel}>
           <ChevronLeft size={20} />
         </button>
         <div className="flex gap-2">
           <LanguageSwitcher currentLanguage={language} onLanguageChange={setLanguage} />
           <button onClick={onHome} className={btnStyle} aria-label="Home">
             <Home size={20} />
           </button>
         </div>
      </div>

      {/* Main Glass Panel */}
      <div className="glass-panel flex flex-col flex-grow h-0 rounded-3xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-6 pb-2 shrink-0 text-center border-b border-white/5 bg-slate-900/40">
          <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 text-cyan-400">
             <UserCircle2 size={24} />
          </div>
          <h2 className="text-xl md:text-2xl font-bold">{t.title}</h2>
          <p className="text-slate-400 text-xs md:text-sm mt-1">{t.desc}</p>
        </div>

        {/* Scrollable Form Area */}
        <div className="flex-grow overflow-y-auto custom-scrollbar p-6 space-y-6">
          {/* Nationality */}
          <div>
            <label className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-2 flex items-center gap-2">
              <Flag size={12} className="text-cyan-500" /> {t.label_nationality}
            </label>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                {priorityList.map(code => (
                  <button
                    key={code}
                    onClick={() => onUpdate({ nationality: code })}
                    className={`py-3 px-1 rounded-xl text-xs font-bold border transition-all flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 ${
                      userProfile.nationality === code
                        ? 'bg-cyan-600 border-cyan-400 text-white shadow-lg shadow-cyan-500/20'
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-lg leading-none">{getFlagEmoji(code)}</span>
                    <span className="truncate max-w-full">{regionNames.of(code)}</span>
                  </button>
                ))}
              </div>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                  <Globe size={16} />
                </div>
                <select
                  value={priorityList.includes(userProfile.nationality) ? "" : userProfile.nationality}
                  onChange={handleSelectChange}
                  className={`w-full appearance-none bg-slate-900 text-sm font-bold border rounded-xl py-3 pl-10 pr-4 cursor-pointer transition-all ${
                    userProfile.nationality && !priorityList.includes(userProfile.nationality)
                      ? 'border-cyan-500 text-cyan-400' 
                      : 'border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-300'
                  }`}
                >
                  <option value="" disabled>
                     {t.nationalities?.other || "Select other country..."}
                  </option>
                  {dropdownList.map(code => (
                    <option key={code} value={code} className="bg-slate-900 text-slate-300">
                      {getFlagEmoji(code)} {regionNames.of(code)}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                  <ChevronRight size={14} className="rotate-90" />
                </div>
              </div>
            </div>
          </div>

          {/* Gender */}
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

          {/* Age */}
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

        {/* Sticky Footer */}
        <div className="p-4 bg-slate-900/90 backdrop-blur-md border-t border-slate-800 shrink-0">
          <Button onClick={onSubmit} fullWidth>
            {isComplete ? t.btn_submit : t.skip} <ChevronRight size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
};
