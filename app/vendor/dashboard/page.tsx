'use client'

import { supabase } from '@/lib/supabaseClient'
import Image from 'next/image'
import { useEffect, useState } from 'react'

type Product = {
  id: string
  name: string
  price: number
  image_url: string | null
}

export default function VendorProfile() {
  const [vendorId, setVendorId] = useState<string>('')

  const [storeName, setStoreName] = useState('')
  const [description, setDescription] = useState('')

  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')

  const [logo, setLogo] = useState<File | null>(null)
  const [banner, setBanner] = useState<File | null>(null)

  const [logoPreview, setLogoPreview] = useState('/avatar-placeholder.png')
  const [bannerPreview, setBannerPreview] = useState('/banner-placeholder.jpg')

  const [products, setProducts] = useState<Product[]>([])

  const [loading, setLoading] = useState(false)

  // -------------------------
  // Load Vendor Data (FIXED)
  // -------------------------

  useEffect(() => {
    async function loadVendor() {
      const { data: userData } = await supabase.auth.getUser()
      const user = userData.user

      if (!user) return

      const { data: vendor, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle() // ✅ FIX (no crash)

      if (error) {
        console.error(error)
        return
      }

      // 🚨 If vendor not created yet
      if (!vendor) {
        alert('Your vendor account is not approved yet.')
        return
      }

      setVendorId(vendor.id)

      setStoreName(vendor.store_name ?? '')
      setDescription(vendor.description ?? '')
      setEmail(vendor.email ?? '')
      setPhone(vendor.phone ?? '')
      setLocation(vendor.location ?? '')

      // Logo
      if (vendor.logo_url) {
        const { data } = supabase.storage
          .from('vendor-logos')
          .getPublicUrl(vendor.logo_url)

        setLogoPreview(data.publicUrl)
      }

      // Banner
      if (vendor.banner_url) {
        const { data } = supabase.storage
          .from('vendor-banners')
          .getPublicUrl(vendor.banner_url)

        setBannerPreview(data.publicUrl)
      }

      // Products
      const { data: vendorProducts } = await supabase
        .from('products')
        .select('id,name,price,image_url')
        .eq('vendor_id', vendor.id)

      setProducts(vendorProducts ?? [])
    }

    loadVendor()
  }, [])

  // -------------------------
  // Delete Product
  // -------------------------

  async function deleteProduct(productId: string) {
    const confirmDelete = confirm('Delete this product?')
    if (!confirmDelete) return

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId)

    if (error) {
      alert('Delete failed')
      return
    }

    setProducts((prev) => prev.filter((p) => p.id !== productId))
  }

  // -------------------------
  // Upload File (IMPROVED)
  // -------------------------

  async function uploadFile(file: File, bucket: string) {
    const fileName = `${Date.now()}-${file.name}`

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file)

    if (error) {
      console.error(error)
      return null
    }

    return data.path
  }

  // -------------------------
  // Save Profile (FIXED)
  // -------------------------

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!vendorId) {
      alert('Vendor not found')
      return
    }

    setLoading(true)

    let logo_url: string | undefined
    let banner_url: string | undefined

    if (logo) {
      logo_url = (await uploadFile(logo, 'vendor-logos')) || undefined
    }

    if (banner) {
      banner_url = (await uploadFile(banner, 'vendor-banners')) || undefined
    }

    const { error } = await supabase
      .from('vendors')
      .update({
        store_name: storeName,
        description,
        email,
        phone,
        location,
        ...(logo_url && { logo_url }),
        ...(banner_url && { banner_url }),
      })
      .eq('id', vendorId)

    setLoading(false)

    if (error) {
      alert('Update failed')
      console.error(error)
      return
    }

    alert('Profile updated successfully!')
  }

  return (
    <form onSubmit={handleSave} className='space-y-8'>
      {/* Banner */}
      <div className='relative h-48 rounded-xl overflow-hidden bg-gray-100'>
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

      {/* Avatar */}
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

        <input
          value={storeName}
          onChange={(e) => setStoreName(e.target.value)}
          className='text-xl font-semibold border-none focus:outline-none'
        />
      </div>

      {/* Store Info */}
      <div className='grid md:grid-cols-2 gap-6'>
        <div className='bg-white border rounded-xl p-6 space-y-4'>
          <h2 className='font-semibold text-lg'>Store Information</h2>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder='Store description'
            className='w-full border p-3 rounded'
          />
        </div>

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

      {/* Save Button */}
      <button
        disabled={loading}
        className='bg-[#10b5cb] text-white px-6 py-3 rounded-lg hover:bg-[#0ea3b7]'
      >
        {loading ? 'Saving...' : 'Save Profile'}
      </button>

      {/* Products */}
      <div className='mt-12'>
        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-xl font-semibold'>My Products</h2>

          <a
            href='/vendor/dashboard/products/new'
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

                <div className='flex justify-between mt-3 text-sm'>
                  <a
                    href={`/vendor/products/edit/${product.id}`}
                    className='text-blue-500 hover:underline'
                  >
                    Edit
                  </a>

                  <button
                    type='button'
                    onClick={() => deleteProduct(product.id)}
                    className='text-red-500 hover:underline'
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </form>
  )
}
