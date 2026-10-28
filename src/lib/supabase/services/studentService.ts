import { supabase, isSupabaseConfigured } from '@/src/lib/supabase/client';
import {
  Student,
  StudentStats,
  RewardLedger,
  InventoryItem,
  StudentItem,
  Room,
} from '@/src/types/database';
import {
  initialStudents,
  initialStudentStats,
  initialRewardLedger,
  initialStudentItems,
  initialRooms,
  initialClassrooms,
  DEMO_STUDENT_ID,
} from './demoData';
import { STARTER_INVENTORY } from '@/src/features/home/starterCatalog';

let demoStudents = [...initialStudents];
let demoStats = { ...initialStudentStats };
let demoRewards = [...initialRewardLedger];
let demoStudentItems = [...initialStudentItems];
let demoRooms = { ...initialRooms };

export const studentService = {
  // Join classroom using the join_classroom RPC
  async joinClassroom(
    joinCode: string,
    displayName: string,
    characterId: string
  ): Promise<Student> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.rpc('join_classroom', {
        p_join_code: joinCode.trim(),
        p_display_name: displayName.trim(),
        p_character_id: characterId,
      });

      if (error) throw error;
      return data as Student;
    }

    // Demo Mode
    const code = joinCode.trim().toUpperCase();
    const classroom = initialClassrooms.find(
      (c) => c.join_code.toUpperCase() === code && c.status === 'active'
    );
    if (!classroom) {
      throw new Error('Жарамсыз сынып коды! Тексеріп қайта енгізіңіз.');
    }

    const newStudentId = 'demo-stu-' + Date.now();
    const newStudent: Student = {
      id: newStudentId,
      auth_user_id: 'demo-auth-' + Date.now(),
      classroom_id: classroom.id,
      display_name: displayName.trim(),
      character_id: characterId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    demoStudents.push(newStudent);
    demoStats[newStudentId] = {
      student_id: newStudentId,
      total_xp: 0,
      coins: 50, // Welcome gift
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    demoRooms[newStudentId] = {
      id: 'room-' + Date.now(),
      student_id: newStudentId,
      room_data: { wall: null, floor: null, desk: null, plant: null, bed: null },
      updated_at: new Date().toISOString(),
    };

    return newStudent;
  },

  async getStudentProfile(studentId: string = DEMO_STUDENT_ID): Promise<Student | null> {
    if (!isSupabaseConfigured || !supabase) {
      return demoStudents.find((s) => s.id === studentId) || null;
    }

    const { data, error } = await supabase
      .from('students')
      .select('id, auth_user_id, classroom_id, display_name, character_id, created_at, updated_at')
      .eq('id', studentId)
      .single();

    if (error) return null;
    return data as Student;
  },

  async getStudentStats(studentId: string = DEMO_STUDENT_ID): Promise<StudentStats> {
    if (!isSupabaseConfigured || !supabase) {
      return (
        demoStats[studentId] || {
          student_id: studentId,
          total_xp: 0,
          coins: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      );
    }

    const { data, error } = await supabase
      .from('student_stats')
      .select('student_id, total_xp, coins, created_at, updated_at')
      .eq('student_id', studentId)
      .single();

    if (error) {
      return {
        student_id: studentId,
        total_xp: 0,
        coins: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    return data as StudentStats;
  },

  async getRewardLedger(studentId: string = DEMO_STUDENT_ID): Promise<RewardLedger[]> {
    if (!isSupabaseConfigured || !supabase) {
      return demoRewards.filter((r) => r.student_id === studentId);
    }

    const { data, error } = await supabase
      .from('reward_ledger')
      .select('id, student_id, assignment_problem_id, submission_id, xp_amount, coin_amount, created_at')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as RewardLedger[];
  },

  async getCatalog(): Promise<InventoryItem[]> {
    if (!isSupabaseConfigured || !supabase) {
      return STARTER_INVENTORY;
    }

    const { data, error } = await supabase
      .from('inventory')
      .select('id, code, name, description, category, price_coins, unlock_level, asset_path, is_active, created_at')
      .eq('is_active', true)
      .order('unlock_level', { ascending: true });

    if (error || !data || data.length === 0) {
      return STARTER_INVENTORY;
    }

    return data as InventoryItem[];
  },

  async getStudentItems(studentId: string = DEMO_STUDENT_ID): Promise<StudentItem[]> {
    if (!isSupabaseConfigured || !supabase) {
      return demoStudentItems.filter((i) => i.student_id === studentId);
    }

    const { data, error } = await supabase
      .from('student_items')
      .select('id, student_id, inventory_id, acquired_at, is_equipped, placement')
      .eq('student_id', studentId);

    if (error) throw error;
    return (data || []) as StudentItem[];
  },

  async buyItem(studentId: string, item: InventoryItem): Promise<StudentItem> {
    if (!isSupabaseConfigured || !supabase) {
      const stats = demoStats[studentId];
      if (!stats || stats.coins < item.price_coins) {
        throw new Error('Монета жеткіліксіз!');
      }

      stats.coins -= item.price_coins;
      stats.updated_at = new Date().toISOString();

      const newItem: StudentItem = {
        id: 'si-' + Date.now(),
        student_id: studentId,
        inventory_id: item.id,
        acquired_at: new Date().toISOString(),
        is_equipped: false,
        placement: null,
      };

      demoStudentItems.push(newItem);
      return newItem;
    }

    // With Supabase: verify balance and insert item
    const { data: stats, error: stErr } = await supabase
      .from('student_stats')
      .select('total_xp, coins')
      .eq('student_id', studentId)
      .single();

    if (stErr || !stats || stats.coins < item.price_coins) {
      throw new Error('Монета жеткіліксіз!');
    }

    const { data: studentItem, error: buyErr } = await supabase
      .from('student_items')
      .insert({
        student_id: studentId,
        inventory_id: item.id,
        is_equipped: false,
      })
      .select('id, student_id, inventory_id, acquired_at, is_equipped, placement')
      .single();

    if (buyErr) throw buyErr;

    // Deduct coins
    await supabase
      .from('student_stats')
      .update({
        coins: stats.coins - item.price_coins,
        updated_at: new Date().toISOString(),
      })
      .eq('student_id', studentId);

    return studentItem as StudentItem;
  },

  async getRoom(studentId: string = DEMO_STUDENT_ID): Promise<Room> {
    if (!isSupabaseConfigured || !supabase) {
      return (
        demoRooms[studentId] || {
          id: 'room-' + studentId,
          student_id: studentId,
          room_data: { wall: null, floor: null, desk: null, plant: null, bed: null },
          updated_at: new Date().toISOString(),
        }
      );
    }

    const { data, error } = await supabase
      .from('rooms')
      .select('id, student_id, room_data, updated_at')
      .eq('student_id', studentId)
      .maybeSingle();

    if (error || !data) {
      return {
        id: 'room-' + studentId,
        student_id: studentId,
        room_data: { wall: null, floor: null, desk: null, plant: null, bed: null },
        updated_at: new Date().toISOString(),
      };
    }

    return data as Room;
  },

  async saveRoom(studentId: string, roomData: Record<string, any>): Promise<Room> {
    if (!isSupabaseConfigured || !supabase) {
      const room: Room = {
        id: 'room-' + studentId,
        student_id: studentId,
        room_data: roomData,
        updated_at: new Date().toISOString(),
      };
      demoRooms[studentId] = room;
      return room;
    }

    const { data, error } = await supabase
      .from('rooms')
      .upsert({
        student_id: studentId,
        room_data: roomData,
        updated_at: new Date().toISOString(),
      })
      .select('id, student_id, room_data, updated_at')
      .single();

    if (error) throw error;
    return data as Room;
  },

  async updateCharacter(studentId: string, characterId: string): Promise<void> {
    if (!isSupabaseConfigured || !supabase) {
      const student = demoStudents.find((s) => s.id === studentId);
      if (student) {
        student.character_id = characterId;
        student.updated_at = new Date().toISOString();
      }
      return;
    }

    const { error } = await supabase
      .from('students')
      .update({
        character_id: characterId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', studentId);

    if (error) throw error;
  },
};
