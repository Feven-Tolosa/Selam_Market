'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Image from 'next/image'
import Link from 'next/link'

interface Vendor {
  id: string
  store_name: string
  description: string
  image_url: string | null
  banner_url: string
  logo_url: string
  location: string
  email: string
  phone: string
  latitude: number
  longitude: number
  created_at: string
  rating?: number
}

export default function TopVendors() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)

  const getImageUrl = (bucket: string, path: string | null | undefined) => {
    if (!path) return '/placeholder.jpg'

    const { data } = supabase.storage.from(bucket).getPublicUrl(path)

    return data.publicUrl || '/placeholder.jpg'
  }

  const fetchTopVendors = async () => {
    // Step 1: get vendors
    const { data: vendorsData, error: vendorsError } = await supabase
      .from('vendors')
      .select('*')
      .limit(6)

    if (vendorsError) {
      console.error('Error fetching vendors:', vendorsError.message)
      setLoading(false)
      return
    }

    // Step 2: get ratings grouped by vendor_id
    const { data: ratingsData, error: ratingsError } = await supabase
      .from('vendor_ratings')
      .select('vendor_id, rating')

    if (ratingsError) {
      console.error('Error fetching ratings:', ratingsError.message)
      setLoading(false)
      return
    }

    // Step 3: calculate averages
    const ratingMap: Record<string, { total: number; count: number }> = {}

    ratingsData.forEach((r) => {
      if (!ratingMap[r.vendor_id]) {
        ratingMap[r.vendor_id] = { total: 0, count: 0 }
      }
      ratingMap[r.vendor_id].total += r.rating
      ratingMap[r.vendor_id].count += 1
    })

    // Step 4: merge with vendors
    const vendorsWithRatings = vendorsData.map((vendor) => {
      const stats = ratingMap[vendor.id]

      return {
        ...vendor,
        rating: stats ? stats.total / stats.count : 0,
      }
    })

    // Optional: sort by rating
    vendorsWithRatings.sort((a, b) => b.rating - a.rating)

    setVendors(vendorsWithRatings)
    setLoading(false)
  }
  useEffect(() => {
    fetchTopVendors()
  }, [])

  if (loading) {
    return <p className='text-center py-10'>Loading vendors...</p>
  }

  return (
    <section className='py-10 px-4'>
      {/* Section header */}
      <div className='flex items-center justify-between mb-10'>
        <div>
          <h2 className='text-3xl font-bold text-gray-900'>Popular Vendors</h2>
          <p className='text-gray-500 mt-1 text-sm'>
            Discover trusted local vendors and explore their products.
          </p>
        </div>
        <Link
          href='/vendor'
          className='text-sm font-medium text-[#10b5cb] hover:underline'
        >
          View all →
        </Link>
      </div>
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'>
        {vendors.map((vendor) => (
          <Link
            key={vendor.id}
            href={`/vendor/${vendor.id}`}
            className='border rounded-xl overflow-hidden shadow hover:shadow-lg transition'
          >
            <div className='relative h-40'>
              <Image
                src={getImageUrl('vendor-banners', vendor.banner_url)}
                alt={vendor.store_name}
                fill
                className='object-cover'
              />
            </div>

            <div className='p-4'>
              <div className='flex items-center gap-3 mb-2'>
                <Image
                  src={getImageUrl('vendor-logos', vendor.logo_url)}
                  alt='logo'
                  width={40}
                  height={40}
                  className='rounded-full object-cover'
                />
                <h3 className='font-semibold'>{vendor.store_name}</h3>
              </div>

              <p className='text-sm text-gray-500 line-clamp-2'>
                {vendor.description}
              </p>

              <div className='mt-2 flex justify-between text-sm'>
                <span>{vendor.location}</span>
                <span>⭐ {(vendor.rating ?? 0).toFixed(1)}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
