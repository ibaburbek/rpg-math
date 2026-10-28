import React, { useState, useEffect } from 'react';
import { CHARACTERS } from '@/src/features/rpg/characters';
import { CharacterAvatar } from '@/src/components/CharacterAvatar';
import { studentService } from '@/src/lib/supabase/services/studentService';
import { Student, StudentStats } from '@/src/types/database';
import { calculateLevelFromXp } from '@/src/features/rpg/levelEngine';
import { Check, Sparkles, Shield, Compass } from 'lucide-react';
import { DEMO_STUDENT_ID } from '@/src/lib/supabase/services/demoData';

interface Props {
  studentId?: string;
}

export const StudentCharacter: React.FC<Props> = ({ studentId = DEMO_STUDENT_ID }) => {
  const [student, setStudent] = useState<Student | null>(null);
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [selectedCharId, setSelectedCharId] = useState('forest_explorer');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        const [stu, st] = await Promise.all([
          studentService.getStudentProfile(studentId),
          studentService.getStudentStats(studentId),
        ]);
        setStudent(stu);
        setStats(st);
        if (stu?.character_id) {
          setSelectedCharId(stu.character_id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [studentId]);

  const handleSelect = async (charId: string) => {
    setSelectedCharId(charId);
    try {
      await studentService.updateCharacter(studentId, charId);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
      </div>
    );
  }

  const levelInfo = calculateLevelFromXp(stats?.total_xp || 0);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800">Кейіпкер галереясы</h1>
        <p className="text-xs text-slate-500 mt-1">
          Кейіпкеріңізді таңдаңыз немесе басқа шытырман оқиға батырына ауысыңыз
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs rounded-xl flex items-center gap-2 font-bold animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Кейіпкер сәтті ауыстырылды!</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {CHARACTERS.map((char) => {
          const isCurrent = selectedCharId === char.id;
          return (
            <div
              key={char.id}
              className={`p-6 rounded-3xl border-2 transition-all flex flex-col justify-between ${
                isCurrent
                  ? 'border-teal-500 bg-white shadow-md ring-2 ring-teal-500/20'
                  : 'border-stone-200 bg-white/70 hover:bg-white hover:border-stone-300 shadow-xs'
              }`}
            >
              <div>
                <div className="flex justify-center mb-4">
                  <CharacterAvatar characterId={char.id} size="xl" level={levelInfo.level} />
                </div>

                <div className="text-center">
                  <h3 className="text-base font-extrabold text-slate-800">{char.nameKz}</h3>
                  <p className="text-xs font-semibold text-teal-700 mt-0.5">{char.titleKz}</p>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {char.descriptionKz}
                  </p>
                </div>

                <div className="mt-4 p-3 bg-stone-50 rounded-2xl border border-stone-100 text-[11px] text-slate-600">
                  <span className="font-bold text-slate-700 block mb-0.5">Ойын рөлі:</span>
                  {char.roleLore}
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-stone-100 flex justify-center">
                {isCurrent ? (
                  <span className="px-4 py-1.5 rounded-xl bg-teal-50 text-teal-800 text-xs font-bold border border-teal-200 flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-teal-600" /> Таңдалған кейіпкер
                  </span>
                ) : (
                  <button
                    onClick={() => handleSelect(char.id)}
                    className="w-full py-2 bg-stone-100 hover:bg-teal-600 hover:text-white text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Осы кейіпкерді таңдау
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
