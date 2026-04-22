'use client'

import { supabase } from '@/lib/supabaseClient'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import toast from 'react-hot-toast/headless'
import {
  Menu,
  X,
  ChevronRight,
  Edit3,
  Trash2,
  Plus,
  MapPin,
  Phone,
  Mail,
  Store as StoreIcon,
} from 'lucide-react'

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
  const [activeTab, setActiveTab] = useState('info')
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const LocationPicker = dynamic(
    () => import('@/components/vendor/LocationPicker'),
    { ssr: false },
  )

  // Load Vendor Data
  useEffect(() => {
    async function loadVendor() {
      const { data: userData, error: userError } = await supabase.auth.getUser()

      if (userError) {
        console.error('Auth error:', userError)
        return
      }

      const user = userData.user
      if (!user) return

      console.log('USER ID:', user.id)

      // ✅ Fetch ONLY one vendor (prevents breaking UI if duplicates exist)
      const { data: vendors, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('user_id', user.id)
        .limit(2) // detect duplicates

      if (error) {
        toast.error('Failed to load vendor')
        console.error(error)
        return
      }

      if (!vendors || vendors.length === 0) {
        toast.error('Your vendor account is not approved yet.')
        return
      }

      // 🚨 Detect duplicates
      if (vendors.length > 1) {
        console.warn('DUPLICATE VENDORS FOUND:', vendors)
        toast.error('Duplicate vendor accounts detected. Contact admin.')
      }

      const vendor = vendors[0] // ✅ always use first

      setVendorId(vendor.id)
      setStoreName(vendor.store_name ?? '')
      setDescription(vendor.description ?? '')
      setEmail(vendor.email ?? '')
      setPhone(vendor.phone ?? '')
      setLocation(vendor.location ?? '')

      setLatitude(vendor.latitude ?? null)
      setLongitude(vendor.longitude ?? null)

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

      // ✅ FIXED products error bug
      const { data: vendorProducts, error: productsError } = await supabase
        .from('products')
        .select('id,name,price,image_url')
        .eq('vendor_id', vendor.id)

      if (productsError) {
        console.error('Products error:', productsError)
      }

      setProducts(vendorProducts ?? [])
    }

    loadVendor()
  }, [])

  async function deleteProduct(productId: string) {
    const confirmDelete = confirm('Delete this product?')
    if (!confirmDelete) return

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId)

    if (error) {
      toast.error('Delete failed')
      console.error(error)
      return
    }

    setProducts((prev) => prev.filter((p) => p.id !== productId))
    toast.success('Product deleted successfully!')
  }

  async function uploadFile(file: File, bucket: string) {
    const fileName = `${Date.now()}-${file.name}`

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file)

    if (error) {
      console.error('Upload error:', error)
      return null
    }

    return data.path
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!vendorId) {
      toast.error('Vendor not found')
      return
    }

    setLoading(true)

    let logo_url: string | undefined
    let banner_url: string | undefined

    if (logo) {
      logo_url = (await uploadFile(logo, 'vendor-logos')) ?? undefined
    }

    if (banner) {
      banner_url = (await uploadFile(banner, 'vendor-banners')) ?? undefined
    }

    const { error } = await supabase
      .from('vendors')
      .update({
        store_name: storeName,
        description,
        email,
        phone,
        location,
        latitude,
        longitude,
        ...(logo_url && { logo_url }),
        ...(banner_url && { banner_url }),
      })
      .eq('id', vendorId)

    setLoading(false)

    if (error) {
      toast.error('Update failed')
      console.error(error)
      return
    }

    toast.success('Profile updated successfully!')
  }

  return (
    <div className='min-h-screen bg-gray-50 pb-20'>
      {/* Mobile Navigation Tabs */}
      <div className='md:hidden sticky top-0 z-20 bg-white border-b shadow-sm'>
        <div className='flex justify-between items-center px-4 py-3'>
          <h1 className='font-semibold text-gray-800'>Vendor Dashboard</h1>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className='p-2 rounded-lg bg-gray-100'
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className='flex flex-col border-t bg-white'>
            {[
              { id: 'info', label: 'Store Info', icon: StoreIcon },
              { id: 'products', label: 'Products', icon: StoreIcon },
              { id: 'map', label: 'Location', icon: MapPin },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id)
                  setMobileMenuOpen(false)
                  document
                    .getElementById(tab.id)
                    ?.scrollIntoView({ behavior: 'smooth' })
                }}
                className={`flex items-center gap-3 px-4 py-3 text-left transition ${
                  activeTab === tab.id
                    ? 'bg-[#10b5cb]/10 text-[#10b5cb] border-l-4 border-[#10b5cb]'
                    : 'text-gray-600'
                }`}
              >
                <tab.icon size={18} />
                <span>{tab.label}</span>
                <ChevronRight size={16} className='ml-auto' />
              </button>
            ))}
          </div>
        )}
      </div>

      <form
        onSubmit={handleSave}
        className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8'
      >
        {/* Banner Section - Responsive */}
        <div id='info' className='scroll-mt-20'>
          <div className='relative h-40 sm:h-48 md:h-56 lg:h-64 rounded-xl overflow-hidden bg-gradient-to-r from-gray-200 to-gray-300'>
            <Image
              src={bannerPreview}
              alt='banner'
              fill
              className='object-cover'
              sizes='(max-width: 640px) 100vw, (max-width: 768px) 100vw, 1200px'
            />
            <label className='absolute bottom-3 right-3 bg-black/60 hover:bg-black/70 text-white text-xs sm:text-sm px-3 py-1.5 rounded-lg cursor-pointer transition backdrop-blur-sm'>
              Change Banner
              <input
                type='file'
                className='hidden'
                accept='image/*'
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    setBanner(file)
                    setBannerPreview(URL.createObjectURL(file))
                  }
                }}
              />
            </label>
          </div>

          {/* Avatar and Store Name - Responsive */}
          <div className='flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-10 sm:-mt-12 px-4'>
            <div className='relative'>
              <div className='relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32'>
                <Image
                  src={logoPreview}
                  alt='logo'
                  fill
                  className='rounded-full border-4 border-white object-cover bg-white shadow-md'
                />
              </div>
              <label className='absolute bottom-0 right-0 bg-[#10b5cb] text-white p-1.5 rounded-full cursor-pointer shadow-md hover:bg-[#0e9db0] transition'>
                <Edit3 size={14} />
                <input
                  type='file'
                  className='hidden'
                  accept='image/*'
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setLogo(file)
                      setLogoPreview(URL.createObjectURL(file))
                    }
                  }}
                />
              </label>
            </div>

            <div className='flex-1 text-center sm:text-left'>
              <input
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className='text-xl sm:text-2xl md:text-3xl font-bold border-none focus:outline-none focus:ring-2 focus:ring-[#10b5cb] rounded-lg px-3 py-2 w-full sm:w-auto bg-white shadow-sm'
                placeholder='Store Name'
              />
            </div>
          </div>
        </div>

        {/* Store Information - Responsive Grid */}
        <div className='grid md:grid-cols-2 gap-6'>
          <div className='bg-white rounded-xl shadow-sm border p-4 sm:p-6 space-y-4'>
            <h2 className='font-semibold text-lg flex items-center gap-2'>
              <StoreIcon size={20} className='text-[#10b5cb]' />
              Store Information
            </h2>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder='Tell customers about your store...'
              rows={5}
              className='w-full border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#10b5cb] focus:border-transparent resize-none'
            />
          </div>

          <div className='bg-white rounded-xl shadow-sm border p-4 sm:p-6 space-y-4'>
            <h2 className='font-semibold text-lg flex items-center gap-2'>
              <StoreIcon size={20} className='text-[#10b5cb]' />
              Contact Information
            </h2>

            <div className='space-y-3'>
              <div className='relative'>
                <Mail
                  size={18}
                  className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
                />
                <input
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder='Email address'
                  className='w-full pl-10 border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#10b5cb]'
                />
              </div>

              <div className='relative'>
                <Phone
                  size={18}
                  className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
                />
                <input
                  type='tel'
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder='Phone number'
                  className='w-full pl-10 border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#10b5cb]'
                />
              </div>

              <div className='relative'>
                <MapPin
                  size={18}
                  className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
                />
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder='Store location'
                  className='w-full pl-10 border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#10b5cb]'
                />
              </div>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div
          id='map'
          className='scroll-mt-20 bg-white rounded-xl shadow-sm border p-4 sm:p-6'
        >
          <h2 className='font-semibold text-lg mb-4 flex items-center gap-2'>
            <MapPin size={20} className='text-[#10b5cb]' />
            Store Location (Map)
          </h2>

          <div className='h-64 sm:h-80 md:h-96 w-full rounded-lg overflow-hidden'>
            <LocationPicker
              lat={latitude}
              lng={longitude}
              onSelect={(lat, lng) => {
                setLatitude(lat)
                setLongitude(lng)
              }}
            />
          </div>

          {latitude && longitude && (
            <p className='text-sm text-gray-500 mt-3 p-2 bg-gray-50 rounded-lg'>
              📍 Selected: {latitude.toFixed(5)}, {longitude.toFixed(5)}
            </p>
          )}
        </div>

        {/* Save Button */}
        <div className='flex justify-center md:justify-start'>
          <button
            disabled={loading}
            className='bg-[#10b5cb] text-white px-6 sm:px-8 py-3 rounded-lg hover:bg-[#0e9db0] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-md hover:shadow-lg w-full sm:w-auto'
          >
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </div>

        {/* Products Section */}
        <div id='products' className='scroll-mt-20 pt-6'>
          <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6'>
            <h2 className='text-xl font-semibold flex items-center gap-2'>
              <StoreIcon size={22} className='text-[#10b5cb]' />
              My Products
              <span className='text-sm text-gray-500 font-normal'>
                ({products.length})
              </span>
            </h2>

            <Link
              href='/vendor/dashboard/products/new'
              className='bg-[#10b5cb] text-white px-4 py-2 rounded-lg hover:bg-[#0e9db0] transition flex items-center gap-2 text-sm sm:text-base w-full sm:w-auto justify-center'
            >
              <Plus size={18} />
              Add Product
            </Link>
          </div>

          {/* Products Grid - Responsive */}
          {products.length === 0 ? (
            <div className='text-center py-12 bg-white rounded-xl border'>
              <StoreIcon size={48} className='mx-auto text-gray-300 mb-3' />
              <p className='text-gray-500'>No products yet</p>
              <Link
                href='/vendor/dashboard/products/new'
                className='inline-block mt-3 text-[#10b5cb] hover:underline'
              >
                Add your first product →
              </Link>
            </div>
          ) : (
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6'>
              {products.map((product) => (
                <div
                  key={product.id}
                  className='border rounded-xl overflow-hidden bg-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1'
                >
                  <div className='relative h-40 sm:h-48 bg-gray-100'>
                    <img
                      src={product.image_url ?? '/placeholder.png'}
                      alt={product.name}
                      className='w-full h-full object-cover'
                    />
                  </div>

                  <div className='p-3 sm:p-4'>
                    <h3 className='text-sm sm:text-base font-medium line-clamp-2 text-gray-800'>
                      {product.name}
                    </h3>

                    <p className='text-[#10b5cb] font-bold mt-2 text-lg'>
                      ${product.price.toFixed(2)}
                    </p>

                    <div className='flex justify-between gap-2 mt-4'>
                      <Link
                        href={`/vendor/dashboard/products/edit/${product.id}`}
                        className='flex-1 text-center bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition text-sm'
                      >
                        Edit
                      </Link>

                      <button
                        type='button'
                        onClick={() => deleteProduct(product.id)}
                        className='flex-1 bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100 transition text-sm'
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </form>
    </div>
  )
}
