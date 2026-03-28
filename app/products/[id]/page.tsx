'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useParams, useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Image from 'next/image'
import Link from 'next/link'

type Product = {
  id: string
  name: string
  description: string
  price: number
  category: string
  image_url: string | null
  images: string[] | null
  vendor_id: string
}

type Vendor = {
  id: string
  store_name: string
}

type Review = {
  id: string
  rating: number
  comment: string
  created_at: string
}

export default function ProductPage() {
  const { id } = useParams()
  const router = useRouter()

  const [product, setProduct] = useState<Product | null>(null)
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      if (!id) return

      const { data: productData, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !productData) {
        toast.error('Product not found')
        router.push('/')
        return
      }

      setProduct(productData)

      const { data: vendorData } = await supabase
        .from('vendors')
        .select('id, store_name')
        .eq('id', productData.vendor_id)
        .single()

      setVendor(vendorData || null)

      const { data: reviewData } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productData.id)
        .order('created_at', { ascending: false })

      setReviews(reviewData || [])
      setLoading(false)
    }

    loadData()
  }, [id, router])

  // 🛒 ADD TO CART
  const addToCart = async () => {
    const { data } = await supabase.auth.getUser()

    if (!data.user) {
      toast.error('Login required')
      return
    }

    await supabase.from('cart_items').insert({
      user_id: data.user.id,
      product_id: product?.id,
      quantity: 1,
    })

    toast.success('Added to cart 🛒')
  }

  // ❤️ WISHLIST
  const addToWishlist = async () => {
    const { data } = await supabase.auth.getUser()

    if (!data.user) return

    await supabase.from('wishlist').insert({
      user_id: data.user.id,
      product_id: product?.id,
    })

    toast.success('Saved ❤️')
  }

  // ⭐ ADD REVIEW
  const addReview = async () => {
    const { data } = await supabase.auth.getUser()

    if (!data.user) {
      toast.error('Login required')
      return
    }

    await supabase.from('reviews').insert({
      user_id: data.user.id,
      product_id: product?.id,
      rating: 5,
      comment: 'Great product!',
    })

    toast.success('Review added ⭐')
  }

  if (loading) {
    return (
      <div className='p-10 grid md:grid-cols-2 gap-8 animate-pulse'>
        <div className='h-[400px] bg-gray-200 rounded-xl' />
        <div className='space-y-4'>
          <div className='h-8 w-2/3 bg-gray-200 rounded' />
          <div className='h-6 w-1/3 bg-gray-200 rounded' />
        </div>
      </div>
    )
  }

  if (!product) return <p className='p-10'>Product not found</p>

  return (
    <div className='max-w-7xl mx-auto px-6 py-10 space-y-10'>
      {/* TOP SECTION */}
      <div className='grid md:grid-cols-2 gap-12'>
        {/* 🖼️ IMAGE GALLERY */}
        <div className='space-y-4'>
          <div className='rounded-xl overflow-hidden shadow'>
            <Image
              src={selectedImage || product.image_url || '/placeholder.png'}
              alt={product.name}
              width={700}
              height={700}
              className='w-full h-[450px] object-cover hover:scale-105 transition hover:shadow-lg ease-in-out duration-300'
            />
          </div>

          <div className='flex gap-3'>
            {(product.images && product.images.length > 0
              ? product.images
              : [product.image_url]
            ).map((img) => (
              <Image
                key={img || ''}
                src={img || '/placeholder.png'}
                alt='thumb'
                width={80}
                height={80}
                onClick={() => setSelectedImage(img)}
                className='cursor-pointer rounded-lg border hover:scale-105 transition'
              />
            ))}
          </div>
        </div>

        {/* 📦 PRODUCT INFO */}
        <div className='space-y-6'>
          <h1 className='text-4xl font-bold'>{product.name}</h1>

          <p className='text-3xl text-[#10b5cb] font-semibold'>
            ${product.price.toFixed(2)}
          </p>

          <span className='bg-gray-100 px-3 py-1 rounded-full text-sm'>
            {product.category}
          </span>

          {vendor && (
            <Link
              href={`/store/${vendor.id}`}
              className='block text-blue-600 hover:underline'
            >
              {vendor.store_name}
            </Link>
          )}

          <p className='text-green-600 font-medium'>✔ In stock</p>

          {/* DELIVERY */}
          <div className='bg-gray-50 p-4 rounded-xl text-sm'>
            <p>🚚 Ships in 2–3 days</p>
            <p>💳 Cash on delivery available</p>
          </div>

          <p className='text-gray-700'>{product.description}</p>

          {/* ACTIONS */}
          <div className='flex gap-4 flex-wrap'>
            <button
              onClick={addToCart}
              className='px-8 py-3 bg-[#10b5cb] text-white rounded-xl hover:opacity-90'
            >
              Add to Cart
            </button>

            <button
              onClick={addToWishlist}
              className='px-6 py-3 border rounded-xl hover:bg-gray-100'
            >
              ⩎ Save
            </button>

            {vendor && (
              <Link
                href={`/chat/${vendor.id}?product=${product.id}`}
                className='px-6 py-3 bg-[#10b5cb] text-white rounded-xl'
              >
                💬 Chat
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ⭐ REVIEWS */}
      <div>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-xl font-semibold'>Reviews</h2>

          <button
            onClick={addReview}
            className='text-sm bg-gray-200 px-3 py-1 rounded'
          >
            Add Review
          </button>
        </div>

        {reviews.length === 0 && (
          <p className='text-gray-500'>No reviews yet</p>
        )}

        <div className='space-y-4'>
          {reviews.map((r) => (
            <div key={r.id} className='border-b pb-3'>
              <p className='text-yellow-500'>⭐ {r.rating}/5</p>
              <p className='text-gray-700'>{r.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
