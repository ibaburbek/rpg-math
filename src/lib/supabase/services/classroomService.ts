import { supabase, isSupabaseConfigured } from '@/src/lib/supabase/client';
import { Classroom, StudentWithStats } from '@/src/types/database';
import { initialClassrooms, initialStudents, initialStudentStats, DEMO_TEACHER_ID } from './demoData';
import { calculateLevelFromXp } from '@/src/features/rpg/levelEngine';

// In-memory state for demo mode
let demoClassrooms = [...initialClassrooms];
let demoStudents = [...initialStudents];

export const classroomService = {
  async getClassrooms(ownerId: string = DEMO_TEACHER_ID): Promise<Classroom[]> {
    if (!isSupabaseConfigured || !supabase) {
      return demoClassrooms.filter((c) => c.owner_id === ownerId);
    }

    const { data, error } = await supabase
      .from('classrooms')
      .select('id, owner_id, name, grade_range, join_code, status, created_at, updated_at')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Classroom[];
  },

  async getClassroomById(classroomId: string): Promise<Classroom | null> {
    if (!isSupabaseConfigured || !supabase) {
      return demoClassrooms.find((c) => c.id === classroomId) || null;
    }

    const { data, error } = await supabase
      .from('classrooms')
      .select('id, owner_id, name, grade_range, join_code, status, created_at, updated_at')
      .eq('id', classroomId)
      .single();

    if (error) return null;
    return data as Classroom;
  },

  async createClassroom(ownerId: string, name: string, gradeRange: string): Promise<Classroom> {
    // Generate a clean 6-character uppercase join code
    const generatedCode = 'MQ' + Math.random().toString(36).substring(2, 6).toUpperCase();

    if (!isSupabaseConfigured || !supabase) {
      const newClass: Classroom = {
        id: 'cls-' + Date.now(),
        owner_id: ownerId,
        name: name.trim(),
        grade_range: gradeRange.trim(),
        join_code: generatedCode,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      demoClassrooms.unshift(newClass);
      return newClass;
    }

    const { data, error } = await supabase
      .from('classrooms')
      .insert({
        owner_id: ownerId,
        name: name.trim(),
        grade_range: gradeRange.trim(),
        join_code: generatedCode,
        status: 'active',
      })
      .select('id, owner_id, name, grade_range, join_code, status, created_at, updated_at')
      .single();

    if (error) throw error;
    return data as Classroom;
  },

  async getClassroomStudents(classroomId: string): Promise<StudentWithStats[]> {
    if (!isSupabaseConfigured || !supabase) {
      const students = demoStudents.filter((s) => s.classroom_id === classroomId);
      return students.map((s) => {
        const stats = initialStudentStats[s.id] || {
          student_id: s.id,
          total_xp: 0,
          coins: 0,
          created_at: s.created_at,
          updated_at: s.updated_at,
        };
        const levelInfo = calculateLevelFromXp(stats.total_xp);
        return {
          ...s,
          stats,
          level: levelInfo.level,
        };
      });
    }

    const { data: students, error: sErr } = await supabase
      .from('students')
      .select('id, auth_user_id, classroom_id, display_name, character_id, created_at, updated_at')
      .eq('classroom_id', classroomId);

    if (sErr) throw sErr;
    if (!students || students.length === 0) return [];

    const studentIds = students.map((s) => s.id);
    const { data: statsData } = await supabase
      .from('student_stats')
      .select('student_id, total_xp, coins, created_at, updated_at')
      .in('student_id', studentIds);

    const statsMap = new Map((statsData || []).map((st) => [st.student_id, st]));

    return students.map((s) => {
      const stats = statsMap.get(s.id) || {
        student_id: s.id,
        total_xp: 0,
        coins: 0,
        created_at: s.created_at,
        updated_at: s.updated_at,
      };
      return {
        ...s,
        stats,
        level: calculateLevelFromXp(stats.total_xp).level,
      };
    });
  },
};
