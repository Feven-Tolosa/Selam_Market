'use client'

import Link from 'next/link'
import Image from 'next/image'

export interface Product {
  id: string
  name: string
  price: number
  image_url: string | null
  category_name?: string
  rating?: number
  ratingCount?: number
  distance?: number
}

export default function ProductCard({ product }: { product: Product }) {
  const getImageUrl = (path: string | null) => {
    if (!path || path.trim() === '') {
      return '/placeholder.png'
    }

    // Already a full URL
    if (path.startsWith('http')) {
      return path
    }

    // Supabase storage path fix
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${path}`
  }

  return (
    <Link
      href={`/products/${product.id}`}
      className='group border rounded-2xl overflow-hidden bg-white hover:shadow-xl transition-all duration-300'
    >
      {/* Image */}
      <div className='relative overflow-hidden'>
        <Image
          src={getImageUrl(product.image_url)}
          alt={product.name}
          width={300}
          height={300}
          className='w-full h-48 object-cover group-hover:scale-105 transition'
        />
      </div>

      {/* Content */}
      <div className='p-4 space-y-2'>
        <h2 className='font-medium line-clamp-2 text-gray-800 group-hover:text-[#10b5cb] transition'>
          {product.name}
        </h2>

        {/* ⭐ Rating */}
        <div className='flex items-center gap-1 text-sm text-yellow-500'>
          ⭐ {product.rating?.toFixed(1) || '0.0'}
          {product.ratingCount ? (
            <span className='text-gray-400 text-xs'>
              ({product.ratingCount})
            </span>
          ) : null}
        </div>

        {/* Price */}
        <p className='text-[#10b5cb] font-semibold'>
          ${product.price.toFixed(2)}
        </p>

        {/* Category */}
        {product.category_name && (
          <p className='text-gray-400 text-xs'>{product.category_name}</p>
        )}
        {product.distance && (
          <p className='text-xs text-gray-400'>
            📍 {product.distance.toFixed(1)} km away
          </p>
        )}
      </div>
    </Link>
  )
}
