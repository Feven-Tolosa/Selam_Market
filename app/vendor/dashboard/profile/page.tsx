'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function VendorProfile() {
  const [storeName, setStoreName] = useState('')
  const [description, setDescription] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [logo, setLogo] = useState<File | null>(null)

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
      }
    }

    loadVendor()
  }, [])

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    let logo_url = ''

    if (logo) {
      const fileName = `${Date.now()}-${logo.name}`

      const { data } = await supabase.storage
        .from('vendor-logos')
        .upload(fileName, logo)

      logo_url = data?.path || ''
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
      })
      .eq('id', vendorId)

    alert('Profile updated!')
  }

  return (
    <div className='max-w-2xl'>
      <h1 className='text-2xl font-semibold mb-6'>Store Profile</h1>

      <form onSubmit={handleSave} className='space-y-4'>
        <input
          value={storeName}
          onChange={(e) => setStoreName(e.target.value)}
          placeholder='Store name'
          className='w-full border p-3 rounded'
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder='Store description'
          className='w-full border p-3 rounded'
        />

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder='Contact email'
          className='w-full border p-3 rounded'
        />

        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder='Phone number'
          className='w-full border p-3 rounded'
        />

        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder='Location'
          className='w-full border p-3 rounded'
        />

        <div>
          <label className='text-sm text-gray-600'>Store logo</label>

          <input
            type='file'
            onChange={(e) => setLogo(e.target.files?.[0] || null)}
          />
        </div>

        <button className='bg-[#10b5cb] text-white px-6 py-3 rounded hover:bg-[#0e9fb3]'>
          Save Changes
        </button>
      </form>
    </div>
  )
}
