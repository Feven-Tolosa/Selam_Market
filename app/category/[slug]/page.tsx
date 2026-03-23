import { supabase } from '@/lib/supabaseClient'
import type { Category, Product } from '@/types'

export default async function CategoryPage({
  params,
}: {
  params: { slug: string }
}) {
  // ✅ get category
  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', params.slug)
    .single<Category>()

  if (!category) {
    return <p>Category not found</p>
  }

  // ✅ get products
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('category_id', category.id)
    .returns<Product[]>()

  return (
    <div className='p-6'>
      <h1 className='text-xl font-bold mb-4'>{category.name}</h1>

      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        {products?.map((product) => (
          <div key={product.id} className='border p-3'>
            {product.name}
          </div>
        ))}
      </div>
    </div>
  )
}
