import { supabase, isSupabaseConfigured } from '@/src/lib/supabase/client';
import { Problem, ProblemWithKey, ProblemAnswerKey } from '@/src/types/database';
import { initialProblems, initialAnswerKeys, DEMO_TEACHER_ID } from './demoData';

let demoProblems = [...initialProblems];
let demoAnswerKeys = { ...initialAnswerKeys };

export const problemService = {
  // Teacher view: fetches problems owned by teacher
  async getTeacherProblems(ownerId: string = DEMO_TEACHER_ID): Promise<Problem[]> {
    if (!isSupabaseConfigured || !supabase) {
      return demoProblems.filter((p) => p.owner_id === ownerId);
    }

    const { data, error } = await supabase
      .from('problems')
      .select('id, owner_id, title, statement, image_path, grade, subject, topic, difficulty, answer_type, answer_options, explanation, hint, grading_mode, max_score, xp_reward, coin_reward, status, created_at, updated_at')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Problem[];
  },

  // Teacher problem detail with private answer key
  async getProblemWithKey(problemId: string): Promise<ProblemWithKey | null> {
    if (!isSupabaseConfigured || !supabase) {
      const prob = demoProblems.find((p) => p.id === problemId);
      if (!prob) return null;
      const key = demoAnswerKeys[problemId];
      return {
        ...prob,
        correct_answer: key?.correct_answer || '',
        accepted_answers: key?.accepted_answers || null,
        numeric_tolerance: key?.numeric_tolerance || null,
      };
    }

    const { data: problem, error: pErr } = await supabase
      .from('problems')
      .select('id, owner_id, title, statement, image_path, grade, subject, topic, difficulty, answer_type, answer_options, explanation, hint, grading_mode, max_score, xp_reward, coin_reward, status, created_at, updated_at')
      .eq('id', problemId)
      .single();

    if (pErr || !problem) return null;

    const { data: keyData } = await supabase
      .from('problem_answer_keys')
      .select('problem_id, correct_answer, accepted_answers, numeric_tolerance, updated_at')
      .eq('problem_id', problemId)
      .maybeSingle();

    return {
      ...problem,
      correct_answer: keyData?.correct_answer,
      accepted_answers: keyData?.accepted_answers,
      numeric_tolerance: keyData?.numeric_tolerance,
    } as ProblemWithKey;
  },

  // Student problem view: NEVER queries problem_answer_keys!
  async getProblemForStudent(problemId: string): Promise<Problem | null> {
    if (!isSupabaseConfigured || !supabase) {
      const prob = demoProblems.find((p) => p.id === problemId && p.status === 'published');
      return prob || null;
    }

    const { data, error } = await supabase
      .from('problems')
      .select('id, owner_id, title, statement, image_path, grade, subject, topic, difficulty, answer_type, answer_options, explanation, hint, grading_mode, max_score, xp_reward, coin_reward, status, created_at, updated_at')
      .eq('id', problemId)
      .eq('status', 'published')
      .single();

    if (error) return null;
    return data as Problem;
  },

  // Create problem with separate answer key
  async createProblem(
    problemData: Omit<Problem, 'id' | 'created_at' | 'updated_at'>,
    answerKeyData: {
      correct_answer: string;
      accepted_answers?: string[] | null;
      numeric_tolerance?: number | null;
    }
  ): Promise<Problem> {
    if (!isSupabaseConfigured || !supabase) {
      const newId = 'prob-' + Date.now();
      const newProblem: Problem = {
        ...problemData,
        id: newId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      demoProblems.unshift(newProblem);

      demoAnswerKeys[newId] = {
        problem_id: newId,
        correct_answer: answerKeyData.correct_answer,
        accepted_answers: answerKeyData.accepted_answers || null,
        numeric_tolerance: answerKeyData.numeric_tolerance || null,
        updated_at: new Date().toISOString(),
      };

      return newProblem;
    }

    // Insert into problems
    const { data: createdProblem, error: pError } = await supabase
      .from('problems')
      .insert({
        owner_id: problemData.owner_id,
        title: problemData.title,
        statement: problemData.statement,
        image_path: problemData.image_path,
        grade: problemData.grade,
        subject: problemData.subject,
        topic: problemData.topic,
        difficulty: problemData.difficulty,
        answer_type: problemData.answer_type,
        answer_options: problemData.answer_options,
        explanation: problemData.explanation,
        hint: problemData.hint,
        grading_mode: problemData.grading_mode,
        max_score: problemData.max_score,
        xp_reward: problemData.xp_reward,
        coin_reward: problemData.coin_reward,
        status: problemData.status,
      })
      .select('id, owner_id, title, statement, image_path, grade, subject, topic, difficulty, answer_type, answer_options, explanation, hint, grading_mode, max_score, xp_reward, coin_reward, status, created_at, updated_at')
      .single();

    if (pError) throw pError;

    // Insert into problem_answer_keys
    const { error: keyError } = await supabase.from('problem_answer_keys').insert({
      problem_id: createdProblem.id,
      correct_answer: answerKeyData.correct_answer,
      accepted_answers: answerKeyData.accepted_answers || null,
      numeric_tolerance: answerKeyData.numeric_tolerance || null,
    });

    if (keyError) throw keyError;

    return createdProblem as Problem;
  },
};
