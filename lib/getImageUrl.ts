import { supabase } from '@/lib/supabaseClient'

export function getImageUrl(path: string | null | undefined): string {
  if (!path) return '/placeholder.png'

  if (path.startsWith('http')) return path

  const { data } = supabase.storage.from('product-images').getPublicUrl(path)

  return data.publicUrl
}
