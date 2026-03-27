'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Image from 'next/image'
import dynamic from 'next/dynamic'

type Vendor = {
  id: string
  store_name: string
  description: string | null
  email: string | null
  phone: string | null
  location: string | null
  latitude: number | null
  longitude: number | null
  logo_url: string | null
  banner_url: string | null
}

type Product = {
  id: string
  name: string
  price: number
  image_url: string | null
}

export default function VendorPublicPage({
  params,
}: {
  params: { id: string }
}) {
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const MapView = dynamic(() => import('@/components/vendor/MapView'), {
    ssr: false,
  })

  useEffect(() => {
    async function fetchVendor() {
      setLoading(true)

      // Fetch vendor
      const { data: vendorData, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('id', params.id)
        .maybeSingle()

      if (error || !vendorData) {
        console.error(error)
        setLoading(false)
        return
      }

      setVendor(vendorData)

      // Fetch products
      const { data: productData } = await supabase
        .from('products')
        .select('id,name,price,image_url')
        .eq('vendor_id', params.id)

      setProducts(productData ?? [])
      setLoading(false)
    }

    fetchVendor()
  }, [params.id])

  if (loading) return <p className='p-6'>Loading...</p>

  if (!vendor) return <p className='p-6'>Vendor not found</p>

  // Get images
  const logoUrl = vendor.logo_url
    ? supabase.storage.from('vendor-logos').getPublicUrl(vendor.logo_url).data
        .publicUrl
    : '/avatar-placeholder.png'

  const bannerUrl = vendor.banner_url
    ? supabase.storage.from('vendor-banners').getPublicUrl(vendor.banner_url)
        .data.publicUrl
    : '/banner-placeholder.jpg'

  return (
    <div className='space-y-8'>
      {/* Banner */}
      <div className='relative h-56 w-full'>
        <Image src={bannerUrl} alt='banner' fill className='object-cover' />
      </div>

      {/* Vendor Info */}
      <div className='max-w-6xl mx-auto px-4 -mt-16'>
        <div className='bg-white rounded-xl shadow p-6'>
          <div className='flex items-center gap-6'>
            <Image
              src={logoUrl}
              alt='logo'
              width={100}
              height={100}
              className='rounded-full border-4 border-white'
            />

            <div>
              <h1 className='text-2xl font-bold'>{vendor.store_name}</h1>
              <p className='text-gray-500'>{vendor.location}</p>
            </div>
          </div>

          {/* Description */}
          {vendor.description && (
            <p className='mt-4 text-gray-700'>{vendor.description}</p>
          )}

          {/* Contact */}
          <div className='mt-4 text-sm text-gray-600 space-y-1'>
            {vendor.email && <p>Email: {vendor.email}</p>}
            {vendor.phone && <p>Phone: {vendor.phone}</p>}
          </div>
        </div>
      </div>

      {/* Map */}
      {vendor.latitude && vendor.longitude && (
        <div className='max-w-6xl mx-auto px-4'>
          <h2 className='font-semibold mb-2'>Location</h2>

          <div className='h-72 rounded-xl overflow-hidden'>
            <MapView lat={vendor.latitude} lng={vendor.longitude} />
          </div>
        </div>
      )}

      {/* Products */}
      <div className='max-w-6xl mx-auto px-4'>
        <h2 className='text-xl font-semibold mb-4'>Products</h2>

        <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
          {products.map((product) => (
            <div
              key={product.id}
              className='border rounded-xl overflow-hidden bg-white hover:shadow-md transition'
            >
              <div className='h-40 bg-gray-100'>
                <Image
                  alt={product.name}
                  width={400}
                  height={400}
                  src={product.image_url ?? '/placeholder.png'}
                  className='w-full h-full object-cover'
                />
              </div>

              <div className='p-3'>
                <h3 className='text-sm font-medium line-clamp-2'>
                  {product.name}
                </h3>

                <p className='text-[#10b5cb] font-semibold mt-1'>
                  ${product.price}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
