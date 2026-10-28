import React from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  GraduationCap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Award,
  Layers,
  BookOpen,
  Home,
  CheckCircle2,
} from 'lucide-react';
import { isSupabaseConfigured } from '@/src/lib/supabase/client';
import { CHARACTERS } from '@/src/features/rpg/characters';
import { CharacterAvatar } from '@/src/components/CharacterAvatar';

export const LandingPage: React.FC = () => {
  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white p-8 sm:p-14 border border-slate-800 shadow-xl text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-300 text-xs font-bold border border-emerald-500/30 mb-6">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>4–9 сынып оқушыларына арналған білім беру RPG-платформасы</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-3xl mx-auto leading-tight">
          Математиканы <span className="text-emerald-400">шытырман оқиғаға</span> айналдыр
        </h1>

        <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Мұғалім тағайындаған есептерді шығарып, тәжірибе (XP) мен монеталар жинаңыз, кейіпкеріңіздің деңгейін өсіріп, жеке виртуалды бөлмеңізді безендіріңіз!
        </p>

        {/* Two Clear Role Selection Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
          <Link
            to="/teacher"
            className="w-full sm:w-1/2 py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 group cursor-pointer"
          >
            <GraduationCap className="w-5 h-5 text-emerald-200" />
            <span>Мұғалім</span>
            <ArrowRight className="w-4 h-4 text-emerald-200 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            to="/join"
            className="w-full sm:w-1/2 py-3.5 px-6 rounded-2xl bg-teal-700 hover:bg-teal-600 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 group cursor-pointer"
          >
            <Sparkles className="w-5 h-5 text-teal-200" />
            <span>Оқушы</span>
            <ArrowRight className="w-4 h-4 text-teal-200 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Status Callout */}
        <div className="mt-8 pt-6 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>
            {isSupabaseConfigured
              ? 'Нақты Supabase PostgreSQL дерекқоры байланыстырылған'
              : 'Демо режимі белсенді (Supabase баптауларын .env арқылы қосуға болады)'}
          </span>
        </div>
      </div>

      {/* Characters Showcase */}
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-extrabold text-slate-800">
            Өз математикалық кейіпкеріңді таңда
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Әрбір оқушыға 6 түрлі ерекше қабілеті бар кейіпкерлер қолжетімді
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {CHARACTERS.map((char) => (
            <div
              key={char.id}
              className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-xs text-center hover:shadow-md transition-all flex flex-col items-center"
            >
              <CharacterAvatar characterId={char.id} size="md" />
              <p className="font-bold text-xs text-slate-800 mt-2">{char.nameKz}</p>
              <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{char.titleKz}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 3 Pillars */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-base">Автоматты & Қолмен бағалау</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Жай сандық мәндер мен тесттер лезде тексеріледі. Күрделі геометриялық және мәтіндік есептерді мұғалім қарап, пікір қалдырады.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-stone-100 text-[11px] font-bold text-emerald-700">
            ✓ Қайталанатын сыйлықтардан қорғалған
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mb-4">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-base">Жүйелі RPG деңгейі</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              <code>100 × L × (L − 1) / 2</code> деңгей формуласы оқушыларды әр есеп шығарған сайын ынталандырып, жаңа жетістіктер ашады.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-stone-100 text-[11px] font-bold text-amber-700">
            ✓ Канондық student_stats & reward_ledger
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center mb-4">
              <Home className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-base">Виртуалды бөлме дизайны</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Оқу үстелі, бонсай өсімдігі, формулалар тақтасы мен сағаттар. Монеталарға жиһаз сатып алып, жеке бөлмеңізді безендіріңіз.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-stone-100 text-[11px] font-bold text-teal-700">
            ✓ 2D слоттық орналастыру жүйесі
          </div>
        </div>
      </div>
    </div>
  );
};
