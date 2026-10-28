import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Plus, Filter, Sparkles, Coins, CheckCircle, Clock } from 'lucide-react';
import { problemService } from '@/src/lib/supabase/services/problemService';
import { Problem } from '@/src/types/database';
import { DEMO_TEACHER_ID } from '@/src/lib/supabase/services/demoData';

export const TeacherProblems: React.FC = () => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [diffFilter, setDiffFilter] = useState<string>('all');

  useEffect(() => {
    async function load() {
      try {
        const probs = await problemService.getTeacherProblems(DEMO_TEACHER_ID);
        setProblems(probs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = problems.filter((p) => {
    if (gradeFilter !== 'all' && p.grade.toString() !== gradeFilter) return false;
    if (diffFilter !== 'all' && p.difficulty !== diffFilter) return false;
    return true;
  });

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case 'easy':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">Оңай</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">Орташа</span>;
      case 'hard':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">Күрделі</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">Есептер қоры (Problem Bank)</h1>
          <p className="text-xs text-slate-500 mt-1">
            Сыныптарға тапсырма ретінде беруге арналған есептер топтамасы
          </p>
        </div>
        <Link
          to="/teacher/problems/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Жаңа есеп қосу
        </Link>
      </div>

      {/* Filter Controls */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="font-bold text-slate-700">Сүзу:</span>
        </div>

        <select
          value={gradeFilter}
          onChange={(e) => setGradeFilter(e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-emerald-600"
        >
          <option value="all">Барлық сыныптар</option>
          <option value="4">4-сынып</option>
          <option value="5">5-сынып</option>
          <option value="6">6-сынып</option>
          <option value="7">7-сынып</option>
          <option value="8">8-сынып</option>
          <option value="9">9-сынып</option>
        </select>

        <select
          value={diffFilter}
          onChange={(e) => setDiffFilter(e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-emerald-600"
        >
          <option value="all">Барлық қиындық деңгейлері</option>
          <option value="easy">Оңай</option>
          <option value="medium">Орташа</option>
          <option value="hard">Күрделі</option>
        </select>
      </div>

      {/* Problems Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((prob) => (
          <div
            key={prob.id}
            className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 text-slate-700">
                    {prob.grade}-сынып
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-50 text-teal-800">
                    {prob.topic}
                  </span>
                </div>
                {getDifficultyBadge(prob.difficulty)}
              </div>

              <h3 className="text-base font-bold text-slate-800 mt-3">{prob.title}</h3>
              <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                {prob.statement}
              </p>

              {prob.image_path && (
                <div className="mt-3">
                  <img
                    src={prob.image_path}
                    alt={prob.title}
                    className="max-h-36 rounded-xl object-contain border border-stone-200"
                  />
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> +{prob.xp_reward} XP
                </span>
                <span className="font-bold text-amber-600 flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5" /> +{prob.coin_reward}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400">
                  {prob.grading_mode === 'auto' ? 'Авто тексеру' : 'Қолмен тексеру'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
