'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Image from 'next/image'
import Link from 'next/link'
import { getTranslation } from '@/lib/i18n'

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
  const t = getTranslation()

  const [deals, setDeals] = useState<DealProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [activeIndex, setActiveIndex] = useState(0)

  function getImageSrc(url: string | null) {
    if (!url) return '/placeholder.png'
    if (url.startsWith('http')) return url
    if (url.startsWith('/')) return url
    return `/uploads/${url}`
  }

  useEffect(() => {
    if (deals.length > 0) {
      const interval = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % deals.length)
      }, 2000)
      return () => clearInterval(interval)
    }
  }, [deals.length])

  function generateDiscount() {
    return Math.floor(Math.random() * 26) + 5
  }

  async function fetchDeals() {
    setLoading(true)

    const { data, error } = await supabase.from('products').select('*').limit(8)

    if (!error && data) {
      const withDiscounts = data.map((product) => ({
        ...product,
        discount: generateDiscount(),
      }))

      const sorted = withDiscounts.sort((a, b) => b.discount - a.discount)
      setDeals(sorted.slice(0, 4))
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchDeals()
  }, [])

  return (
    <section className='py-20 bg-gray-50'>
      <div className='container mx-auto px-6'>
        {/* Header */}
        <div className='text-center mb-12'>
          <h2 className='text-3xl font-bold text-[#10b5cb]'>
            {t.topDeals.title}
          </h2>
          <p className='text-gray-600 mt-3 max-w-xl mx-auto'>
            {t.topDeals.subtitle}
          </p>
        </div>

        {/* Loading */}
        {loading ? (
          <div className='text-center text-gray-500'>{t.topDeals.loading}</div>
        ) : (
          <div className='grid sm:grid-cols-2 md:grid-cols-4 gap-8'>
            {deals.map((deal, index) => {
              const discountedPrice =
                deal.price - (deal.price * deal.discount) / 100

              const isActive = index === activeIndex

              return (
                <Link
                  key={deal.id}
                  href={`/products/${deal.id}`}
                  className='relative group rounded-xl overflow-hidden'
                >
                  <div className='relative bg-white p-6 border'>
                    <div className='text-red-500 text-xs px-2 py-1 rounded-full'>
                      -{deal.discount}%
                    </div>

                    <Image
                      src={getImageSrc(deal.image_url)}
                      width={90}
                      height={90}
                      alt={deal.name}
                    />

                    <h3 className='text-center font-semibold'>{deal.name}</h3>

                    <p className='text-center'>
                      <span className='line-through'>${deal.price}</span>{' '}
                      <span className='text-[#10b5cb] font-bold'>
                        ${discountedPrice.toFixed(2)}
                      </span>
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
