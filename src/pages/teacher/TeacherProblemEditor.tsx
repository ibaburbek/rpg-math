import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Upload,
  Sparkles,
  Coins,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Image as ImageIcon,
} from 'lucide-react';
import { problemService } from '@/src/lib/supabase/services/problemService';
import { storageService } from '@/src/lib/supabase/services/storageService';
import { DEMO_TEACHER_ID } from '@/src/lib/supabase/services/demoData';
import { Difficulty, AnswerType, GradingMode, ProblemStatus } from '@/src/types/database';

export const TeacherProblemEditor: React.FC = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [statement, setStatement] = useState('');
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [grade, setGrade] = useState<number>(6);
  const [subject, setSubject] = useState('Математика');
  const [topic, setTopic] = useState('Бөлшектер мен пропорция');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [answerType, setAnswerType] = useState<AnswerType>('numeric');
  const [gradingMode, setGradingMode] = useState<GradingMode>('auto');
  const [maxScore, setMaxScore] = useState<number>(10);
  const [xpReward, setXpReward] = useState<number>(60);
  const [coinReward, setCoinReward] = useState<number>(15);
  const [hint, setHint] = useState('');
  const [explanation, setExplanation] = useState('');
  const [status, setStatus] = useState<ProblemStatus>('published');

  // Answer Key State (Saved in canonical problem_answer_keys)
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [acceptedAnswersStr, setAcceptedAnswersStr] = useState('');
  const [numericTolerance, setNumericTolerance] = useState<number | ''>(0.001);

  // Multiple Choice Options (4 options)
  const [choiceA, setChoiceA] = useState('');
  const [choiceB, setChoiceB] = useState('');
  const [choiceC, setChoiceC] = useState('');
  const [choiceD, setChoiceD] = useState('');

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setErrorMsg(null);
    try {
      const uploadedPath = await storageService.uploadProblemImage(file);
      setImagePath(uploadedPath);
    } catch (err: any) {
      setErrorMsg(err.message || 'Сурет жүктеу кезінде қате шықты');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation: Require either statement or image_path
    if (!statement.trim() && !imagePath) {
      setErrorMsg('Есептің мәтінін немесе суретін міндетті түрде енгізіңіз.');
      return;
    }

    if (gradingMode === 'auto' && !correctAnswer.trim()) {
      setErrorMsg('Автоматты тексеру үшін дұрыс жауапты көрсету қажет.');
      return;
    }

    let answerOptions: string[] | null = null;
    if (answerType === 'multiple_choice') {
      answerOptions = [choiceA, choiceB, choiceC, choiceD].filter((c) => c.trim() !== '');
      if (answerOptions.length < 2) {
        setErrorMsg('Тест түріндегі есеп үшін кемінде 2 нұсқа толтырылуы қажет.');
        return;
      }
    }

    const acceptedAnswers = acceptedAnswersStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    setSubmitting(true);
    try {
      await problemService.createProblem(
        {
          owner_id: DEMO_TEACHER_ID,
          title: title.trim(),
          statement: statement.trim(),
          image_path: imagePath,
          grade,
          subject,
          topic: topic.trim(),
          difficulty,
          answer_type: answerType,
          answer_options: answerOptions,
          explanation: explanation.trim() || null,
          hint: hint.trim() || null,
          grading_mode: gradingMode,
          max_score: maxScore,
          xp_reward: xpReward,
          coin_reward: coinReward,
          status,
        },
        {
          correct_answer: correctAnswer.trim(),
          accepted_answers: acceptedAnswers.length > 0 ? acceptedAnswers : null,
          numeric_tolerance: numericTolerance !== '' ? Number(numericTolerance) : null,
        }
      );

      navigate('/teacher/problems');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Есепті сақтау кезінде қате орын алды');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Link
        to="/teacher/problems"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Есептер қорына қайту
      </Link>

      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs">
        <div className="border-b border-stone-100 pb-5 mb-6">
          <h1 className="text-2xl font-extrabold text-slate-800">Жаңа математикалық есеп қосу</h1>
          <p className="text-xs text-slate-500 mt-1">
            Есептің шарты, жауап кілті мен геймификациялық марапаттарын белгілеңіз.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Есептің атауы *
              </label>
              <input
                type="text"
                required
                placeholder="мысалы: Бөлшектерді көбейту және қысқарту"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Сынып</label>
              <select
                value={grade}
                onChange={(e) => setGrade(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              >
                {[4, 5, 6, 7, 8, 9].map((g) => (
                  <option key={g} value={g}>
                    {g}-сынып
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Тақырып *</label>
              <input
                type="text"
                required
                placeholder="мысалы: Жай бөлшектер"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Қиындық деңгейі
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              >
                <option value="easy">Оңай</option>
                <option value="medium">Орташа</option>
                <option value="hard">Күрделі</option>
              </select>
            </div>
          </div>

          {/* Statement & Image Upload */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Есептің шарты (Мәтін)
            </label>
            <textarea
              rows={4}
              placeholder="Есептің шартын толық жазыңыз..."
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          {/* Image Upload Area */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
            <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-emerald-700" />
              Есептің суреті немесе сызбасы (қосымша)
            </label>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <label className="px-4 py-2 bg-white rounded-xl border border-stone-300 hover:bg-stone-100 text-xs font-semibold text-slate-700 flex items-center gap-2 cursor-pointer">
                <Upload className="w-4 h-4 text-slate-500" />
                {uploadingImage ? 'Жүктелуде...' : 'Файл таңдау'}
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp, image/svg+xml"
                  onChange={handleImageFileChange}
                  className="hidden"
                  disabled={uploadingImage}
                />
              </label>
              <span className="text-[11px] text-slate-400">
                JPEG, PNG, WebP немесе SVG (макс 5 МБ). Supabase Storage-қа сақталады.
              </span>
            </div>

            {imagePath && (
              <div className="mt-3 relative inline-block">
                <img
                  src={imagePath}
                  alt="Алдын ала қарау"
                  className="max-h-36 rounded-xl border border-stone-200 object-contain bg-white p-1"
                />
                <button
                  type="button"
                  onClick={() => setImagePath(null)}
                  className="absolute -top-2 -right-2 bg-slate-800 text-white rounded-full p-1 text-[10px] hover:bg-rose-600 transition-colors"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Grading Mode & Answer Configuration */}
          <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-4">
            <h3 className="font-bold text-slate-800 text-sm">Тексеру режимі мен жауап кілті</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Тексеру режимі
                </label>
                <select
                  value={gradingMode}
                  onChange={(e) => setGradingMode(e.target.value as GradingMode)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs bg-white focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="auto">Автоматты тексеру (Жүйе тексереді)</option>
                  <option value="manual">Қолмен тексеру (Мұғалім қарайды)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Жауап түрі</label>
                <select
                  value={answerType}
                  onChange={(e) => setAnswerType(e.target.value as AnswerType)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs bg-white focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="numeric">Сандық мән (бүтін/ондық)</option>
                  <option value="multiple_choice">Нұсқалар (Тест 4 таңдау)</option>
                  <option value="text">Мәтіндік жауап</option>
                  <option value="math_expression">Қысқа математикалық өрнек</option>
                </select>
              </div>
            </div>

            {/* Multiple Choice Options */}
            {answerType === 'multiple_choice' && (
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-bold text-slate-700">
                  4 жауап нұсқасын толтырыңыз:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="А нұсқасы"
                    value={choiceA}
                    onChange={(e) => setChoiceA(e.target.value)}
                    className="px-3.5 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Б нұсқасы"
                    value={choiceB}
                    onChange={(e) => setChoiceB(e.target.value)}
                    className="px-3.5 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                  />
                  <input
                    type="text"
                    placeholder="В нұсқасы"
                    value={choiceC}
                    onChange={(e) => setChoiceC(e.target.value)}
                    className="px-3.5 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Г нұсқасы"
                    value={choiceD}
                    onChange={(e) => setChoiceD(e.target.value)}
                    className="px-3.5 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                  />
                </div>
              </div>
            )}

            {/* Answer Key fields (Stored strictly in problem_answer_keys) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Дұрыс жауап *
                </label>
                <input
                  type="text"
                  placeholder="мысалы: 24 немесе 0.5"
                  value={correctAnswer}
                  onChange={(e) => setCorrectAnswer(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs bg-white"
                />
                <span className="text-[10px] text-slate-500">
                  Тек problem_answer_keys ішінде сақталады.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Балама жауаптар (үтірмен)
                </label>
                <input
                  type="text"
                  placeholder="мысалы: 1/2, 0,5"
                  value={acceptedAnswersStr}
                  onChange={(e) => setAcceptedAnswersStr(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs bg-white"
                />
              </div>

              {answerType === 'numeric' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Сандық дәлдік қателігі
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    placeholder="0.001"
                    value={numericTolerance}
                    onChange={(e) =>
                      setNumericTolerance(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs bg-white"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Explanation & Hint */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Шешу жолы мен түсіндірме
              </label>
              <textarea
                rows={3}
                placeholder="Оқушы есепті шығарған соң көретін түсініктеме..."
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Көмекші кеңес (Hint)
              </label>
              <textarea
                rows={3}
                placeholder="Оқушы қиналған кезде көмекке алатын нұсқаулық..."
                value={hint}
                onChange={(e) => setHint(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs"
              />
            </div>
          </div>

          {/* Rewards & Score */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-200">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Максималды балл
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={maxScore}
                onChange={(e) => setMaxScore(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs bg-white font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> XP сыйлығы
              </label>
              <input
                type="number"
                min="10"
                step="5"
                value={xpReward}
                onChange={(e) => setXpReward(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs bg-white font-bold text-emerald-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-amber-500" /> Монета сыйлығы
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={coinReward}
                onChange={(e) => setCoinReward(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs bg-white font-bold text-amber-600"
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
            <Link
              to="/teacher/problems"
              className="px-5 py-2.5 rounded-xl border border-stone-200 text-xs font-bold text-slate-600 hover:bg-stone-50"
            >
              Бас тарту
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-60"
            >
              {submitting ? 'Сақталуда...' : 'Есепті жариялау'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
