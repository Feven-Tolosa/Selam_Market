'use client'

import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

export interface Vendor {
  id: string
  store_name: string
  description: string
  banner_url: string
  logo_url: string
  location: string
  rating?: number
  ratingCount?: number
  distance?: number
}

interface Props {
  vendor: Vendor
}

export default function VendorCard({ vendor }: Props) {
  const getImageUrl = (bucket: string, path: string | null | undefined) => {
    if (!path) return '/placeholder.jpg'
    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    return data.publicUrl || '/placeholder.jpg'
  }

  return (
    <Link
      href={`/vendor/${vendor.id}`}
      className='group border rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 bg-white'
    >
      {/* Banner */}
      <div className='relative h-40 overflow-hidden'>
        <Image
          src={getImageUrl('vendor-banners', vendor.banner_url)}
          alt={vendor.store_name}
          fill
          className='object-cover group-hover:scale-105 transition-transform duration-300'
        />
      </div>

      {/* Content */}
      <div className='p-4'>
        {/* Logo + Name */}
        <div className='flex items-center gap-3 mb-2'>
          <Image
            src={getImageUrl('vendor-logos', vendor.logo_url)}
            alt='logo'
            width={42}
            height={42}
            className='rounded-full object-cover border'
          />
          <h3 className='font-semibold text-gray-800 group-hover:text-[#10b5cb] transition'>
            {vendor.store_name}
          </h3>
        </div>

        {/* Description */}
        <p className='text-sm text-gray-500 line-clamp-2'>
          {vendor.description}
        </p>

        {/* Footer */}
        <div className='mt-3 flex justify-between items-center text-sm'>
          <span className='text-gray-400'>{vendor.location}</span>

          <span className='flex items-center gap-1 font-medium text-yellow-500'>
            ⭐ {vendor.rating?.toFixed(1) || '0.0'}
            {vendor.ratingCount ? (
              <span className='text-gray-400 text-xs'>
                ({vendor.ratingCount})
              </span>
            ) : null}
          </span>
          {vendor.distance !== undefined && vendor.distance !== Infinity && (
            <p className='text-xs text-gray-500'>
              {vendor.distance.toFixed(1)} km away
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}
