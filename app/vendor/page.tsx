'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Image from 'next/image'
import Link from 'next/link'

interface Vendor {
  id: string
  store_name: string
  description: string
  banner_url: string
  logo_url: string
  location: string
  rating: number
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [search, setSearch] = useState('')
  const [location, setLocation] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchVendors()
  }, [])

  const fetchVendors = async () => {
    setLoading(true)

    let query = supabase.from('vendors').select('*')

    if (search) {
      query = query.ilike('store_name', `%${search}%`)
    }

    if (location) {
      query = query.ilike('location', `%${location}%`)
    }

    const { data, error } = await query

    if (error) {
      console.error(error.message)
      setLoading(false)
      return
    }

    setVendors(data || [])
    setLoading(false)
  }

  const handleSearch = () => {
    fetchVendors()
  }

  return (
    <div className='p-6'>
      <h1 className='text-2xl font-bold mb-6'>Find Vendors</h1>

      {/* 🔍 Filters */}
      <div className='flex flex-col md:flex-row gap-4 mb-6'>
        <input
          type='text'
          placeholder='Search by store name...'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className='border p-2 rounded w-full'
        />

        <input
          type='text'
          placeholder='Location...'
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className='border p-2 rounded w-full'
        />

        <button
          onClick={handleSearch}
          className='bg-black text-white px-4 py-2 rounded'
        >
          Search
        </button>
      </div>

      {/* Vendors */}
      {loading ? (
        <p>Loading...</p>
      ) : vendors.length === 0 ? (
        <p>No vendors found.</p>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'>
          {vendors.map((vendor) => (
            <Link
              key={vendor.id}
              href={`/vendors/${vendor.id}`}
              className='border rounded-lg overflow-hidden hover:shadow-md transition'
            >
              <div className='relative h-40'>
                <Image
                  src={vendor.banner_url || '/placeholder.jpg'}
                  alt='banner'
                  fill
                  className='object-cover'
                />
              </div>

              <div className='p-4'>
                <div className='flex items-center gap-2 mb-2'>
                  <Image
                    src={vendor.logo_url || '/placeholder.jpg'}
                    alt='logo'
                    width={35}
                    height={35}
                    className='rounded-full'
                  />
                  <h3 className='font-semibold'>{vendor.store_name}</h3>
                </div>

                <p className='text-sm text-gray-500'>{vendor.description}</p>

                <div className='flex justify-between mt-2 text-sm'>
                  <span>{vendor.location}</span>
                  <span>⭐ {vendor.rating || 0}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
