import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Sparkles,
  Coins,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  ArrowRight,
  Check,
  Award,
} from 'lucide-react';
import { assignmentService } from '@/src/lib/supabase/services/assignmentService';
import { submissionService, SubmitResult } from '@/src/lib/supabase/services/submissionService';
import { studentService } from '@/src/lib/supabase/services/studentService';
import {
  Assignment,
  AssignmentWithProblems,
  AssignmentProblemWithDetails,
} from '@/src/types/database';
import { DEMO_STUDENT_ID, DEMO_CLASSROOM_ID } from '@/src/lib/supabase/services/demoData';

interface Props {
  studentId?: string;
  onRewardEarned?: (newStats: { total_xp: number; coins: number }) => void;
}

export const StudentQuests: React.FC<Props> = ({
  studentId = DEMO_STUDENT_ID,
  onRewardEarned,
}) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAsgId, setSelectedAsgId] = useState<string | null>(null);
  const [activeAssignment, setActiveAssignment] = useState<AssignmentWithProblems | null>(null);
  const [loading, setLoading] = useState(true);

  // Active question index in problem sequence
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<SubmitResult | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const student = await studentService.getStudentProfile(studentId);
        const classId = student?.classroom_id || DEMO_CLASSROOM_ID;
        const asgs = await assignmentService.getStudentAssignments(classId);
        setAssignments(asgs);
        if (asgs.length > 0) {
          setSelectedAsgId(asgs[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [studentId]);

  useEffect(() => {
    if (!selectedAsgId) return;
    loadAssignmentDetails(selectedAsgId);
  }, [selectedAsgId]);

  async function loadAssignmentDetails(asgId: string) {
    try {
      const full = await assignmentService.getAssignmentWithProblems(asgId, studentId);
      setActiveAssignment(full);
      setCurrentIndex(0);
      setUserAnswer('');
      setFeedback(null);
      setShowHint(false);
    } catch (err) {
      console.error(err);
    }
  }

  const currentItem: AssignmentProblemWithDetails | undefined =
    activeAssignment?.problems?.[currentIndex];
  const problem = currentItem?.problem;
  const existingSubmission = currentItem?.submission;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentItem || !userAnswer.trim() || submitting) return;

    setSubmitting(true);
    setFeedback(null);

    try {
      const result = await submissionService.submitAnswer(
        studentId,
        currentItem.id,
        userAnswer.trim()
      );

      setFeedback(result);

      // Refresh student stats if rewards awarded
      if (result.xp_awarded > 0 || result.coins_awarded > 0) {
        const updatedStats = await studentService.getStudentStats(studentId);
        if (onRewardEarned) {
          onRewardEarned({ total_xp: updatedStats.total_xp, coins: updatedStats.coins });
        }
      }

      // Reload assignment to update submission statuses
      if (selectedAsgId) {
        const refreshed = await assignmentService.getAssignmentWithProblems(selectedAsgId, studentId);
        setActiveAssignment(refreshed);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center text-slate-500 text-xs max-w-lg mx-auto">
        <BookOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        Қазіргі уақытта сыныбыңызда белсенді тапсырма жоқ. Мұғалім жаңа квест қосқан кезде осы жерден көре аласыз.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Assignment selector tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {assignments.map((asg) => (
          <button
            key={asg.id}
            onClick={() => setSelectedAsgId(asg.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedAsgId === asg.id
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-white border border-stone-200 text-slate-600 hover:bg-stone-50'
            }`}
          >
            {asg.title}
          </button>
        ))}
      </div>

      {activeAssignment && (
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
          {/* Header */}
          <div className="border-b border-stone-100 pb-4">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800">
              {activeAssignment.title}
            </h1>
            {activeAssignment.instructions && (
              <p className="text-xs text-slate-500 mt-1">{activeAssignment.instructions}</p>
            )}

            {/* Problem sequence indicator bar */}
            <div className="flex items-center gap-2 mt-4 overflow-x-auto">
              {activeAssignment.problems?.map((p, idx) => {
                const isSolved = p.submission?.is_correct === true;
                const isPending = p.submission?.status === 'pending';
                const isCurrent = idx === currentIndex;

                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setUserAnswer('');
                      setFeedback(null);
                      setShowHint(false);
                    }}
                    className={`w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${
                      isCurrent
                        ? 'ring-2 ring-teal-500 bg-slate-900 text-white scale-105'
                        : isSolved
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : isPending
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-stone-100 text-slate-600 hover:bg-stone-200'
                    }`}
                  >
                    {isSolved ? <Check className="w-4 h-4 text-emerald-700" /> : idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current Question View */}
          {problem && currentItem ? (
            <div className="space-y-6">
              {/* Question metadata badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                    {currentIndex + 1}-есеп / {activeAssignment.problems?.length}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-slate-600">
                    {problem.topic}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> +{problem.xp_reward} XP
                  </span>
                  <span className="font-bold text-amber-600 flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5" /> +{problem.coin_reward}
                  </span>
                </div>
              </div>

              {/* Statement & Image */}
              <div className="space-y-4">
                <h2 className="text-base font-bold text-slate-800">{problem.title}</h2>
                <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 text-slate-800 text-sm leading-relaxed whitespace-pre-wrap">
                  {problem.statement}
                </div>

                {problem.image_path && (
                  <div className="flex justify-center p-2 bg-stone-50 rounded-2xl border border-stone-200">
                    <img
                      src={problem.image_path}
                      alt={problem.title}
                      className="max-h-64 object-contain rounded-xl"
                    />
                  </div>
                )}
              </div>

              {/* Hint button & toggle */}
              {problem.hint && (
                <div>
                  <button
                    type="button"
                    onClick={() => setShowHint(!showHint)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-800 cursor-pointer"
                  >
                    <HelpCircle className="w-4 h-4" />
                    {showHint ? 'Көмекші кеңесті жабу' : 'Көмек сұрау (Hint)'}
                  </button>

                  {showHint && (
                    <div className="mt-2 p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed">
                      💡 <strong>Кеңес:</strong> {problem.hint}
                    </div>
                  )}
                </div>
              )}

              {/* Previous Submission Status if already solved */}
              {existingSubmission && (
                <div
                  className={`p-4 rounded-2xl border text-xs flex items-center gap-3 ${
                    existingSubmission.is_correct
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : existingSubmission.status === 'pending'
                      ? 'bg-amber-50 border-amber-200 text-amber-900'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}
                >
                  {existingSubmission.is_correct ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : existingSubmission.status === 'pending' ? (
                    <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  )}
                  <div>
                    <span className="font-bold">
                      {existingSubmission.is_correct
                        ? 'Бұл есеп сәтті шешілген!'
                        : existingSubmission.status === 'pending'
                        ? 'Жауабыңыз мұғалімге тексеруге жіберілді (күтілуде).'
                        : 'Алдыңғы жауабыңыз қате болды, қайталап көрсеңіз болады.'}
                    </span>
                    <p className="text-[11px] mt-0.5">
                      Сіздің жауабыңыз: «{existingSubmission.answer}»
                    </p>
                  </div>
                </div>
              )}

              {/* Immediate Feedback Banner after submit */}
              {feedback && (
                <div
                  className={`p-4 rounded-2xl border text-xs flex flex-col gap-2 ${
                    feedback.is_correct
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : feedback.status === 'pending'
                      ? 'bg-amber-50 border-amber-300 text-amber-900'
                      : 'bg-rose-50 border-rose-300 text-rose-900'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm">
                    {feedback.is_correct ? (
                      <>
                        <Sparkles className="w-5 h-5 text-emerald-600 animate-spin" />
                        <span>Керемет! Жауабыңыз дұрыс!</span>
                      </>
                    ) : feedback.status === 'pending' ? (
                      <>
                        <Clock className="w-5 h-5 text-amber-600" />
                        <span>Жауап мұғалімнің қолмен тексеруіне қабылданды!</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-rose-600" />
                        <span>Қате, қайтадан ойланып көр!</span>
                      </>
                    )}
                  </div>

                  {feedback.xp_awarded > 0 && (
                    <div className="flex items-center gap-3 font-bold text-xs pt-1">
                      <span className="text-emerald-700">+{feedback.xp_awarded} XP сыйлығы берілді!</span>
                      <span className="text-amber-700">+{feedback.coins_awarded} Монета табылды!</span>
                    </div>
                  )}

                  {feedback.explanation && (
                    <div className="mt-2 pt-2 border-t border-emerald-200 text-slate-700">
                      <strong>Түсіндірме мен шешу жолы:</strong> {feedback.explanation}
                    </div>
                  )}
                </div>
              )}

              {/* Answer Input Area */}
              <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                {problem.answer_type === 'multiple_choice' && problem.answer_options ? (
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700 mb-2">
                      Дұрыс нұсқаны таңдаңыз:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {problem.answer_options.map((opt, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setUserAnswer(opt)}
                          className={`p-3.5 rounded-xl border-2 text-left text-xs font-semibold transition-all cursor-pointer flex items-center justify-between ${
                            userAnswer === opt
                              ? 'border-teal-600 bg-teal-50 text-teal-900 shadow-xs'
                              : 'border-stone-200 bg-white hover:bg-stone-50 text-slate-700'
                          }`}
                        >
                          <span>{opt}</span>
                          <span className="w-5 h-5 rounded-full border border-stone-300 flex items-center justify-center text-[10px] text-slate-400">
                            {['A', 'B', 'C', 'D'][idx] || idx + 1}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Жауабыңызды енгізіңіз:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={
                        problem.answer_type === 'numeric'
                          ? 'мысалы: 24 немесе 0.625'
                          : 'Жауабыңызды осы жерге жазыңыз...'
                      }
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                  <button
                    type="button"
                    disabled={currentIndex === 0}
                    onClick={() => {
                      setCurrentIndex((prev) => Math.max(0, prev - 1));
                      setUserAnswer('');
                      setFeedback(null);
                      setShowHint(false);
                    }}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-stone-100 rounded-xl disabled:opacity-30 cursor-pointer"
                  >
                    ← Алдыңғы есеп
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      disabled={submitting || !userAnswer.trim()}
                      className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      {submitting ? 'Тексерілуде...' : 'Жауапты тексеру'}
                    </button>

                    {currentIndex < (activeAssignment.problems?.length || 1) - 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentIndex((prev) => prev + 1);
                          setUserAnswer('');
                          setFeedback(null);
                          setShowHint(false);
                        }}
                        className="px-4 py-2 text-xs font-bold text-teal-700 hover:bg-teal-50 rounded-xl cursor-pointer"
                      >
                        Келесі есеп →
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400 text-xs">
              Бұл тапсырмада есептер тағайындалмаған.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
