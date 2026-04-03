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
  latitude: number
  longitude: number
  products: Product[]
  rating?: number
  ratingCount?: number
  distance?: number
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [search, setSearch] = useState('')
  const [location, setLocation] = useState('')
  const [category, setCategory] = useState('')
  const [product, setProduct] = useState('')
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  )
  const [loading, setLoading] = useState(true)

  const VendorsMap = dynamic(() => import('@/components/vendor/VendorsMap'), {
    ssr: false,
  })

  // ✅ Get user location
  const getUserLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        })
      },
      (err) => console.error(err.message),
    )
  }

  // ✅ Distance formula
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

  // ✅ Fetch ratings separately
  const attachRatings = async (vendorsData: Vendor[]) => {
    const { data: ratings } = await supabase
      .from('vendor_ratings')
      .select('vendor_id, rating')

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

  // ✅ Main fetch
  const fetchVendors = async () => {
    setLoading(true)

    try {
      let vendorsData: Vendor[] = []

      // 🔥 CASE 1: Nearby vendors (RPC)
      if (coords) {
        const { data, error } = await supabase.rpc('nearby_vendors', {
          user_lat: coords.lat,
          user_lng: coords.lng,
          radius_km: 10,
        })

        if (error) throw error
        vendorsData = data || []
      } else {
        // 🔥 CASE 2: Normal query
        let query = supabase.from('vendors').select(`
          *,
          products (
            name,
            category
          )
        `)

        if (search) query = query.ilike('store_name', `%${search}%`)
        if (location) query = query.ilike('location', `%${location}%`)
        if (product) query = query.ilike('products.name', `%${product}%`)
        if (category) query = query.eq('products.category', category)

        const { data, error } = await query
        if (error) throw error

        vendorsData = data || []
      }

      // ✅ Attach ratings
      let result = await attachRatings(vendorsData)

      // ✅ Add distance if coords exist
      if (coords) {
        result = result
          .map((v) => ({
            ...v,
            distance: getDistance(
              coords.lat,
              coords.lng,
              v.latitude,
              v.longitude,
            ),
          }))
          .sort((a, b) => (a.distance || 0) - (b.distance || 0))
      }

      setVendors(result)
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  // ✅ Debounce
  useEffect(() => {
    const delay = setTimeout(fetchVendors, 400)
    return () => clearTimeout(delay)
  }, [search, location, category, product, coords])

  return (
    <div className='p-6 bg-white min-h-screen'>
      <h1 className='text-2xl font-bold mb-6 text-[#10b5cb]'>Find Vendors</h1>

      {/* Filters */}
      <div className='grid md:grid-cols-4 gap-4 mb-6'>
        <input
          placeholder='Store name...'
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

        {/* <input
          placeholder='Product...'
          value={product}
          onChange={(e) => setProduct(e.target.value)}
          className='border p-2 rounded'
        /> */}

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className='border p-2 rounded'
        >
          <option value=''>All Categories</option>
          <option value='electronics'>Electronics</option>
          <option value='fashion'>Fashion</option>
          <option value='furniture'>Furniture</option>
          <option value='food'>Food</option>
        </select>

        <button
          onClick={getUserLocation}
          className='bg-[#10b5cb] text-white rounded px-4 py-2 hover:opacity-90'
        >
          Use My Location
        </button>
      </div>

      {/* Vendors */}
      {loading ? (
        <p>Loading...</p>
      ) : vendors.length === 0 ? (
        <p>No vendors found.</p>
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
