import { supabase, isSupabaseConfigured } from '@/src/lib/supabase/client';
import { Profile } from '@/src/types/database';
import { DEMO_TEACHER_ID } from './demoData';

export interface AuthState {
  user: any | null;
  profile: Profile | null;
  role: 'teacher' | 'student' | null;
  isLoading: boolean;
}

export const authService = {
  async getTeacherProfile(userId: string = DEMO_TEACHER_ID): Promise<Profile | null> {
    if (!isSupabaseConfigured || !supabase) {
      return {
        id: DEMO_TEACHER_ID,
        role: 'teacher',
        display_name: 'Әлия Мұғалім (Демо)',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('id, role, display_name, created_at, updated_at')
      .eq('id', userId)
      .single();

    if (error) return null;
    return data as Profile;
  },

  async signUpTeacher(email: string, password: string, displayName: string): Promise<Profile> {
    if (!isSupabaseConfigured || !supabase) {
      return {
        id: DEMO_TEACHER_ID,
        role: 'teacher',
        display_name: displayName,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
          role: 'teacher',
        },
      },
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('User creation failed');

    // Create profile row
    const { data: profile, error: pError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        role: 'teacher',
        display_name: displayName.trim(),
      })
      .select('id, role, display_name, created_at, updated_at')
      .single();

    if (pError) throw pError;
    return profile as Profile;
  },

  async signInTeacher(email: string, password: string): Promise<Profile> {
    if (!isSupabaseConfigured || !supabase) {
      return {
        id: DEMO_TEACHER_ID,
        role: 'teacher',
        display_name: 'Әлия Мұғалім',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    if (!authData.user) throw new Error('Sign in failed');

    const profile = await this.getTeacherProfile(authData.user.id);
    if (!profile) {
      throw new Error('Профиль табылмады');
    }
    return profile;
  },

  async signOut(): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
  },
};
