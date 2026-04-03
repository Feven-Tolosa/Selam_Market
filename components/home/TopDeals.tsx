'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Image from 'next/image'
import Link from 'next/link'

type Product = {
  id: string
  name: string
  price: number
  image_url: string | null
}

type DealProduct = Product & {
  discount: number
}

export default function TopDeals() {
  const [deals, setDeals] = useState<DealProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDeals()
  }, [])

  function generateDiscount() {
    return Math.floor(Math.random() * 26) + 5 // 5% → 30%
  }

  async function fetchDeals() {
    setLoading(true)

    const { data, error } = await supabase.from('products').select('*').limit(8)

    if (!error && data) {
      const withDiscounts = data.map((product) => ({
        ...product,
        discount: generateDiscount(),
      }))

      // sort highest discount first
      const sorted = withDiscounts.sort((a, b) => b.discount - a.discount)

      setDeals(sorted.slice(0, 4))
    }

    setLoading(false)
  }

  return (
    <section className='py-20 bg-white'>
      <div className='container mx-auto px-6'>
        {/* Header */}
        <div className='text-center mb-12'>
          <h2 className='text-3xl font-bold text-[#10b5cb]'>Top Deals</h2>
          <p className='text-gray-600 mt-3 max-w-xl mx-auto'>
            Discover great prices from local vendors near you.
          </p>
        </div>

        {/* Loading */}
        {loading ? (
          <div className='text-center text-gray-500'>Loading deals...</div>
        ) : (
          <div className='grid sm:grid-cols-2 md:grid-cols-4 gap-8'>
            {deals.map((deal) => {
              const discountedPrice =
                deal.price - (deal.price * deal.discount) / 100

              return (
                <Link
                  key={deal.id}
                  href={`/product/${deal.id}`}
                  className='relative group bg-white p-6 rounded-xl border hover:shadow-xl hover:-translate-y-1 transition'
                  style={{ borderColor: '#10b5cb30' }}
                >
                  {/* Discount badge */}
                  <div className='absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded'>
                    -{deal.discount}%
                  </div>

                  {/* Image */}
                  <div className='flex justify-center mb-4'>
                    <Image
                      src={deal.image_url || '/placeholder.png'}
                      width={90}
                      height={90}
                      alt={deal.name}
                      className='group-hover:scale-110 transition'
                    />
                  </div>

                  <div className='flex flex-col items-center bottom-0'>
                    {/* Name */}
                    <h3 className='font-semibold text-center mb-2'>
                      {deal.name}
                    </h3>

                    {/* Price */}
                    <p className='text-center text-gray-700 mb-1'>
                      <span className='line-through mr-2 text-sm text-gray-400'>
                        ${deal.price}
                      </span>
                      <span className='font-bold text-[#10b5cb]'>
                        ${discountedPrice.toFixed(2)}
                      </span>
                    </p>

                    <p className='text-center text-sm text-green-600'>
                      Save {deal.discount}%
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
