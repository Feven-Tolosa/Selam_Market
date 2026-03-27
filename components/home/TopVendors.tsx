'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Image from 'next/image'
import Link from 'next/link'
import { Star } from 'lucide-react'

interface Vendor {
  id: string
  store_name: string
  description: string
  image_url: string | null
  location: string
  rating: number
}

export default function TopVendors() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchVendors()
  }, [])

  async function fetchVendors(): Promise<void> {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .order('rating', { ascending: false })
      .limit(6)

    if (error) {
      console.error('Error fetching vendors:', error.message)
    } else if (data) {
      setVendors(data)
    }

    setLoading(false)
  }

  if (loading) {
    return <p className='text-center py-10'>Loading vendors...</p>
  }

  return (
    <section className='py-12 px-6'>
      <h2 className='text-2xl font-bold mb-6'>Top Vendors</h2>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        {vendors.map((vendor) => (
          <Link
            key={vendor.id}
            href={`/vendors/${vendor.id}`}
            className='border rounded-lg p-4 hover:shadow-md transition'
          >
            <Image
              src={vendor.image_url || '/placeholder.png'}
              alt={vendor.store_name}
              width={400}
              height={250}
              className='rounded-md object-cover'
            />

            <h3 className='text-lg font-semibold mt-3'>{vendor.store_name}</h3>

            <p className='text-sm text-gray-500'>{vendor.location}</p>

            <div className='flex items-center mt-2'>
              <Star className='w-4 h-4 text-yellow-500' />
              <span className='ml-1 text-sm'>{vendor.rating ?? 0}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
