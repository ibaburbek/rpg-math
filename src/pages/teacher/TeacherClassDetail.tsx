import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Users, Copy, Check, ArrowLeft, Coins, Award, Sparkles } from 'lucide-react';
import { classroomService } from '@/src/lib/supabase/services/classroomService';
import { Classroom, StudentWithStats } from '@/src/types/database';
import { CharacterAvatar } from '@/src/components/CharacterAvatar';

export const TeacherClassDetail: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [students, setStudents] = useState<StudentWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function load() {
      if (!classId) return;
      try {
        const [cls, stus] = await Promise.all([
          classroomService.getClassroomById(classId),
          classroomService.getClassroomStudents(classId),
        ]);
        setClassroom(cls);
        setStudents(stus);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [classId]);

  const copyCode = () => {
    if (!classroom) return;
    navigator.clipboard.writeText(classroom.join_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
      </div>
    );
  }

  if (!classroom) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">Сынып табылмады.</p>
        <Link to="/teacher/classes" className="text-emerald-700 font-bold text-xs mt-2 inline-block">
          Сыныптар тізіміне оралу
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        to="/teacher/classes"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Сыныптарға қайту
      </Link>

      {/* Classroom Banner */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {classroom.grade_range}-сынып
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Күйі: {classroom.status === 'active' ? 'Белсенді' : 'Мұрағат'}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 mt-1">{classroom.name}</h1>
          <p className="text-xs text-slate-500 mt-1">Барлығы: {students.length} оқушы тіркелген</p>
        </div>

        <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center gap-3">
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Қосылу коды
            </p>
            <p className="text-xl font-extrabold font-mono text-slate-900 tracking-wider">
              {classroom.join_code}
            </p>
          </div>
          <button
            onClick={copyCode}
            className="p-2 bg-white rounded-xl border border-stone-200 hover:bg-stone-100 text-slate-700 transition-colors cursor-pointer"
            title="Кодты көшіру"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Students List */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Сынып оқушылары мен RPG үлгерімі</h2>

        {students.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs">
            Бұл сыныпта әзірге оқушылар жоқ. Қосылу кодын оқушыларға беріңіз.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.map((student) => (
              <div
                key={student.id}
                className="p-4 rounded-2xl border border-stone-200 bg-stone-50/50 flex items-center gap-4"
              >
                <CharacterAvatar
                  characterId={student.character_id}
                  size="md"
                  level={student.level || 1}
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-800 text-sm truncate">
                    {student.display_name}
                  </h4>
                  <div className="flex items-center gap-3 mt-1 text-xs">
                    <span className="font-semibold text-emerald-700 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      {student.stats?.total_xp || 0} XP
                    </span>
                    <span className="font-semibold text-amber-600 flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5" />
                      {student.stats?.coins || 0}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
