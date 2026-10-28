import { supabase, isSupabaseConfigured } from '@/src/lib/supabase/client';
import {
  Assignment,
  AssignmentProblem,
  AssignmentWithProblems,
  AssignmentProblemWithDetails,
} from '@/src/types/database';
import {
  initialAssignments,
  initialAssignmentProblems,
  initialProblems,
  DEMO_TEACHER_ID,
} from './demoData';
import { submissionService } from './submissionService';

let demoAssignments = [...initialAssignments];
let demoAssignmentProblems = [...initialAssignmentProblems];

export const assignmentService = {
  // Teacher: get assignments for a classroom
  async getClassroomAssignments(classroomId: string): Promise<Assignment[]> {
    if (!isSupabaseConfigured || !supabase) {
      return demoAssignments.filter((a) => a.classroom_id === classroomId);
    }

    const { data, error } = await supabase
      .from('assignments')
      .select('id, owner_id, classroom_id, title, instructions, due_at, status, created_at, updated_at')
      .eq('classroom_id', classroomId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Assignment[];
  },

  // Student: get published assignments for their classroom
  async getStudentAssignments(classroomId: string): Promise<Assignment[]> {
    if (!isSupabaseConfigured || !supabase) {
      return demoAssignments.filter(
        (a) => a.classroom_id === classroomId && a.status === 'published'
      );
    }

    const { data, error } = await supabase
      .from('assignments')
      .select('id, owner_id, classroom_id, title, instructions, due_at, status, created_at, updated_at')
      .eq('classroom_id', classroomId)
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Assignment[];
  },

  // Get full assignment with problems & student submissions
  async getAssignmentWithProblems(
    assignmentId: string,
    studentId?: string
  ): Promise<AssignmentWithProblems | null> {
    if (!isSupabaseConfigured || !supabase) {
      const assignment = demoAssignments.find((a) => a.id === assignmentId);
      if (!assignment) return null;

      const links = demoAssignmentProblems
        .filter((ap) => ap.assignment_id === assignmentId)
        .sort((a, b) => a.position - b.position);

      const studentSubs = studentId
        ? await submissionService.getStudentSubmissions(studentId)
        : [];
      const subMap = new Map(studentSubs.map((s) => [s.assignment_problem_id, s]));

      const problemsWithDetails: AssignmentProblemWithDetails[] = links.map((link) => {
        const prob = initialProblems.find((p) => p.id === link.problem_id);
        return {
          ...link,
          problem: prob,
          submission: subMap.get(link.id) || null,
        };
      });

      return {
        ...assignment,
        problems: problemsWithDetails,
      };
    }

    const { data: assignment, error: aErr } = await supabase
      .from('assignments')
      .select('id, owner_id, classroom_id, title, instructions, due_at, status, created_at, updated_at')
      .eq('id', assignmentId)
      .single();

    if (aErr || !assignment) return null;

    // Fetch assignment_problems ordered by position
    const { data: links, error: lErr } = await supabase
      .from('assignment_problems')
      .select('id, assignment_id, problem_id, position, created_at')
      .eq('assignment_id', assignmentId)
      .order('position', { ascending: true });

    if (lErr) throw lErr;
    if (!links || links.length === 0) {
      return { ...assignment, problems: [] };
    }

    const problemIds = links.map((l) => l.problem_id);
    const { data: problemsData } = await supabase
      .from('problems')
      .select('id, owner_id, title, statement, image_path, grade, subject, topic, difficulty, answer_type, answer_options, explanation, hint, grading_mode, max_score, xp_reward, coin_reward, status, created_at, updated_at')
      .in('id', problemIds);

    const problemMap = new Map((problemsData || []).map((p) => [p.id, p]));

    // Fetch student's submissions for these assignment_problem ids if studentId provided
    const apIds = links.map((l) => l.id);
    let subMap = new Map();
    if (studentId) {
      const { data: subs } = await supabase
        .from('submissions')
        .select('id, student_id, assignment_problem_id, answer, is_correct, score, teacher_feedback, status, attempt_number, submitted_at, graded_by, graded_at')
        .eq('student_id', studentId)
        .in('assignment_problem_id', apIds);

      subMap = new Map((subs || []).map((s) => [s.assignment_problem_id, s]));
    }

    const problems: AssignmentProblemWithDetails[] = links.map((link) => ({
      ...link,
      problem: problemMap.get(link.problem_id),
      submission: subMap.get(link.id) || null,
    }));

    return {
      ...assignment,
      problems,
    };
  },

  // Create an assignment and link problems
  async createAssignment(
    ownerId: string,
    classroomId: string,
    title: string,
    instructions: string | null,
    dueAt: string | null,
    problemIds: string[]
  ): Promise<Assignment> {
    if (!isSupabaseConfigured || !supabase) {
      const newAsg: Assignment = {
        id: 'asg-' + Date.now(),
        owner_id: ownerId,
        classroom_id: classroomId,
        title: title.trim(),
        instructions: instructions ? instructions.trim() : null,
        due_at: dueAt,
        status: 'published',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      demoAssignments.unshift(newAsg);

      problemIds.forEach((probId, idx) => {
        demoAssignmentProblems.push({
          id: 'ap-' + Date.now() + '-' + idx,
          assignment_id: newAsg.id,
          problem_id: probId,
          position: idx + 1,
          created_at: new Date().toISOString(),
        });
      });

      return newAsg;
    }

    const { data: asg, error: aErr } = await supabase
      .from('assignments')
      .insert({
        owner_id: ownerId,
        classroom_id: classroomId,
        title: title.trim(),
        instructions: instructions ? instructions.trim() : null,
        due_at: dueAt,
        status: 'published',
      })
      .select('id, owner_id, classroom_id, title, instructions, due_at, status, created_at, updated_at')
      .single();

    if (aErr) throw aErr;

    // Insert links into assignment_problems
    const linksToInsert = problemIds.map((pId, idx) => ({
      assignment_id: asg.id,
      problem_id: pId,
      position: idx + 1,
    }));

    const { error: apErr } = await supabase.from('assignment_problems').insert(linksToInsert);
    if (apErr) throw apErr;

    return asg as Assignment;
  },
};
