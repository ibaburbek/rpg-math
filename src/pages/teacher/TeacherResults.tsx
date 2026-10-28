import React, { useState, useEffect } from 'react';
import { CheckSquare, Sparkles, Coins, Check, Clock, AlertCircle, MessageSquare } from 'lucide-react';
import { submissionService } from '@/src/lib/supabase/services/submissionService';

export const TeacherResults: React.FC = () => {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'graded'>('pending');

  // Grading form state per submission
  const [gradingState, setGradingState] = useState<{
    [subId: string]: { score: number; feedback: string; submitting: boolean };
  }>({});

  useEffect(() => {
    loadSubmissions();
  }, []);

  async function loadSubmissions() {
    try {
      const subs = await submissionService.getPendingSubmissionsForTeacher();
      setSubmissions(subs);
      // Initialize grading state
      const initialMap: any = {};
      subs.forEach((s) => {
        initialMap[s.id] = {
          score: s.score ?? s.problem_max_score ?? 10,
          feedback: s.teacher_feedback || '',
          submitting: false,
        };
      });
      setGradingState(initialMap);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleGrade = async (submissionId: string) => {
    const current = gradingState[submissionId];
    if (!current) return;

    setGradingState((prev) => ({
      ...prev,
      [submissionId]: { ...prev[submissionId], submitting: true },
    }));

    try {
      await submissionService.gradeSubmission(submissionId, current.score, current.feedback);
      await loadSubmissions();
    } catch (err) {
      console.error(err);
    } finally {
      setGradingState((prev) => ({
        ...prev,
        [submissionId]: { ...prev[submissionId], submitting: false },
      }));
    }
  };

  const pendingList = submissions.filter((s) => s.status === 'pending');
  const gradedList = submissions.filter((s) => s.status === 'graded');
  const displayedList = activeTab === 'pending' ? pendingList : gradedList;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800">
          Оқушылар нәтижесі мен тексеру кезегі
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Қолмен тексерілетін жауаптарды бағалап, тиісті XP және монета сыйлықтарын беріңіз.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'pending'
              ? 'bg-amber-100 text-amber-900 border border-amber-300'
              : 'text-slate-600 hover:bg-stone-100'
          }`}
        >
          <Clock className="w-4 h-4 text-amber-600" />
          Тексеруді күтуде ({pendingList.length})
        </button>

        <button
          onClick={() => setActiveTab('graded')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'graded'
              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
              : 'text-slate-600 hover:bg-stone-100'
          }`}
        >
          <Check className="w-4 h-4 text-emerald-600" />
          Тексерілгендер ({gradedList.length})
        </button>
      </div>

      {/* Submissions List */}
      <div className="space-y-4">
        {displayedList.length === 0 ? (
          <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center text-slate-400 text-xs">
            {activeTab === 'pending'
              ? 'Тексеруді күтіп тұрған жұмыстар жоқ.'
              : 'Әзірге тексерілген жұмыстар жоқ.'}
          </div>
        ) : (
          displayedList.map((sub) => {
            const form = gradingState[sub.id] || {
              score: sub.score || 10,
              feedback: sub.teacher_feedback || '',
              submitting: false,
            };

            return (
              <div
                key={sub.id}
                className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      Оқушы: {sub.student_name}
                    </span>
                    <h3 className="text-base font-bold text-slate-800 mt-1">{sub.problem_title}</h3>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="font-bold text-emerald-700 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> +{sub.problem_xp_reward} XP
                    </span>
                    <span className="font-bold text-amber-600 flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5" /> +{sub.problem_coin_reward}
                    </span>
                  </div>
                </div>

                {/* Statement & Submitted Answer */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80">
                    <p className="font-bold text-slate-700 mb-1">Есептің шарты:</p>
                    <p className="text-slate-600 leading-relaxed">{sub.problem_statement}</p>
                  </div>

                  <div className="p-3.5 bg-blue-50/60 rounded-2xl border border-blue-200/80">
                    <p className="font-bold text-blue-900 mb-1">Оқушының жіберген жауабы:</p>
                    <p className="text-slate-800 font-medium leading-relaxed whitespace-pre-wrap">
                      {sub.answer}
                    </p>
                  </div>
                </div>

                {/* Grading Controls */}
                {activeTab === 'pending' ? (
                  <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row items-center gap-3">
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-bold text-slate-700 whitespace-nowrap">
                        Балл (макс {sub.problem_max_score}):
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={sub.problem_max_score}
                        value={form.score}
                        onChange={(e) =>
                          setGradingState((prev) => ({
                            ...prev,
                            [sub.id]: { ...prev[sub.id], score: Number(e.target.value) },
                          }))
                        }
                        className="w-20 px-3 py-1.5 rounded-xl border border-stone-300 text-xs font-bold text-center"
                      />
                    </div>

                    <div className="flex-1 w-full">
                      <input
                        type="text"
                        placeholder="Оқушыға пікір қалдырыңыз (мысалы: Тамаша шешім!)..."
                        value={form.feedback}
                        onChange={(e) =>
                          setGradingState((prev) => ({
                            ...prev,
                            [sub.id]: { ...prev[sub.id], feedback: e.target.value },
                          }))
                        }
                        className="w-full px-3.5 py-1.5 rounded-xl border border-stone-300 text-xs"
                      />
                    </div>

                    <button
                      onClick={() => handleGrade(sub.id)}
                      disabled={form.submitting}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs cursor-pointer whitespace-nowrap disabled:opacity-50"
                    >
                      {form.submitting ? 'Сақталуда...' : 'Бағалау және марапаттау'}
                    </button>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-slate-600">
                    <div>
                      <span className="font-bold text-emerald-700">
                        Берілген балл: {sub.score} / {sub.problem_max_score}
                      </span>
                      {sub.teacher_feedback && (
                        <p className="text-slate-500 mt-0.5">
                          Мұғалім пікірі: "{sub.teacher_feedback}"
                        </p>
                      )}
                    </div>
                    <span className="text-[11px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                      ✓ Тексерілді және марапатталды
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
