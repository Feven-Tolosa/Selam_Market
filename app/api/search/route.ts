import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('q')

  if (!query) {
    return NextResponse.json({ products: [], vendors: [] })
  }

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .ilike('name', `%${query}%`)

  const { data: vendors } = await supabase
    .from('users')
    .select('id, business_name')
    .ilike('business_name', `%${query}%`)

  return NextResponse.json({
    products: products ?? [],
    vendors: vendors ?? [],
  })
}
