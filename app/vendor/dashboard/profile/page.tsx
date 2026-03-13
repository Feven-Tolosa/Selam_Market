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

  useEffect(() => {
    async function loadVendor() {
      const { data: userData } = await supabase.auth.getUser()

      const user = userData.user

      if (!user) return

      const { data } = await supabase
        .from('vendors')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (data) {
        setVendorId(data.id)
        setStoreName(data.store_name || '')
        setDescription(data.description || '')
        setEmail(data.email || '')
        setPhone(data.phone || '')
        setLocation(data.location || '')

        if (data.logo_url) setLogoPreview(data.logo_url)
        if (data.banner_url) setBannerPreview(data.banner_url)
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
    </form>
  )
}
