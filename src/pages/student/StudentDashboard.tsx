import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Coins,
  BookOpen,
  Home,
  ArrowRight,
  Award,
  Layers,
  Calendar,
  Compass,
} from 'lucide-react';
import { studentService } from '@/src/lib/supabase/services/studentService';
import { assignmentService } from '@/src/lib/supabase/services/assignmentService';
import { Student, StudentStats, Assignment } from '@/src/types/database';
import { calculateLevelFromXp } from '@/src/features/rpg/levelEngine';
import { CharacterAvatar } from '@/src/components/CharacterAvatar';
import { getCharacterById } from '@/src/features/rpg/characters';
import { DEMO_STUDENT_ID, DEMO_CLASSROOM_ID } from '@/src/lib/supabase/services/demoData';

interface Props {
  studentId?: string;
  onStatsUpdate?: (stats: { total_xp: number; coins: number }) => void;
}

export const StudentDashboard: React.FC<Props> = ({
  studentId = DEMO_STUDENT_ID,
  onStatsUpdate,
}) => {
  const [student, setStudent] = useState<Student | null>(null);
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [stu, st] = await Promise.all([
          studentService.getStudentProfile(studentId),
          studentService.getStudentStats(studentId),
        ]);
        setStudent(stu);
        setStats(st);
        if (onStatsUpdate && st) {
          onStatsUpdate({ total_xp: st.total_xp, coins: st.coins });
        }

        const classId = stu?.classroom_id || DEMO_CLASSROOM_ID;
        const asgs = await assignmentService.getStudentAssignments(classId);
        setAssignments(asgs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [studentId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
      </div>
    );
  }

  const currentXp = stats?.total_xp || 0;
  const levelInfo = calculateLevelFromXp(currentXp);
  const character = getCharacterById(student?.character_id || 'forest_explorer');

  return (
    <div className="space-y-8">
      {/* Hero / RPG Status Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 rounded-3xl p-6 sm:p-8 text-white shadow-lg border border-slate-700/80">
        <div className="flex flex-col md:flex-row items-center gap-6 justify-between">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <div className="p-2 bg-slate-800/80 rounded-2xl border border-teal-500/30 shadow-md">
              <CharacterAvatar
                characterId={student?.character_id || 'forest_explorer'}
                size="lg"
                level={levelInfo.level}
              />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[11px] font-bold border border-teal-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{character.nameKz} • {character.titleKz}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
                Қош келдің, {student?.display_name || 'Батыр'}!
              </h1>
              <p className="text-xs text-slate-300 mt-1 max-w-md">
                Бүгінгі математикалық квесттерді шешіп, кейіпкеріңді келесі деңгейге көтер!
              </p>
            </div>
          </div>

          {/* Quick Balance Indicators */}
          <div className="flex items-center gap-4 bg-slate-900/90 p-4 rounded-2xl border border-slate-700">
            <div className="text-center px-3 border-r border-slate-700">
              <p className="text-[10px] uppercase font-bold text-slate-400">Монета</p>
              <div className="flex items-center gap-1 text-lg font-extrabold text-amber-300 mt-0.5">
                <Coins className="w-5 h-5 text-amber-400" />
                <span>{stats?.coins || 0}</span>
              </div>
            </div>

            <div className="text-center px-3">
              <p className="text-[10px] uppercase font-bold text-slate-400">Деңгей</p>
              <div className="flex items-center gap-1 text-lg font-extrabold text-teal-300 mt-0.5">
                <Compass className="w-5 h-5 text-teal-400" />
                <span>{levelInfo.level}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Level XP Progress Bar */}
        <div className="mt-6 pt-5 border-t border-slate-700/60">
          <div className="flex justify-between items-center text-xs mb-2">
            <span className="font-bold text-teal-300">
              {levelInfo.level}-деңгей прогресі ({levelInfo.progressPercent}%)
            </span>
            <span className="text-slate-300 text-[11px]">
              Келесі деңгейге: <strong>{levelInfo.xpNeededForNextLevel} XP</strong> қажет (барлығы: {currentXp} / {levelInfo.nextLevelThreshold} XP)
            </span>
          </div>

          <div className="w-full bg-slate-800 rounded-full h-3.5 p-0.5 border border-slate-700 overflow-hidden">
            <div
              className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${levelInfo.progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/play/quests"
          className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs hover:shadow-md transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-teal-100 text-teal-800 group-hover:scale-105 transition-transform">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Квесттерді бастау</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Есептерді шығару</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-700 group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          to="/play/home"
          className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs hover:shadow-md transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-100 text-amber-800 group-hover:scale-105 transition-transform">
              <Home className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Виртуалды бөлме</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Бөлмеңді безендір</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-700 group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          to="/play/progress"
          className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs hover:shadow-md transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-100 text-indigo-800 group-hover:scale-105 transition-transform">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Жетістіктер</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Марапаттар тарихы</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-700 group-hover:translate-x-1 transition-all" />
        </Link>
      </div>

      {/* Active Assignments List */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Мұғалімнің тапсырмалары (Квесттер)</h2>
            <p className="text-xs text-slate-500">
              Сыныпқа берілген белсенді математикалық тапсырмалар
            </p>
          </div>
          <Link
            to="/play/quests"
            className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1"
          >
            Барлық квесттер <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {assignments.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            Қазіргі уақытта жаңа тапсырма жоқ. Мұғалім жаңа квест қосқанша күтіңіз немесе бөлмеңізді безендіріңіз!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignments.map((asg) => (
              <div
                key={asg.id}
                className="p-5 rounded-2xl border border-stone-200 bg-stone-50/50 hover:bg-stone-50 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                      Белсенді
                    </span>
                    {asg.due_at && (
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Дедлайн: {new Date(asg.due_at).toLocaleDateString('kk-KZ')}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm mt-2">{asg.title}</h3>
                  {asg.instructions && (
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">{asg.instructions}</p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-stone-200/60 flex justify-end">
                  <Link
                    to={`/play/quests`}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
                  >
                    Квестті орындау →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
