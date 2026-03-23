'use client'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

export default function FeaturedProducts({ userId }: { userId: string }) {
  const [products, setProducts] = useState<Product[]>([])
  const [wishlist, setWishlist] = useState<number[]>([])

  type Vendor = {
    id: number
    store_name: string
  }

  type Product = {
    id: number
    name: string
    description: string
    price: number
    image_url: string | null
    rating: number | null
    reviews_count: number | null
    vendors: Vendor[] | null // ✅ FIXED
  }

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase
        .from('products')
        .select(
          `
          id,
          name,
          description,
          price,
          image_url,
          rating,
          reviews_count,
          vendors (
            id,
            store_name
          )
        `,
        )
        .limit(8)
        .order('created_at', { ascending: false })

      setProducts(data || [])

      const formattedProducts: Product[] = (data || []).map((item) => ({
        ...item,
        vendors: item.vendors || [],
      }))

      setProducts(formattedProducts)

      // fetch wishlist
      if (userId) {
        const { data: wishlistData } = await supabase
          .from('wishlist')
          .select('product_id')
          .eq('user_id', userId)
        setWishlist(wishlistData?.map((w) => w.product_id) || [])
      }
    }

    fetchData()
  }, [userId])

  // Add to Cart
  const addToCart = async (productId: number) => {
    const { error } = await supabase.from('cart').insert({
      user_id: userId,
      product_id: productId,
      quantity: 1,
    })
    if (error) return toast.error('Failed to add to cart')
    toast.success('Added to cart!')
  }

  // Toggle Wishlist
  const toggleWishlist = async (productId: number) => {
    if (!userId) return toast.error('Login to use wishlist')
    if (wishlist.includes(productId)) {
      await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId)
      setWishlist((prev) => prev.filter((id) => id !== productId))
      toast('Removed from wishlist')
    } else {
      await supabase
        .from('wishlist')
        .insert({ user_id: userId, product_id: productId })
      setWishlist((prev) => [...prev, productId])
      toast('Added to wishlist')
    }
  }

  return (
    <section className='py-20 bg-gradient-to-b from-white to-gray-50'>
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
          {products.map((product) => (
            <div
              key={product.id}
              className='group bg-white rounded-2xl border hover:shadow-xl transition-all duration-300 overflow-hidden relative'
            >
              {/* Wishlist Icon */}
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center ${
                  wishlist.includes(product.id)
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                } hover:scale-110 transition`}
              >
                ♥
              </button>

              {/* Image */}
              <Link href={`/product/${product.id}`}>
                <img
                  src={product.image_url || '/placeholder.png'}
                  alt={product.name}
                  className='w-full h-52 object-cover group-hover:scale-105 transition'
                />
              </Link>

              {/* Content */}
              <div className='p-4'>
                {/* Vendor */}
                <p className='text-xs text-gray-400 mb-1'>
                  {product.vendors?.[0]?.store_name || 'Unknown Vendor'}
                </p>

                {/* Title */}
                <Link href={`/product/${product.id}`}>
                  <h3 className='font-semibold text-gray-900 line-clamp-1'>
                    {product.name}
                  </h3>
                </Link>

                {/* Description */}
                <p className='text-sm text-gray-500 mt-1 line-clamp-2'>
                  {product.description}
                </p>

                {/* Ratings */}
                <div className='mt-2 flex items-center text-yellow-400'>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i}>
                      {i < Math.round(product.rating || 0) ? '★' : '☆'}
                    </span>
                  ))}
                  <span className='ml-2 text-gray-500 text-xs'>
                    ({product.reviews_count || 0})
                  </span>
                </div>

                {/* Footer */}
                <div className='mt-4 flex items-center justify-between'>
                  <span className='text-[#10b5cb] font-bold text-lg'>
                    ${product.price}
                  </span>

                  <button
                    onClick={() => addToCart(product.id)}
                    className='text-xs px-3 py-1 border rounded-lg hover:bg-gray-100 transition'
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
