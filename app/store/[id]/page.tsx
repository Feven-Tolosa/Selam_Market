import { supabase } from '@/lib/supabaseClient'
import { Vendor, Product } from '@/types/marketplace'
import Image from 'next/image'
import Link from 'next/link'

type Props = {
  params: { id: string }
}

export default async function Store({ params }: Props) {
  const { data: vendor } = await supabase
    .from('vendors')
    .select('*')
    .eq('id', params.id)
    .single<Vendor>()

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('vendor_id', params.id)
    .order('created_at', { ascending: false })
    .returns<Product[]>()

  if (!vendor) {
    return <div className='p-10'>Store not found</div>
  }

  return (
    <div className='bg-white'>
      {/* Banner */}
      <div className='relative h-[280px] w-full bg-gray-100'>
        <Image
          src={vendor.banner_url || '/banner-placeholder.jpg'}
          alt='Store banner'
          fill
          className='object-cover'
        />
      </div>

      {/* Store Header */}
      <div className='max-w-7xl mx-auto px-6'>
        <div className='flex flex-col md:flex-row md:items-center gap-6 -mt-16'>
          {/* Avatar */}
          <div className='relative w-32 h-32 rounded-full overflow-hidden border-4 border-white bg-gray-200'>
            <Image
              src={vendor.logo_url || '/avatar-placeholder.png'}
              alt={vendor.store_name}
              fill
              className='object-cover'
            />
          </div>

          {/* Store info */}
          <div className='flex-1'>
            <h1 className='text-3xl font-bold'>{vendor.store_name}</h1>

            <p className='text-gray-600 mt-1'>
              {vendor.location ?? 'Local Vendor'}
            </p>

            <div className='flex gap-6 mt-3 text-sm text-gray-500'>
              <span>{products?.length ?? 0} products</span>

              <span>Verified Vendor</span>
            </div>
          </div>

          {/* Contact Button */}
          <Link
            href='/login'
            className='bg-[#10b5cb] text-white px-6 py-3 rounded-lg hover:bg-[#0ea3b7] transition'
          >
            Contact Vendor
          </Link>
        </div>

        {/* Description */}
        {vendor.description && (
          <div className='mt-8 max-w-3xl text-gray-700'>
            {vendor.description}
          </div>
        )}
      </div>

      {/* Products */}
      <section className='max-w-7xl mx-auto px-6 mt-14'>
        <h2 className='text-2xl font-semibold mb-8'>Products</h2>

        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8'>
          {products?.map((product) => (
            <div
              key={product.id}
              className='group border rounded-xl overflow-hidden hover:shadow-lg transition bg-white'
            >
              {/* Product Image */}
              <div className='relative h-52 bg-gray-100'>
                <Image
                  src={product.image_url || '/placeholder.png'}
                  alt={product.name}
                  fill
                  className='object-cover group-hover:scale-105 transition'
                />
              </div>

              {/* Product info */}
              <div className='p-4'>
                <h3 className='text-sm font-medium line-clamp-2'>
                  {product.name}
                </h3>

                <p className='text-[#10b5cb] font-semibold mt-2'>
                  ${product.price}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
