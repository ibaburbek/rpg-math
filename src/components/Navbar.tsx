import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Compass,
  GraduationCap,
  Sparkles,
  Coins,
  Database,
  Layers,
  Home,
  Package,
  Award,
  BookOpen,
  CheckSquare,
  Users,
} from 'lucide-react';
import { isSupabaseConfigured } from '@/src/lib/supabase/client';
import { SupabaseSetupModal } from './SupabaseSetupModal';
import { calculateLevelFromXp } from '@/src/features/rpg/levelEngine';

interface Props {
  studentStats?: { total_xp: number; coins: number };
}

export const Navbar: React.FC<Props> = ({ studentStats }) => {
  const location = useLocation();
  const [showSetupModal, setShowSetupModal] = useState(false);

  const isTeacherRoute = location.pathname.startsWith('/teacher');
  const isStudentRoute =
    location.pathname.startsWith('/play') || location.pathname === '/join';

  const stats = studentStats || { total_xp: 160, coins: 75 };
  const levelInfo = calculateLevelFromXp(stats.total_xp);

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#0f172a] text-white border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-6">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                  <Compass className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-lg tracking-tight text-white">MathQuest</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      4–9 сынып
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium">Шығар. Өс. Зертте.</p>
                </div>
              </Link>

              {/* Mode Links */}
              <nav className="hidden md:flex items-center gap-1 pl-4 border-l border-slate-800">
                <Link
                  to="/teacher"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    isTeacherRoute
                      ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  Мұғалім кабинеті
                </Link>

                <Link
                  to="/play"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    isStudentRoute
                      ? 'bg-slate-800 text-teal-400 border border-teal-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  Оқушы әлемі
                </Link>
              </nav>
            </div>

            {/* Right side: Stats & Supabase Indicator */}
            <div className="flex items-center gap-3">
              {/* Student RPG Stats (When in student view) */}
              {isStudentRoute && (
                <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-1.5">
                  <div className="flex items-center gap-1.5 text-xs text-amber-300 font-bold border-r border-slate-700 pr-2">
                    <Coins className="w-4 h-4 text-amber-400 fill-amber-400/20" />
                    <span>{stats.coins}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-[11px]">
                      {levelInfo.level}-деңгей
                    </span>
                    <span className="text-[11px] text-slate-300">{stats.total_xp} XP</span>
                  </div>
                </div>
              )}

              {/* Supabase status badge */}
              <button
                onClick={() => setShowSetupModal(true)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer ${
                  isSupabaseConfigured
                    ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60 hover:bg-emerald-900/50'
                    : 'bg-amber-950/40 text-amber-300 border-amber-800/60 hover:bg-amber-900/50'
                }`}
                title="Supabase дерекқор күйін көру"
              >
                <Database className="w-3.5 h-3.5" />
                <span>{isSupabaseConfigured ? 'Supabase Live' : 'Демо режимі'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sub-navigation for Teacher */}
        {isTeacherRoute && (
          <div className="bg-slate-950 border-t border-slate-800/80 px-4 sm:px-6 lg:px-8 py-2 overflow-x-auto">
            <div className="max-w-7xl mx-auto flex items-center gap-2 min-w-max text-xs">
              <Link
                to="/teacher"
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  location.pathname === '/teacher'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                Басты тақта
              </Link>
              <Link
                to="/teacher/classes"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                  location.pathname.startsWith('/teacher/classes')
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                Сыныптар
              </Link>
              <Link
                to="/teacher/problems"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                  location.pathname.startsWith('/teacher/problems')
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                Есептер қоры
              </Link>
              <Link
                to="/teacher/assignments"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                  location.pathname === '/teacher/assignments'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Тапсырма беру
              </Link>
              <Link
                to="/teacher/results"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                  location.pathname === '/teacher/results'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5" />
                Нәтижелер мен тексеру
              </Link>
            </div>
          </div>
        )}

        {/* Sub-navigation for Student */}
        {isStudentRoute && (
          <div className="bg-slate-950 border-t border-slate-800/80 px-4 sm:px-6 lg:px-8 py-2 overflow-x-auto">
            <div className="max-w-7xl mx-auto flex items-center gap-2 min-w-max text-xs">
              <Link
                to="/play"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                  location.pathname === '/play'
                    ? 'bg-teal-600 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Басты бет
              </Link>
              <Link
                to="/play/quests"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                  location.pathname.startsWith('/play/quests')
                    ? 'bg-teal-600 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                Квесттер (Тапсырмалар)
              </Link>
              <Link
                to="/play/character"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                  location.pathname === '/play/character'
                    ? 'bg-teal-600 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                Кейіпкер
              </Link>
              <Link
                to="/play/home"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                  location.pathname === '/play/home'
                    ? 'bg-teal-600 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Home className="w-3.5 h-3.5" />
                Виртуалды бөлме
              </Link>
              <Link
                to="/play/inventory"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                  location.pathname === '/play/inventory'
                    ? 'bg-teal-600 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                Инвентарь
              </Link>
              <Link
                to="/play/progress"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                  location.pathname === '/play/progress'
                    ? 'bg-teal-600 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                Жетістіктер
              </Link>
            </div>
          </div>
        )}
      </header>

      <SupabaseSetupModal
        isOpen={showSetupModal}
        onClose={() => setShowSetupModal(false)}
      />
    </>
  );
};
