'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import VendorCard from '../vendor/VendorCard'

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
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(1) // 1 = right, -1 = left
  const [visibleCards, setVisibleCards] = useState(3)
  const extendedVendors = [...vendors, ...vendors, ...vendors]

  const getImageUrl = (bucket: string, path: string | null | undefined) => {
    if (!path) return '/placeholder.jpg'
    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    return data.publicUrl || '/placeholder.jpg'
  }

  const fetchTopVendors = async () => {
    const { data: vendorsData, error: vendorsError } = await supabase
      .from('vendors')
      .select('*')
      .limit(12)

    if (vendorsError) {
      console.error('Error fetching vendors:', vendorsError.message)
      setLoading(false)
      return
    }

    const { data: ratingsData, error: ratingsError } = await supabase
      .from('vendor_ratings')
      .select('vendor_id, rating')

    if (ratingsError) {
      console.error('Error fetching ratings:', ratingsError.message)
      setLoading(false)
      return
    }

    const ratingMap: Record<string, { total: number; count: number }> = {}
    ratingsData?.forEach((r) => {
      if (!ratingMap[r.vendor_id]) {
        ratingMap[r.vendor_id] = { total: 0, count: 0 }
      }
      ratingMap[r.vendor_id].total += r.rating
      ratingMap[r.vendor_id].count += 1
    })

    const vendorsWithRatings = vendorsData.map((vendor) => ({
      ...vendor,
      rating: ratingMap[vendor.id] ? ratingMap[vendor.id].total / ratingMap[vendor.id].count : 0,
    }))

    vendorsWithRatings.sort((a, b) => b.rating - a.rating)
    setVendors(vendorsWithRatings)
    setCurrentIndex(vendorsWithRatings.length)
    setLoading(false)
  }

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setVisibleCards(1)
      } else if (window.innerWidth < 768) {
        setVisibleCards(2)
      } else {
        setVisibleCards(3)
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    fetchTopVendors()
  }, [])

  // Smooth back-and-forth animation
  useEffect(() => {
    if (vendors.length === 0) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const maxIndex = vendors.length * 2 - visibleCards
        const minIndex = vendors.length
        const next = prev + direction

        // Change direction at boundaries
        if (next > maxIndex) {
          setDirection(-1)
          return prev - 1
        } else if (next < minIndex) {
          setDirection(1)
          return prev + 1
        }
        return next
      })
    }, 2500) // Move every 2.5 seconds

    return () => clearInterval(interval)
  }, [vendors.length, direction, visibleCards])

  if (loading) {
    return (
      <div className='py-10 px-4 text-center'>
        <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#10b5cb]'></div>
        <p className='mt-2 text-gray-500'>Loading vendors...</p>
      </div>
    )
  }

  if (vendors.length === 0) {
    return null
  }

  return (
    <section className='py-10 px-4 overflow-hidden'>
      {/* Section header */}
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4'>
        <div>
          <h2 className='text-3xl font-bold text-gray-900'>Popular Vendors</h2>
          <p className='text-gray-500 mt-1 text-sm'>
            Discover trusted local vendors and explore their products.
          </p>
        </div>
        
        <Link href='/vendor' className='text-sm font-medium text-[#10b5cb] hover:underline'>
          View all →
        </Link>
      </div>

      {/* Auto-sliding Carousel */}
      <div className='relative overflow-hidden'>
        <div
          className='flex transition-transform duration-700 ease-in-out gap-6'
          style={{
            transform: `translateX(-${currentIndex * (100 / visibleCards)}%)`,
          }}
        >
          {extendedVendors.map((vendor, idx) => (
            <div
              key={`${vendor.id}-${idx}`}
              className='flex-shrink-0 transition-all duration-300 hover:scale-105'
              style={{ width: `calc(${100 / visibleCards}% - ${(visibleCards - 1) * 24 / visibleCards}px)` }}
            >
              <VendorCard vendor={vendor} />
            </div>
          ))}
        </div>
      </div>

      {/* Simple direction indicator */}
      <div className='flex justify-center mt-6'>
        <div className='flex gap-1 text-gray-400 text-xs'>
          <span className={direction === -1 ? 'text-[#10b5cb] font-bold' : ''}>←</span>
          <span>Auto-sliding</span>
          <span className={direction === 1 ? 'text-[#10b5cb] font-bold' : ''}>→</span>
        </div>
      </div>
    </section>
  )
}