import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || 'https://xxxx.supabase.co';
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg';
  const filename = `${userId}.${ext}`;
  
  const { error } = await supabase.storage
    .from('avatars')
    .upload(filename, file, { upsert: true, contentType: file.type });
  
  if (error) throw new Error(error.message);
  
  const { data } = supabase.storage.from('avatars').getPublicUrl(filename);
  return data.publicUrl;
}
