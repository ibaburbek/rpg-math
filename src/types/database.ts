/**
 * Canonical Supabase Database Schema TypeScript Types
 * Matches the production SQL schema exactly.
 */

export type Role = 'teacher' | 'student' | 'admin';
export type ClassroomStatus = 'active' | 'archived';
export type ProblemStatus = 'draft' | 'published' | 'archived';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type AnswerType = 'numeric' | 'text' | 'multiple_choice' | 'math_expression';
export type GradingMode = 'auto' | 'manual';
export type AssignmentStatus = 'draft' | 'published' | 'closed';
export type SubmissionStatus = 'pending' | 'graded';
export type ItemCategory = 'outfit' | 'hat' | 'furniture' | 'plant' | 'wall' | 'flooring';

export interface Profile {
  id: string; // uuid, references auth.users
  role: Role;
  display_name: string;
  created_at: string;
  updated_at: string;
}

export interface Classroom {
  id: string; // uuid
  owner_id: string; // uuid
  name: string;
  grade_range: string;
  join_code: string;
  status: ClassroomStatus;
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: string; // uuid
  auth_user_id: string; // uuid
  classroom_id: string; // uuid
  display_name: string;
  character_id: string;
  created_at: string;
  updated_at: string;
}

export interface Problem {
  id: string; // uuid
  owner_id: string; // uuid
  title: string;
  statement: string;
  image_path: string | null;
  grade: number;
  subject: string;
  topic: string;
  difficulty: Difficulty;
  answer_type: AnswerType;
  answer_options: string[] | null;
  explanation: string | null;
  hint: string | null;
  grading_mode: GradingMode;
  max_score: number;
  xp_reward: number;
  coin_reward: number;
  status: ProblemStatus;
  created_at: string;
  updated_at: string;
}

export interface ProblemAnswerKey {
  problem_id: string; // uuid
  correct_answer: string;
  accepted_answers: string[] | null;
  numeric_tolerance: number | null;
  updated_at: string;
}

export interface Assignment {
  id: string; // uuid
  owner_id: string; // uuid
  classroom_id: string; // uuid
  title: string;
  instructions: string | null;
  due_at: string | null;
  status: AssignmentStatus;
  created_at: string;
  updated_at: string;
}

export interface AssignmentProblem {
  id: string; // uuid
  assignment_id: string; // uuid
  problem_id: string; // uuid
  position: number;
  created_at: string;
}

export interface Submission {
  id: string; // uuid
  student_id: string; // uuid
  assignment_problem_id: string; // uuid
  answer: string;
  is_correct: boolean | null;
  score: number | null;
  teacher_feedback: string | null;
  status: SubmissionStatus;
  attempt_number: number;
  submitted_at: string;
  graded_by: string | null;
  graded_at: string | null;
}

export interface StudentStats {
  student_id: string; // uuid
  total_xp: number;
  coins: number;
  created_at: string;
  updated_at: string;
}

export interface RewardLedger {
  id: string; // uuid
  student_id: string; // uuid
  assignment_problem_id: string; // uuid
  submission_id: string; // uuid
  xp_amount: number;
  coin_amount: number;
  created_at: string;
}

export interface InventoryItem {
  id: string;
  code: string;
  name: string;
  description: string | null;
  category: ItemCategory;
  price_coins: number;
  unlock_level: number;
  asset_path: string;
  is_active: boolean;
  created_at: string;
}

export interface StudentItem {
  id: string; // uuid
  student_id: string; // uuid
  inventory_id: string;
  acquired_at: string;
  is_equipped: boolean;
  placement: string | null;
}

export interface Room {
  id: string; // uuid
  student_id: string; // uuid
  room_data: {
    wall?: string | null;
    floor?: string | null;
    desk?: string | null;
    plant?: string | null;
    bed?: string | null;
    rug?: string | null;
    accessory?: string | null;
    [key: string]: any;
  };
  updated_at: string;
}

// Joined views & helper types used by frontend components
export interface ProblemWithKey extends Problem {
  correct_answer?: string;
  accepted_answers?: string[] | null;
  numeric_tolerance?: number | null;
}

export interface AssignmentProblemWithDetails extends AssignmentProblem {
  problem?: Problem;
  submission?: Submission | null;
}

export interface AssignmentWithProblems extends Assignment {
  classroom_name?: string;
  problems?: AssignmentProblemWithDetails[];
}

export interface StudentWithStats extends Student {
  stats?: StudentStats;
  level?: number;
}
