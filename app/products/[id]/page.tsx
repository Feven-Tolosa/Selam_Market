'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useParams, useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

type Product = {
  id: string
  name: string
  description: string
  price: number
  category: string
  image_url: string | null
  vendor_id: string
}

type Vendor = {
  id: string
  store_name: string
}

export default function ProductPage() {
  const { id } = useParams()
  const router = useRouter()

  const [product, setProduct] = useState<Product | null>(null)
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProduct() {
      if (!id) return

      // Fetch product
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()

      if (productError || !productData) {
        toast.error('Product not found')
        router.push('/')
        return
      }

      setProduct(productData)

      // Fetch vendor
      const { data: vendorData } = await supabase
        .from('vendors')
        .select('id, store_name')
        .eq('id', productData.vendor_id)
        .single()

      setVendor(vendorData || null)
      setLoading(false)
    }

    loadProduct()
  }, [id])

  if (loading) return <p className='p-10'>Loading...</p>
  if (!product) return <p className='p-10'>Product not found</p>

  return (
    <div className='max-w-screen mx-auto p-6 grid grid-cols-2 md:grid gap-8'>
      {/* PRODUCT IMAGE */}
      <div className='w-full h-96 bg-gray-100 mb-6 rounded-lg overflow-hidden'>
        <img
          src={product.image_url || '/placeholder.png'}
          className='w-full h-full object-cover'
        />
      </div>

      {/* PRODUCT INFO */}
      <div className='space-y-4'>
        <h1 className='text-3xl font-bold'>{product.name}</h1>

        <p className='text-[#10b5cb] font-semibold text-xl'>
          ${product.price.toFixed(2)}
        </p>

        {product.category && (
          <p className='text-gray-500'>
            Category: <span className='font-medium'>{product.category}</span>
          </p>
        )}

        {vendor && (
          <p className='text-gray-700'>
            Sold by:{' '}
            <a
              href={`/store/${vendor.id}`}
              className='text-blue-500 hover:underline'
            >
              {vendor.store_name}
            </a>
          </p>
        )}

        <div className='mt-4'>
          <h2 className='font-semibold text-lg mb-2'>Description</h2>
          <p className='text-gray-800'>
            {product.description || 'No description'}
          </p>
        </div>

        {/* ADD TO CART BUTTON  */}
        <button
          className='mt-6 bg-[#10b5cb] hover:bg-[#0ea5b7] text-white py-3 px-6 rounded-lg'
          onClick={() => toast.success('Added to cart!')}
        >
          Add to Cart
        </button>
      </div>
    </div>
  )
}
