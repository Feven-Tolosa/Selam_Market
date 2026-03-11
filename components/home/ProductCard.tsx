import Link from 'next/link'
import Image from 'next/image'
import { Heart, ShoppingCart } from 'lucide-react'

type Product = {
  id: string
  name: string
  price: number
  image_url: string
  vendor_name?: string
}

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className='group bg-white border rounded-xl overflow-hidden hover:shadow-md transition'>
      {/* Image */}
      <Link href={`/product/${product.id}`}>
        <div className='relative h-52 bg-gray-100'>
          <Image
            src={product.image_url || '/placeholder.png'}
            alt={product.name}
            fill
            className='object-cover group-hover:scale-105 transition'
          />

          {/* Wishlist */}
          <button className='absolute top-3 right-3 bg-white rounded-full p-2 shadow hover:text-red-500'>
            <Heart size={18} />
          </button>
        </div>
      </Link>

      {/* Info */}
      <div className='p-4'>
        {/* Vendor */}
        {product.vendor_name && (
          <p className='text-xs text-gray-500 mb-1'>{product.vendor_name}</p>
        )}

        {/* Title */}
        <Link href={`/product/${product.id}`}>
          <h3 className='text-sm font-medium text-gray-800 line-clamp-2 hover:text-[#10b5cb]'>
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className='flex justify-between items-center mt-3'>
          <span className='text-[#10b5cb] font-semibold'>${product.price}</span>

          {/* Add to cart */}
          <button className='bg-[#10b5cb] text-white p-2 rounded hover:bg-[#0e9fb3]'>
            <ShoppingCart size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
