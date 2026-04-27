'use client'

import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import ProductCard from '../product/ProductCard'
import { useEffect, useState } from 'react'
import { getTranslation } from '@/lib/i18n'

type ProductWithExtras = {
  id: string
  name: string
  description: string
  price: number
  image_url: string | null
  vendors?: {
    id: string
    store_name: string
  }[]
  rating?: number
  ratingCount?: number
}

export default function AvailableProducts() {
  const t = getTranslation()

  const [products, setProducts] = useState<ProductWithExtras[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)

      const { data: productsData } = await supabase
        .from('products')
        .select(
          `
          id,
          name,
          description,
          price,
          image_url,
          vendors (id, store_name)
        `,
        )
        .limit(12)

      const { data: reviews } = await supabase
        .from('reviews')
        .select('product_id, rating')

      const ratingMap: Record<string, { total: number; count: number }> = {}

      reviews?.forEach((r) => {
        if (!ratingMap[r.product_id]) {
          ratingMap[r.product_id] = { total: 0, count: 0 }
        }
        ratingMap[r.product_id].total += r.rating
        ratingMap[r.product_id].count++
      })

      const enriched =
        productsData?.map((p) => {
          const stats = ratingMap[p.id]
          return {
            ...p,
            rating: stats ? stats.total / stats.count : 0,
            ratingCount: stats ? stats.count : 0,
          }
        }) || []

      setProducts(enriched)
      setLoading(false)
    }

    fetchData()
  }, [])

  return (
    <section className='py-20 bg-linear-to-b from-white to-gray-50'>
      <div className='max-w-7xl mx-auto px-6'>
        {/* Header */}
        <div className='flex items-center justify-between mb-10'>
          <div>
            <h2 className='text-3xl font-bold text-gray-900'>
              {t.availableProducts.title}
            </h2>

            <p className='text-gray-500 mt-1 text-sm'>
              {t.availableProducts.subtitle}
            </p>
          </div>

          <Link
            href='/products'
            className='text-sm font-medium text-[#10b5cb] hover:underline'
          >
            {t.availableProducts.viewAll}
          </Link>
        </div>

        {/* Grid */}
        {loading ? (
          <p className='text-center text-gray-500'>Loading...</p>
        ) : products.length === 0 ? (
          <p className='text-center text-gray-500'>
            {t.availableProducts.empty}
          </p>
        ) : (
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8'>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
