import { supabase } from '@/lib/supabaseClient'
import Image from 'next/image'
import Link from 'next/link'

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
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className='group bg-white rounded-2xl border hover:shadow-xl transition-all duration-300 overflow-hidden'
            >
              {/* Image */}
              <div className='relative'>
                <Image
                  src={product.image_url || '/placeholder.png'}
                  alt={product.name}
                  width={300}
                  height={200}
                  className='w-full h-52 object-cover group-hover:scale-105 transition'
                />

                {/* Badge */}
                <span className='absolute top-3 left-3 bg-[#10b5cb] text-white text-xs px-3 py-1 rounded-full shadow'>
                  New
                </span>
              </div>

              {/* Content */}
              <div className='p-4'>
                {/* Vendor */}
                <p className='text-xs text-gray-400 mb-1'>
                  {product.vendors?.store_name || 'Unknown Vendor'}
                </p>

                {/* Title */}
                <h3 className='font-semibold text-gray-900 line-clamp-1'>
                  {product.name}
                </h3>

                {/* Description */}
                <p className='text-sm text-gray-500 mt-1 line-clamp-2'>
                  {product.description}
                </p>

                {/* Footer */}
                <div className='mt-4 flex items-center justify-between'>
                  <span className='text-[#10b5cb] font-bold text-lg'>
                    ${product.price}
                  </span>

                  <button className='text-xs px-3 py-1 border rounded-lg hover:bg-gray-100 transition'>
                    View
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
