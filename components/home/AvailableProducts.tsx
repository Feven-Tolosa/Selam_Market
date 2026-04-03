import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import ProductCard from '../product/ProductCard'

type ProductWithExtras = {
  id: string
  name: string
  description: string
  price: number
  image_url: string | null
  vendors?: {
    id: string
    store_name: string
  }
  rating?: number
  ratingCount?: number
}

export default async function AvailableProducts() {
  // 📦 Fetch products
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
    .limit(12)

  // ⭐ Fetch ratings
  const { data: reviews } = await supabase
    .from('reviews')
    .select('product_id, rating')

  // 🧠 Build rating map
  const ratingMap: Record<string, { total: number; count: number }> = {}

  reviews?.forEach((r) => {
    if (!ratingMap[r.product_id]) {
      ratingMap[r.product_id] = { total: 0, count: 0 }
    }
    ratingMap[r.product_id].total += r.rating
    ratingMap[r.product_id].count++
  })

  // 🔗 Attach ratings
  const enrichedProducts: ProductWithExtras[] =
    products?.map((p) => {
      const stats = ratingMap[p.id]

      return {
        ...p,
        rating: stats ? stats.total / stats.count : 0,
        ratingCount: stats ? stats.count : 0,
      }
    }) || []

  return (
    <section className='py-20 bg-gradient-to-b from-white to-gray-50'>
      <div className='max-w-7xl mx-auto px-6'>
        {/* Header */}
        <div className='flex items-center justify-between mb-10'>
          <div>
            <h2 className='text-3xl font-bold text-gray-900'>
              Available products
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
        {enrichedProducts.length === 0 ? (
          <p className='text-center text-gray-500'>
            No featured products available.
          </p>
        ) : (
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8'>
            {enrichedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
