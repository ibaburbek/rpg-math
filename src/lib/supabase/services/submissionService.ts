import { supabase, isSupabaseConfigured } from '@/src/lib/supabase/client';
import { Submission, RewardLedger } from '@/src/types/database';
import {
  initialSubmissions,
  initialRewardLedger,
  initialStudentStats,
  initialProblems,
  initialAnswerKeys,
  initialAssignmentProblems,
  DEMO_TEACHER_ID,
} from './demoData';

let demoSubmissions = [...initialSubmissions];
let demoRewardLedger = [...initialRewardLedger];

export interface SubmitResult {
  submission_id: string;
  status: 'pending' | 'graded';
  is_correct: boolean | null;
  score: number | null;
  xp_awarded: number;
  coins_awarded: number;
  explanation: string | null;
}

export const submissionService = {
  // Student submits an answer for an assignment problem
  async submitAnswer(
    studentId: string,
    assignmentProblemId: string,
    rawAnswer: string
  ): Promise<SubmitResult> {
    const answer = rawAnswer.trim();

    if (isSupabaseConfigured && supabase) {
      // Calls server-side PostgreSQL function to prevent client-side answer sniffing or reward forgery
      const { data, error } = await supabase.rpc('submit_assignment_problem', {
        p_assignment_problem_id: assignmentProblemId,
        p_answer: answer,
      });

      if (error) throw error;
      return data as SubmitResult;
    }

    // Demo Mode: Identical deterministic server logic
    const link = initialAssignmentProblems.find((ap) => ap.id === assignmentProblemId);
    const problem = link ? initialProblems.find((p) => p.id === link.problem_id) : null;
    const answerKey = link ? initialAnswerKeys[link.problem_id] : null;

    let isCorrect: boolean | null = null;
    let score: number | null = null;
    let status: 'pending' | 'graded' = 'pending';
    let xpAwarded = 0;
    let coinsAwarded = 0;

    if (problem && problem.grading_mode === 'auto' && answerKey) {
      const normalizedSubmitted = answer.toLowerCase().trim();
      const normalizedCorrect = answerKey.correct_answer.toLowerCase().trim();

      if (problem.answer_type === 'numeric') {
        const numSub = parseFloat(normalizedSubmitted);
        const numCor = parseFloat(normalizedCorrect);
        const tol = answerKey.numeric_tolerance ?? 0.001;
        if (!isNaN(numSub) && !isNaN(numCor) && Math.abs(numSub - numCor) <= tol) {
          isCorrect = true;
        } else {
          isCorrect = normalizedSubmitted === normalizedCorrect;
        }
      } else {
        if (normalizedSubmitted === normalizedCorrect) {
          isCorrect = true;
        } else if (
          answerKey.accepted_answers &&
          answerKey.accepted_answers.some(
            (alt) => alt.toLowerCase().trim() === normalizedSubmitted
          )
        ) {
          isCorrect = true;
        } else {
          isCorrect = false;
        }
      }

      status = 'graded';
      score = isCorrect ? problem.max_score : 0;
    }

    const newSubId = 'sub-' + Date.now();
    const newSubmission: Submission = {
      id: newSubId,
      student_id: studentId,
      assignment_problem_id: assignmentProblemId,
      answer,
      is_correct: isCorrect,
      score,
      teacher_feedback: null,
      status,
      attempt_number: 1,
      submitted_at: new Date().toISOString(),
      graded_by: null,
      graded_at: null,
    };

    demoSubmissions.unshift(newSubmission);

    // Reward ledger duplicate check (idempotent reward)
    if (isCorrect && problem) {
      const alreadyRewarded = demoRewardLedger.some(
        (r) => r.student_id === studentId && r.assignment_problem_id === assignmentProblemId
      );

      if (!alreadyRewarded) {
        xpAwarded = problem.xp_reward;
        coinsAwarded = problem.coin_reward;

        demoRewardLedger.push({
          id: 'rew-' + Date.now(),
          student_id: studentId,
          assignment_problem_id: assignmentProblemId,
          submission_id: newSubId,
          xp_amount: xpAwarded,
          coin_amount: coinsAwarded,
          created_at: new Date().toISOString(),
        });

        if (initialStudentStats[studentId]) {
          initialStudentStats[studentId].total_xp += xpAwarded;
          initialStudentStats[studentId].coins += coinsAwarded;
          initialStudentStats[studentId].updated_at = new Date().toISOString();
        }
      }
    }

    return {
      submission_id: newSubId,
      status,
      is_correct: isCorrect,
      score,
      xp_awarded: xpAwarded,
      coins_awarded: coinsAwarded,
      explanation: isCorrect ? problem?.explanation || null : null,
    };
  },

  // Get student submissions
  async getStudentSubmissions(studentId: string): Promise<Submission[]> {
    if (!isSupabaseConfigured || !supabase) {
      return demoSubmissions.filter((s) => s.student_id === studentId);
    }

    const { data, error } = await supabase
      .from('submissions')
      .select('id, student_id, assignment_problem_id, answer, is_correct, score, teacher_feedback, status, attempt_number, submitted_at, graded_by, graded_at')
      .eq('student_id', studentId)
      .order('submitted_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Submission[];
  },

  // Teacher submissions review queue
  async getPendingSubmissionsForTeacher(): Promise<any[]> {
    if (!isSupabaseConfigured || !supabase) {
      return demoSubmissions.map((sub) => {
        const link = initialAssignmentProblems.find((ap) => ap.id === sub.assignment_problem_id);
        const prob = link ? initialProblems.find((p) => p.id === link.problem_id) : null;
        return {
          ...sub,
          problem_title: prob?.title || 'Есеп',
          problem_statement: prob?.statement || '',
          problem_max_score: prob?.max_score || 10,
          problem_xp_reward: prob?.xp_reward || 50,
          problem_coin_reward: prob?.coin_reward || 10,
          student_name: 'Оқушы (Арсен)',
        };
      });
    }

    const { data, error } = await supabase
      .from('submissions')
      .select(`
        id, student_id, assignment_problem_id, answer, is_correct, score, teacher_feedback, status, attempt_number, submitted_at, graded_by, graded_at,
        students:student_id ( display_name ),
        assignment_problems:assignment_problem_id (
          problem:problem_id ( title, statement, max_score, xp_reward, coin_reward )
        )
      `)
      .order('submitted_at', { ascending: false });

    if (error) throw error;
    return (data || []).map((row: any) => ({
      ...row,
      student_name: row.students?.display_name || 'Оқушы',
      problem_title: row.assignment_problems?.problem?.title || 'Есеп',
      problem_statement: row.assignment_problems?.problem?.statement || '',
      problem_max_score: row.assignment_problems?.problem?.max_score || 10,
      problem_xp_reward: row.assignment_problems?.problem?.xp_reward || 50,
      problem_coin_reward: row.assignment_problems?.problem?.coin_reward || 10,
    }));
  },

  // Teacher manual grading
  async gradeSubmission(
    submissionId: string,
    score: number,
    feedback: string
  ): Promise<{ success: boolean; xp_awarded: number; coins_awarded: number }> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.rpc('grade_submission', {
        p_submission_id: submissionId,
        p_score: score,
        p_feedback: feedback,
      });

      if (error) throw error;
      return data;
    }

    // Demo Mode
    const sub = demoSubmissions.find((s) => s.id === submissionId);
    if (!sub) throw new Error('Submission not found');

    const link = initialAssignmentProblems.find((ap) => ap.id === sub.assignment_problem_id);
    const prob = link ? initialProblems.find((p) => p.id === link.problem_id) : null;

    sub.score = score;
    sub.teacher_feedback = feedback;
    sub.is_correct = score > 0;
    sub.status = 'graded';
    sub.graded_by = DEMO_TEACHER_ID;
    sub.graded_at = new Date().toISOString();

    let xp = 0;
    let coins = 0;
    if (score > 0 && prob) {
      const alreadyRewarded = demoRewardLedger.some(
        (r) => r.student_id === sub.student_id && r.assignment_problem_id === sub.assignment_problem_id
      );

      if (!alreadyRewarded) {
        const ratio = score / Math.max(1, prob.max_score);
        xp = Math.round(ratio * prob.xp_reward);
        coins = Math.round(ratio * prob.coin_reward);

        demoRewardLedger.push({
          id: 'rew-' + Date.now(),
          student_id: sub.student_id,
          assignment_problem_id: sub.assignment_problem_id,
          submission_id: sub.id,
          xp_amount: xp,
          coin_amount: coins,
          created_at: new Date().toISOString(),
        });

        if (initialStudentStats[sub.student_id]) {
          initialStudentStats[sub.student_id].total_xp += xp;
          initialStudentStats[sub.student_id].coins += coins;
          initialStudentStats[sub.student_id].updated_at = new Date().toISOString();
        }
      }
    }

    return { success: true, xp_awarded: xp, coins_awarded: coins };
  },
};
