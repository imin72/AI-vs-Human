import React from 'react';
import { UserCircle2, ChevronRight } from 'lucide-react';
import { Button } from '../components/Button';
import { UserProfile } from '../types';

interface ProfileViewProps {
  t: any;
  userProfile: UserProfile;
  onUpdate: (profile: Partial<UserProfile>) => void;
  onSubmit: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ t, userProfile, onUpdate, onSubmit }) => {
  return (
    <div className="glass-panel p-6 rounded-3xl space-y-6 animate-fade-in">
      <div className="text-center">
        <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 text-cyan-400">
           <UserCircle2 size={24} />
        </div>
        <h2 className="text-2xl font-bold">{t.title}</h2>
        <p className="text-slate-400 text-sm mt-1">{t.desc}</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-2 block">{t.label_gender}</label>
          <div className="grid grid-cols-3 gap-2">
            {Object.keys(t.genders).map(g => (
              <button
                key={g}
                onClick={() => onUpdate({ gender: g })}
                className={`py-3 rounded-xl text-sm font-bold border transition-all ${
                  userProfile.gender === g
                    ? 'bg-cyan-600 border-cyan-400 text-white'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                {t.genders[g]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-2 block">{t.label_age}</label>
          <div className="grid grid-cols-3 gap-2">
            {Object.keys(t.ages).map(age => (
              <button
                key={age}
                onClick={() => onUpdate({ ageGroup: age })}
                className={`py-3 rounded-xl text-sm font-bold border transition-all ${
                  userProfile.ageGroup === age
                    ? 'bg-cyan-600 border-cyan-400 text-white'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                {t.ages[age]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-2">
        <Button onClick={onSubmit} fullWidth>
          {userProfile.gender && userProfile.ageGroup ? t.btn_submit : t.skip} <ChevronRight size={18} />
        </Button>
      </div>
    </div>
  );
};
