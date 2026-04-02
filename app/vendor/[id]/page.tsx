'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import Image from 'next/image'
import { useChatStore } from '@/store/chatStore'

type Vendor = {
  id: string
  store_name: string
  description: string
  email: string | null
  phone: string | null
  location: string | null
  logo_url: string | null
  banner_url: string | null
  latitude: number | null
  longitude: number | null
}

type Product = {
  id: string
  name: string
  price: number
  image_url: string | null
}

type Review = {
  id: string
  rating: number
  comment: string | null
  created_at: string
  user_id: string
  vendor_id: string
  edited?: boolean // ✅ new
}

type RatingStats = {
  vendor_id: string
  average_rating: number
  total_reviews: number
}

export default function VendorPublicPage() {
  const params = useParams()
  const router = useRouter()

  const rawId = params?.id
  const vendorId = Array.isArray(rawId) ? rawId[0] : rawId

  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const [logoUrl, setLogoUrl] = useState('/avatar-placeholder.png')
  const [bannerUrl, setBannerUrl] = useState('/banner-placeholder.jpg')
  const { openChat } = useChatStore()

  const [averageRating, setAverageRating] = useState<number>(0)
  const [userRating, setUserRating] = useState<number>(0)
  const [ratingLoading, setRatingLoading] = useState(false)

  const [reviews, setReviews] = useState<Review[]>([])
  const [comment, setComment] = useState('')
  const [stats, setStats] = useState<RatingStats | null>(null)
  const [showAllReviews, setShowAllReviews] = useState(false)

  useEffect(() => {
    if (!vendorId) return

    const loadData = async () => {
      setLoading(true)

      const { data: vendorData, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('id', vendorId)
        .single()

      if (error || !vendorData) {
        toast.error('Vendor not found')
        router.push('/')
        return
      }

      setVendor(vendorData)

      // ✅ Load logo
      if (vendorData.logo_url) {
        const { data } = supabase.storage
          .from('vendor-logos')
          .getPublicUrl(vendorData.logo_url)

        setLogoUrl(data.publicUrl)
      }

      // ✅ Load banner
      if (vendorData.banner_url) {
        const { data } = supabase.storage
          .from('vendor-banners')
          .getPublicUrl(vendorData.banner_url)

        setBannerUrl(data.publicUrl)
      }

      // ✅ Load products
      const { data: productData } = await supabase
        .from('products')
        .select('id,name,price,image_url')
        .eq('vendor_id', vendorData.id)

      setProducts(productData ?? [])

      // ⭐ Load ratings
      const { data: ratings } = await supabase
        .from('vendor_ratings')
        .select('rating')
        .eq('vendor_id', vendorData.id)

      if (ratings && ratings.length > 0) {
        const avg =
          ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
        setAverageRating(Number(avg.toFixed(1)))
      }

      // ✅ Get current user's rating
      const { data: userData } = await supabase.auth.getUser()

      if (userData.user) {
        const { data: myRating } = await supabase
          .from('vendor_ratings')
          .select('rating')
          .eq('vendor_id', vendorData.id)
          .eq('user_id', userData.user.id)
          .single()

        if (myRating) {
          setUserRating(myRating.rating)
        }
      }

      // ⭐ Fetch reviews
      const { data: reviewData } = await supabase
        .from('vendor_ratings')
        .select('*')
        .eq('vendor_id', vendorData.id)
        .order('created_at', { ascending: false })

      setReviews((reviewData ?? []) as Review[])

      // 📊 Fetch stats
      const { data: statsData } = await supabase
        .from('vendor_rating_stats')
        .select('*')
        .eq('vendor_id', vendorData.id)
        .single()

      if (statsData) {
        setStats(statsData as RatingStats)
      }

      setLoading(false)
    }

    loadData()
  }, [vendorId, router])

  const handleRating = async (value: number) => {
    const { data } = await supabase.auth.getUser()

    if (!data.user) {
      toast.error('Login required')
      return
    }

    setRatingLoading(true)

    const { error } = await supabase.from('vendor_ratings').upsert({
      vendor_id: vendor?.id,
      user_id: data.user.id,
      rating: value,
    })

    if (error) {
      toast.error('Failed to rate')
    } else {
      setUserRating(value)
      toast.success('Rating submitted ⭐')
    }

    setRatingLoading(false)
  }

  // ✅ FIXED: now properly outside
  const submitReview = async (value: number) => {
    const { data } = await supabase.auth.getUser()

    if (!data.user) {
      toast.error('Login required')
      return
    }

    if (!vendor) {
      toast.error('Vendor not loaded')
      return
    }

    if (!comment.trim()) {
      toast.error('Comment cannot be empty')
      return
    }

    // 🔍 check if user already reviewed
    const existing = reviews.find((r) => r.user_id === data.user.id)

    const { error } = await supabase.from('vendor_ratings').upsert(
      {
        vendor_id: vendor.id,
        user_id: data.user.id,
        rating: value,
        comment,
      },
      {
        onConflict: 'vendor_id,user_id',
      },
    )

    if (error) {
      console.error(error)
      toast.error(error.message)
      return
    }

    const newReview = {
      id: existing?.id || crypto.randomUUID(),
      rating: value,
      comment,
      created_at: new Date().toISOString(),
      user_id: data.user.id,
      vendor_id: vendor.id,
      edited: !!existing, // ✅ mark edited
    }

    // ✅ prevent duplicate + replace old review
    const updatedReviews = existing
      ? reviews.map((r) => (r.user_id === data.user!.id ? newReview : r))
      : [newReview, ...reviews]

    setReviews(updatedReviews)

    // ⚡ auto update average rating
    const avg =
      updatedReviews.reduce((sum, r) => sum + r.rating, 0) /
      updatedReviews.length

    setAverageRating(Number(avg.toFixed(1)))

    toast.success(existing ? 'Review updated ✏️' : 'Review submitted ⭐')

    setComment('')
  }

  // 🛒 ADD TO CART
  const addToCart = async (productId: string) => {
    const { data } = await supabase.auth.getUser()

    if (!data.user) {
      toast.error('Login required')
      return
    }

    await supabase.from('cart_items').insert({
      user_id: data.user.id,
      product_id: productId,
      quantity: 1,
    })

    toast.success('Added to cart 🛒')
  }

  if (loading) {
    return <p className='p-10'>Loading...</p>
  }

  if (!vendor) return <p className='p-10'>Vendor not found</p>

  return (
    <div className='max-w-7xl mx-auto pb-10'>
      {/* 🖼️ BANNER */}
      <div className='relative h-56 w-full bg-gray-200'>
        <Image src={bannerUrl} alt='banner' fill className='object-cover' />
      </div>

      {/* 🧾 HEADER */}
      <div className='flex items-center gap-6 px-6 overflow-auto mt-12'>
        <Image
          width={100}
          height={100}
          src={logoUrl}
          alt='logo'
          className='rounded-full border-4 border-white object-cover'
        />

        <div>
          <h1 className='text-3xl font-bold'>{vendor.store_name}</h1>
          <p className='text-gray-500'>{vendor.location}</p>
        </div>
      </div>

      {/* 📄 INFO */}
      <div className='grid md:grid-cols-3 gap-8 px-6 mt-8'>
        {/* LEFT */}
        <div className='md:col-span-2 space-y-6'>
          <div className='bg-white border p-6 rounded-xl'>
            <h2 className='font-semibold text-lg mb-2'>About Store</h2>
            <p className='text-gray-700'>{vendor.description}</p>
          </div>

          {/* 🛍️ PRODUCTS */}
          <div>
            <h2 className='text-xl font-semibold mb-4'>Products</h2>

            {products.length === 0 && (
              <p className='text-gray-500'>No products yet</p>
            )}

            <div className='grid grid-cols-2 md:grid-cols-3 gap-6'>
              {products.map((product) => (
                <div
                  key={product.id}
                  className='border rounded-xl overflow-hidden bg-white hover:shadow-md transition'
                >
                  <div className='h-40 bg-gray-100'>
                    <Image
                      alt={product.name}
                      width={300}
                      height={300}
                      src={product.image_url ?? '/placeholder.png'}
                      className='w-full h-full object-cover hover:scale-105 transition hover:shadow-lg ease-in-out duration-300'
                    />
                  </div>

                  <div className='p-3'>
                    <Link href={`/products/${product.id}`}>
                      <h3 className='text-sm font-medium'>{product.name}</h3>

                      <p className='text-[#10b5cb] font-semibold mt-1'>
                        ${product.price}
                      </p>
                    </Link>

                    <button
                      onClick={() => addToCart(product.id)}
                      className='mt-3 w-full bg-[#10b5cb] text-white py-2 rounded'
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className='space-y-6'>
          {/* CONTACT */}
          <div className='bg-white border p-6 rounded-xl'>
            <h2 className='font-semibold mb-3'>Contact</h2>

            <p className='text-sm'>📧 {vendor.email}</p>
            <p className='text-sm'>📞 {vendor.phone}</p>
            <p className='text-sm'>📍 {vendor.location}</p>
          </div>

          {/* ⭐ RATING */}
          <div className='bg-white border p-6 rounded-xl'>
            <h2 className='font-semibold mb-3'>Rating</h2>

            <p className='text-sm text-gray-500 mb-2'>
              Average Rating: ⭐ {averageRating || 'No ratings yet'}
            </p>

            <div className='flex gap-2'>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  disabled={ratingLoading}
                  onClick={() => handleRating(star)}
                  className={`text-2xl transition ${
                    star <= userRating ? 'text-yellow-400' : 'text-gray-300'
                  } hover:scale-110`}
                >
                  ★
                </button>
              ))}
            </div>

            <p className='text-xs text-gray-400 mt-2'>
              Tap a star to rate this vendor
            </p>
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder='Write your review...'
            className='w-full border rounded p-2 mt-3 text-sm'
          />

          <button
            onClick={() => submitReview(userRating || 5)}
            className='mt-3 w-full bg-[#10b5cb] text-white py-2 rounded'
          >
            Submit Review
          </button>

          <div className='bg-white border p-6 rounded-xl mt-6'>
            <h2 className='font-semibold mb-4'>Customer Reviews</h2>

            {reviews.length === 0 && (
              <p className='text-gray-500'>No reviews yet</p>
            )}

            <div className='space-y-4'>
              {(showAllReviews ? reviews : reviews.slice(0, 3)).map((r) => (
                <div key={r.id} className='border-b pb-3'>
                  <p className='text-yellow-400'>
                    {'★'.repeat(r.rating)}
                    {'☆'.repeat(5 - r.rating)}
                  </p>

                  {r.comment && (
                    <p className='text-sm text-gray-700 mt-1'>{r.comment}</p>
                  )}

                  <p className='text-xs text-gray-400 mt-1'>
                    {new Date(r.created_at).toLocaleDateString()}
                  </p>
                  {r.edited && (
                    <p className='text-xs text-gray-400 italic'>Edited</p>
                  )}
                </div>
              ))}
              {reviews.length > 3 && (
                <button
                  onClick={() => setShowAllReviews(!showAllReviews)}
                  className='text-sm text-[#10b5cb] mt-2 flex items-center gap-1'
                >
                  {showAllReviews ? 'Show less ▲' : 'Show all ▼'}
                </button>
              )}
            </div>
          </div>

          {/* ACTIONS */}
          <div className='bg-white border p-6 rounded-xl space-y-3'>
            <button
              onClick={() => openChat(vendor.id)}
              className='w-full bg-[#10b5cb] text-white py-2 rounded flex items-center justify-center gap-2 ease-in-out duration-300 hover:scale-105 transition'
            >
              💬 Chat Vendor
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
