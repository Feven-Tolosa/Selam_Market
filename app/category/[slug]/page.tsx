import { supabase } from '@/lib/supabaseClient'
import Image from 'next/image'
import Link from 'next/link'

export default async function CategoryPage({
  params,
}: {
  params: { slug: string }
}) {
  const { slug } = params

  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', slug)

  if (error) {
    return <p className='p-6'>Error loading products</p>
  }

  return (
    <div className='max-w-7xl mx-auto px-6 py-10'>
      <h1 className='text-2xl font-semibold mb-6 capitalize'>
        {slug} Products
      </h1>

      {products?.length === 0 && <p>No products found in this category.</p>}

      <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
        {products?.map((product) => (
          <div key={product.id} className='border rounded-lg p-4'>
            {product.image_url && (
              <Image
                src={product.image_url}
                alt={product.name}
                width={200}
                height={200}
                className='rounded-md object-cover'
              />
            )}

            <h2 className='mt-2 font-medium'>{product.name}</h2>
            <p className='text-gray-500 text-sm'>${product.price}</p>

            <Link
              href={`/product/${product.id}`}
              className='text-[#10b5cb] text-sm mt-2 inline-block'
            >
              View Product
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
