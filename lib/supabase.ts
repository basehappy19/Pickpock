import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * FIX SUPABASE RLS ERROR:
 * If you see "new row violates row-level security policy", do the following in Supabase Dashboard:
 * 1. Go to Storage -> Buckets -> "products"
 * 2. Click "Policies" tab
 * 3. Add a New Policy for "INSERT":
 *    - Name: "Allow anonymous uploads"
 *    - Allowed roles: anon, authenticated
 *    - Policy definition: (true) or specific check
 * 4. Add a New Policy for "SELECT":
 *    - Name: "Allow public read"
 *    - Allowed roles: public
 */
export async function uploadProductImage(file: File) {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `product-images/${fileName}`;

    const { data, error } = await supabase.storage
      .from('products')
      .upload(filePath, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('products')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
}
