'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import ProductCard from './ProductCard'

interface Vendor {
  store_name: string
}

interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url: string | null
  vendor_name?: string
  rating?: number
  ratingCount?: number
}

export default function Featured() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchFeatured() {
      setLoading(true)

      try {
        // Fetch top 12 products with vendor info
        const { data: productsData } = await supabase
          .from('products')
          .select(
            `
            id,
            name,
            description,
            price,
            image_url,
            vendors (
              store_name
            )
          `,
          )
          .limit(4)

        if (!productsData) {
          setProducts([])
          return
        }

        // Fetch reviews for ratings
        const { data: reviews } = await supabase
          .from('reviews')
          .select('product_id, rating')

        // Build rating map
        const ratingMap: Record<string, { total: number; count: number }> = {}
        reviews?.forEach((r) => {
          if (!r.product_id) return
          if (!ratingMap[r.product_id]) {
            ratingMap[r.product_id] = { total: 0, count: 0 }
          }
          ratingMap[r.product_id].total += r.rating
          ratingMap[r.product_id].count++
        })

        // Attach vendor name + ratings
        const featuredProducts: Product[] = productsData.map(
          (p: {
            id: string
            name: string
            description: string
            price: number
            image_url: string | null
            vendors?: Vendor[]
          }) => {
            const stats = ratingMap[p.id]
            return {
              id: p.id,
              name: p.name,
              description: p.description,
              price: p.price,
              image_url: p.image_url,
              vendor_name: p.vendors?.[0]?.store_name,
              rating: stats ? stats.total / stats.count : 0,
              ratingCount: stats ? stats.count : 0,
            }
          },
        )

        // Sort by Top Rated
        featuredProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0))

        setProducts(featuredProducts)
      } catch (err) {
        console.error('Failed to fetch featured products', err)
      } finally {
        setLoading(false)
      }
    }

    fetchFeatured()
  }, [])

  if (loading)
    return <p className='p-10 text-center'>Loading featured products...</p>
  if (products.length === 0)
    return <p className='p-10 text-center'>No featured products found.</p>

  return (
    <section className='py-15 bg-linear-to-b from-white to-gray-50'>
      <div className='max-w-7xl mx-auto px-6'>
        {/* Header */}
        <div className='flex items-center justify-between mb-10'>
          <div>
            <h2 className='text-3xl font-bold text-gray-900'>
              Featured Products
            </h2>
            <p className='text-gray-500 mt-1 text-sm'>
              Discover our top-rated products from trusted vendors. Handpicked
              for you!
            </p>
          </div>
        </div>

        {/* Modern Grid */}
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8'>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
