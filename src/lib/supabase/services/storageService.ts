import { supabase, isSupabaseConfigured } from '@/src/lib/supabase/client';

export const storageService = {
  async uploadProblemImage(file: File): Promise<string> {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Тек JPEG, PNG, WebP немесе SVG суреттер қабылданады.');
    }

    const maxSize = 5 * 1024 * 1024; // 5 MB
    if (file.size > maxSize) {
      throw new Error('Сурет көлемі 5 МБ-тан аспауы тиіс.');
    }

    const fileExt = file.name.split('.').pop() || 'png';
    const filePath = `problems/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

    if (!isSupabaseConfigured || !supabase) {
      // In demo mode, create an object URL for preview and note storage path
      return URL.createObjectURL(file);
    }

    const { error } = await supabase.storage
      .from('problem-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw new Error(`Суретті жүктеу сәтсіз аяқталды: ${error.message}. Storage-та "problem-images" бакеті бар екеніне көз жеткізіңіз.`);
    }

    const { data: publicUrlData } = supabase.storage
      .from('problem-images')
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl || filePath;
  },
};
