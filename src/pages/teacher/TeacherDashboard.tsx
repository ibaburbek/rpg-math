import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  BookOpen,
  Layers,
  CheckSquare,
  Plus,
  Copy,
  Check,
  ArrowRight,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { classroomService } from '@/src/lib/supabase/services/classroomService';
import { problemService } from '@/src/lib/supabase/services/problemService';
import { assignmentService } from '@/src/lib/supabase/services/assignmentService';
import { submissionService } from '@/src/lib/supabase/services/submissionService';
import { Classroom, Problem, Assignment } from '@/src/types/database';

export const TeacherDashboard: React.FC = () => {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [pendingSubs, setPendingSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [cls, probs, subs] = await Promise.all([
          classroomService.getClassrooms(),
          problemService.getTeacherProblems(),
          submissionService.getPendingSubmissionsForTeacher(),
        ]);
        setClassrooms(cls);
        setProblems(probs);
        setPendingSubs(subs.filter((s) => s.status === 'pending'));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden border border-slate-700">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-3 border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Мұғалімнің басқару орталығы</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Қош келдіңіз, Әлия Мұғалім!
          </h1>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Сыныптарыңызды бақылаңыз, жаңа математикалық есептер құрастырыңыз және оқушылардың шешімдерін тексеріп, XP мен монеталармен марапаттаңыз.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Сыныптар
            </span>
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-800 mt-3">{classrooms.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">Белсенді оқу топтары</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Есептер қоры
            </span>
            <div className="p-2 rounded-xl bg-teal-100 text-teal-700">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-800 mt-3">{problems.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">Дайын тапсырмалар</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Тексеруді күтуде
            </span>
            <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-amber-600 mt-3">{pendingSubs.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">Қолмен бағаланатын жауаптар</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Жүйе деңгейі
            </span>
            <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-indigo-600 mt-3">4–9</p>
          <p className="text-[11px] text-slate-500 mt-1">Сыныптарға арналған RPG</p>
        </div>
      </div>

      {/* Classrooms & Join Codes */}
      <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Сыныптар мен қосылу кодтары</h2>
            <p className="text-xs text-slate-500">
              Оқушыларға осы 6 таңбалы кодты беріңіз, олар тікелей қосыла алады
            </p>
          </div>
          <Link
            to="/teacher/classes"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800"
          >
            Барлық сыныптар <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {classrooms.map((cls) => (
            <div
              key={cls.id}
              className="p-4 rounded-2xl border border-stone-200 bg-stone-50/50 hover:bg-stone-50 flex items-center justify-between transition-colors"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-800 text-sm">{cls.name}</h3>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    {cls.grade_range}-сынып
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">Күйі: {cls.status === 'active' ? 'Белсенді' : 'Мұрағатта'}</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="bg-slate-900 text-white font-mono font-bold text-xs px-2.5 py-1.5 rounded-lg tracking-widest">
                  {cls.join_code}
                </div>
                <button
                  onClick={() => copyCode(cls.join_code)}
                  className="p-1.5 text-slate-600 hover:text-emerald-700 rounded-lg hover:bg-stone-200/60 transition-colors cursor-pointer"
                  title="Кодты көшіру"
                >
                  {copiedCode === cls.join_code ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Reviews Banner */}
      {pendingSubs.length > 0 && (
        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-900">
                {pendingSubs.length} оқушының жауабы тексеруді күтуде
              </h3>
              <p className="text-xs text-amber-700">
                Оқушыларға тиісті балл мен XP марапаттарын тағайындау үшін нәтижелер бөліміне өтіңіз.
              </p>
            </div>
          </div>
          <Link
            to="/teacher/results"
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
          >
            Тексеруге өту
          </Link>
        </div>
      )}
    </div>
  );
};
