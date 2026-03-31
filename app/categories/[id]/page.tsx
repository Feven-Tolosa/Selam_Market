import { supabase } from '@/lib/supabaseClient'

export default async function CategoryPage({
  params,
}: {
  params: { id: string }
}) {
  const categoryId = Number(params.id) // FIX HERE

  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('category_id', categoryId)

  if (error) {
    return <p className='p-6 text-red-500'>Error loading products</p>
  }

  const safeProducts = products ?? []

  return (
    <div className='p-6'>
      <h1 className='text-2xl font-bold mb-6'>Category Products</h1>

      {safeProducts.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
          {safeProducts.map((p) => (
            <div key={p.id} className='border p-4 rounded'>
              {p.name}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
