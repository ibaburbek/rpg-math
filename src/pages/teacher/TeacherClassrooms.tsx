import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Plus, Copy, Check, ArrowRight, X } from 'lucide-react';
import { classroomService } from '@/src/lib/supabase/services/classroomService';
import { Classroom } from '@/src/types/database';
import { DEMO_TEACHER_ID } from '@/src/lib/supabase/services/demoData';

export const TeacherClassrooms: React.FC = () => {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [gradeRange, setGradeRange] = useState('6');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadClassrooms();
  }, []);

  async function loadClassrooms() {
    try {
      const cls = await classroomService.getClassrooms(DEMO_TEACHER_ID);
      setClassrooms(cls);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await classroomService.createClassroom(DEMO_TEACHER_ID, name, gradeRange);
      setName('');
      setIsModalOpen(false);
      await loadClassrooms();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
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
          <h1 className="text-2xl font-extrabold text-slate-800">Сыныптар тізімі</h1>
          <p className="text-xs text-slate-500 mt-1">
            Сыныптарыңызды бақылап, оқушыларға қосылу кодтарын үлестіріңіз
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Жаңа сынып қосу
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {classrooms.map((cls) => (
          <div
            key={cls.id}
            className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {cls.grade_range}-сынып
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {cls.status === 'active' ? 'Белсенді' : 'Мұрағат'}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mt-3">{cls.name}</h3>

              <div className="mt-4 p-3 bg-stone-50 rounded-2xl border border-stone-200/80">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                  Қосылу коды
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-base font-extrabold font-mono text-slate-900 tracking-wider">
                    {cls.join_code}
                  </span>
                  <button
                    onClick={() => copyCode(cls.join_code)}
                    className="flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer"
                  >
                    {copiedCode === cls.join_code ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Көшірілді</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Көшіру</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between">
              <Link
                to={`/teacher/classes/${cls.id}`}
                className="text-xs font-bold text-slate-700 hover:text-emerald-700 flex items-center gap-1"
              >
                Оқушылар мен есептер <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Create Classroom Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <h3 className="font-bold text-slate-800 text-base">Жаңа сынып ашу</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Сынып атауы
                </label>
                <input
                  type="text"
                  required
                  placeholder="мысалы: 6-«А» Математика сыныбы"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Сынып деңгейі (графа)
                </label>
                <select
                  value={gradeRange}
                  onChange={(e) => setGradeRange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                >
                  <option value="4">4-сынып</option>
                  <option value="5">5-сынып</option>
                  <option value="6">6-сынып</option>
                  <option value="7">7-сынып</option>
                  <option value="8">8-сынып</option>
                  <option value="9">9-сынып</option>
                  <option value="5-6">5–6 аралас сыныптар</option>
                  <option value="7-9">7–9 орта буын</option>
                </select>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl text-xs text-emerald-800 border border-emerald-200">
                ✨ Сынып ашылғанда автоматты түрде бірегей 6 таңбалы қосылу коды генерацияланады.
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
                >
                  Бас тарту
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs cursor-pointer disabled:opacity-60"
                >
                  {submitting ? 'Құрылуда...' : 'Сыныпты ашу'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
