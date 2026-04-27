'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Heart, ShoppingCart } from 'lucide-react'
import { getTranslation } from '@/lib/i18n'

interface Product {
  id: string
  name: string
  price: number
  image_url: string | null
  vendor_name?: string
  rating?: number
  ratingCount?: number
}

export default function ProductCard({ product }: { product: Product }) {
  const t = getTranslation()
  const isTopRated = (product.rating || 0) >= 4.5

  const renderStars = () => {
    const fullStars = Math.floor(product.rating || 0)
    const halfStar = (product.rating || 0) - fullStars >= 0.5
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0)
    return (
      <div className='flex items-center gap-1 text-yellow-400 text-sm'>
        {Array(fullStars)
          .fill('★')
          .map((s, i) => (
            <span key={`f${i}`}>{s}</span>
          ))}
        {halfStar && <span>☆</span>}
        {Array(emptyStars)
          .fill('☆')
          .map((s, i) => (
            <span key={`e${i}`}>{s}</span>
          ))}
        <span className='text-gray-500 ml-1'>({product.ratingCount || 0})</span>
      </div>
    )
  }

  return (
    <div className='group relative bg-white border rounded-xl overflow-hidden hover:shadow-lg transition transform hover:-translate-y-1'>
      {/* Top Rated Badge */}
      {isTopRated && (
        <div className='absolute top-2 left-2 bg-yellow-400 text-white text-xs font-semibold px-2 py-1 rounded z-10'>
          {t.productCard.topRated}
        </div>
      )}

      {/* Image */}
      <Link href={`/products/${product.id}`}>
        <div className='relative h-80 bg-gray-100 overflow-hidden'>
          <Image
            src={product.image_url || '/placeholder.png'}
            alt={product.name}
            fill
            className='object-cover w-full h-full group-hover:scale-105 transition-transform duration-300'
          />
          <button className='absolute top-3 right-3 bg-white rounded-full p-2 shadow hover:text-red-500 z-10'>
            <Heart size={18} />
          </button>

          {/* Hover Overlay */}
          <div className='absolute inset-0 bg-[#10b5cb]/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center text-center p-4'>
            <h3 className='text-white text-lg font-semibold'>{product.name}</h3>
            <span className='text-[#10b5cb] text-lg font-bold mt-1'>
              ${product.price.toFixed(2)}
            </span>
            <div className='mt-2 flex gap-2'>
              <button className='bg-[#10b5cb] text-white px-3 py-1 rounded hover:bg-[#0e9fb3]'>
                <ShoppingCart size={16} />
              </button>
            </div>
          </div>
        </div>
      </Link>

      {/* Vendor & Rating (optional) */}
      <div className='p-4 space-y-1'>
        {product.vendor_name && (
          <p className='text-xs text-gray-500'>{product.vendor_name}</p>
        )}
        {product.rating && product.ratingCount !== undefined && renderStars()}
      </div>
    </div>
  )
}
