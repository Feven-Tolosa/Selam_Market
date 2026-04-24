'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import dynamic from 'next/dynamic'
import VendorCard from '@/components/vendor/VendorCard'

interface Product {
  name: string
  category: string
}

interface Vendor {
  id: string
  store_name: string
  description: string
  banner_url: string
  logo_url: string
  location: string
  latitude: number | null
  longitude: number | null
  products: Product[]
  rating?: number
  ratingCount?: number
  distance?: number
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [search, setSearch] = useState('')
  const [location, setLocation] = useState('')
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  )
  const [loading, setLoading] = useState(true)

  const [nearbyOnly, setNearbyOnly] = useState(false)
  const MAX_DISTANCE_KM = 20

  const VendorsMap = dynamic(() => import('@/components/vendor/VendorsMap'), {
    ssr: false,
  })

  // 📍 Get user location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        })
      },
      () => console.log('Location denied'),
    )
  }, [])

  // 📏 Distance formula (Haversine)
  const getDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ) => {
    const R = 6371
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2

    return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }

  // ⭐ Attach ratings
  const attachRatings = async (vendorsData: Vendor[]) => {
    if (vendorsData.length === 0) return vendorsData

    const vendorIds = vendorsData.map((v) => v.id)

    const { data: ratings, error } = await supabase
      .from('vendor_ratings')
      .select('vendor_id, rating')
      .in('vendor_id', vendorIds)

    if (error) {
      console.error(error)
      return vendorsData
    }

    const map: Record<string, { total: number; count: number }> = {}

    ratings?.forEach((r) => {
      if (!map[r.vendor_id]) {
        map[r.vendor_id] = { total: 0, count: 0 }
      }
      map[r.vendor_id].total += r.rating
      map[r.vendor_id].count++
    })

    return vendorsData.map((v) => {
      const stats = map[v.id]
      return {
        ...v,
        rating: stats ? stats.total / stats.count : 0,
        ratingCount: stats ? stats.count : 0,
      }
    })
  }

  // 🧹 Remove duplicates
  const dedupeVendors = (vendors: Vendor[]) => {
    const map = new Map<string, Vendor>()
    vendors.forEach((v) => {
      if (!map.has(v.id)) map.set(v.id, v)
    })
    return Array.from(map.values())
  }

  // 🚀 Fetch vendors (FIXED)
  const fetchVendors = async () => {
    setLoading(true)

    try {
      // STEP 1: fetch ALL vendors (no RPC!)
      let query = supabase.from('vendors').select(`
        *,
        products (
          name,
          category
        )
      `)

      if (search) {
        query = query.ilike('store_name', `%${search}%`)
      }

      if (location) {
        query = query.ilike('location', `%${location}%`)
      }

      const { data, error } = await query

      if (error) throw error

      let result: Vendor[] = data || []

      // STEP 2: dedupe
      result = dedupeVendors(result)

      // STEP 3: ratings
      result = await attachRatings(result)

      // STEP 4: distance calculation
      if (coords) {
        result = result.map((v) => {
          if (v.latitude == null || v.longitude == null) {
            return { ...v, distance: Infinity }
          }

          return {
            ...v,
            distance: getDistance(
              coords.lat,
              coords.lng,
              v.latitude,
              v.longitude,
            ),
          }
        })
      }

      // STEP 5: nearby filter (NOW WORKS)
      if (nearbyOnly && coords) {
        result = result
          .filter((v) => v.distance !== Infinity)
          .filter((v) => (v.distance || 0) <= MAX_DISTANCE_KM)
          .sort((a, b) => (a.distance || 0) - (b.distance || 0))
      } else if (coords) {
        // soft sorting only
        result.sort((a, b) => (a.distance || 0) - (b.distance || 0))
      }

      setVendors(result)
    } catch (err) {
      console.error('Fetch vendors error:', err)
    } finally {
      setLoading(false)
    }
  }

  // 🔁 re-fetch when filters change
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchVendors()
    }, 300)

    return () => clearTimeout(timeout)
  }, [search, location, coords, nearbyOnly])

  return (
    <div className='p-6 bg-white min-h-screen'>
      <h1 className='text-2xl font-bold mb-2 text-[#10b5cb]'>Find Vendors</h1>

      {/* Filters */}
      <div className='grid md:grid-cols-3 gap-4 mb-6'>
        <input
          placeholder='Search store...'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className='border p-2 rounded'
        />

        <input
          placeholder='Location...'
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className='border p-2 rounded'
        />

        <button
          onClick={() => setCoords(null)}
          className='bg-gray-200 text-sm px-4 py-2 rounded'
        >
          Clear Location
        </button>
      </div>

      {/* Nearby toggle */}
      <div className='flex items-center gap-4 mb-6'>
        <label className='flex items-center gap-2 cursor-pointer'>
          <input
            type='checkbox'
            checked={nearbyOnly}
            onChange={(e) => setNearbyOnly(e.target.checked)}
          />
          Nearby vendors 📍 (within {MAX_DISTANCE_KM} km)
        </label>
      </div>

      {/* Loading */}
      {loading ? (
        <p>Loading...</p>
      ) : vendors.length === 0 ? (
        <p className='text-gray-500'>No vendors found. Try changing filters.</p>
      ) : (
        <div className='grid sm:grid-cols-2 md:grid-cols-3 gap-6'>
          {vendors.map((vendor) => (
            <VendorCard key={vendor.id} vendor={vendor} />
          ))}
        </div>
      )}
    </div>
  )
}
