'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useParams, useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Image from 'next/image'
import ReportButton from '@/components/chat/ReportButton'

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

  //  NEW STATE
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

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

      await fetchReviews(productData.id)

      setLoading(false)
    }

    loadData()
  }, [id, router])

  //  FETCH REVIEWS (REUSABLE)
  const fetchReviews = async (productId: string) => {
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false })

    setReviews(data || [])
  }

  //  AVERAGE RATING
  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
        ).toFixed(1)
      : null

  //  ADD TO CART
  const addToCart = async () => {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) return toast.error('Login required')
    if (!product || !product.id) return toast.error('Invalid product')

    try {
      // 1 Get or create pending cart
      let { data: cart, error: cartError } = await supabase
        .from('carts')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .single()

      if (cartError && cartError.code === 'PGRST116') {
        // No cart exists → create one
        const { data: newCart, error: newCartError } = await supabase
          .from('carts')
          .insert({ user_id: user.id, status: 'pending' })
          .select()
          .single()

        if (newCartError || !newCart) {
          console.error('Failed to create cart', newCartError)
          return toast.error('Failed to create cart')
        }
        cart = newCart
      } else if (cartError) {
        console.error('Error fetching cart', cartError)
        return toast.error('Failed to fetch cart')
      }

      // 2 Insert product into cart_items
      const { data: existingItem } = await supabase
        .from('cart_items')
        .select('*')
        .eq('cart_id', cart.id)
        .eq('product_id', product.id)
        .single()

      if (existingItem) {
        // Increment quantity
        await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + 1 })
          .eq('id', existingItem.id)
      } else {
        // Insert new cart item
        await supabase.from('cart_items').insert({
          cart_id: cart.id, // must exist
          product_id: product.id, // must exist
          quantity: 1,
        })
      }

      toast.success('Added to cart 🛒')
    } catch (error) {
      console.error('Unexpected error', error)
      toast.error('Failed to add to cart')
    }
  }

  //  WISHLIST
  const addToWishlist = async () => {
    const { data } = await supabase.auth.getUser()

    if (!data.user) return

    await supabase.from('wishlist').insert({
      user_id: data.user.id,
      product_id: product?.id,
    })

    toast.success('Saved')
  }

  //  ADD REVIEW (REAL)
  const addReview = async () => {
    const { data } = await supabase.auth.getUser()

    if (!data.user) {
      toast.error('Login required')
      return
    }

    if (rating === 0) {
      toast.error('Please select a rating')
      return
    }

    setSubmitting(true)

    const { error } = await supabase.from('reviews').insert({
      user_id: data.user.id,
      product_id: product?.id,
      rating,
      comment,
    })

    setSubmitting(false)

    if (error) {
      toast.error('Failed to add review')
      return
    }

    toast.success('Review added ⭐')

    setRating(0)
    setComment('')

    if (product) {
      await fetchReviews(product.id)
    }
  }

  if (loading) return <p className='p-10'>Loading...</p>
  if (!product) return <p className='p-10'>Product not found</p>

  return (
    <div className='max-w-7xl mx-auto px-6 py-10 space-y-10'>
      {/* PRODUCT */}
      <div className='grid md:grid-cols-2 gap-12'>
        {/* IMAGES */}
        <div className='space-y-4'>
          <Image
            src={selectedImage || product.image_url || '/placeholder.png'}
            alt={product.name}
            width={700}
            height={700}
            className='rounded-xl object-cover transform ease-in-out duration-300 hover:scale-105'
          />

          <div className='flex gap-3'>
            {(product.images?.length
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
                className='cursor-pointer rounded-lg border'
              />
            ))}
          </div>
        </div>

        {/* INFO */}
        <div className='space-y-6'>
          <h1 className='text-4xl font-bold'>{product.name}</h1>

          {/* ⭐ AVG RATING */}
          {averageRating && (
            <p className='text-yellow-500 text-lg'>
              ⭐ {averageRating} ({reviews.length} reviews)
            </p>
          )}

          <p className='text-3xl text-[#10b5cb] font-semibold'>
            ${product.price.toFixed(2)}
          </p>

          <p>{product.description}</p>

          <div className='flex gap-4'>
            <button
              onClick={addToCart}
              className='bg-[#10b5cb] text-white px-6 py-2 rounded hover:bg-[#0e9aa7] transition'
            >
              Add to Cart
            </button>

            {/* <button
              onClick={addToWishlist}
              className='border border-[#10b5cb] text-[#10b5cb] px-6 py-2 rounded'
            >
              Save
            </button> */}
            <ReportButton type='product' targetId={product.id} />
          </div>
          {/* ⭐ REVIEW FORM */}
          <div className='bg-gray-50 p-6 rounded-xl space-y-4'>
            <h2 className='text-xl font-semibold'>Write a Review</h2>

            {/* ⭐ STAR SELECTOR */}
            <div className='flex gap-2 text-2xl'>
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => setRating(star)}>
                  {star <= rating ? '⭐' : '☆'}
                </button>
              ))}
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder='Write your review...'
              className='w-full border rounded-lg p-3'
            />

            <button
              onClick={addReview}
              disabled={submitting}
              className='bg-[#10b5cb] text-white px-6 py-2 rounded'
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>

          {/* ⭐ REVIEWS LIST */}
          <div>
            <h2 className='text-xl font-semibold mb-4'>Reviews</h2>

            {reviews.length === 0 && (
              <p className='text-gray-500'>No reviews yet</p>
            )}

            <div className='space-y-4'>
              {reviews.map((r) => (
                <div key={r.id} className='border-b pb-3'>
                  <p className='text-yellow-500'>⭐ {r.rating}/5</p>
                  <p>{r.comment}</p>
                  <p className='text-xs text-gray-400'>
                    {new Date(r.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
