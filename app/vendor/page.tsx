'use client'

import { useEffect, useMemo, useState } from 'react'
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

  const VendorsMap = dynamic(() => import('@/components/vendor/VendorsMap'), {
    ssr: false,
  })

  // ✅ Auto detect location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        })
      },
      () => {
        console.log('Location denied → fallback to normal search')
      },
    )
  }, [])

  // ✅ Distance formula (safe)
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

  // ✅ Attach ratings (optimized)
  const attachRatings = async (vendorsData: Vendor[]) => {
    if (vendorsData.length === 0) return vendorsData

    const vendorIds = vendorsData.map((v) => v.id)

    const { data: ratings, error } = await supabase
      .from('vendor_ratings')
      .select('vendor_id, rating')
      .in('vendor_id', vendorIds)

    if (error) {
      console.error('Ratings error:', error)
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

  // ✅ Remove duplicate vendors (important!)
  const dedupeVendors = (vendors: Vendor[]) => {
    const map = new Map<string, Vendor>()
    vendors.forEach((v) => {
      if (!map.has(v.id)) {
        map.set(v.id, v)
      }
    })
    return Array.from(map.values())
  }

  // ✅ Fetch vendors
  const fetchVendors = async () => {
    setLoading(true)

    try {
      let vendorsData: Vendor[] = []

      // 🔥 STEP 1: Try nearby vendors
      if (coords) {
        const { data, error } = await supabase.rpc('nearby_vendors', {
          user_lat: coords.lat,
          user_lng: coords.lng,
          radius_km: 20, // 🔥 increased radius
        })

        if (error) {
          console.error('RPC error:', error)
        }

        vendorsData = data || []

        console.log('Nearby vendors:', vendorsData)

        // 🔥 fallback if empty
        if (vendorsData.length === 0) {
          console.warn('No nearby vendors → fallback to all vendors')
        }
      }

      // 🔥 STEP 2: fallback OR no coords
      if (!coords || vendorsData.length === 0) {
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

        vendorsData = data || []

        console.log('Fallback vendors:', vendorsData)
      }

      // 🔥 STEP 3: safer search filtering (client-side)
      if (search) {
        vendorsData = vendorsData.filter((v) =>
          v.store_name?.toLowerCase().includes(search.toLowerCase()),
        )
      }

      // 🔥 STEP 4: dedupe
      vendorsData = dedupeVendors(vendorsData)

      let result = await attachRatings(vendorsData)

      // 🔥 STEP 5: distance (safe)
      if (coords) {
        result = result
          .map((v) => {
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
          .sort((a, b) => (a.distance || 0) - (b.distance || 0))
      }

      console.log('FINAL vendors:', result)

      setVendors(result)
    } catch (err) {
      console.error('Fetch vendors error:', err)
    } finally {
      setLoading(false)
    }
  }

  // ✅ Debounce (stable)
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchVendors()
    }, 400)

    return () => clearTimeout(timeout)
  }, [search, location, coords])

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

      {/* Vendors */}
      {loading ? (
        <p>Loading...</p>
      ) : vendors.length === 0 ? (
        <p className='text-gray-500'>
          No vendors found. Try changing location or search.
        </p>
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
