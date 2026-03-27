'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Image from 'next/image'
import Link from 'next/link'

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
  rating: number
  latitude: number
  longitude: number
  products: Product[]
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

  // ✅ Image helper
  const getImageUrl = (bucket: string, path: string | null) => {
    if (!path) return '/placeholder.jpg'
    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    return data.publicUrl
  }

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

  // ✅ Haversine formula (distance in KM)
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
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  // ✅ Fetch vendors
  const fetchVendors = async () => {
    setLoading(true)

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

    if (product) {
      query = query.ilike('products.name', `%${product}%`)
    }

    if (category) {
      query = query.eq('products.category', category)
    }

    const { data, error } = await query

    if (error) {
      console.error(error.message)
      setLoading(false)
      return
    }

    let result: Vendor[] = data || []

    // ✅ Distance + Sorting
    if (coords) {
      result = result
        .map((vendor) => {
          const distance = getDistance(
            coords.lat,
            coords.lng,
            vendor.latitude,
            vendor.longitude,
          )

          return {
            ...vendor,
            distance,
          }
        })
        .sort((a, b) => a.distance - b.distance)
    }

    setVendors(result)
    setLoading(false)
  }

  // ✅ Debounced auto search
  useEffect(() => {
    const delay = setTimeout(() => {
      fetchVendors()
    }, 400)

    return () => clearTimeout(delay)
  }, [search, location, category, product, coords])

  return (
    <div className='p-6 bg-white min-h-screen'>
      <h1 className='text-2xl font-bold mb-6 text-[#10b5cb]'>Find Vendors</h1>

      {/* 🔍 Filters */}
      <div className='grid md:grid-cols-5 gap-4 mb-6'>
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

        <input
          placeholder='Product...'
          value={product}
          onChange={(e) => setProduct(e.target.value)}
          className='border p-2 rounded'
        />

        <input
          placeholder='Category...'
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className='border p-2 rounded'
        />

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
            <Link
              key={vendor.id}
              href={`/vendors/${vendor.id}`}
              className='border rounded-lg overflow-hidden hover:shadow-lg transition'
            >
              <div className='relative h-40'>
                <Image
                  src={getImageUrl('vendor-banners', vendor.banner_url)}
                  alt='banner'
                  fill
                  className='object-cover'
                />
              </div>

              <div className='p-4'>
                <div className='flex items-center gap-2 mb-2'>
                  <Image
                    src={getImageUrl('vendor-logos', vendor.logo_url)}
                    alt='logo'
                    width={35}
                    height={35}
                    className='rounded-full'
                  />
                  <h3 className='font-semibold'>{vendor.store_name}</h3>
                </div>

                <p className='text-sm text-gray-500 line-clamp-2'>
                  {vendor.description}
                </p>

                <div className='flex justify-between mt-2 text-sm'>
                  <span>{vendor.location}</span>
                  <span>⭐ {vendor.rating || 0}</span>
                </div>

                {/* 📍 Distance */}
                {coords && (
                  <p className='text-xs mt-1 text-[#10b5cb]'>
                    {(vendor as Vendor & { distance: number }).distance.toFixed(
                      2,
                    )}{' '}
                    km away
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
