import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Sparkles, Check, AlertCircle, ArrowRight } from 'lucide-react';
import { studentService } from '@/src/lib/supabase/services/studentService';
import { CHARACTERS } from '@/src/features/rpg/characters';
import { CharacterAvatar } from '@/src/components/CharacterAvatar';
import { DEMO_STUDENT_ID } from '@/src/lib/supabase/services/demoData';

interface Props {
  onJoinSuccess?: (studentId: string) => void;
}

export const StudentJoin: React.FC<Props> = ({ onJoinSuccess }) => {
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState('MATH6A');
  const [displayName, setDisplayName] = useState('');
  const [selectedCharId, setSelectedCharId] = useState('forest_explorer');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim() || !displayName.trim()) return;

    setLoading(true);
    setErrorMsg(null);
    try {
      const student = await studentService.joinClassroom(
        joinCode.trim(),
        displayName.trim(),
        selectedCharId
      );
      if (onJoinSuccess) onJoinSuccess(student.id);
      navigate('/play');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Сыныпқа қосылу кезінде қате орын алды');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = () => {
    if (onJoinSuccess) onJoinSuccess(DEMO_STUDENT_ID);
    navigate('/play');
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-10 shadow-lg">
        {/* Header */}
        <div className="text-center max-w-md mx-auto">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xs">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800">MathQuest әлеміне қосылу</h1>
          <p className="text-xs text-slate-500 mt-1">
            Мұғалім берген сынып кодын енгізіп, өз кейіпкеріңді таңда!
          </p>
        </div>

        {errorMsg && (
          <div className="mt-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {/* Join Code & Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Сынып коды (6 таңбалы) *
              </label>
              <input
                type="text"
                required
                maxLength={10}
                placeholder="мысалы: MATH6A"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-mono font-bold tracking-wider uppercase text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Демо сынып үшін: <strong>MATH6A</strong> немесе <strong>LOGIC5</strong>
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Аты-жөніңіз немесе лақап атыңыз *
              </label>
              <input
                type="text"
                required
                placeholder="мысалы: Арсен Сапаров"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>
          </div>

          {/* Character Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Өз кейіпкеріңді таңда (6 нұсқа):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {CHARACTERS.map((char) => {
                const isSelected = selectedCharId === char.id;
                return (
                  <div
                    key={char.id}
                    onClick={() => setSelectedCharId(char.id)}
                    className={`p-3.5 rounded-2xl border-2 text-center cursor-pointer transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/60 shadow-xs scale-102'
                        : 'border-stone-200 bg-white hover:bg-stone-50'
                    }`}
                  >
                    <CharacterAvatar characterId={char.id} size="md" />
                    <p className="font-bold text-xs text-slate-800 mt-2">{char.nameKz}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{char.titleKz}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleQuickDemo}
              className="text-xs text-slate-500 hover:text-emerald-700 font-semibold cursor-pointer underline"
            >
              Дайын демо-оқушымен кіру (Арсен Сапаров)
            </button>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                'Қосылуда...'
              ) : (
                <>
                  <span>Ойынды бастау</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
