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
}

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.id}`}
      className='group border rounded-2xl overflow-hidden bg-white hover:shadow-xl transition-all duration-300'
    >
      {/* Image */}
      <div className='relative overflow-hidden'>
        <Image
          src={product.image_url || '/placeholder.png'}
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
      </div>
    </Link>
  )
}
