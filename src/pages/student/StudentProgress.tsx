import React, { useState, useEffect } from 'react';
import { Award, Sparkles, Coins, CheckCircle, TrendingUp, History } from 'lucide-react';
import { studentService } from '@/src/lib/supabase/services/studentService';
import { StudentStats, RewardLedger } from '@/src/types/database';
import { calculateLevelFromXp, getXpRequiredForLevel } from '@/src/features/rpg/levelEngine';
import { DEMO_STUDENT_ID } from '@/src/lib/supabase/services/demoData';

interface Props {
  studentId?: string;
}

export const StudentProgress: React.FC<Props> = ({ studentId = DEMO_STUDENT_ID }) => {
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [rewards, setRewards] = useState<RewardLedger[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [st, rew] = await Promise.all([
          studentService.getStudentStats(studentId),
          studentService.getRewardLedger(studentId),
        ]);
        setStats(st);
        setRewards(rew);
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

  const levelInfo = calculateLevelFromXp(stats?.total_xp || 0);

  // Milestone list up to level 6
  const milestones = [1, 2, 3, 4, 5, 6].map((lvl) => ({
    level: lvl,
    requiredXp: getXpRequiredForLevel(lvl),
    unlocked: (stats?.total_xp || 0) >= getXpRequiredForLevel(lvl),
  }));

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800">Жетістіктер мен деңгей тарихы</h1>
        <p className="text-xs text-slate-500 mt-1">
          Есептерді дұрыс шығарғаныңыз үшін берілген барлық ресми марапаттар тізімі
        </p>
      </div>

      {/* Level Summary Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 rounded-3xl text-white shadow-md border border-slate-700">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30 mb-2">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Деңгей жүйесінің формуласы</span>
            </div>
            <h2 className="text-xl font-extrabold">Сіздің деңгейіңіз: {levelInfo.level}</h2>
            <p className="text-xs text-slate-300 mt-1">
              Формула: <code>XP = 100 × L × (L − 1) / 2</code>
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-900/80 p-3.5 rounded-2xl border border-slate-700">
            <div className="text-center pr-3 border-r border-slate-700">
              <span className="text-[10px] text-slate-400 block font-bold">ЖАЛПЫ XP</span>
              <span className="text-base font-extrabold text-teal-300">{stats?.total_xp || 0}</span>
            </div>
            <div className="text-center">
              <span className="text-[10px] text-slate-400 block font-bold">МОНЕТАЛАР</span>
              <span className="text-base font-extrabold text-amber-300">{stats?.coins || 0}</span>
            </div>
          </div>
        </div>

        {/* Milestones row */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 mt-6 pt-4 border-t border-slate-700/60">
          {milestones.map((m) => (
            <div
              key={m.level}
              className={`p-2.5 rounded-xl text-center border transition-all ${
                m.unlocked
                  ? 'bg-teal-950/60 border-teal-500/50 text-teal-300'
                  : 'bg-slate-900/40 border-slate-800 text-slate-500'
              }`}
            >
              <p className="text-xs font-bold">{m.level}-деңгей</p>
              <p className="text-[10px] font-mono mt-0.5">{m.requiredXp} XP</p>
              <p className="text-[10px] font-bold mt-1">
                {m.unlocked ? '✓ Ашылды' : 'Құлыптаулы'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Reward Ledger (Audit Log) */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-teal-700" />
          <h3 className="text-base font-bold text-slate-800">
            Марапаттар журналы (Reward Ledger)
          </h3>
        </div>
        <p className="text-xs text-slate-500">
          Бұл жазбалар сервердегі канондық <code>reward_ledger</code> кестесінде сақталады және қайталанатын сыйлықтардан қорғалған.
        </p>

        {rewards.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            Әзірге марапаттар жазбасы жоқ. Квест есептерін шешіп, марапаттар жинаңыз!
          </div>
        ) : (
          <div className="space-y-3">
            {rewards.map((r) => (
              <div
                key={r.id}
                className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50 flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-bold text-slate-800">Есепті сәтті аяқтау марапаты</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {new Date(r.created_at).toLocaleString('kk-KZ')}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-emerald-700 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> +{r.xp_amount} XP
                  </span>
                  <span className="font-extrabold text-amber-600 flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5" /> +{r.coin_amount} монета
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
