'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import Link from 'next/link'

// --------------------
// TYPES
// --------------------

type Vendor = {
  id: string
  store_name: string
  description: string | null
  email: string | null
  phone: string | null
  location: string | null
  latitude: number | null
  longitude: number | null
  logo_url: string | null
  banner_url: string | null
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
}

// ✅ Strict tab type
const tabs = ['products', 'reviews', 'about'] as const
type Tab = (typeof tabs)[number]

// --------------------
// COMPONENT
// --------------------

export default function VendorPublicPage({
  params,
}: {
  params: { id: string }
}) {
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [activeTab, setActiveTab] = useState<Tab>('products')
  const [loading, setLoading] = useState<boolean>(true)

  // Review form state
  const [newRating, setNewRating] = useState<number>(5)
  const [newComment, setNewComment] = useState<string>('')
  const [submitting, setSubmitting] = useState<boolean>(false)

  const MapView = dynamic(() => import('@/components/vendor/MapView'), {
    ssr: false,
  })

  // --------------------
  // FETCH DATA
  // --------------------
  useEffect(() => {
    if (!params?.id) return

    async function fetchData(): Promise<void> {
      try {
        setLoading(true)

        // Vendor
        const { data: vendorData, error: vendorError } = await supabase
          .from('vendors')
          .select('*')
          .eq('id', params.id)
          .single()

        if (vendorError || !vendorData) {
          console.error(vendorError?.message || 'Vendor not found')
          setVendor(null)
          return
        }

        setVendor(vendorData)

        // Products
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('id,name,price,image_url')
          .eq('vendor_id', params.id)

        if (productError) {
          console.error(productError.message)
          setProducts([])
        } else {
          setProducts(productData ?? [])
        }

        // Reviews
        const { data: reviewData, error: reviewError } = await supabase
          .from('reviews')
          .select('id,rating,comment,created_at')
          .eq('vendor_id', params.id)
          .order('created_at', { ascending: false })

        if (reviewError) {
          console.error(reviewError.message)
          setReviews([])
        } else {
          setReviews(reviewData ?? [])
        }
      } catch (error) {
        console.error('Unexpected error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params?.id])

  // --------------------
  // SUBMIT REVIEW
  // --------------------
  async function handleSubmitReview(): Promise<void> {
    if (!vendor) return

    setSubmitting(true)

    try {
      const { data: userData } = await supabase.auth.getUser()
      const user = userData.user

      if (!user) {
        alert('Please login to leave a review')
        return
      }

      const { error } = await supabase.from('reviews').insert({
        vendor_id: vendor.id,
        user_id: user.id,
        rating: newRating,
        comment: newComment,
      })

      if (error) {
        console.error(error.message)
        alert('Failed to submit review')
        return
      }

      // Refresh reviews
      const { data: updatedReviews } = await supabase
        .from('reviews')
        .select('id,rating,comment,created_at')
        .eq('vendor_id', vendor.id)
        .order('created_at', { ascending: false })

      setReviews(updatedReviews ?? [])
      setNewComment('')
      setNewRating(5)
    } finally {
      setSubmitting(false)
    }
  }

  // --------------------
  // COMPUTED VALUES
  // --------------------
  if (loading) return <p className='p-6'>Loading vendor...</p>
  if (!vendor)
    return (
      <p className='p-6 text-red-500'>Vendor with ID {params.id} not found</p>
    )

  const avgRating: string =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        ).toFixed(1)
      : '0.0'

  const logoUrl: string = vendor.logo_url
    ? supabase.storage.from('vendor-logos').getPublicUrl(vendor.logo_url).data
        .publicUrl
    : '/avatar-placeholder.png'

  const bannerUrl: string = vendor.banner_url
    ? supabase.storage.from('vendor-banners').getPublicUrl(vendor.banner_url)
        .data.publicUrl
    : '/banner-placeholder.jpg'

  // --------------------
  // RENDER
  // --------------------
  return (
    <div className='space-y-6'>
      {/* Banner */}
      <div className='relative h-56 w-full bg-gray-100'>
        <Image src={bannerUrl} alt='banner' fill className='object-cover' />
      </div>

      {/* Header */}
      <div className='max-w-6xl mx-auto px-4 -mt-16'>
        <div className='bg-white rounded-xl shadow p-6 flex items-center gap-6'>
          <Image
            src={logoUrl}
            alt='logo'
            width={100}
            height={100}
            className='rounded-full border-4 border-white object-cover'
          />
          <div>
            <h1 className='text-2xl font-bold'>{vendor.store_name}</h1>
            <p className='text-yellow-500 font-semibold'>
              ⭐ {avgRating} ({reviews.length} reviews)
            </p>
            {vendor.location && (
              <p className='text-gray-500'>{vendor.location}</p>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className='max-w-6xl mx-auto px-4'>
        <div className='flex gap-6 border-b'>
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 capitalize ${
                activeTab === tab
                  ? 'border-b-2 border-[#10b5cb] font-semibold'
                  : 'text-gray-500'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <div className='max-w-6xl mx-auto px-4'>
        {/* PRODUCTS */}
        {activeTab === 'products' && (
          <div className='grid grid-cols-2 md:grid-cols-4 gap-6 mt-4'>
            {products.map((product) => (
              <Link key={product.id} href={`/products/${product.id}`}>
                <div className='border rounded-xl overflow-hidden bg-white hover:shadow-md transition cursor-pointer'>
                  <div className='h-40 bg-gray-100'>
                    <img
                      src={product.image_url ?? '/placeholder.png'}
                      className='w-full h-full object-cover'
                    />
                  </div>
                  <div className='p-3'>
                    <h3 className='text-sm font-medium'>{product.name}</h3>
                    <p className='text-[#10b5cb] font-semibold'>
                      ${product.price}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* REVIEWS */}
        {activeTab === 'reviews' && (
          <div className='space-y-6 mt-4'>
            {/* REVIEW FORM */}
            <div className='border p-4 rounded space-y-3 bg-gray-50'>
              <h3 className='font-semibold'>Leave a Review</h3>

              <select
                value={newRating}
                onChange={(e) => setNewRating(Number(e.target.value))}
                className='border p-2 rounded w-full'
              >
                {[5, 4, 3, 2, 1].map((r) => (
                  <option key={r} value={r}>
                    {r} Stars
                  </option>
                ))}
              </select>

              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder='Write your review...'
                className='w-full border p-2 rounded'
              />

              <button
                onClick={handleSubmitReview}
                disabled={submitting}
                className='bg-[#10b5cb] text-white px-4 py-2 rounded'
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>

            {/* EXISTING REVIEWS */}
            {reviews.length === 0 ? (
              <p>No reviews yet</p>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className='border p-4 rounded'>
                  <p className='text-yellow-500'>⭐ {review.rating}</p>
                  {review.comment && <p>{review.comment}</p>}
                  <p className='text-xs text-gray-400'>
                    {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        )}

        {/* ABOUT */}
        {activeTab === 'about' && (
          <div className='space-y-4 mt-4'>
            {vendor.description && <p>{vendor.description}</p>}
            {vendor.latitude !== null && vendor.longitude !== null && (
              <div className='h-72 rounded-xl overflow-hidden'>
                <MapView lat={vendor.latitude} lng={vendor.longitude} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
