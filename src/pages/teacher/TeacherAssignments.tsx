import React, { useState, useEffect } from 'react';
import { Layers, Plus, Calendar, CheckSquare, Sparkles, BookOpen, X } from 'lucide-react';
import { assignmentService } from '@/src/lib/supabase/services/assignmentService';
import { classroomService } from '@/src/lib/supabase/services/classroomService';
import { problemService } from '@/src/lib/supabase/services/problemService';
import { Assignment, Classroom, Problem } from '@/src/types/database';
import { DEMO_TEACHER_ID } from '@/src/lib/supabase/services/demoData';

export const TeacherAssignments: React.FC = () => {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>('');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [availableProblems, setAvailableProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [dueAt, setDueAt] = useState('');
  const [selectedProblemIds, setSelectedProblemIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const [cls, probs] = await Promise.all([
          classroomService.getClassrooms(DEMO_TEACHER_ID),
          problemService.getTeacherProblems(DEMO_TEACHER_ID),
        ]);
        setClassrooms(cls);
        setAvailableProblems(probs);
        if (cls.length > 0) {
          setSelectedClassroomId(cls[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  useEffect(() => {
    if (!selectedClassroomId) return;
    loadAssignments(selectedClassroomId);
  }, [selectedClassroomId]);

  async function loadAssignments(classId: string) {
    try {
      const list = await assignmentService.getClassroomAssignments(classId);
      setAssignments(list);
    } catch (err) {
      console.error(err);
    }
  }

  const toggleProblemSelection = (probId: string) => {
    setSelectedProblemIds((prev) =>
      prev.includes(probId) ? prev.filter((id) => id !== probId) : [...prev, probId]
    );
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || selectedProblemIds.length === 0 || !selectedClassroomId) return;

    setSubmitting(true);
    try {
      await assignmentService.createAssignment(
        DEMO_TEACHER_ID,
        selectedClassroomId,
        title,
        instructions || null,
        dueAt ? new Date(dueAt).toISOString() : null,
        selectedProblemIds
      );

      setTitle('');
      setInstructions('');
      setDueAt('');
      setSelectedProblemIds([]);
      setIsModalOpen(false);
      await loadAssignments(selectedClassroomId);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
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
          <h1 className="text-2xl font-extrabold text-slate-800">Тапсырмалар (Квесттер)</h1>
          <p className="text-xs text-slate-500 mt-1">
            Сыныпқа есептер топтамасын тағайындаңыз және мерзімін белгілеңіз
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Жаңа тапсырма беру
        </button>
      </div>

      {/* Classroom Switcher */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {classrooms.map((cls) => (
          <button
            key={cls.id}
            onClick={() => setSelectedClassroomId(cls.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedClassroomId === cls.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-stone-200 text-slate-600 hover:bg-stone-50'
            }`}
          >
            {cls.name} ({cls.grade_range}-сынып)
          </button>
        ))}
      </div>

      {/* Assignments List */}
      <div className="space-y-4">
        {assignments.length === 0 ? (
          <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center text-slate-400 text-xs">
            Бұл сыныпта әзірге тапсырмалар жоқ. «Жаңа тапсырма беру» батырмасын басыңыз.
          </div>
        ) : (
          assignments.map((asg) => (
            <div
              key={asg.id}
              className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Жарияланған
                  </span>
                  {asg.due_at && (
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Мерзімі: {new Date(asg.due_at).toLocaleDateString('kk-KZ')}
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-slate-800 mt-2">{asg.title}</h3>
                {asg.instructions && (
                  <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                    {asg.instructions}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-stone-100 text-slate-700">
                  Квест белсенді
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Assignment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <h3 className="font-bold text-slate-800 text-base">Жаңа тапсырма (Квест) құрастыру</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Тапсырма тақырыбы *</label>
                <input
                  type="text"
                  required
                  placeholder="мысалы: 2-Квест: Бөлшектерді қосу және теңдеулер"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Сыныпты таңдаңыз
                </label>
                <select
                  value={selectedClassroomId}
                  onChange={(e) => setSelectedClassroomId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs"
                >
                  {classrooms.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} ({cls.grade_range}-сынып)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Оқушыларға нұсқаулық (қосымша)
                </label>
                <textarea
                  rows={2}
                  placeholder="Барлық есептерді ретімен шығарыңыз..."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Орындау мерзімі (Дедлайн)
                </label>
                <input
                  type="datetime-local"
                  value={dueAt}
                  onChange={(e) => setDueAt(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs"
                />
              </div>

              {/* Problem Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Тапсырмаға кіретін есептерді таңдаңыз ({selectedProblemIds.length} таңдалды):
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto border border-stone-200 rounded-2xl p-3">
                  {availableProblems.map((prob) => {
                    const isSelected = selectedProblemIds.includes(prob.id);
                    return (
                      <div
                        key={prob.id}
                        onClick={() => toggleProblemSelection(prob.id)}
                        className={`p-3 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                            : 'bg-white border-stone-200 hover:bg-stone-50'
                        }`}
                      >
                        <div>
                          <p className="font-bold">{prob.title}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            {prob.grade}-сынып • {prob.topic} • {prob.difficulty}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-emerald-700">
                            +{prob.xp_reward} XP
                          </span>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="rounded text-emerald-600 focus:ring-0"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-stone-100 rounded-xl"
                >
                  Бас тарту
                </button>
                <button
                  type="submit"
                  disabled={submitting || selectedProblemIds.length === 0}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Жариялануда...' : 'Тапсырманы жариялау'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
