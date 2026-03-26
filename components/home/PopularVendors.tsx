'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Star } from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

/**
 * Represents a vendor as stored in the database.
 */
type VendorRow = {
  id: string
  store_name: string | null
  logo_url: string | null
}

/**
 * Represents a vendor formatted for UI display.
 */
type Vendor = {
  id: string
  name: string
  logo: string
  rating: number
  products: number
}

export default function PopularVendors() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    /**
     * Fetches vendor data from the database and maps it to UI format.
     */
    const fetchVendors = async () => {
      const { data, error } = await supabase
        .from('vendors')
        .select('id, store_name, logo_url')
        .limit(4)

      if (error) {
        console.error('Error fetching vendors:', error)
        setLoading(false)
        return
      }

      if (data) {
        const mappedVendors: Vendor[] = (data as VendorRow[]).map((vendor) => ({
          id: vendor.id,
          name: vendor.store_name ?? 'Unnamed Vendor',
          logo: vendor.logo_url ?? '/placeholder.png',
          rating: 4.5, // Placeholder value until ratings are implemented
          products: 0, // Placeholder value until product count is implemented
        }))

        setVendors(mappedVendors)
      }

      setLoading(false)
    }

    fetchVendors()
  }, [])

  return (
    <section className='py-20 bg-white'>
      <div className='container mx-auto px-6'>
        {/* Section header */}
        <div className='text-center mb-12'>
          <h2 className='text-3xl font-bold' style={{ color: '#10b5cb' }}>
            Popular Vendors
          </h2>
          <p className='text-gray-600 mt-3 max-w-xl mx-auto'>
            Discover trusted local vendors and explore their products.
          </p>
        </div>

        {/* Loading state */}
        {loading && (
          <p className='text-center text-gray-500'>Loading vendors...</p>
        )}

        {/* Empty state */}
        {!loading && vendors.length === 0 && (
          <p className='text-center text-gray-500'>No vendors available.</p>
        )}

        {/* Vendor grid */}
        <div className='grid sm:grid-cols-2 md:grid-cols-4 gap-8'>
          {vendors.map((vendor) => (
            <div
              key={vendor.id}
              className='bg-white p-6 rounded-xl border transition hover:shadow-lg'
              style={{ borderColor: '#10b5cb30' }}
            >
              {/* Vendor logo */}
              <div className='flex items-center justify-center mb-4'>
                <div
                  className='w-16 h-16 flex items-center justify-center rounded-full'
                  style={{ backgroundColor: '#10b5cb10' }}
                >
                  <Image
                    src={vendor.logo}
                    alt={vendor.name}
                    width={40}
                    height={40}
                    className='object-cover rounded-full'
                  />
                </div>
              </div>

              {/* Vendor name */}
              <h3 className='font-semibold text-lg text-center mb-1'>
                {vendor.name}
              </h3>

              {/* Vendor rating and product count */}
              {/* <div className='flex items-center justify-center mb-2'>
                <Star className='w-4 h-4 mr-1' style={{ color: '#10b5cb' }} />
                <span className='text-sm text-gray-700'>
                  {vendor.rating.toFixed(1)} • {vendor.products} products
                </span>
              </div> */}

              {/* Navigation to vendor profile */}
              <Link
                href={`/vendor/${vendor.id}`}
                className='block text-center mt-3 font-medium'
                style={{ color: '#10b5cb' }}
              >
                View Profile →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
