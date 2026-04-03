import { supabase } from '@/lib/supabaseClient'
import Image from 'next/image'
import Link from 'next/link'
import ProductCard from '../product/ProductCard'

export default async function FeaturedProducts() {
  const { data: products } = await supabase
    .from('products')
    .select(
      `
      id,
      name,
      description,
      price,
      image_url,
      vendors (
        id,
        store_name
      )
    `,
    )
    .limit(8)

  return (
    <section className='py-20 bg-linear-to-b from-white to-gray-50'>
      <div className='max-w-7xl mx-auto px-6'>
        {/* Header */}
        <div className='flex items-center justify-between mb-10'>
          <div>
            <h2 className='text-3xl font-bold text-gray-900'>
              Featured Products
            </h2>
            <p className='text-gray-500 mt-1 text-sm'>
              Discover top products from trusted vendors
            </p>
          </div>

          <Link
            href='/products'
            className='text-sm font-medium text-[#10b5cb] hover:underline'
          >
            View all →
          </Link>
        </div>

        {/* Grid */}
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8'>
          {products?.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
