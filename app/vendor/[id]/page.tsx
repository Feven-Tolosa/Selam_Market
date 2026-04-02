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

      setProducts(productData || [])

      // ⭐ Load ratings
      const { data: ratings } = await supabase
        .from('vendor_ratings')
        .select('rating')

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

  // 🛒 ADD TO CART
  const addToCart = async () => {
    const { data } = await supabase.auth.getUser()

    if (!data.user) {
      toast.error('Login required')
      return
    }

    await supabase.from('cart_items').insert({
      user_id: data.user.id,
      product_id: products[0]?.id,
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
                      onClick={addToCart}
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
