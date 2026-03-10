import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'

export default async function FeaturedProducts() {
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .limit(8)

  return (
    <section className='py-16 bg-gray-50'>
      <div className='max-w-7xl mx-auto px-6'>
        <div className='flex justify-between items-center mb-8'>
          <h2 className='text-2xl font-semibold text-gray-800'>
            Featured Products
          </h2>

          <Link href='/products' className='text-[#10b5cb] hover:underline'>
            View all
          </Link>
        </div>

        <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
          {products?.map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.id}`}
              className='bg-white rounded-xl border hover:shadow-md transition'
            >
              <img
                src={product.image_url || '/placeholder.png'}
                alt={product.name}
                className='w-full h-48 object-cover rounded-t-xl'
              />

              <div className='p-4'>
                <h3 className='font-medium text-gray-800 line-clamp-1'>
                  {product.name}
                </h3>

                <p className='text-sm text-gray-500 mt-1 line-clamp-2'>
                  {product.description}
                </p>

                <div className='mt-3 text-[#10b5cb] font-semibold'>
                  ${product.price}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
