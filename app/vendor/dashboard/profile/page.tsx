'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Image from 'next/image'

export default function VendorProfile() {
  const [storeName, setStoreName] = useState('')
  const [description, setDescription] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')

  const [logo, setLogo] = useState<File | null>(null)
  const [banner, setBanner] = useState<File | null>(null)

  const [logoPreview, setLogoPreview] = useState('/avatar-placeholder.png')
  const [bannerPreview, setBannerPreview] = useState('/banner-placeholder.jpg')

  const [vendorId, setVendorId] = useState('')

  type Product = {
    id: string
    name: string
    price: number
    image_url: string | null
  }
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    async function loadVendor() {
      const { data: userData } = await supabase.auth.getUser()

      const user = userData.user

      if (!user) return

      const { data: vendor } = await supabase
        .from('vendors')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (vendor) {
        setVendorId(vendor.id)
        setStoreName(vendor.store_name || '')
        setDescription(vendor.description || '')
        setEmail(vendor.email || '')
        setPhone(vendor.phone || '')
        setLocation(vendor.location || '')

        if (vendor.logo_url) setLogoPreview(vendor.logo_url)
        if (vendor.banner_url) setBannerPreview(vendor.banner_url)

        const { data: vendorProducts } = await supabase
          .from('products')
          .select('id,name,price,image_url')
          .eq('vendor_id', vendor.id)

        setProducts(vendorProducts || [])
      }
    }

    loadVendor()
  }, [])

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    let logo_url = logoPreview
    let banner_url = bannerPreview

    if (logo) {
      const fileName = `${Date.now()}-${logo.name}`

      const { data } = await supabase.storage
        .from('vendor-logos')
        .upload(fileName, logo)

      logo_url = data?.path || logoPreview
    }

    if (banner) {
      const fileName = `${Date.now()}-${banner.name}`

      const { data } = await supabase.storage
        .from('vendor-banners')
        .upload(fileName, banner)

      banner_url = data?.path || bannerPreview
    }

    await supabase
      .from('vendors')
      .update({
        store_name: storeName,
        description,
        email,
        phone,
        location,
        logo_url,
        banner_url,
      })
      .eq('id', vendorId)

    alert('Profile updated')
  }

  return (
    <form onSubmit={handleSave}>
      {/* Banner */}
      <div className='relative h-48 bg-gray-100 rounded-xl overflow-hidden'>
        <Image src={bannerPreview} alt='banner' fill className='object-cover' />

        <input
          type='file'
          className='absolute bottom-3 right-3 text-sm'
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) {
              setBanner(file)
              setBannerPreview(URL.createObjectURL(file))
            }
          }}
        />
      </div>

      {/* Avatar + name */}
      <div className='flex items-center gap-6 -mt-10 px-4'>
        <div className='relative'>
          <Image
            src={logoPreview}
            alt='logo'
            width={90}
            height={90}
            className='rounded-full border-4 border-white object-cover'
          />

          <input
            type='file'
            className='absolute bottom-0 left-0 text-xs'
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                setLogo(file)
                setLogoPreview(URL.createObjectURL(file))
              }
            }}
          />
        </div>

        <div>
          <input
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            className='text-xl font-semibold border-none focus:outline-none'
          />

          <p className='text-gray-500 text-sm'>Vendor Store</p>
        </div>
      </div>

      {/* Info cards */}
      <div className='grid md:grid-cols-2 gap-6 mt-10'>
        {/* Store info */}
        <div className='bg-white border rounded-xl p-6 space-y-4'>
          <h2 className='font-semibold text-lg'>Store Information</h2>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder='Store description'
            className='w-full border p-3 rounded'
          />
        </div>

        {/* Contact */}
        <div className='bg-white border rounded-xl p-6 space-y-4'>
          <h2 className='font-semibold text-lg'>Contact Information</h2>

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder='Email'
            className='w-full border p-3 rounded'
          />

          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder='Phone'
            className='w-full border p-3 rounded'
          />

          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder='Location'
            className='w-full border p-3 rounded'
          />
        </div>
      </div>

      {/* Save button */}
      <div className='mt-8'>
        <button className='bg-[#10b5cb] text-white px-6 py-3 rounded-lg hover:bg-[#0ea3b7]'>
          Save Profile
        </button>
      </div>
      {/* Vendor products */}

      <div className='mt-12'>
        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-xl font-semibold'>My Products</h2>

          <a
            href='/vendor/products/new'
            className='bg-[#10b5cb] text-white px-4 py-2 rounded'
          >
            Add Product
          </a>
        </div>

        <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
          {products.map((product) => (
            <div
              key={product.id}
              className='border rounded-xl overflow-hidden bg-white hover:shadow-md transition'
            >
              <div className='h-36 bg-gray-100'>
                <img
                  src={product.image_url || '/placeholder.png'}
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
    </form>
  )
}
