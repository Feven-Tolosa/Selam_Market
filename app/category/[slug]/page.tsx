import { supabase } from '@/lib/supabaseClient'
import type { Category, Product } from '@/types'

export default async function CategoryPage({
  params,
}: {
  params: { slug: string }
}) {
  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', params.slug)
    .maybeSingle<Category>()

  if (!category) {
    return <p className='p-6'>Category not found</p>
  }

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('category_id', category.id)
    .returns<Product[]>()

  return (
    <div className='max-w-7xl mx-auto px-6 py-10'>
      <div className='flex justify-between mb-6'>
        <h1 className='text-2xl font-semibold'>{category.name}</h1>

        <span className='text-gray-500 text-sm'>
          {products?.length || 0} products
        </span>
      </div>

      <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
        {products?.map((product) => (
          <div key={product.id}>{product.name}</div>
        ))}
      </div>
    </div>
  )
}
