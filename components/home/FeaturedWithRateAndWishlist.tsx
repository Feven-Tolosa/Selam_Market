'use client'

import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { useUser } from '@/useUser'

// ✅ TYPES (OUTSIDE COMPONENT)
type Vendor = {
  id: string
  store_name: string
}

type Product = {
  id: string
  name: string
  description: string
  price: number
  image_url: string | null
  rating: number | null
  reviews_count: number | null
  vendors: Vendor[] | null
}

export default function FeaturedProducts() {
  const { user, loading } = useUser()

  const [products, setProducts] = useState<Product[]>([])
  const [wishlist, setWishlist] = useState<string[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)

  // ✅ FETCH DATA (SINGLE SOURCE OF TRUTH)
  useEffect(() => {
    async function fetchData() {
      setLoadingProducts(true)

      const { data, error } = await supabase
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
        .order('created_at', { ascending: false })
        .limit(8)

      console.log('DATA:', data)
      console.log('ERROR:', error)

      if (error) {
        toast.error('Failed to load products')
        setLoadingProducts(false)
        return
      }

      const formatted: Product[] = (data || []).map((item) => ({
        ...item,
        vendors: item.vendors || [],
      }))

      setProducts(formatted)

      // ✅ Fetch wishlist ONLY if logged in
      if (user) {
        const { data: wishlistData } = await supabase
          .from('wishlist')
          .select('product_id')
          .eq('user_id', user.id)

        setWishlist(wishlistData?.map((w) => w.product_id) || [])
      }

      setLoadingProducts(false)
    }

    fetchData()
  }, [user])

  // ✅ ADD TO CART
  const addToCart = async (productId: string) => {
    if (!user) return toast.error('Login required')

    const { error } = await supabase.from('cart').insert({
      user_id: user.id,
      product_id: productId,
      quantity: 1,
    })

    if (error) return toast.error('Failed to add to cart')

    toast.success('Added to cart!')
  }

  // ✅ TOGGLE WISHLIST
  const toggleWishlist = async (productId: string) => {
    if (!user) return toast.error('Login required')

    if (wishlist.includes(productId)) {
      await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId)

      setWishlist((prev) => prev.filter((id) => id !== productId))
      toast('Removed from wishlist')
    } else {
      await supabase.from('wishlist').insert({
        user_id: user.id,
        product_id: productId,
      })

      setWishlist((prev) => [...prev, productId])
      toast('Added to wishlist')
    }
  }

  // ✅ LOADING STATES
  if (loading || loadingProducts) {
    return <p className='p-6'>Loading products...</p>
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

        {/* EMPTY STATE */}
        {products.length === 0 && (
          <p className='text-gray-500'>No products found</p>
        )}

        {/* GRID */}
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8'>
          {products.map((product) => (
            <div
              key={product.id}
              className='group bg-white rounded-2xl border hover:shadow-xl transition overflow-hidden relative'
            >
              {/* Wishlist */}
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center ${
                  wishlist.includes(product.id)
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-200'
                }`}
              >
                ♥
              </button>

              {/* Image */}
              <Link href={`/product/${product.id}`}>
                <img
                  src={product.image_url || '/placeholder.png'}
                  alt={product.name}
                  className='w-full h-52 object-cover'
                />
              </Link>

              {/* Content */}
              <div className='p-4'>
                <p className='text-xs text-gray-400'>
                  {product.vendors?.[0]?.store_name || 'Unknown Vendor'}
                </p>

                <h3 className='font-semibold text-gray-900'>{product.name}</h3>

                <p className='text-sm text-gray-500 line-clamp-2'>
                  {product.description}
                </p>

                {/* Rating */}
                <div className='mt-2 text-yellow-400 text-sm'>
                  {'★'.repeat(Math.round(product.rating || 0))}
                  {'☆'.repeat(5 - Math.round(product.rating || 0))}
                  <span className='text-gray-400 ml-1'>
                    ({product.reviews_count || 0})
                  </span>
                </div>

                {/* Footer */}
                <div className='mt-4 flex justify-between items-center'>
                  <span className='text-[#10b5cb] font-bold'>
                    ${product.price}
                  </span>

                  <button
                    onClick={() => addToCart(product.id)}
                    className='text-xs border px-3 py-1 rounded'
                  >
                    Add
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
